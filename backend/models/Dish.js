/**
 * Dish.js — Mongoose Model for Menu Dishes (collection: "dishes")
 *
 * Represents a food item belonging to a specific Category and Restaurant.
 * Includes a static helper `getOrderable(ids)` to validate that ordered dishes exist and are available.
 */
// Partie Yassmine : modèle Plat (collection "dishes")
const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du plat est obligatoire'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, default: '' },
    prix: { type: Number, required: [true, 'Le prix est obligatoire'], min: [0, 'Le prix doit être positif'] },
    image: { type: String, default: '' },
    // Whether customers can currently order this dish
    disponible: { type: Boolean, default: true },
    // Reference to the Category this dish belongs to
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    // Reference to the Restaurant that serves this dish
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  },
  { timestamps: true }
);

// Indexes to speed up menu queries by restaurant/category and text search by dish name
dishSchema.index({ restaurant: 1, categorie: 1 });
dishSchema.index({ nom: 'text' });

// Règle n°3 : « Un client ne peut commander que des plats disponibles ».
// À utiliser dans orderController (Adem) : const dishes = await Dish.getOrderable(ids);
// Lève une erreur (err.status = 400) si un plat est introuvable ou indisponible.
/**
 * Static method `getOrderable(ids)`:
 * Fetches all dishes matching the given IDs, verifies that every ID exists in MongoDB,
 * and checks that every dish has `disponible === true`. Throws a 400 error otherwise.
 */
dishSchema.statics.getOrderable = async function (ids) {
  // Deduplicate IDs so we can compare the count of found documents accurately
  const unique = [...new Set(ids.map(String))];
  const dishes = await this.find({ _id: { $in: unique } });
  if (dishes.length !== unique.length) {
    const err = new Error('Un des plats est introuvable');
    err.status = 400;
    throw err;
  }
  const unavailable = dishes.filter((d) => !d.disponible);
  if (unavailable.length) {
    const err = new Error(`Plat(s) indisponible(s) : ${unavailable.map((d) => d.nom).join(', ')}`);
    err.status = 400;
    throw err;
  }
  return dishes;
};

module.exports = mongoose.model('Dish', dishSchema);
