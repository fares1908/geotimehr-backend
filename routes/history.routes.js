/**
 * history.routes.js — Attendance history endpoints.
 *
 * Routes:
 * GET    /api/history                   (own history)
 * GET    /api/history/monthly-summary   (own monthly stats)
 * GET    /api/history/user/:userId      (HR — any employee)
 */

const express = require("express");

const history = require("../controllers/history.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");

const router = express.Router();

router.get("/", [protect, enforceTenant], history.getHistory);
router.get("/monthly-summary", [protect, enforceTenant], history.getMonthlySummary);
router.get(
  "/user/:userId",
  [protect, requireHR, enforceTenant],
  history.getUserHistory
);

module.exports = router;
