/**
 * LawConnect — Express Backend
 * server.js
 *
 * Endpoints:
 *   POST   /api/auth/signup   — register
 *   POST   /api/auth/login    — login, returns JWT
 *   GET    /api/auth/me       — get current user (protected)
 *   POST   /api/chat          — send message to LexAI (protected)
 *   GET    /health            — health check for Railway/Render
 */

require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ══════════════════════════════════════
   MIDDLEWARE
══════════════════════════════════════ */

/* CORS — allow your frontend origin */
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* Parse JSON bodies */
app.use(express.json({ limit: '10kb' })); // reject oversized payloads

/* Global rate limiter — 100 requests per 15 minutes per IP */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use(globalLimiter);

/* Stricter rate limiter for auth routes — 10 attempts per 15 minutes */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

/* Chat rate limiter — 30 messages per minute per IP */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      30,
  message:  { error: 'Too many messages. Please slow down.' },
});

/* ══════════════════════════════════════
   ROUTES
══════════════════════════════════════ */

app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    service:  'LawConnect API',
    time:     new Date().toISOString(),
    db:       mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

/* ══════════════════════════════════════
   DATABASE + SERVER START
══════════════════════════════════════ */

const startServer = async () => {
  try {
    /* Connect to MongoDB */
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'lawconnect',
    });
    console.log('✅ MongoDB connected');

    /* Start Express */
    app.listen(PORT, () => {
      console.log(`✅ LawConnect API running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
