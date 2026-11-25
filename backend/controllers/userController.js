const User = require('../models/User');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// GET /api/users/me (connecté)
exports.getMe = async (req, res) => {
  try {
    // req.user est déjà alimenté par authMiddleware.protect sans le mot de passe
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Erreur getMe :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
};

// PUT /api/users/me (connecté)
// Modifie nom, prenom, telephone, photoProfil UNIQUEMENT (jamais email, role, isActive)
exports.updateMe = async (req, res) => {
  try {
    const { nom, prenom, telephone, photoProfil } = req.body;
    const updates = {};

    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({ message: 'Le nom ne peut pas être vide' });
      }
      updates.nom = nom.trim();
    }

    if (prenom !== undefined) {
      if (!prenom.trim()) {
        return res.status(400).json({ message: 'Le prénom ne peut pas être vide' });
      }
      updates.prenom = prenom.trim();
    }

    if (telephone !== undefined) {
      if (!telephone.trim()) {
        return res.status(400).json({ message: 'Le téléphone ne peut pas être vide' });
      }
      updates.telephone = telephone.trim();
    }

    if (photoProfil !== undefined) {
      if (photoProfil !== '' && !/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(photoProfil)) {
        return res.status(400).json({ message: 'Format d\'image invalide (PNG, JPEG ou WebP requis)' });
      }
      if (photoProfil.length > 1500000) {
        return res.status(400).json({ message: 'La photo de profil est trop volumineuse (max 1 Mo)' });
      }
      updates.photoProfil = photoProfil;
    }

    // Sécurité stricte : ignorer et ne JAMAIS modifier email, role, isActive ici
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Erreur updateMe :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
};

// PUT /api/users/me/password (connecté)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmation } = req.body;

    if (!currentPassword || !newPassword || !confirmation) {
      return res.status(400).json({
        message: 'L\'ancien mot de passe, le nouveau et sa confirmation sont requis',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // 1. Vérification de l'ancien mot de passe
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Le mot de passe actuel est incorrect' });
    }

    // 2. Règles de robustesse du nouveau mot de passe
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit comporter au moins 8 caractères, avec au moins une majuscule, une minuscule et un chiffre',
      });
    }

    // 3. Confirmation identique
    if (newPassword !== confirmation) {
      return res.status(400).json({ message: 'Le nouveau mot de passe et sa confirmation ne correspondent pas' });
    }

    // 4. Différent de l'ancien mot de passe
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit être différent de l\'actuel' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changePassword :', error);
    return res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe' });
  }
};

// GET /api/users?search=&page=&limit= (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ nom: regex }, { prenom: regex }, { email: regex }];
    }

    if (role && ['client', 'restaurateur', 'admin'].includes(role)) {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (error) {
    console.error('Erreur getUsers :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
};

// PATCH /api/users/:id/status (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Le champ isActive (booléen true/false) est requis' });
    }

    // Règle stricte : un admin NE PEUT PAS désactiver son propre compte
    if (req.user._id.toString() === id && isActive === false) {
      return res.status(400).json({
        message: 'Action interdite : vous ne pouvez pas désactiver votre propre compte administrateur',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      message: `Compte ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Erreur updateUserStatus :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la modification du statut utilisateur' });
  }
};
