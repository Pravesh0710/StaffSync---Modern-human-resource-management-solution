/**
 * Middleware to restrict route access to specific user roles
 * @param  {...string} roles - e.g. 'HR', 'MANAGER', 'EMPLOYEE'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Your role (${req.user.role}) is not authorized to perform this operation.`
      });
    }

    next();
  };
};

module.exports = authorize;
