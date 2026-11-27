/**
 * server.hiba.js — Minimal Standalone Server (Development/Testing)
 *
 * A lightweight Express server created for testing only the public restaurant
 * and category endpoints independently of the main `server.js`.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getRestaurants } = require('./controllers/restaurantController');
const { getCategoriesByRestaurant } = require('./controllers/categoryController');

const app = express();

// Allow requests from the Angular frontend
app.use(cors({ origin: 'http://localhost:4200' }));

// Mount only the public read endpoints for restaurants and categories
app.get('/api/restaurants', getRestaurants);
app.get('/api/categories/restaurant/:restaurantId', getCategoriesByRestaurant);

/**
 * Connects to MongoDB and starts listening on port 5000.
 */
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