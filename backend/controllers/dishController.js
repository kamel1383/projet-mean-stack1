/**
 * dishController.js — Dish / Menu Item Controller
 *
 * Handles public dish listing & lookup (`getDishes`, `getDishById`) as well as
 * restaurateur menu management (`getMyDishes`, `getMyOptions`, `createDish`, `updateDish`, `deleteDish`).
 * Every write operation verifies that the restaurant belongs to the logged-in restaurateur.
 */
// Partie Yassmine : plats et menus
const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');

// Helper functions for user ID extraction and standardized JSON error responses
const userId = (req) => req.user._id || req.user.id;
const bad = (res, message, status = 400) => res.status(status).json({ message });
const serverError = (res, err) => res.status(500).json({ message: 'Erreur serveur', error: err.message });

// Champs modifiables par le restaurateur (liste blanche : "restaurant" n'est pas modifiable)
const EDITABLE = ['nom', 'description', 'prix', 'image', 'disponible', 'categorie'];

// Contrôle de propriété : le restaurant doit appartenir au restaurateur connecté
const ownsRestaurant = (req, restaurantId) =>
  Restaurant.exists({ _id: restaurantId, owner: userId(req) });

// Valide les champs reçus ; retourne un message d'erreur ou null
// When `partial` is true (PUT update), only fields actually present in `body` are validated.
function validate(body, { partial }) {
  if (!partial || body.nom !== undefined) {
    if (typeof body.nom !== 'string' || !body.nom.trim()) return 'Le nom du plat est obligatoire';
  }
  if (!partial || body.prix !== undefined) {
    const p = Number(body.prix);
    if (body.prix === '' || body.prix === null || body.prix === undefined || Number.isNaN(p) || p < 0) {
      return 'Le prix doit être un nombre positif';
    }
  }
  if (body.disponible !== undefined && typeof body.disponible !== 'boolean') {
    return 'Le champ disponible doit être un booléen';
  }
  return null;
}

// GET /api/dishes?restaurant=&categorie=&disponible=&search=   (public)
// Public endpoint: lists dishes with optional filters for restaurant, category, availability, and name search.
exports.getDishes = async (req, res) => {
  try {
    const { restaurant, categorie, disponible, search } = req.query;
    const filter = {};
    if (restaurant) {
      if (!mongoose.isValidObjectId(restaurant)) return bad(res, 'Identifiant restaurant invalide');
      filter.restaurant = restaurant;
    }
    if (categorie) {
      if (!mongoose.isValidObjectId(categorie)) return bad(res, 'Identifiant catégorie invalide');
      filter.categorie = categorie;
    }
    if (disponible === 'true' || disponible === 'false') filter.disponible = disponible === 'true';
    if (search) {
      filter.nom = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const dishes = await Dish.find(filter).populate('categorie', 'nom').sort({ nom: 1 });
    res.json(dishes);
  } catch (err) {
    serverError(res, err);
  }
};

// GET /api/dishes/mine   (restaurateur : tous les plats de ses restaurants)
// Finds all restaurants owned by the logged-in restaurateur, then returns all their dishes.
exports.getMyDishes = async (req, res) => {
  try {
    const mine = await Restaurant.find({ owner: userId(req) }).select('_id');
    const dishes = await Dish.find({ restaurant: { $in: mine.map((r) => r._id) } })
      .populate('categorie', 'nom')
      .populate('restaurant', 'nom')
      .sort({ nom: 1 });
    res.json(dishes);
  } catch (err) {
    serverError(res, err);
  }
};

// GET /api/dishes/my-options   (restaurateur : ses restaurants + leurs catégories, pour le formulaire)
// Provides dropdown options (restaurants and their categories) for the dish creation/edit form.
exports.getMyOptions = async (req, res) => {
  try {
const restaurants = await Restaurant.find({ owner: userId(req) });    const categories = await Category.find({ restaurant: { $in: restaurants.map((r) => r._id) } })
      .select('nom restaurant')
      .sort({ nom: 1 });
    res.json({ restaurants, categories });
  } catch (err) {
    serverError(res, err);
  }
};

// GET /api/dishes/:id   (public)
// Returns a single dish by ID with its category name populated.
exports.getDishById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, 'Identifiant invalide');
    const dish = await Dish.findById(req.params.id).populate('categorie', 'nom');
    if (!dish) return bad(res, 'Plat introuvable', 404);
    res.json(dish);
  } catch (err) {
    serverError(res, err);
  }
};

// POST /api/dishes   (restaurateur propriétaire du restaurant)
// Validates fields, checks restaurant ownership and category consistency, then creates the dish.
exports.createDish = async (req, res) => {
  try {
    const msg = validate(req.body, { partial: false });
    if (msg) return bad(res, msg);

    const { restaurant, categorie } = req.body;
    if (!mongoose.isValidObjectId(restaurant) || !mongoose.isValidObjectId(categorie)) {
      return bad(res, 'Restaurant et catégorie sont obligatoires');
    }
    if (!(await ownsRestaurant(req, restaurant))) {
      return bad(res, 'Ce restaurant ne vous appartient pas', 403);
    }
    // La catégorie doit appartenir au même restaurant (cohérence des données)
    if (!(await Category.exists({ _id: categorie, restaurant }))) {
      return bad(res, "Cette catégorie n'appartient pas à ce restaurant");
    }

    const data = { restaurant };
    EDITABLE.forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    data.nom = data.nom.trim();
    data.prix = Number(data.prix);

    const dish = await Dish.create(data);
    res.status(201).json(await dish.populate('categorie', 'nom'));
  } catch (err) {
    if (err.name === 'ValidationError') return bad(res, err.message);
    serverError(res, err);
  }
};

// PUT /api/dishes/:id   (modification partielle : infos, prix, disponibilité, catégorie)
// Updates allowed fields on an existing dish after verifying the user owns its restaurant.
exports.updateDish = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, 'Identifiant invalide');
    const dish = await Dish.findById(req.params.id);
    if (!dish) return bad(res, 'Plat introuvable', 404);
    if (!(await ownsRestaurant(req, dish.restaurant))) {
      return bad(res, "Ce plat n'appartient pas à vos restaurants", 403);
    }

    const msg = validate(req.body, { partial: true });
    if (msg) return bad(res, msg);

    if (req.body.categorie !== undefined) {
      const okId = mongoose.isValidObjectId(req.body.categorie);
      if (!okId || !(await Category.exists({ _id: req.body.categorie, restaurant: dish.restaurant }))) {
        return bad(res, "Cette catégorie n'appartient pas au restaurant du plat");
      }
    }

    EDITABLE.forEach((k) => { if (req.body[k] !== undefined) dish[k] = req.body[k]; });
    if (req.body.prix !== undefined) dish.prix = Number(req.body.prix);
    await dish.save();
    res.json(await dish.populate('categorie', 'nom'));
  } catch (err) {
    if (err.name === 'ValidationError') return bad(res, err.message);
    serverError(res, err);
  }
};

// DELETE /api/dishes/:id
// Deletes a dish owned by the restaurateur; past orders retain dish name/price snapshots.
exports.deleteDish = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, 'Identifiant invalide');
    const dish = await Dish.findById(req.params.id);
    if (!dish) return bad(res, 'Plat introuvable', 404);
    if (!(await ownsRestaurant(req, dish.restaurant))) {
      return bad(res, "Ce plat n'appartient pas à vos restaurants", 403);
    }
    // Les commandes passées gardent nom et prix dans leurs articles : l'historique n'est pas affecté
    await dish.deleteOne();
    res.json({ message: 'Plat supprimé' });
  } catch (err) {
    serverError(res, err);
  }
};
