const mongoose = require('mongoose');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');

const getUserId = (req) => req.user?._id || req.user?.id;

// GET /api/categories/restaurant/:restaurantId
exports.getCategoriesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isObjectIdOrHexString(restaurantId)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      statut: 'valide',
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable' });
    }

    const categories = await Category.find({ restaurant: restaurantId })
      .sort({ nom: 1 });

    return res.json({ categories });
  } catch (error) {
    console.error('Erreur getCategoriesByRestaurant :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/categories
// Body : { "nom": "Pizzas", "description": "...", "restaurantId": "..." }
exports.createCategory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { nom, description, restaurantId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!mongoose.isObjectIdOrHexString(restaurantId)) {
      return res.status(400).json({ message: 'Identifiant du restaurant invalide' });
    }

    if (!nom?.trim()) {
      return res.status(400).json({ message: 'Le nom est obligatoire' });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      owner: userId,
    });

    if (!restaurant) {
      return res.status(403).json({
        message: 'Vous ne pouvez gérer que les catégories de vos restaurants',
      });
    }

    const category = await Category.create({
      nom: nom.trim(),
      description: description?.trim() || '',
      restaurant: restaurant._id,
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Cette catégorie existe déjà pour ce restaurant',
      });
    }

    console.error('Erreur createCategory :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
// PUT /api/categories/:categoryId
// Body : { "nom": "Nouveau nom", "description": "..." }
exports.updateCategory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { categoryId } = req.params;
    const { nom, description } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!mongoose.isObjectIdOrHexString(categoryId)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }

    const restaurant = await Restaurant.findOne({
      _id: category.restaurant,
      owner: userId,
    });

    if (!restaurant) {
      return res.status(403).json({
        message: 'Vous ne pouvez modifier que les catégories de vos restaurants',
      });
    }

    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({ message: 'Le nom ne peut pas être vide' });
      }
      category.nom = nom.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();
    return res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Cette catégorie existe déjà pour ce restaurant',
      });
    }

    console.error('Erreur updateCategory :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};