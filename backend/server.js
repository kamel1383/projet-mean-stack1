/**
 * server.js — Main Express Application Entry Point
 *
 * Sets up the Express web server, configures CORS and JSON body parsing,
 * mounts all API route modules under `/api/*`, handles 404/error responses,
 * connects to MongoDB, and starts listening on `PORT` (default 5000).
 */
// Load environment variables from backend/.env into process.env
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import des routes du périmètre Membre 1 (Auth & Users)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Import des routes existantes développées par les autres membres
// Optional route imports wrapped in try/catch so the server can still boot
// during modular team development if a teammate's route file is not present yet.
let restaurantRoutes;
let restaurantOrderRoutes;
let statsRoutes;
let categoryRoutes;
let orderRoutes;
let dishRoutes;

try { restaurantRoutes = require('./routes/restaurantRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { restaurantOrderRoutes = require('./routes/restaurantOrderRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { statsRoutes = require('./routes/statsRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { categoryRoutes = require('./routes/categoryRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { orderRoutes = require('./routes/orderRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { dishRoutes = require('./routes/dishRoutes'); } catch (e) { /* route optionnelle si absente */ }

const app = express();

// Middlewares globaux
// Allow requests from the Angular dev server (localhost:4200) with cookies/auth headers
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
// Parse incoming JSON request bodies (up to 2 MB, e.g. for base64 images)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// --- Branchement des routes Périmètre Membre 1 : Authentification & Utilisateurs ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- Branchement des routes des autres membres (conformément à server.snippet.js) ---
if (restaurantOrderRoutes) {
  // IMPORTANT : restaurantOrderRoutes avant orderRoutes (sinon /:id capture "restaurant")
  // Mounting order matters in Express: `/api/orders/restaurant/...` must match before `/api/orders/:id`.
  app.use('/api/orders', restaurantOrderRoutes);
}
if (orderRoutes) {
  app.use('/api/orders', orderRoutes);
}
if (restaurantRoutes) {
  app.use('/api/restaurants', restaurantRoutes);
}
if (statsRoutes) {
  app.use('/api/stats', statsRoutes);
}
if (categoryRoutes) {
  app.use('/api/categories', categoryRoutes);
}
if (dishRoutes) {
  app.use('/api/dishes', dishRoutes);
}

// Route de santé (Health check) — used to verify the API is up and running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des routes inconnues — catches any request that didn't match a route above
app.use((req, res) => {
  res.status(404).json({ message: 'Ressource introuvable sur ce serveur' });
});

// Middleware global de gestion des erreurs — catches errors passed via `next(err)`
app.use((err, req, res, next) => {
  console.error('[Erreur Serveur] :', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Une erreur interne est survenue',
  });
});

const PORT = process.env.PORT || 5000;

/**
 * Connects to MongoDB first, then starts the HTTP server.
 * Exits with code 1 if the database connection fails.
 */
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Serveur FoodExpress démarré sur : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Échec du démarrage du serveur :', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
