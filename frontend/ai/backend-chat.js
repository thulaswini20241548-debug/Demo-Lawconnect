/**
 * LawConnect — Chat Route (Enhanced)
 * File: routes/chat.js
 *
 * POST /api/chat        — send message + optional conversation history
 * POST /api/analyse     — analyse an uploaded legal document (text extracted by frontend)
 */

const express = require('express');
const Groq    = require('groq-sdk');

const router = express.Router();
const groq   = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ══════════════════════════════════════
   LEGAL SYSTEM PROMPT
══════════════════════════════════════ */

const LEGAL_SYSTEM_PROMPT = `
You are LexAI, an expert AI legal assistant for LawConnect — a Sri Lankan legal services platform
dedicated to democratising access to legal knowledge for ordinary citizens.

IDENTITY & PERSONA
Name:     LexAI (LawConnect AI Legal Assistant)
Role:     AI-powered legal information assistant trained in Sri Lankan law
Platform: LawConnect — bridging citizens with legal knowledge in Sri Lanka
Tone:     Professional yet warm, plain-language, empathetic, non-intimidating
Language: English (primary). Acknowledge Sinhala/Tamil messages with apology and respond in English.

LEGAL KNOWLEDGE BASE — SRI LANKAN LAW

1. CONSTITUTIONAL & FUNDAMENTAL RIGHTS
• Constitution of Sri Lanka 1978 (as amended):
  - Article 12: Right to equality and equal protection of the law; non-discrimination
  - Article 13: Protection from arbitrary arrest and detention; right to know reason for arrest
  - Article 14: Freedom of speech, expression, peaceful assembly, association, movement
  - Article 17: Right to petition the Supreme Court directly for fundamental rights violations
  - Articles 19-23: Sinhala and Tamil are official languages; English is a link language
• Citizens may petition the Supreme Court directly under Article 126 for fundamental rights violations

2. EMPLOYMENT LAW
• Shop and Office Employees Act No. 19 of 1954 — governs working hours, overtime, leave
• Termination of Employment of Workmen Act No. 45 of 1971 (TEWA) — unfair dismissal protection
• Employees' Provident Fund (EPF) Act No. 15 of 1958 — employer contributes 12%, employee 8%
• Employees' Trust Fund (ETF) Act No. 46 of 1980 — employer contributes 3%
• Gratuity Act No. 12 of 1983 — half month salary per year after 5+ years of service
• Industrial Disputes Act No. 43 of 1950 — dispute resolution through Labour Tribunals

3. LAND & PROPERTY LAW
• Land Registration Ordinance — all land transfers must be registered at the Land Registry
• Prescription Ordinance — adverse possession after 10 years of uninterrupted possession
• Partition Law Act No. 21 of 1977 — co-owned land can be partitioned through court
• Prevention of Frauds Ordinance — contracts for land must be in writing and attested
• Apartment Ownership Law No. 11 of 1973 — strata title for apartments

4. FAMILY LAW
• General (Kandyan, Tesawalamai, Muslim) personal laws apply by community
• Marriage Registration Ordinance — civil marriages must be registered
• Maintenance Act No. 37 of 1999 — spouses and children can claim maintenance
• Divorce: Fault-based (adultery, malicious desertion, incurable impotency) or separation-based
• Domestic Violence Act No. 34 of 2005 — protection orders available from Magistrates Court

5. CONSUMER & CONTRACT LAW
• Consumer Affairs Authority Act No. 9 of 2003 — consumer protection and complaint handling
• Sale of Goods Ordinance — implied warranties of quality and fitness for purpose
• Contracts are governed by Roman-Dutch law principles

RESPONSE RULES
1. Always cite relevant Sri Lankan laws or ordinances when answering.
2. Clarify that your responses are legal information, NOT legal advice.
3. Recommend consulting a qualified Sri Lankan lawyer for serious matters.
4. Be empathetic — users may be in stressful situations.
5. Keep responses concise and in plain language — avoid legal jargon where possible.
6. Never make up laws or cases. If uncertain, say so.

CONFIDENCE SCORING — VERY IMPORTANT
At the very end of every response, you MUST append a JSON block on its own line like this:
{"confidence":"high","reason":"well-established employment law"}
- "confidence" must be exactly one of: "high", "medium", or "low"
- "high"   = question is clearly covered by a specific Sri Lankan law you know well
- "medium" = general legal principles apply but the specific situation has nuances
- "low"    = outside your knowledge, borderline, or requires a lawyer immediately
- "reason" = one short phrase (max 8 words) explaining your confidence level
This JSON block will be parsed and removed before showing the response to the user.
`;

const DOCUMENT_SYSTEM_PROMPT = `
You are LexAI, a Sri Lankan legal document analyst for LawConnect.

Your job is to analyse legal documents (leases, contracts, employment letters, court notices, etc.)
submitted by Sri Lankan citizens and explain them in plain language.

For each document you must:
1. Identify the document type
2. Summarise what it says in 3-5 plain-language bullet points
3. Flag any clauses that may be problematic, unfair, or illegal under Sri Lankan law
4. List the person's key rights and obligations
5. Recommend next steps

Format your response with clear sections:
**Document Type:** ...
**Summary:**
• ...
**⚠ Potential Issues:**
• ...
**Your Rights & Obligations:**
• ...
**Recommended Next Steps:**
• ...

At the very end append the confidence JSON block:
{"confidence":"high","reason":"clear rental agreement under Rent Act"}
`;

/* ══════════════════════════════════════
   HELPER: strip confidence JSON from reply
══════════════════════════════════════ */
function parseConfidence(rawReply) {
  const jsonRegex = /\{"confidence"\s*:\s*"(high|medium|low)"[^}]*\}/;
  const match = rawReply.match(jsonRegex);

  let confidence = 'medium';
  let reason     = '';

  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      confidence   = parsed.confidence || 'medium';
      reason       = parsed.reason     || '';
    } catch (_) { /* keep defaults */ }
  }

  const cleanReply = rawReply.replace(jsonRegex, '').trim();
  return { cleanReply, confidence, reason };
}

/* ══════════════════════════════════════
   POST /api/chat
══════════════════════════════════════ */
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required.' });
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
    }

    const messages = [
      { role: 'system', content: LEGAL_SYSTEM_PROMPT },
      ...history.map(h => ({
        role:    h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h.content).slice(0, 2000),
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages,
    });

    const rawReply = response.choices?.[0]?.message?.content
      ?? 'I could not generate a response. Please try again.';

    const { cleanReply, confidence, reason } = parseConfidence(rawReply);

    res.json({ reply: cleanReply, confidence, reason });

  } catch (err) {
    console.error('Chat error:', err);
    if (err?.status === 429) return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    if (err?.status === 401) return res.status(500).json({ error: 'AI service configuration error.' });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/* ══════════════════════════════════════
   POST /api/analyse
   Body: { documentText: string, filename: string }
══════════════════════════════════════ */
router.post('/analyse', async (req, res) => {
  try {
    const { documentText, filename = 'document' } = req.body;

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length < 50) {
      return res.status(400).json({ error: 'Document text is too short or missing.' });
    }
    if (documentText.length > 15000) {
      return res.status(400).json({ error: 'Document is too long. Please upload a shorter document (max ~10 pages).' });
    }

    const userPrompt = `Please analyse this legal document: "${filename}"\n\n---\n${documentText.slice(0, 12000)}\n---`;

    const response = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages:   [
        { role: 'system', content: DOCUMENT_SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
    });

    const rawReply = response.choices?.[0]?.message?.content
      ?? 'I could not analyse this document. Please try again.';

    const { cleanReply, confidence, reason } = parseConfidence(rawReply);

    res.json({ analysis: cleanReply, confidence, reason, filename });

  } catch (err) {
    console.error('Analyse error:', err);
    if (err?.status === 429) return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    res.status(500).json({ error: 'Document analysis failed. Please try again.' });
  }
});

module.exports = router;
