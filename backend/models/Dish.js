// Partie Yassmine : modèle Plat (collection "dishes")
const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du plat est obligatoire'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, default: '' },
    prix: { type: Number, required: [true, 'Le prix est obligatoire'], min: [0, 'Le prix doit être positif'] },
    image: { type: String, default: '' },
    disponible: { type: Boolean, default: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  },
  { timestamps: true }
);

dishSchema.index({ restaurant: 1, categorie: 1 });
dishSchema.index({ nom: 'text' });

// Règle n°3 : « Un client ne peut commander que des plats disponibles ».
// À utiliser dans orderController (Adem) : const dishes = await Dish.getOrderable(ids);
// Lève une erreur (err.status = 400) si un plat est introuvable ou indisponible.
dishSchema.statics.getOrderable = async function (ids) {
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
