const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      console.log('AUTH MIDDLEWARE - Checking token...');
      
      const authHeader = req.header('Authorization');
      console.log('  Auth header:', authHeader ? 'Present' : 'Missing');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No Bearer token in header');
        return res.status(401).json({ error: 'No authentication token provided' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      console.log('  Token length:', token.length);
      console.log('  JWT_SECRET exists:', !!process.env.JWT_SECRET);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-dev');
      console.log('Token valid for user:', decoded.userId || decoded.id);
      
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
};

module.exports = authMiddleware;