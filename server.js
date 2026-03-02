/**
 * server.js — Entry point for the GeoTime HR API.
 * Loads environment variables, connects to MongoDB, and starts the Express server.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(' MongoDB connected');
    app.listen(PORT, () => {
      console.log(` GeoTime HR API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown on unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION ', reason);
  process.exit(1);
});

// Graceful shutdown on uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION ', err);
  process.exit(1);
});
