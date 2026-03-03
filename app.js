/**
 * app.js — Express application setup.
 * Configures middleware, mounts routes, and defines error handlers.
 * NOTE: Database connection is handled in server.js, NOT here.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { clientUrl } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security & parsing middleware ──────────────────────────────
app.use(helmet());
app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting (all /api/* routes) ─────────────────────────
app.use('/api', generalLimiter);

// ── Swagger API Documentation ─────────────────────────────────
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'GeoTime HR API Docs',
    customCss: '.swagger-ui .topbar { background: #161b22 }',
  })
);


// ── Routes ────────────────────────────────────────────────────
app.use('/api', require('./routes'));

// ── 404 → Error handler (must be last) ────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
