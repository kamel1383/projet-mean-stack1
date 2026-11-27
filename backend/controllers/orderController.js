/**
 * orderController.js — Client Order Controller
 *
 * Handles order creation (`createOrder`) and order history retrieval (`getMyOrders`)
 * for logged-in customers (`'client'` role).
 * Security note: Dish names, prices, and delivery fees are always fetched from MongoDB
 * on the server rather than trusting values sent by the frontend.
 */
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');

// POST /api/orders — Passer une commande (client uniquement)
// Validates request body, verifies restaurant and dish availability in MongoDB,
// computes subtotal/total server-side, and creates the Order document.
exports.createOrder = async (req, res) => {
  try {
    const { restaurant, articles, adresseLivraison, modePaiement, remarque } = req.body;

    // --- Validations de base ---
    if (!restaurant) {
      return res.status(400).json({ message: 'Le restaurant est obligatoire' });
    }
    if (!adresseLivraison || !adresseLivraison.trim()) {
      return res.status(400).json({ message: "L'adresse de livraison est obligatoire" });
    }
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ message: 'La commande doit contenir au moins un article' });
    }

    for (const art of articles) {
      if (!art.plat) {
        return res.status(400).json({ message: 'Chaque article doit référencer un plat' });
      }
      if (!art.quantite || art.quantite < 1) {
        return res.status(400).json({ message: 'La quantité de chaque article doit être >= 1' });
      }
    }

    // --- Vérifier que le restaurant existe ---
    if (!mongoose.isValidObjectId(restaurant)) {
      return res.status(400).json({ message: 'Identifiant de restaurant invalide' });
    }
    const resto = await Restaurant.findById(restaurant);
    if (!resto) {
      return res.status(404).json({ message: 'Restaurant introuvable' });
    }

    const fraisLivraison = resto.fraisLivraison || 0;

    // --- Vérifier chaque plat et construire les articles avec données serveur ---
    const articlesVerifies = [];
    let sousTotal = 0;

    for (const art of articles) {
      if (!mongoose.isValidObjectId(art.plat)) {
        return res.status(400).json({ message: `Identifiant de plat invalide : ${art.plat}` });
      }

      const plat = await Dish.findById(art.plat);
      if (!plat) {
        return res.status(404).json({ message: `Plat introuvable (id: ${art.plat})` });
      }
      if (!plat.disponible) {
        return res.status(400).json({
          message: `Le plat "${plat.nom}" n'est actuellement pas disponible`,
        });
      }

      // Copier nom et prix depuis la base (jamais confiance au front)
      const prixUnitaire = plat.prix;
      const nom = plat.nom;
      const quantite = Math.floor(art.quantite);

      articlesVerifies.push({ plat: plat._id, nom, quantite, prixUnitaire });
      sousTotal += prixUnitaire * quantite;
    }

    // Arrondir pour éviter les erreurs de virgule flottante
    sousTotal = Math.round(sousTotal * 100) / 100;
    const total = Math.round((sousTotal + fraisLivraison) * 100) / 100;

    const order = await Order.create({
      client: req.user._id || req.user.id,
      restaurant: resto._id,
      articles: articlesVerifies,
      adresseLivraison: adresseLivraison.trim(),
      sousTotal,
      fraisLivraison,
      total,
      modePaiement: modePaiement || 'livraison',
      statut: 'en_attente',
      remarque: remarque || '',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('[createOrder]', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/orders/my-orders — Historique du client connecté
// Returns all orders placed by the logged-in customer, newest first, with restaurant info populated.
exports.getMyOrders = async (req, res) => {
  try {
    const clientId = req.user._id || req.user.id;

    const orders = await Order.find({ client: clientId })
      .populate('restaurant', 'nom image adresse')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('[getMyOrders]', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
