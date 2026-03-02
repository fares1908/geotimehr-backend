/**
 * server.js — Entry point for the GeoTime HR API.
 * Loads environment variables, connects to MongoDB, and starts the Express server.
 */

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

const start = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`🚀 GeoTime HR API running on port ${port}`);
  });
};

start();

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
