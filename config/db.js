/**
 * db.js — MongoDB connection helper for GeoTime HR.
 *
 * Uses Mongoose to connect to MongoDB Atlas.
 * Logs the host on success; exits the process on failure.
 *
 * @module config/db
 */

const mongoose = require("mongoose");
const { mongoUri } = require("./env");

/**
 * Open a Mongoose connection to MongoDB Atlas.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(` MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
