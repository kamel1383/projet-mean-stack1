const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI est absente des variables d\'environnement (.env)');
  }

  const conn = await mongoose.connect(uri);
  console.log(`[Database] MongoDB connecté avec succès : ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
