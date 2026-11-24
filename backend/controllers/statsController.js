// Partie Kamel : statistiques restaurateur + admin
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const userId = (req) => req.user._id || req.user.id;
const countIf = (statut) => ({ $sum: { $cond: [{ $eq: ['$statut', statut] }, 1, 0] } });

// GET /api/stats/restaurant   (role: restaurateur)
exports.getRestaurantStats = async (req, res) => {
  try {
    const mine = await Restaurant.find({ owner: userId(req) }).select('_id');
    const match = { restaurant: { $in: mine.map((r) => r._id) } };

    const [summary] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: countIf('en_attente'),
          acceptedOrders: countIf('acceptee'),
          // Chiffre d'affaires = commandes livrées uniquement
          revenue: { $sum: { $cond: [{ $eq: ['$statut', 'livree'] }, '$total', 0] } },
        },
      },
    ]);

    const topDishes = await Order.aggregate([
      { $match: { ...match, statut: { $ne: 'annulee' } } },
      { $unwind: '$articles' },
      {
        $group: {
          _id: '$articles.plat',
          nom: { $first: '$articles.nom' },
          quantite: { $sum: '$articles.quantite' },
        },
      },
      { $sort: { quantite: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalOrders: summary?.totalOrders || 0,
      pendingOrders: summary?.pendingOrders || 0,
      acceptedOrders: summary?.acceptedOrders || 0,
      revenue: summary?.revenue || 0,
      topDishes,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/stats/admin   (role: admin)
exports.getAdminStats = async (req, res) => {
  try {
    const [clients, restaurants, orders, revenueAgg, byStatus] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { statut: 'livree' } },
        { $group: { _id: null, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
    ]);

    res.json({
      clients,
      restaurants,
      orders,
      revenue: revenueAgg[0]?.revenue || 0,
      ordersByStatus: byStatus.map((s) => ({ statut: s._id, count: s.count })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
