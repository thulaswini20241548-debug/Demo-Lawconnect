/**
 * LawConnect — Express Backend Server
 * File: server.js
 *
 * Endpoints:
 *   GET  /health                       — health check (Railway / Render)
 *   POST /api/chat                     — main LexAI chat
 *   POST /api/analyse                  — legal document analysis
 *   POST /api/wizard                   — Legal Situation Wizard focused answers
 *   GET  /api/practice-areas           — list all practice areas
 *   GET  /api/practice-areas/:id       — single practice area details
 *   POST /api/practice-areas/explain   — LexAI deep-dive on a topic
 */

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const { globalLimiter } = require('./middleware/rateLimiter');

const healthRoute         = require('./routes/health');
const chatRoute           = require('./routes/chat');
const analyseRoute        = require('./routes/analyse');
const wizardRoute         = require('./routes/wizard');
const practiceAreasRoute  = require('./routes/practiceAreas');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ══════════════════════════════════════
   SECURITY HEADERS
══════════════════════════════════════ */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/* ══════════════════════════════════════
   CORS
══════════════════════════════════════ */
const allowedOrigin = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin:          allowedOrigin,
  methods:         ['GET', 'POST', 'OPTIONS'],
  allowedHeaders:  ['Content-Type', 'Accept'],
  credentials:     false,
}));

/* ══════════════════════════════════════
   REQUEST LOGGING
══════════════════════════════════════ */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ══════════════════════════════════════
   BODY PARSING  (reject payloads > 200 KB)
══════════════════════════════════════ */
app.use(express.json({ limit: '200kb' }));

/* ══════════════════════════════════════
   GLOBAL RATE LIMITER
══════════════════════════════════════ */
app.use(globalLimiter);

/* ══════════════════════════════════════
   ROUTES
══════════════════════════════════════ */
app.use('/health',                healthRoute);
app.use('/api/chat',              chatRoute);
app.use('/api/analyse',           analyseRoute);
app.use('/api/wizard',            wizardRoute);
app.use('/api/practice-areas',    practiceAreasRoute);

/* ══════════════════════════════════════
   404 HANDLER
══════════════════════════════════════ */
app.use((req, res) => {
  res.status(404).json({
    error:     `Route ${req.method} ${req.path} not found.`,
    available: [
      'GET  /health',
      'POST /api/chat',
      'POST /api/analyse',
      'POST /api/wizard',
      'GET  /api/practice-areas',
      'GET  /api/practice-areas/:id',
      'POST /api/practice-areas/explain',
    ],
  });
});

/* ══════════════════════════════════════
   GLOBAL ERROR HANDLER
══════════════════════════════════════ */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});



module.exports = app;   // exported for testing
