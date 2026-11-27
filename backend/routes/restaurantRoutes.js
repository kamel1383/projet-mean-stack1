/**
 * restaurantRoutes.js — Restaurant API Routes (mounted at `/api/restaurants`)
 *
 * Combines public browsing routes (`GET /`, `GET /:id`), restaurateur-only routes
 * (`GET /my`, `POST /`, `PUT /:id`), and admin moderation routes (`/admin`, `/:id/status`, `/:id/owner`).
 * Note: static paths like `/my` and `/admin` are defined BEFORE `/:id` so Express doesn't treat them as IDs.
 */
const router = require('express').Router();
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
// Public: list validated restaurants (supports search/cuisine/open filters)
router.get('/', restaurantController.getRestaurants);
// Restaurateur: list restaurants owned by the logged-in restaurateur
router.get(
  '/my',
  protect,
  authorize('restaurateur'),
  restaurantController.getMyRestaurants
);
// Admin: list all restaurants regardless of status
router.get(
  '/admin',
  protect,
  authorize('admin'),
  restaurantController.getAdminRestaurants
);
// Admin: create a restaurant and assign it to an existing restaurateur owner
router.post(
  '/admin',
  protect,
  authorize('admin'),
  restaurantController.createRestaurantForOwner
);

// Admin: approve ('valide') or suspend ('suspendu') a restaurant
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  restaurantController.updateRestaurantStatus
);
// Admin: reassign restaurant ownership to another restaurateur
router.patch(
  '/:id/owner',
  protect,
  authorize('admin'),
  restaurantController.changeRestaurantOwner
);
// Public: get single restaurant details by ID
router.get('/:id', restaurantController.getRestaurantById);
// Restaurateur: create a new restaurant (starts with status 'en_attente')
router.post(
  '/',
  protect,
  authorize('restaurateur'),
  restaurantController.createRestaurant
);
// Logged-in owner or admin (ownership is checked inside the controller)
router.put(
  '/:id',
  protect,
  restaurantController.updateRestaurant
);



module.exports = router;