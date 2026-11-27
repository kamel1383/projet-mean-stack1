/**
 * server.snippet.js — Reference Integration Snippet
 *
 * Not executed directly; serves as a team integration note showing how
 * restaurant orders, stats, and dish routes should be mounted in `server.js`.
 */
// À AJOUTER dans server.js (ne pas remplacer le fichier entier : il est partagé)
const restaurantOrderRoutes = require('./routes/restaurantOrderRoutes');
const statsRoutes = require('./routes/statsRoutes');
const dishRoutes = require('./routes/dishRoutes');
// IMPORTANT : restaurantOrderRoutes avant orderRoutes (sinon /:id capture "restaurant")
app.use('/api/orders', restaurantOrderRoutes);
app.use('/api/orders', orderRoutes);   // routes d'Adem
app.use('/api/stats', statsRoutes);
app.use('/api/dishes', dishRoutes);