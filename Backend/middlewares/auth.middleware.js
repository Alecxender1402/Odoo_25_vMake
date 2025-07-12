import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required. Please login to continue.',
        code: 'NO_TOKEN'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Fix: Use 'id' instead of 'userId' if that's what the token contains
      const userId = decoded.userId || decoded.id;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid token. User not found.',
          code: 'USER_NOT_FOUND'
        });
      }

      req.userId = userId;
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

// Alias for compatibility
export const verifyToken = authenticateToken;

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId).select('-password');
        
        if (user) {
          req.userId = userId;
          req.user = user;
        }
      } catch (jwtError) {
        console.log('Optional auth failed, continuing without user:', jwtError.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue anyway
  }
};

// Role-based authorization middleware
export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (req.user.role !== role) {
        return res.status(403).json({ 
          message: `Access denied. Requires ${role} role.`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ 
        message: 'Authorization error',
        error: error.message 
      });
    }
  };
};

// Admin role check middleware
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Requires Admin role.',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ 
      message: 'Authorization error',
      error: error.message 
    });
  }
};
