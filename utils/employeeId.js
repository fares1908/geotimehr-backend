/**
 * employeeId.js — Auto-generate employee ID strings.
 *
 * Format: EMP-YYYY-XX  (XX = zero-padded sequential number per org per year)
 * Example: EMP-2025-01, EMP-2025-42
 *
 * NOTE: Not guaranteed unique under race conditions.
 * A unique index on { orgId, employeeId } is the safety net.
 */

const User = require("../models/User");

/**
 * Generate the next employee ID for an organisation.
 *
 * @param {import('mongoose').Types.ObjectId} orgId
 * @returns {Promise<string>} e.g. "EMP-2025-01"
 */
const generateEmployeeId = async (orgId) => {
  const year = new Date().getFullYear();

  const count = await User.countDocuments({
    orgId,
    employeeId: { $regex: `EMP-${year}-` },
  });

  const nextNum = count + 1;

  return `EMP-${year}-${String(nextNum).padStart(2, "0")}`;
};

module.exports = { generateEmployeeId };
