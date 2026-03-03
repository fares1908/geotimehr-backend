/**
 * dashboard.routes.js — HR dashboard endpoints.
 *
 * Routes:
 * GET    /api/dashboard/stats   (HR)
 * GET    /api/dashboard/live    (HR)
 */

const express = require("express");

const dashboard = require("../controllers/dashboard.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");

const router = express.Router();

router.get("/stats", [protect, requireHR, enforceTenant], dashboard.getStats);
router.get("/live", [protect, requireHR, enforceTenant], dashboard.getLive);

module.exports = router;
