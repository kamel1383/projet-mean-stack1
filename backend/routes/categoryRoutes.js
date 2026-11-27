const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const categoryController = require('../controllers/categoryController');

router.get(
  '/restaurant/:restaurantId',
  categoryController.getCategoriesByRestaurant
);

router.post(
  '/',
  protect,
  authorize('restaurateur'),
  categoryController.createCategory
);
router.put(
  '/:categoryId',
  protect,
  authorize('restaurateur'),
  categoryController.updateCategory
);
router.delete(
  '/:categoryId',
  protect,
  authorize('restaurateur'),
  categoryController.deleteCategory
);
module.exports = router;