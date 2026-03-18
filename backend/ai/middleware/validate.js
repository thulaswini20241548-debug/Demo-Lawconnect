/**
 * LawConnect — Input Validation Middleware
 * File: middleware/validate.js
 */

/* Sanitise a single string field */
function sanitiseString(str, maxLen = 2000) {
  if (typeof str !== 'string') return null;
  return str.trim().slice(0, maxLen);
}

/* Validate chat message body */
function validateChatBody(req, res, next) {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
  }

  if (history !== undefined && !Array.isArray(history)) {
    return res.status(400).json({ error: 'history must be an array.' });
  }

  // Sanitise history entries
  req.body.message = sanitiseString(message);
  req.body.history = Array.isArray(history)
    ? history
        .filter(h => h && typeof h.role === 'string' && typeof h.content === 'string')
        .slice(-20)  // cap at last 20 turns
        .map(h => ({
          role:    h.role === 'assistant' ? 'assistant' : 'user',
          content: sanitiseString(h.content),
        }))
    : [];

  next();
}

/* Validate document analysis body */
function validateAnalyseBody(req, res, next) {
  const { documentText, filename } = req.body;

  if (!documentText || typeof documentText !== 'string') {
    return res.status(400).json({ error: 'documentText is required.' });
  }

  if (documentText.trim().length < 50) {
    return res.status(400).json({ error: 'Document text is too short to analyse. Please upload a text-based document.' });
  }

  if (documentText.length > 15000) {
    return res.status(400).json({ error: 'Document is too long. Please upload a shorter document (max ~10 pages).' });
  }

  req.body.documentText = sanitiseString(documentText, 15000);
  req.body.filename     = sanitiseString(filename || 'Uploaded Document', 200);

  next();
}

/* Validate practice area topic body */
function validatePracticeAreaBody(req, res, next) {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    return res.status(400).json({ error: 'topic is required.' });
  }

  if (topic.trim().length > 300) {
    return res.status(400).json({ error: 'Topic is too long. Please keep it under 300 characters.' });
  }

  req.body.topic = sanitiseString(topic, 300);
  next();
}

/* Validate wizard prompt body */
function validateWizardBody(req, res, next) {
  const { prompt, area } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'prompt is required.' });
  }

  if (prompt.trim().length > 1000) {
    return res.status(400).json({ error: 'Prompt is too long.' });
  }

  req.body.prompt = sanitiseString(prompt, 1000);
  req.body.area   = sanitiseString(area   || '', 100);
  next();
}

module.exports = {
  validateChatBody,
  validateAnalyseBody,
  validatePracticeAreaBody,
  validateWizardBody,
};
