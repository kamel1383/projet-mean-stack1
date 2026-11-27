const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');

const userId = (req) => req.user._id || req.user.id;

async function findOwnedDish(dishId, ownerId) {
  if (!mongoose.isObjectIdOrHexString(dishId)) {
    return { error: { status: 400, message: 'Identifiant de plat invalide' } };
  }
  const dish = await Dish.findById(dishId);
  if (!dish) {
    return { error: { status: 404, message: 'Plat introuvable' } };
  }
  const restaurant = await Restaurant.findOne({ _id: dish.restaurant, owner: ownerId });
  if (!restaurant) {
    return { error: { status: 403, message: 'Ce plat ne vous appartient pas' } };
  }
  return { dish, restaurant };
}

// GET /api/dishes/restaurant/:restaurantId (public)
exports.getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.isObjectIdOrHexString(restaurantId)) {
      return res.status(400).json({ message: 'Identifiant de restaurant invalide' });
    }

    const filter = { restaurant: restaurantId };
    if (req.query.disponible === 'true') {
      filter.disponible = true;
    }

    const dishes = await Dish.find(filter).sort({ categorie: 1, nom: 1 });
    return res.json(dishes);
  } catch (error) {
    console.error('Erreur getDishesByRestaurant :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/dishes/my (restaurateur)
exports.getMyDishes = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: userId(req) }).sort({ nom: 1 });
    const restaurantIds = restaurants.map((r) => r._id);
    const dishes = await Dish.find({ restaurant: { $in: restaurantIds } })
      .populate('restaurant', 'nom')
      .sort({ createdAt: -1 });

    return res.json({ restaurants, dishes });
  } catch (error) {
    console.error('Erreur getMyDishes :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/dishes (restaurateur)
exports.createDish = async (req, res) => {
  try {
    const owner = userId(req);
    const { nom, description, prix, image, categorie, disponible, restaurant: restaurantId } = req.body;

    let targetRestaurant;
    if (restaurantId) {
      if (!mongoose.isObjectIdOrHexString(restaurantId)) {
        return res.status(400).json({ message: 'Identifiant de restaurant invalide' });
      }
      targetRestaurant = await Restaurant.findOne({ _id: restaurantId, owner });
    } else {
      targetRestaurant = await Restaurant.findOne({ owner });
    }

    if (!targetRestaurant) {
      return res.status(404).json({ message: 'Aucun restaurant trouvé pour ce compte' });
    }

    const dish = await Dish.create({
      nom,
      description,
      prix,
      image,
      categorie,
      disponible: disponible !== undefined ? disponible : true,
      restaurant: targetRestaurant._id,
    });

    const populated = await dish.populate('restaurant', 'nom');
    return res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur createDish :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/dishes/:id (restaurateur)
exports.updateDish = async (req, res) => {
  try {
    const { dish, error } = await findOwnedDish(req.params.id, userId(req));
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { nom, description, prix, image, categorie, disponible } = req.body;
    if (nom !== undefined) dish.nom = nom;
    if (description !== undefined) dish.description = description;
    if (prix !== undefined) dish.prix = prix;
    if (image !== undefined) dish.image = image;
    if (categorie !== undefined) dish.categorie = categorie;
    if (disponible !== undefined) dish.disponible = disponible;

    await dish.save();
    const populated = await dish.populate('restaurant', 'nom');
    return res.json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur updateDish :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PATCH /api/dishes/:id/availability (restaurateur)
exports.toggleAvailability = async (req, res) => {
  try {
    const { dish, error } = await findOwnedDish(req.params.id, userId(req));
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    dish.disponible = !dish.disponible;
    await dish.save();
    const populated = await dish.populate('restaurant', 'nom');
    return res.json(populated);
  } catch (error) {
    console.error('Erreur toggleAvailability :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/dishes/:id (restaurateur)
exports.deleteDish = async (req, res) => {
  try {
    const { dish, error } = await findOwnedDish(req.params.id, userId(req));
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    await dish.deleteOne();
    return res.json({ message: 'Plat supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteDish :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
