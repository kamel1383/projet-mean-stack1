/**
 * seedAdmin.js — Admin & Test Restaurateur Seed Script
 *
 * Run manually via `node backend/scripts/seedAdmin.js` to create (or update)
 * the initial Admin account from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`),
 * as well as a test Restaurateur account and a validated sample restaurant.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

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

    // Create or synchronize the Admin user
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

    // --- Seed d'un compte restaurateur de test + son restaurant ---
    const restoEmail = (process.env.SEED_RESTO_EMAIL || 'restaurateur@foodexpress.com').toLowerCase().trim();
    const restoPassword = process.env.SEED_RESTO_PASSWORD || 'Resto1234!';

    let restaurateur = await User.findOne({ email: restoEmail });
    if (!restaurateur) {
      restaurateur = await User.create({
        nom: 'Benali',
        prenom: 'Karim',
        email: restoEmail,
        telephone: '0611223344',
        password: restoPassword,
        role: 'restaurateur',
        isActive: true,
      });
      console.log(`✓ Compte restaurateur de test créé : ${restoEmail} / ${restoPassword}`);
    } else {
      console.log(`[Seed] Le restaurateur de test (${restoEmail}) existe déjà.`);
    }

    // Create a validated restaurant owned by the test restaurateur if none exists yet
    const existingResto = await Restaurant.findOne({ owner: restaurateur._id });
    if (!existingResto) {
      await Restaurant.create({
        nom: 'Chez Karim Grill',
        description: 'Spécialités grillades, burgers maison et cuisine méditerranéenne.',
        adresse: '25 Avenue Habib Bourguiba, Tunis',
        typeCuisine: 'Grillades & Burgers',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        fraisLivraison: 4,
        horaires: '11h00 - 23h30',
        isOpen: true,
        owner: restaurateur._id,
        statut: 'valide',
      });
      console.log('✓ Restaurant de test "Chez Karim Grill" créé et validé.');
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
