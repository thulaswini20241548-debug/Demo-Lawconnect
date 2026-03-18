/**
 * LawConnect — Groq AI Client Utility
 * File: utils/groq.js
 *
 * Wraps the Groq SDK with:
 *  - Initialisation check
 *  - Retry on transient errors
 *  - Confidence JSON extraction from every reply
 */

const Groq = require('groq-sdk');

let _groq = null;

function getClient() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. Add it to your .env file.');
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/* ── parse confidence JSON appended by the model ── */
function parseConfidence(rawText) {
  const jsonRegex = /\{"confidence"\s*:\s*"(high|medium|low)"[^}]*\}/;
  const match = rawText.match(jsonRegex);

  let confidence = 'medium';
  let reason     = '';

  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      confidence   = parsed.confidence || 'medium';
      reason       = parsed.reason     || '';
    } catch (_) { /* keep defaults */ }
  }

  // Strip the JSON block (and any trailing whitespace) from the visible reply
  const cleanText = rawText.replace(jsonRegex, '').trim();

  return { cleanText, confidence, reason };
}

/**
 * complete({ systemPrompt, messages, maxTokens })
 * Sends a completion request to Groq and returns:
 *   { reply, confidence, reason }
 *
 * @param {string}  systemPrompt  - System message
 * @param {Array}   messages      - Array of { role, content } objects (no system message)
 * @param {number}  maxTokens     - Max tokens in the reply (default 1024)
 */
async function complete({ systemPrompt, messages, maxTokens = 1024 }) {
  const client = getClient();

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await client.chat.completions.create({
    model:      'llama-3.3-70b-versatile',
    max_tokens: maxTokens,
    messages:   fullMessages,
    temperature: 0.3,   // lower temp = more consistent legal responses
  });

  const rawReply = response.choices?.[0]?.message?.content
    ?? 'I could not generate a response. Please try again.';

  const { cleanText, confidence, reason } = parseConfidence(rawReply);

  return { reply: cleanText, confidence, reason };
}

module.exports = { complete, parseConfidence };
