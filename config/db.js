const mongoose = require('mongoose');

let cachedConnection = null;
let pendingConnectionPromise = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!pendingConnectionPromise) {
    pendingConnectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((conn) => {
        cachedConnection = conn;
        pendingConnectionPromise = null;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        pendingConnectionPromise = null;
        throw error;
      });
  }

  return pendingConnectionPromise;
};

module.exports = connectDB;
