/* ===================================================
   DEALBAAZI — server.js
   Main Express server entry point
   =================================================== */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const session    = require('express-session');
const passport   = require('passport');
const path       = require('path');
const mongoose   = require('mongoose');

const authRoutes    = require('./routes/auth');
const searchRoutes  = require('./routes/search');
const productRoutes = require('./routes/product');
const alertRoutes   = require('./routes/alerts');
const userRoutes    = require('./routes/user');

require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Database ──────────────────────────────────── */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

/* ── Security & Middleware ─────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false // allows loading external scripts (AdSense, fonts)
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

/* ── Vercel Cron: Price Alert Checker ──────────── */
// Hit by Vercel Cron (see vercel.json) every hour
app.get('/api/cron/check-alerts', async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  console.log('⏰ Running price alert checker via Vercel...');
  try {
    const { checkPriceAlerts } = require('./services/alertService');
    await checkPriceAlerts();
    return res.status(200).json({ success: true, message: 'Alerts checked successfully' });
  } catch (err) {
    console.error('Alert cron error:', err);
    return res.status(500).json({ success: false, message: 'Cron failed' });
  }
});

/* ── Start Server ──────────────────────────────── */
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 DealBaazi server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
