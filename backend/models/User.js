/**
 * User.js — Mongoose Model for Application Users (collection: "users")
 *
 * Defines the structure, validation rules, password hashing, and helper methods
 * for all user accounts: 'client', 'restaurateur' (restaurant owner), and 'admin'.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Regular expression to validate basic email format (e.g., user@domain.com)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'L\'adresse email est obligatoire'],
      unique: true, // Prevents duplicate accounts with the same email
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Format d\'adresse email invalide'],
    },
    telephone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [8, 'Le mot de passe doit comporter au moins 8 caractères'],
    },
    // Determines what parts of the app and API the user can access
    role: {
      type: String,
      enum: {
        values: ['client', 'restaurateur', 'admin'],
        message: 'Le rôle {VALUE} n\'est pas valide',
      },
      default: 'client',
    },
    // Allows admins to suspend/disable a user account without deleting it
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional URL or base64 string for the user's profile picture
    photoProfil: {
      type: String,
      default: '',
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` timestamps
    timestamps: true,
  }
);

// Hachage automatique du mot de passe avant sauvegarde
// Mongoose pre-save hook: hashes the password with bcrypt before saving to MongoDB,
// but only if the password field was newly created or modified.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Comparaison du mot de passe fourni avec le hash stocké
// Instance method used during login to check if a plain-text password matches the stored bcrypt hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Suppression du mot de passe de la sérialisation JSON
// Automatically strips the `password` field whenever a User document is converted to JSON (e.g., in API responses).
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};


const User = mongoose.model('User', userSchema);
module.exports = User;
