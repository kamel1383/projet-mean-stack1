/**
 * restaurantOrderRoutes.js — Restaurateur Order Management Routes (mounted at `/api/orders`)
 *
 * Endpoints for `'restaurateur'` users to list incoming orders for their restaurants,
 * inspect a specific order, and advance its status (e.g., acceptee -> en_preparation -> livree).
 */
// Partie Kamel — à monter AVANT orderRoutes dans server.js (voir server.snippet.js)
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const c = require('../controllers/restaurantOrderController');

// GET /api/orders/restaurant -> List orders for the restaurateur's restaurant(s)
router.get('/restaurant', protect, authorize('restaurateur'), c.getRestaurantOrders);
// GET /api/orders/restaurant/:id -> Get details of one order owned by the restaurateur
router.get('/restaurant/:id', protect, authorize('restaurateur'), c.getRestaurantOrderById);
// PUT /api/orders/:id/status -> Update order status following allowed transitions
router.put('/:id/status', protect, authorize('restaurateur'), c.updateOrderStatus);

module.exports = router;
