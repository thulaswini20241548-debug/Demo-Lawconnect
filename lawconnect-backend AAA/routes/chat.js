/**
 * LawConnect — Chat Route
 * File: routes/chat.js
 *
 * POST /api/chat
 * Body:    { message: string, history?: Array<{ role, content }> }
 * Returns: { reply: string, confidence: "high"|"medium"|"low", reason: string }
 *
 * Sends the user's message + conversation history to LexAI (Groq / Llama 3.3)
 * and returns a plain-language legal answer with a confidence indicator.
 */

const express = require('express');
const { chatLimiter }      = require('../middleware/rateLimiter');
const { validateChatBody } = require('../middleware/validate');
const { complete }         = require('../utils/groq');
const { CHAT_SYSTEM_PROMPT } = require('../config/prompts');

const router = express.Router();

/* ── POST /api/chat ── */
router.post('/', chatLimiter, validateChatBody, async (req, res) => {
  try {
    const { message, history } = req.body;

    // Build conversation messages (history already sanitised by middleware)
    const messages = [
      ...history,
      { role: 'user', content: message },
    ];

    const { reply, confidence, reason } = await complete({
      systemPrompt: CHAT_SYSTEM_PROMPT,
      messages,
      maxTokens: 1024,
    });

    return res.json({ reply, confidence, reason });

  } catch (err) {
    console.error('[/api/chat] Error:', err.message);
    return _handleGroqError(err, res);
  }
});

/* ── shared Groq error handler ── */
function _handleGroqError(err, res) {
  if (err?.status === 429) {
    return res.status(429).json({ error: 'AI service is busy. Please wait a moment and try again.' });
  }
  if (err?.status === 401) {
    return res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
  }
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

module.exports = router;
