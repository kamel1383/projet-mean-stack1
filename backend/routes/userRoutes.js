const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// --- Espace profil (utilisateur connecté) ---
router.get('/me', protect, userController.getMe);
router.put('/me', protect, userController.updateMe);
router.put('/me/password', protect, userController.changePassword);

// --- Espace gestion des utilisateurs (administrateur uniquement) ---
router.get('/', protect, authorize('admin'), userController.getUsers);
router.patch('/:id/status', protect, authorize('admin'), userController.updateUserStatus);

module.exports = router;
