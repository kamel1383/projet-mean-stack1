/**
 * restaurantOrderController.js — Restaurateur Order Lifecycle Controller
 *
 * Allows a restaurateur to view incoming orders for their restaurant(s),
 * inspect a single order's details, and transition an order through its
 * allowed lifecycle states (`TRANSITIONS` map).
 */
// Partie Kamel : commandes côté restaurateur (cycle de vie)
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// Cycle de vie autorisé (règles métier n°8 et n°9 : "livree" et "annulee" sont terminaux)
// State machine: maps each current status to the array of valid next statuses.
const TRANSITIONS = {
  en_attente: ['acceptee', 'annulee'],
  acceptee: ['en_preparation', 'annulee'],
  en_preparation: ['en_livraison', 'annulee'],
  en_livraison: ['livree'],
  livree: [],
  annulee: [],
};

const userId = (req) => req.user._id || req.user.id;

// GET /api/orders/restaurant?statut=&restaurantId=&page=&limit=
// Lists paginated orders for all restaurants owned by the logged-in restaurateur (or one specific restaurantId).
exports.getRestaurantOrders = async (req, res) => {
  try {
    // Find all restaurant IDs owned by the current restaurateur
    const mine = await Restaurant.find({ owner: userId(req) }).select('_id');
    const myIds = mine.map((r) => r._id.toString());

    // If a specific restaurantId is requested, verify ownership before filtering
    let ids = myIds;
    if (req.query.restaurantId) {
      if (!myIds.includes(req.query.restaurantId)) {
        return res.status(403).json({ message: 'Ce restaurant ne vous appartient pas' });
      }
      ids = [req.query.restaurantId];
    }

    const filter = { restaurant: { $in: ids } };
    if (req.query.statut) filter.statut = req.query.statut;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('client', 'nom prenom telephone email')
        .populate('restaurant', 'nom')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/orders/restaurant/:id  (détails d'une commande)
// Fetches a single order and verifies that its restaurant belongs to the logged-in restaurateur.
exports.getRestaurantOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }
    const order = await Order.findById(req.params.id)
      .populate('client', 'nom prenom telephone email')
      .populate('restaurant', 'nom owner');
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    if (order.restaurant.owner.toString() !== userId(req).toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// PUT /api/orders/:id/status   body: { statut: "acceptee" }
// Advances an order's status after verifying ownership and checking the `TRANSITIONS` state machine.
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }
    if (!statut || !Object.keys(TRANSITIONS).includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    // Règle 7 : un restaurateur ne modifie que les commandes de SES restaurants
    const restaurant = await Restaurant.findOne({ _id: order.restaurant, owner: userId(req) });
    if (!restaurant) {
      return res.status(403).json({ message: "Cette commande n'appartient pas à vos restaurants" });
    }

    // Règle 9 : une commande livrée (ou annulée) ne peut plus être modifiée
    if (TRANSITIONS[order.statut].length === 0) {
      return res.status(400).json({ message: `Une commande "${order.statut}" ne peut plus être modifiée` });
    }

    // Règle 8 : respecter le cycle de vie
    if (!TRANSITIONS[order.statut].includes(statut)) {
      return res.status(400).json({
        message: `Transition interdite : ${order.statut} → ${statut}`,
        autorises: TRANSITIONS[order.statut],
      });
    }

    order.statut = statut;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
