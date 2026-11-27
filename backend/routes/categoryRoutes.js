/**
 * categoryRoutes.js — Menu Category Routes (mounted at `/api/categories`)
 *
 * Publicly exposes categories for a given restaurant, while creation,
 * updating, and deletion are restricted to authenticated `'restaurateur'` users.
 */
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const categoryController = require('../controllers/categoryController');

// Public: fetch all menu categories for a specific restaurant
router.get(
  '/restaurant/:restaurantId',
  categoryController.getCategoriesByRestaurant
);

// Restaurateur: create, update, or delete a category (ownership verified in controller)
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