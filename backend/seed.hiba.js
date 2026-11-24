require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const Category = require('./models/Category');

const exemples = [
  // Nom, cuisine, ouvert, statut
  ['La Table de Tunis', 'Tunisienne', true, 'valide'],
  ['Dar Couscous', 'Tunisienne', false, 'valide'],
  ['Pizza Medina', 'Italienne', true, 'valide'],
  ['Pasta Roma', 'Italienne', false, 'valide'],
  ['Sushi Lac', 'Japonaise', true, 'valide'],
  ['Tokyo Bento', 'Japonaise', false, 'valide'],
  ['Le Petit Bistrot', 'Française', true, 'valide'],
  ['Saveurs du Levant', 'Libanaise', true, 'valide'],
  ['Burger Avenue', 'Américaine', false, 'valide'],
  ['Tacos du Centre', 'Mexicaine', true, 'valide'],
  ['Le Nouveau Patio', 'Tunisienne', false, 'en_attente'],
  ['Bella Terrasse', 'Italienne', false, 'suspendu'],
];

async function seed() {
  const uri = process.env.MONGO_URI;

  if (!uri) throw new Error('MONGO_URI est absente du fichier .env');
  await mongoose.connect(uri);

  if (mongoose.connection.name !== 'restogo_dev') {
    throw new Error('Ce script est réservé à la base de démo restogo_dev.');
  }

  // Identifiant fictif réservé à la démo publique.
  const owner = new mongoose.Types.ObjectId('660000000000000000000001');

  for (const [index, [nom, typeCuisine, isOpen, statut]] of exemples.entries()) {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner, nom },
      {
        $setOnInsert: {
          owner, nom, typeCuisine, isOpen, statut,
          description: `Spécialités de cuisine ${typeCuisine.toLowerCase()}.`,
          adresse: `${index + 1}, avenue de la Liberté, Tunis`,
          fraisLivraison: 3 + (index % 3),
          horaires: '11h00 – 22h00',
          image: '',
        },
      },
{ upsert: true, returnDocument: 'after', runValidators: true },    );

    for (const nomCategorie of ['Plats principaux', 'Desserts']) {
      await Category.updateOne(
        { restaurant: restaurant._id, nom: nomCategorie },
        { $setOnInsert: { description: 'Catégorie de démonstration' } },
        { upsert: true, runValidators: true },
      );
    }
  }

  console.log('Données de démonstration prêtes.');
}

seed()
  .catch((error) => {
    console.error('Erreur seed :', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());