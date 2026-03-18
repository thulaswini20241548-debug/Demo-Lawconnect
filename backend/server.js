// backend/server.js — SINGLE ENTRY POINT FOR BOTH BACKENDS

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const mongoose   = require('mongoose');
const http       = require('http');
const socketIo   = require('socket.io');
const path       = require('path');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ───────────────────────────────────────────────
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});
app.set('io', io);
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('joinRoom', (roomId) => { socket.join(roomId); });
  socket.on('sendMessage', (data) => { io.to(data.roomId).emit('receiveMessage', data); });
  socket.on('disconnect', () => { console.log('Client disconnected:', socket.id); });
});

// ── Middleware ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
}));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));

// ── AI Rate Limiter ─────────────────────────────────────────
const { globalLimiter } = require('./ai/middleware/rateLimiter');
app.use(globalLimiter);

// ── MongoDB ─────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ══════════════════════════════════════════════════════════
// API ROUTES FIRST
// ══════════════════════════════════════════════════════════
const authRoutes         = require('./lawyer/routes/authRoutes');
const lawyerRoutes       = require('./lawyer/routes/lawyerRoutes');
const appointmentRoutes  = require('./lawyer/routes/appointmentRoutes');
const availabilityRoutes = require('./lawyer/routes/availabilityRoutes');
const chatRoutes         = require('./lawyer/routes/chatRoutes');
const reviewRoutes       = require('./lawyer/routes/reviewRoutes');
const aiAnalyse          = require('./ai/routes/analyse');
const aiChat             = require('./ai/routes/chat');
const aiHealth           = require('./ai/routes/health');
const aiPractice         = require('./ai/routes/practiceAreas');
const aiWizard           = require('./ai/routes/wizard');

app.use('/api/auth',              authRoutes);
app.use('/api/lawyers',           lawyerRoutes);
app.use('/api/appointments',      appointmentRoutes);
app.use('/api/availability',      availabilityRoutes);
app.use('/api/chat',              chatRoutes);
app.use('/api/reviews',           reviewRoutes);
app.use('/api/ai/chat',           aiChat);
app.use('/api/ai/analyse',        aiAnalyse);
app.use('/api/ai/wizard',         aiWizard);
app.use('/api/ai/practice-areas', aiPractice);
app.use('/api/ai/health',         aiHealth);
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ══════════════════════════════════════════════════════════
// STATIC FRONTEND FILES AFTER API ROUTES
// ══════════════════════════════════════════════════════════
app.use('/lawyer', express.static(path.join(__dirname, '../frontend/lawyer')));
app.use('/ai',     express.static(path.join(__dirname, '../frontend/ai')));
app.get('/', (req, res) => res.redirect('/lawyer/lawyer-home.html'));

// ── 404 & Error Handlers ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ⚡  LawConnect Unified API');
  console.log(`  🚀  http://localhost:${PORT}`);
  console.log(`  🔑  GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ loaded' : '❌ missing'}`);
  console.log('');
});

module.exports = app;