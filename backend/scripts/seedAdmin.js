require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Erreur : ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans backend/.env');
    process.exit(1);
  }

  if (!MONGO_URI) {
    console.error('Erreur : MONGO_URI doit être définie dans backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Seed] Connecté à MongoDB : ${mongoose.connection.name}`);

    const emailTrimmed = ADMIN_EMAIL.toLowerCase().trim();
    let admin = await User.findOne({ email: emailTrimmed });

    if (admin) {
      console.log(`[Seed] L'administrateur (${emailTrimmed}) existe déjà. Mise à jour de ses droits...`);
      admin.role = 'admin';
      admin.isActive = true;
      admin.password = ADMIN_PASSWORD; // Le pre('save') se chargera de rehacher
      await admin.save();
      console.log('✓ Compte administrateur synchronisé avec succès.');
    } else {
      console.log(`[Seed] Création du premier compte administrateur : ${emailTrimmed}`);
      admin = await User.create({
        nom: 'Admin',
        prenom: 'Système',
        email: emailTrimmed,
        telephone: '0600000000',
        password: ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
      });
      console.log('✓ Premier compte administrateur créé avec succès.');
    }

    await mongoose.connection.close();
    console.log('[Seed] Terminé.');
    process.exit(0);
  } catch (error) {
    console.error('Erreur seed admin :', error.message);
    process.exit(1);
  }
}

seedAdmin();
