const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CompanySetting = require('../models/CompanySetting');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/roles');

// Protect routes
const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  // Also check auth header just in case cookie isn't used
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route` });
    }
    next();
  };
};

const authorizeModule = (moduleName) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user context' });
  }

  const settings = await CompanySetting.findOne({}).lean();
  const permissions = settings?.permissions?.[req.user.role] || DEFAULT_ROLE_PERMISSIONS[req.user.role] || [];

  if (!permissions.includes(moduleName)) {
    return res.status(403).json({ message: `Role ${req.user.role} does not have access to ${moduleName}` });
  }

  next();
};

module.exports = { protect, authorize, authorizeModule };
