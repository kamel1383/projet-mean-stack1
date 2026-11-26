const router = require('express').Router();
const dishController = require('../controllers/dishController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public : menu d'un restaurant
router.get('/restaurant/:restaurantId', dishController.getDishesByRestaurant);

// Restaurateur : gestion de ses plats
router.get('/my', protect, authorize('restaurateur'), dishController.getMyDishes);
router.post('/', protect, authorize('restaurateur'), dishController.createDish);
router.put('/:id', protect, authorize('restaurateur'), dishController.updateDish);
router.patch('/:id/availability', protect, authorize('restaurateur'), dishController.toggleAvailability);
router.delete('/:id', protect, authorize('restaurateur'), dishController.deleteDish);

module.exports = router;
