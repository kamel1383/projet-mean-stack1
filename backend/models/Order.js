const mongoose = require('mongoose');

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
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
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
    sousTotal: {
      type: Number,
      required: true,
    },
    fraisLivraison: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    modePaiement: {
      type: String,
      enum: ['livraison', 'en ligne'],
      default: 'livraison',
    },
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
