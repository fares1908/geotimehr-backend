/**
 * response.js — Standardised API response helpers.
 *
 * Every controller should use these instead of calling res.json()
 * directly, so every response has a consistent shape.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {*} [data={}]          — Payload to return.
 * @param {string} [message]     — Human-readable message.
 * @param {number} [statusCode]  — HTTP status (default 200).
 */
const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} [message]     — Error description.
 * @param {number} [statusCode]  — HTTP status (default 400).
 * @param {string|null} [code]   — Optional machine-readable error code.
 */
const sendError = (res, message = "Error", statusCode = 400, code = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send a paginated success response.
 * @param {import('express').Response} res
 * @param {Array}  items   — Array of documents for the current page.
 * @param {number} total   — Total number of matching documents.
 * @param {number} page    — Current page number.
 * @param {number} limit   — Items per page.
 * @param {string} [message]
 */
const sendPaginated = (res, items, total, page, limit, message = "Success") => {
  res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
