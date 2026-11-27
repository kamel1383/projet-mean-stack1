const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const c = require('../controllers/statsController');

router.get('/restaurant', protect, authorize('restaurateur'), c.getRestaurantStats);
router.get('/admin', protect, authorize('admin'), c.getAdminStats);

module.exports = router;
