/* ── models/User.js ──────────────────────────────── */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, select: false }, // hidden by default
  googleId:    { type: String },
  facebookId:  { type: String },
  avatar:      { type: String },
  isVerified:  { type: Boolean, default: false },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist:    [{ type: String }], // product IDs
  createdAt:   { type: Date, default: Date.now },
  lastLogin:   { type: Date }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
