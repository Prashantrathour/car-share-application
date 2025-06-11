const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // Check if user exists in request
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get the user's role from the authenticated user object
    const userRole = req.user.role;

    if (!userRole) {
      return res.status(401).json({
        status: 'error',
        message: 'User role not found. Please authenticate first.'
      });
    }

    if (userRole !== requiredRole) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = { checkRole }; 