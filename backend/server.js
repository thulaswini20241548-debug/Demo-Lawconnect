// backend/server.js — SINGLE ENTRY POINT FOR BOTH BACKENDS

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const app     = express();

// ── Security & Logging Middleware ───────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin:         process.env.FRONTEND_URL || '*',
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials:    false,
}));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));

// ── AI Rate Limiter ─────────────────────────────────────────
const { globalLimiter } = require('./ai/middleware/rateLimiter');
app.use(globalLimiter);

// ══════════════════════════════════════════════════════════
// LAWYER ROUTES
// ══════════════════════════════════════════════════════════
const authRoutes         = require('./lawyer/routes/authRoutes');
const lawyerRoutes       = require('./lawyer/routes/lawyerRoutes');
const appointmentRoutes  = require('./lawyer/routes/appointmentRoutes');
const availabilityRoutes = require('./lawyer/routes/availabilityRoutes');
const chatRoutes         = require('./lawyer/routes/chatRoutes');
const reviewRoutes       = require('./lawyer/routes/reviewRoutes');

app.use('/api/auth',         authRoutes);
app.use('/api/lawyers',      lawyerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/reviews',      reviewRoutes);

// ══════════════════════════════════════════════════════════
// AI ROUTES
// ══════════════════════════════════════════════════════════
const aiAnalyse     = require('./ai/routes/analyse');
const aiChat        = require('./ai/routes/chat');
const aiHealth      = require('./ai/routes/health');
const aiPractice    = require('./ai/routes/practiceAreas');
const aiWizard      = require('./ai/routes/wizard');

app.use('/api/ai/chat',           aiChat);
app.use('/api/ai/analyse',        aiAnalyse);
app.use('/api/ai/wizard',         aiWizard);
app.use('/api/ai/practice-areas', aiPractice);
app.use('/api/ai/health',         aiHealth);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Single Port ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('  ⚡  LawConnect Unified API');
  console.log(`  🚀  Listening on http://localhost:${PORT}`);
  console.log(`  🔑  GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ loaded' : '❌ missing'}`);
  console.log('');
});

module.exports = app;