/**
 * dishRoutes.js — Menu Dish Routes (mounted at `/api/dishes`)
 *
 * Public routes allow browsing dishes; protected `'restaurateur'` routes
 * allow managing dishes for restaurants owned by the logged-in user.
 */
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const c = require('../controllers/dishController');

// Routes publiques (consultation du menu)
router.get('/', c.getDishes);

// IMPORTANT : /mine et /my-options AVANT /:id (sinon "mine" est pris pour un identifiant)
router.get('/mine', protect, authorize('restaurateur'), c.getMyDishes);
router.get('/my-options', protect, authorize('restaurateur'), c.getMyOptions);

router.get('/:id', c.getDishById);

// Gestion par le restaurateur (propriété vérifiée dans le contrôleur)
router.post('/', protect, authorize('restaurateur'), c.createDish);
router.put('/:id', protect, authorize('restaurateur'), c.updateDish);
router.delete('/:id', protect, authorize('restaurateur'), c.deleteDish);

module.exports = router;