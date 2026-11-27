/**
 * Restaurant.js — Mongoose Model for Restaurants (collection: "restaurants")
 *
 * Represents a restaurant on the platform, including its details, delivery fee,
 * open/closed toggle (`isOpen`), owner reference (`User`), and admin approval status (`statut`).
 */
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    adresse: {
      type: String,
      required: true,
      trim: true,
    },
    // Cuisine category (e.g., "Italienne", "Tunisienne", "Japonaise") used for filtering
    typeCuisine: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    fraisLivraison: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // Opening hours text (e.g., "11h00 - 23h00")
    horaires: {
      type: String,
      required: true,
      trim: true,
    },
    // Indicates whether the restaurant is currently accepting orders
    isOpen: {
      type: Boolean,
      default: false,
    },
    // Reference to the User document (with role 'restaurateur') who owns this restaurant
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Admin moderation status: pending approval, validated (visible to clients), or suspended
    statut: {
      type: String,
      enum: ['en_attente', 'valide', 'suspendu'],
      default: 'en_attente',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);