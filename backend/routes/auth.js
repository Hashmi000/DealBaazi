/* ===================================================
   DealBaazi — backend/routes/auth.js  (OTP version)
   DROP-IN REPLACEMENT for your existing auth route
   =================================================== */

const express      = require('express');
const jwt          = require('jsonwebtoken');
const passport     = require('passport');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const User         = require('../models/User');

const router = express.Router();

// In-memory OTP store (use Redis in production for multi-server setups)
// Structure: { [email]: { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_EXPIRY_MS   = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

/* ── Email transporter ─────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Nodemailer configuration error:', error);
  } else {
    console.log('✅ Nodemailer is ready to take our messages');
  }
});

function generateOtp() {
  // 6-digit cryptographically secure OTP
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'DealBaazi <noreply@dealbaazi.in>',
    to:   email,
    subject: `${otp} — Your DealBaazi verification code`,
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#0a0b0f;font-family:'DM Sans',Arial,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#111318;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <div style="background:linear-gradient(135deg,rgba(247,201,72,0.12),transparent);padding:36px 40px 0;">
          <div style="font-size:1.4rem;font-weight:800;color:#f7c948;letter-spacing:-0.01em;">⚡ DealBaazi</div>
        </div>
        <div style="padding:32px 40px;">
          <h2 style="color:#f0f0f5;font-size:1.4rem;margin:0 0 8px;">Verify your email</h2>
          <p style="color:#9b9bb0;font-size:0.9rem;margin:0 0 28px;line-height:1.6;">
            Enter this code on the DealBaazi registration page to complete your sign-up.
          </p>
          <div style="background:#1a1d26;border:2px solid rgba(247,201,72,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:2.4rem;font-weight:800;letter-spacing:0.2em;color:#f7c948;font-family:monospace;">${otp}</div>
          </div>
          <p style="color:#5a5a72;font-size:0.78rem;margin:0;line-height:1.6;">
            This code expires in <strong style="color:#9b9bb0;">10 minutes</strong>.<br/>
            If you didn't request this, ignore this email.
          </p>
        </div>
        <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="color:#5a5a72;font-size:0.72rem;margin:0;">© 2025 DealBaazi · India's smartest price tracker</p>
        </div>
      </div>
    </body>
    </html>`
  };

  await transporter.sendMail(mailOptions);
}

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing from environment variables!');
    throw new Error('JWT configuration error');
  }
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/* ─────────────────────────────────────────────────
   POST /api/auth/send-otp
   Validates email isn't taken, generates & emails OTP
   ───────────────────────────────────────────────── */
router.post('/send-otp', async (req, res) => {
  console.log(`[Auth] OTP Requested for: ${req.body.email}`);
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Please provide a valid email address.' });

    // Check if email already registered
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });


    const otp = generateOtp();
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      sentAt:    Date.now(),
      attempts:  0
    });

    // Clean up after expiry
    setTimeout(() => otpStore.delete(email), OTP_EXPIRY_MS + 5000);

    try {
      await sendOtpEmail(email, otp);
      console.log(`[Auth] OTP email sent to ${email}`);
      res.json({ message: 'Verification code sent. Check your inbox.' });
    } catch (emailErr) {
      console.error('[Auth] Nodemailer failed:', emailErr.message);
      
      // Still show the OTP in console for dev debugging
      console.log(`\n=============================================`);
      console.log(`[DEV MODE FALLBACK] Your OTP for ${email} is: ${otp}`);
      console.log(`=============================================\n`);

      res.status(500).json({ 
        message: 'Failed to send verification email.', 
        error: emailErr.message 
      });
    }

  } catch (err) {
    console.error('[Auth] send-otp error:', err);
    res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
  }
});

/* ─────────────────────────────────────────────────
   POST /api/auth/register
   Verifies OTP then creates user account
   ───────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  console.log(`[Auth] Registering user: ${req.body.email}`);
  try {
    const { firstName, lastName, email, password, otp } = req.body;

    if (!firstName || !email || !password || !otp)
      return res.status(400).json({ message: 'All fields including OTP are required.' });

    // Check OTP record exists
    const record = otpStore.get(email);
    if (!record)
      return res.status(400).json({ code:'OTP_EXPIRED', message: 'Code expired or not found. Please request a new one.' });

    // Check attempts
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > MAX_OTP_ATTEMPTS) {
      otpStore.delete(email);
      return res.status(429).json({ code:'TOO_MANY_ATTEMPTS', message: 'Too many failed attempts. Please request a new code.' });
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ code:'OTP_EXPIRED', message: 'Code has expired. Please request a new one.' });
    }

    // Check OTP match
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ code:'INVALID_OTP', message: `Invalid code. ${MAX_OTP_ATTEMPTS - record.attempts} attempt(s) remaining.` });
    }

    // OTP valid — delete it immediately (single-use)
    otpStore.delete(email);

    // Double-check email not taken (race condition guard)
    const alreadyExists = await User.findOne({ email: email.toLowerCase() });
    if (alreadyExists)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      isVerified: true  // email verified via OTP
    });

    console.log(`[Auth] User created successfully: ${user.email}`);
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, firstName: user.firstName, email: user.email }
    });

  } catch (err) {
    console.error('[Auth] register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.', detail: err.message });
  }
});

/* ─────────────────────────────────────────────────
   POST /api/auth/login  (unchanged — keep your existing)
   ───────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  console.log(`[Auth] Login attempt: ${req.body.email}`);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        console.log(`[Auth] Login failed: User ${email} not found`);
        return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    
    if (!(await user.comparePassword(password))) {
        console.log(`[Auth] Login failed: Password mismatch for ${email}`);
        return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`[Auth] Login successful: ${email}`);
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, firstName: user.firstName, email: user.email } });

  } catch (err) {
    console.error('[Auth] login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.', detail: err.message });
  }
});

/* ─────────────────────────────────────────────────
   GET /api/auth/me
   ───────────────────────────────────────────────── */
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email });
});

/* ─────────────────────────────────────────────────
   Google OAuth (keep existing)
   ───────────────────────────────────────────────── */
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth` }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/pages/dashboard.html?token=${token}`);
  }
);

module.exports = router;
