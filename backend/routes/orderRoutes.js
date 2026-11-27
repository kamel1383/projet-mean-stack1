/**
 * orderRoutes.js — Client Order Routes (mounted at `/api/orders`)
 *
 * Endpoints for customers (`'client'` role) to place new orders
 * and view their own order history.
 */
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createOrder, getMyOrders } = require('../controllers/orderController');

// Toutes les routes nécessitent authentification + rôle client
// POST /api/orders -> Place a new order
router.post('/', protect, authorize('client'), createOrder);
// GET /api/orders/my-orders -> Fetch all orders placed by the logged-in client
router.get('/my-orders', protect, authorize('client'), getMyOrders);

module.exports = router;
