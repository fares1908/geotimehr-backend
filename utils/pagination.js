/**
 * pagination.js — Parse and validate pagination query params and
 * build MongoDB date-range filters.
 */

/**
 * Extract pagination values from req.query.
 *
 * @param {Object} query — Express req.query object.
 * @returns {{ page: number, limit: number, skip: number }}
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a MongoDB date-range filter.
 *
 * @param {string|null} from  — Start date "YYYY-MM-DD".
 * @param {string|null} to    — End date "YYYY-MM-DD".
 * @param {string} [field]    — Document field name to filter on.
 * @returns {Object} MongoDB query filter (may be empty).
 */
const buildDateFilter = (from, to, field = "date") => {
  if (!from && !to) return {};

  const filter = {};

  if (from && to) {
    filter[field] = { $gte: from, $lte: to };
  } else if (from) {
    filter[field] = { $gte: from };
  } else {
    filter[field] = { $lte: to };
  }

  return filter;
};

module.exports = {
  getPagination,
  buildDateFilter,
};
