// À AJOUTER dans server.js (ne pas remplacer le fichier entier : il est partagé)
const restaurantOrderRoutes = require('./routes/restaurantOrderRoutes');
const statsRoutes = require('./routes/statsRoutes');

// IMPORTANT : restaurantOrderRoutes avant orderRoutes (sinon /:id capture "restaurant")
app.use('/api/orders', restaurantOrderRoutes);
app.use('/api/orders', orderRoutes);   // routes d'Adem
app.use('/api/stats', statsRoutes);
