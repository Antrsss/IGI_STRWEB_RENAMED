const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No authentication token provided' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user to request
      req.user = decoded;
      
      // Check role if required
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Invalid authentication token' });
    }
  };
};

module.exports = authMiddleware;