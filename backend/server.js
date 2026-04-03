/* ===================================================
   DEALBAAZI — server.js
   Main Express server entry point
   =================================================== */

const path       = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const session    = require('express-session');
const passport   = require('passport');
const mongoose   = require('mongoose');

const authRoutes    = require('./routes/auth');
const searchRoutes  = require('./routes/search');
const productRoutes = require('./routes/Product');
const alertRoutes   = require('./routes/alerts');
const userRoutes    = require('./routes/user');

// require('./config/passport')(passport); // File does not exist yet

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Database ──────────────────────────────────── */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); });

/* ── Security & Middleware ─────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false // allows loading external scripts (AdSense, fonts)
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://deal-baazi.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Basic passport serialization for session support
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session()); 

/* ── Rate Limiting ─────────────────────────────── */
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: { message: 'Too many requests. Please slow down.' }
});
app.use('/api/', limiter);

/* ── Static Files (Serve Frontend) ────────────── */
app.use(express.static(path.join(__dirname, '../')));

/* ── API Routes ────────────────────────────────── */
app.use('/api/auth',    authRoutes);
app.use('/api/search',  searchRoutes);
app.use('/api/product', productRoutes);
app.use('/api/alerts',  alertRoutes);
app.use('/api/user',    userRoutes);

/* ── Health Check ──────────────────────────────── */
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV
}));

/* ── Catch-all: Serve Frontend ─────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

/* ── Error Handler ─────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

/* ── Start Server ──────────────────────────────── */
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 DealBaazi server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
