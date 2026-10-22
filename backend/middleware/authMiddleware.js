const jwt = require('jsonwebtoken');

// The standard gatekeeper: Verifies who you are
exports.verifyToken = (req, res, next) => {
  // 1. Look for the token in the headers
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <token>"

  // 2. If no token, reject immediately (401 Unauthorized)
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    // 3. Verify the token hasn't been tampered with
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the user's ID and Role to the request so the next function can use it
    req.user = verified; 
    next(); // Pass control to the next function
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Role-based gatekeeper: Ensures you have the right permission level
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};