/**
 * authRoutes.js — Authentication Routes (mounted at `/api/auth`)
 *
 * Public endpoints for user registration and login.
 * Neither route requires a JWT token because the user is obtaining one here.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register -> Create a new client or restaurateur account
router.post('/register', authController.register);
// POST /api/auth/login -> Verify credentials and return a signed JWT token + user profile
router.post('/login', authController.login);

module.exports = router;
