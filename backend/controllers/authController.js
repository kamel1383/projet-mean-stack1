const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Au moins 8 caractères, au moins une majuscule, une minuscule et un chiffre
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, confirmation } = req.body;

    // 1. Tous les champs sont obligatoires
    if (!nom || !prenom || !email || !telephone || !password || !confirmation) {
      return res.status(400).json({
        message: 'Tous les champs sont obligatoires (nom, prénom, email, téléphone, mot de passe, confirmation)',
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // 2. Format email valide
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Format d\'adresse email invalide' });
    }

    // 3. Complexité mot de passe (≥8 car, min, maj, chiffre)
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: 'Le mot de passe doit comporter au moins 8 caractères, avec au moins une majuscule, une minuscule et un chiffre',
      });
    }

    // 4. Confirmation identique
    if (password !== confirmation) {
      return res.status(400).json({ message: 'Le mot de passe et sa confirmation ne correspondent pas' });
    }

    // 5. Unicité de l'email
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cette adresse email' });
    }

    // 6. Rôle TOUJOURS 'client' : on ignore tout rôle injecté dans le body
    const newUser = await User.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: trimmedEmail,
      telephone: telephone.trim(),
      password,
      role: 'client',
      isActive: true,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Erreur register :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'L\'email et le mot de passe sont requis' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: trimmedEmail });

    // Message d'erreur STRICTEMENT IDENTIQUE pour email inconnu et mot de passe faux
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Identifiants invalides (email ou mot de passe incorrect)' });
    }

    // Vérification du compte désactivé : refus 403
    if (!user.isActive) {
      return res.status(403).json({ message: 'Votre compte est désactivé. Veuillez contacter un administrateur' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Erreur login :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};
