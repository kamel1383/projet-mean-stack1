/**
 * authMiddleware.js — JWT Authentication Middleware
 *
 * Protects private API routes by verifying the JSON Web Token (JWT)
 * sent by the Angular frontend in the `Authorization: Bearer <token>` header.
 * If valid, it attaches the logged-in user document to `req.user`.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware function `protect`:
 * Runs before a route's controller to ensure the requester is logged in and active.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header starting with "Bearer "
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract only the token string after "Bearer "
    token = authHeader.split(' ')[1];
  }

  // Stop immediately with 401 Unauthorized if no token was provided
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé : aucun token fourni' });
  }

  try {
    // Verify the token signature and expiration using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up the user in MongoDB by the ID stored inside the token payload (excluding the password hash)
    const user = await User.findById(decoded.id).select('-password');

    // Reject if the user no longer exists in the database
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou token révoqué' });
    }

    // Reject with 403 Forbidden if an admin has deactivated this user account
    if (!user.isActive) {
      return res.status(403).json({ message: 'Votre compte est désactivé. Accès refusé' });
    }

    // Attach the authenticated user to the request object so downstream controllers can use `req.user`
    req.user = user;
    next();
  } catch (error) {
    // Token is malformed, tampered with, or expired
    return res.status(401).json({ message: 'Accès non autorisé : token invalide ou expiré' });
  }
};

module.exports = { protect };
