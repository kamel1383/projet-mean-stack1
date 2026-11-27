/**
 * Category.js — Mongoose Model for Menu Categories (collection: "categories")
 *
 * Each restaurant organizes its dishes into categories (e.g., "Entrées", "Plats principaux", "Desserts").
 * A compound unique index ensures a single restaurant cannot have two categories with the exact same name.
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Links this category to a specific Restaurant document
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
  },
  { timestamps: true }
);

// Évite deux catégories portant le même nom dans un restaurant.
// Compound unique index on (restaurant, nom)
categorySchema.index({ restaurant: 1, nom: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);