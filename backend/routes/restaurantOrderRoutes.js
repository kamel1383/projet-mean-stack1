// Partie Kamel — à monter AVANT orderRoutes dans server.js (voir server.snippet.js)
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const c = require('../controllers/restaurantOrderController');

router.get('/restaurant', protect, authorize('restaurateur'), c.getRestaurantOrders);
router.get('/restaurant/:id', protect, authorize('restaurateur'), c.getRestaurantOrderById);
router.put('/:id/status', protect, authorize('restaurateur'), c.updateOrderStatus);

module.exports = router;
