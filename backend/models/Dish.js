const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du plat est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    image: {
      type: String,
      default: '',
    },
    categorie: {
      type: String,
      default: '',
      trim: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Le restaurant est obligatoire'],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dish', dishSchema);
