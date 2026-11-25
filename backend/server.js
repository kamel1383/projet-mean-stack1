require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import des routes du périmètre Membre 1 (Auth & Users)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Import des routes existantes développées par les autres membres
let restaurantRoutes;
let restaurantOrderRoutes;
let statsRoutes;
let categoryRoutes;

try { restaurantRoutes = require('./routes/restaurantRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { restaurantOrderRoutes = require('./routes/restaurantOrderRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { statsRoutes = require('./routes/statsRoutes'); } catch (e) { /* route optionnelle si absente */ }
try { categoryRoutes = require('./routes/categoryRoutes'); } catch (e) { /* route optionnelle si absente */ }

const app = express();

// Middlewares globaux
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// --- Branchement des routes Périmètre Membre 1 : Authentification & Utilisateurs ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- Branchement des routes des autres membres (conformément à server.snippet.js) ---
if (restaurantOrderRoutes) {
  // IMPORTANT : restaurantOrderRoutes avant orderRoutes (sinon /:id capture "restaurant")
  app.use('/api/orders', restaurantOrderRoutes);
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

// Route de santé (Health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ message: 'Ressource introuvable sur ce serveur' });
});

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('[Erreur Serveur] :', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Une erreur interne est survenue',
  });
});

const PORT = process.env.PORT || 5000;

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
