const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const mongoose = require('mongoose');
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, typeCuisine, isOpen } = req.query;

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      50
    );

    // Les clients voient seulement les restaurants validés.
    const filter = { statut: 'valide' };

    if (search?.trim()) {
      filter.nom = {
        $regex: escapeRegex(search.trim()),
        $options: 'i',
      };
    }

    if (typeCuisine?.trim()) {
      filter.typeCuisine = {
        $regex: `^${escapeRegex(typeCuisine.trim())}$`,
        $options: 'i',
      };
    }

    if (isOpen === 'true') {
      filter.isOpen = true;
    } else if (isOpen === 'false') {
      filter.isOpen = false;
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort({ nom: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    res.json({
      restaurants,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erreur getRestaurants :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const restaurant = await Restaurant.findOne({
      _id: id,
      statut: 'valide',
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable' });
    }

    return res.json(restaurant);
  } catch (error) {
    console.error('Erreur getRestaurantById :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
// POST /api/restaurants
exports.createRestaurant = async (req, res) => {
  try {
    const owner = req.user?._id || req.user?.id;

    if (!owner) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const {
      nom,
      description,
      adresse,
      typeCuisine,
      image,
      fraisLivraison,
      horaires,
      isOpen,
    } = req.body;

    const restaurant = await Restaurant.create({
      nom,
      description,
      adresse,
      typeCuisine,
      image,
      fraisLivraison,
      horaires,
      isOpen,
      owner,
      statut: 'en_attente',
    });

    return res.status(201).json(restaurant);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Erreur createRestaurant :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
// GET /api/restaurants/admin
exports.getAdminRestaurants = async (req, res) => {
  try {
    const { search, statut } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      50
    );

    const filter = {};

    if (search?.trim()) {
      filter.nom = {
        $regex: escapeRegex(search.trim()),
        $options: 'i',
      };
    }

    if (statut) {
      if (!['en_attente', 'valide', 'suspendu'].includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide' });
      }
      filter.statut = statut;
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate('owner', 'nom prenom email isActive')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    return res.json({
      restaurants,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erreur getAdminRestaurants :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/restaurants/:id/status
// Body : { "statut": "valide" } ou { "statut": "suspendu" }
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    if (!['valide', 'suspendu'].includes(statut)) {
      return res.status(400).json({
        message: 'Le statut doit être "valide" ou "suspendu"',
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable' });
    }

    restaurant.statut = statut;
    await restaurant.save();

    return res.json(restaurant);
  } catch (error) {
    console.error('Erreur updateRestaurantStatus :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
// PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id || user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const isAdmin = user.role === 'admin';
    const isRestaurantOwner = user.role === 'restaurateur';

    if (!isAdmin && !isRestaurantOwner) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const filter = isAdmin
      ? { _id: id }
      : { _id: id, owner: userId };

    const restaurant = await Restaurant.findOne(filter);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable' });
    }

    const editableFields = [
      'nom',
      'description',
      'adresse',
      'typeCuisine',
      'image',
      'fraisLivraison',
      'horaires',
      'isOpen',
    ];

    for (const field of editableFields) {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    }

    await restaurant.save();
    return res.json(restaurant);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Erreur updateRestaurant :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/restaurants/my (Restaurateur)
// Retourne uniquement les restaurants appartenant au restaurateur connecté
exports.getMyRestaurants = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id;
    const restaurants = await Restaurant.find({ owner: ownerId }).sort({ nom: 1 });
    return res.json({ restaurants });
  } catch (error) {
    console.error('Erreur getMyRestaurants :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/restaurants/admin (Admin)
// Attribue un nouveau restaurant à un restaurateur existant
exports.createRestaurantForOwner = async (req, res) => {
  try {
    const {
      ownerId,
      nom,
      description,
      adresse,
      typeCuisine,
      image,
      fraisLivraison,
      horaires,
      isOpen,
      statut,
    } = req.body;

    if (!ownerId || !mongoose.isObjectIdOrHexString(ownerId)) {
      return res.status(400).json({ message: 'Identifiant de propriétaire invalide' });
    }

    const owner = await User.findOne({ _id: ownerId, role: 'restaurateur' });
    if (!owner) {
      return res.status(404).json({ message: 'Restaurateur introuvable' });
    }

    const validStatut = ['en_attente', 'valide', 'suspendu'].includes(statut) ? statut : 'valide';

    const restaurant = await Restaurant.create({
      nom: nom?.trim(),
      description: description?.trim(),
      adresse: adresse?.trim(),
      typeCuisine: typeCuisine?.trim(),
      image: image?.trim() || '',
      fraisLivraison: fraisLivraison !== undefined ? Number(fraisLivraison) : 0,
      horaires: horaires?.trim(),
      isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
      owner: owner._id,
      statut: validStatut,
    });

    return res.status(201).json(restaurant);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur createRestaurantForOwner :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PATCH /api/restaurants/:id/owner (Admin)
// Change le propriétaire d'un restaurant existant
exports.changeRestaurantOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId } = req.body;

    if (!mongoose.isObjectIdOrHexString(id) || !mongoose.isObjectIdOrHexString(ownerId)) {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }

    const [restaurant, newOwner] = await Promise.all([
      Restaurant.findById(id),
      User.findOne({ _id: ownerId, role: 'restaurateur' }),
    ]);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant introuvable' });
    }
    if (!newOwner) {
      return res.status(404).json({ message: 'Nouveau propriétaire restaurateur introuvable' });
    }

    restaurant.owner = newOwner._id;
    await restaurant.save();
    await restaurant.populate('owner', 'nom prenom email isActive');

    return res.json({
      message: 'Propriétaire du restaurant modifié avec succès',
      restaurant,
    });
  } catch (error) {
    console.error('Erreur changeRestaurantOwner :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};