const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      unique: true,
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
    role: {
      type: String,
      enum: {
        values: ['client', 'restaurateur', 'admin'],
        message: 'Le rôle {VALUE} n\'est pas valide',
      },
      default: 'client',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    photoProfil: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hachage automatique du mot de passe avant sauvegarde
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Comparaison du mot de passe fourni avec le hash stocké
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Suppression du mot de passe de la sérialisation JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};


const User = mongoose.model('User', userSchema);
module.exports = User;
