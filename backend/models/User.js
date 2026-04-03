/* ===================================================
   DealBaazi — backend/models/User.js  (updated)
   =================================================== */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, trim: true, default: '' },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, select: false },
  googleId:     { type: String },
  facebookId:   { type: String },
  avatar:       { type: String },

  // Extended profile
  phone:        { type: String, trim: true, default: '' },
  city:         { type: String, trim: true, default: '' },

  // Verification
  isVerified:   { type: Boolean, default: false },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },

  // Features
  wishlist:     [{ type: String }],
  trackedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Notification preferences
  preferences: {
    price:  { type: Boolean, default: true  },
    weekly: { type: Boolean, default: false },
    flash:  { type: Boolean, default: false }
  },

  lastLogin:    { type: Date }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
