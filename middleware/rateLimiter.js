/**
 * rateLimiter.js — Rate-limiting middleware using express-rate-limit.
 *
 * authLimiter  → strict limit for login / register-org routes.
 * generalLimiter → looser limit for all /api/* routes.
 */

const rateLimit = require("express-rate-limit");

/**
 * Strict limiter for authentication endpoints.
 * 10 requests per 15-minute window.
 *
 * Apply to: /api/auth/login, /api/auth/register-org
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many attempts, try again in 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General limiter for all API routes.
 * 100 requests per 1-minute window.
 *
 * Apply to: all /api/* routes
 */
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: "Too many requests",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  generalLimiter,
};
