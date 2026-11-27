/**
 * statsRoutes.js — Analytics & Dashboard Statistics Routes (mounted at `/api/stats`)
 *
 * Provides aggregated KPIs and chart data for both the Restaurateur dashboard
 * (`/api/stats/restaurant`) and the Admin dashboard (`/api/stats/admin`).
 */
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const c = require('../controllers/statsController');

// Restaurateur KPIs (revenue, order counts, top dishes, daily/status breakdown)
router.get('/restaurant', protect, authorize('restaurateur'), c.getRestaurantStats);
// Platform-wide Admin KPIs (total users, restaurants, orders, revenue, top restaurants)
router.get('/admin', protect, authorize('admin'), c.getAdminStats);

module.exports = router;
