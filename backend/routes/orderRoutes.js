const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createOrder, getMyOrders } = require('../controllers/orderController');

// Toutes les routes nécessitent authentification + rôle client
router.post('/', protect, authorize('client'), createOrder);
router.get('/my-orders', protect, authorize('client'), getMyOrders);

module.exports = router;
