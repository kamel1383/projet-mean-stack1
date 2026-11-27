const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// --- Espace profil (utilisateur connecté) ---
router.get('/me', protect, userController.getMe);
router.put('/me', protect, userController.updateMe);
router.put('/me/password', protect, userController.changePassword);

// --- Espace gestion des utilisateurs et restaurateurs (administrateur uniquement) ---
router.get('/restaurateurs', protect, authorize('admin'), userController.getRestaurateurs);
router.post('/restaurateurs', protect, authorize('admin'), userController.createRestaurateurWithRestaurant);
router.put('/restaurateurs/:id', protect, authorize('admin'), userController.updateRestaurateur);
router.patch('/restaurateurs/:id/password', protect, authorize('admin'), userController.resetRestaurateurPassword);

router.get('/', protect, authorize('admin'), userController.getUsers);
router.patch('/:id/status', protect, authorize('admin'), userController.updateUserStatus);

module.exports = router;
