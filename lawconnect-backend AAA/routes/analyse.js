/**
 * LawConnect — Document Analysis Route
 * File: routes/analyse.js
 *
 * POST /api/analyse
 * Body:    { documentText: string, filename?: string }
 * Returns: { analysis: string, confidence: string, reason: string, filename: string }
 *
 * Accepts the raw text extracted from a PDF or TXT file by the frontend (using PDF.js).
 * Sends it to LexAI for a structured plain-language legal analysis.
 */

const express = require('express');
const { analyseLimiter }       = require('../middleware/rateLimiter');
const { validateAnalyseBody }  = require('../middleware/validate');
const { complete }             = require('../utils/groq');
const { DOCUMENT_ANALYSIS_PROMPT } = require('../config/prompts');

const router = express.Router();

/* ── POST /api/analyse ── */
router.post('/', analyseLimiter, validateAnalyseBody, async (req, res) => {
  try {
    const { documentText, filename } = req.body;

    const userPrompt = `Please analyse the following legal document.\nFilename: "${filename}"\n\n---\n${documentText.slice(0, 12000)}\n---`;

    const { reply: analysis, confidence, reason } = await complete({
      systemPrompt: DOCUMENT_ANALYSIS_PROMPT,
      messages:     [{ role: 'user', content: userPrompt }],
      maxTokens:    1500,
    });

    return res.json({ analysis, confidence, reason, filename });

  } catch (err) {
    console.error('[/api/analyse] Error:', err.message);

    if (err?.status === 429) {
      return res.status(429).json({ error: 'AI service is busy. Please wait a moment and try again.' });
    }
    if (err?.status === 401) {
      return res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
    }
    return res.status(500).json({ error: 'Document analysis failed. Please try again.' });
  }
});

module.exports = router;
