/**
 * Order.js — Mongoose Model for Customer Orders (collection: "orders")
 *
 * Stores the client who placed the order, the target restaurant, a snapshot of the ordered
 * items (`articles`), delivery address, price breakdown (`sousTotal`, `fraisLivraison`, `total`),
 * payment mode, and lifecycle status (`en_attente` -> `acceptee` -> `en_preparation` -> `en_livraison` -> `livree`, or `annulee`).
 */
const mongoose = require('mongoose');

// Sub-schema for each line item inside an order.
// Storing `nom` and `prixUnitaire` here preserves historical order prices even if the dish changes later.
const orderArticleSchema = new mongoose.Schema(
  {
    plat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
    },
    nom: {
      type: String,
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      min: [1, 'La quantité minimale est 1'],
    },
    prixUnitaire: {
      type: Number,
      required: true,
    },
  },
  { _id: false } // Prevents Mongoose from generating an extra _id for each sub-document
);

const orderSchema = new mongoose.Schema(
  {
    // Reference to the client (User) who placed the order
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the Restaurant fulfilling the order
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    // Array of ordered dishes; custom validator ensures at least 1 item is present
    articles: {
      type: [orderArticleSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'La commande doit contenir au moins un article',
      },
    },
    adresseLivraison: {
      type: String,
      required: [true, "L'adresse de livraison est obligatoire"],
      trim: true,
    },
    // Sum of (prixUnitaire * quantite) for all articles
    sousTotal: {
      type: Number,
      required: true,
    },
    // Delivery fee copied from the Restaurant at order creation time
    fraisLivraison: {
      type: Number,
      required: true,
    },
    // Final amount = sousTotal + fraisLivraison
    total: {
      type: Number,
      required: true,
    },
    modePaiement: {
      type: String,
      enum: ['livraison', 'en ligne'],
      default: 'livraison',
    },
    // Tracks the order's progress from placement to delivery or cancellation
    statut: {
      type: String,
      enum: [
        'en_attente',
        'acceptee',
        'en_preparation',
        'en_livraison',
        'livree',
        'annulee',
      ],
      default: 'en_attente',
    },
    remarque: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
