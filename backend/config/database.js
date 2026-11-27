/**
 * database.js — MongoDB Connection Configuration
 *
 * This file is responsible for connecting the Express/Node.js backend
 * to the MongoDB database using Mongoose (an Object Data Modeling library).
 */
const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string stored in `process.env.MONGO_URI`.
 * Called once when the server starts (in server.js).
 */
const connectDB = async () => {
  // Read the MongoDB URI from environment variables (.env file)
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI est absente des variables d\'environnement (.env)');
  }

  // Establish the async connection to MongoDB
  const conn = await mongoose.connect(uri);
  console.log(`[Database] MongoDB connecté avec succès : ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
