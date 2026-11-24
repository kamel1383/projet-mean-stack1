require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getRestaurants } = require('./controllers/restaurantController');
const { getCategoriesByRestaurant } = require('./controllers/categoryController');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));

app.get('/api/restaurants', getRestaurants);
app.get('/api/categories/restaurant/:restaurantId', getCategoriesByRestaurant);

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('Ajoute MONGO_URI dans backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  app.listen(5000, '127.0.0.1', () => {
    console.log('API locale : http://localhost:5000/api');
  });
}

start().catch((error) => {
  console.error('Démarrage impossible :', error.message);
  process.exitCode = 1;
});