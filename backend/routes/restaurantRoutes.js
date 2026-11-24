const router = require('express').Router();
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
router.get('/', restaurantController.getRestaurants);
router.get(
  '/admin',
  protect,
  authorize('admin'),
  restaurantController.getAdminRestaurants
);

router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  restaurantController.updateRestaurantStatus
);
router.get('/:id', restaurantController.getRestaurantById);
router.post(
  '/',
  protect,
  authorize('restaurateur'),
  restaurantController.createRestaurant
);
router.put(
  '/:id',
  protect,
  restaurantController.updateRestaurant
);



module.exports = router;