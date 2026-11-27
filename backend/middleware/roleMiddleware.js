/**
 * roleMiddleware.js — Role-Based Access Control (RBAC) Middleware
 *
 * Used AFTER `protect` (authMiddleware) to restrict a route to specific user roles
 * such as 'admin', 'restaurateur', or 'client'.
 */

/**
 * Factory function `authorize(...roles)`:
 * Returns an Express middleware that checks if `req.user.role` is in the allowed `roles` list.
 * Example usage in a route: `router.get('/admin-only', protect, authorize('admin'), controllerFn)`
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Deny access with 403 Forbidden if user is missing or their role is not permitted
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit : rôle insuffisant pour effectuer cette action' });
    }
    // User has a valid role; proceed to the next middleware or controller
    next();
  };
};

module.exports = { authorize };
