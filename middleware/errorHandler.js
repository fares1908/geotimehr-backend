/**
 * errorHandler.js — Global error handling middleware.
 *
 * notFound     → catches unknown routes and creates a 404 error.
 * errorHandler → catches all errors passed via next(err) and returns
 *                a consistent JSON response shape.
 *
 * Mount order in app.js:
 *   app.use(notFound);      // BEFORE errorHandler
 *   app.use(errorHandler);  // LAST middleware
 */

const { nodeEnv } = require("../config/env");

/**
 * 404 handler — creates an error for unknown routes and forwards it.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Central error handler — translates Mongoose / JWT / generic errors
 * into a consistent { success, message, ... } response.
 *
 * @param {Error & { statusCode?: number, code?: number, errors?: Object, path?: string, keyValue?: Object }} err
 * @param {import('express').Request}  _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  /* --- Mongoose ValidationError ---------------------------------- */
  if (err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  /* --- Mongoose CastError (invalid ObjectId) --------------------- */
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  /* --- Mongoose duplicate key (code 11000) ------------------------ */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "unknown";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      field,
    });
  }

  /* --- JWT errors ------------------------------------------------ */
  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  /* --- Default --------------------------------------------------- */
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal server error",
  };

  /* Include stack trace in development */
  if (nodeEnv === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
