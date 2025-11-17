const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = function(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware to check if user is teacher
exports.isTeacher = function(req, res, next) {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Teacher only.' });
  }
  next();
};

// Middleware to check if user is parent
exports.isParent = function(req, res, next) {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ msg: 'Access denied. Parent only.' });
  }
  next();
};