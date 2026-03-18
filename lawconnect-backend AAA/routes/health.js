/**
 * LawConnect — Health Check Route
 * File: routes/health.js
 *
 * GET /health
 * Returns service status, uptime, and Groq key presence.
 * Used by Railway, Render, and other hosting platforms.
 */

const express = require('express');
const router  = express.Router();

const _startTime = Date.now();

router.get('/', (req, res) => {
  const uptimeMs      = Date.now() - _startTime;
  const uptimeSecs    = Math.floor(uptimeMs / 1000);

  res.json({
    status:   'ok',
    service:  'LawConnect API',
    version:  '2.0.0',
    uptime:   `${uptimeSecs}s`,
    groqKey:  process.env.GROQ_API_KEY ? 'loaded' : 'MISSING',
    env:      process.env.NODE_ENV || 'development',
    time:     new Date().toISOString(),
    endpoints: {
      chat:           'POST /api/chat',
      analyse:        'POST /api/analyse',
      wizard:         'POST /api/wizard',
      practiceAreas:  'GET  /api/practice-areas',
      practiceExplain:'POST /api/practice-areas/explain',
    },
  });
});

module.exports = router;
