/**
 * rbac.js — Role-Based Access Control middleware.
 *
 * Provides factory functions that return Express middleware for
 * restricting routes to specific roles.  Zero DB calls — every
 * check reads from req.user.role (set by auth.js).
 *
 * Usage:
 *   router.get("/users", protect, requireHR, controller)
 *   router.post("/report", protect, requireAnyRole("HR", "MANAGER"), controller)
 */

const { ROLES } = require("../config/constants");

/**
 * Allow only HR users.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireHR = (req, res, next) => {
  if (req.user.role !== ROLES.HR) {
    return res
      .status(403)
      .json({ success: false, message: "HR access required" });
  }
  return next();
};

/**
 * Allow EMPLOYEE and HR (HR can do everything an employee can).
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireEmployee = (req, res, next) => {
  if (req.user.role !== ROLES.EMPLOYEE && req.user.role !== ROLES.HR) {
    return res
      .status(403)
      .json({ success: false, message: "Employee or HR access required" });
  }
  return next();
};

/**
 * Factory — restrict to any of the supplied roles.
 *
 * @param {...string} roles — Allowed role strings (from ROLES constant).
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.delete("/org", protect, requireAnyRole("HR", "MANAGER"), controller)
 */
const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Required role: ${roles.join(" | ")}`,
        yourRole: req.user.role,
      });
    }
    return next();
  };
};

module.exports = {
  requireHR,
  requireEmployee,
  requireAnyRole,
};
