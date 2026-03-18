/**
 * LawConnect — Rate Limiters
 * File: middleware/rateLimiter.js
 */

const rateLimit = require('express-rate-limit');

/* 100 requests per 15 min per IP — global */
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  message:         { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/* 30 messages per minute per IP — chat & analysis */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      30,
  message:  { error: 'Too many messages. Please slow down.' },
});

/* 10 document analyses per 15 min per IP */
const analyseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { error: 'Too many document analyses. Please wait a moment.' },
});

/* 60 requests per minute per IP — practice areas (lightweight) */
const practiceAreaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      60,
  message:  { error: 'Too many requests. Please slow down.' },
});

module.exports = { globalLimiter, chatLimiter, analyseLimiter, practiceAreaLimiter };
