/* ===================================================
   DealBaazi — backend/middleware/auth.js
   JWT authentication middleware
   =================================================== */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authentication required. Please sign in.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user id to request
    req.user = { id: decoded.id };
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    return res.status(401).json({ message: 'Invalid token. Please sign in again.' });
  }
};
