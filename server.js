require('dotenv').config();

const express     = require('express');
const mongoose    = require('mongoose');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const contactRoutes = require('./routes/contact');
const adminRoutes   = require('./routes/admin');

const app  = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ── Database Connection ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Security Middleware ───────────────────────────────────────
app.use(helmet());                         // Sets secure HTTP headers
app.use(cors({
  origin:  process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));  // Block excessively large payloads

// ── Rate Limiting ─────────────────────────────────────────────
// Global: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Too many requests. Please try again later.' },
}));

// Contact form: stricter — 5 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message:  { success: false, message: 'Too many messages sent. Please wait an hour before trying again.' },
});

// Admin login: 10 attempts per 15 min per IP
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Too many login attempts. Please wait before trying again.' },
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/admin/login', adminLoginLimiter);   // extra limiter on login

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status:  'ok',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
