/**
 * report.routes.js — HR reporting and export endpoints.
 *
 * Routes:
 * GET    /api/reports/timesheet    (HR)
 * GET    /api/reports/export-csv   (HR)
 * GET    /api/reports/trends       (HR)
 * GET    /api/reports/late-report  (HR)
 */

const express = require("express");

const report = require("../controllers/report.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");

const router = express.Router();

router.get("/timesheet", [protect, requireHR, enforceTenant], report.getTimesheet);
router.get("/export-csv", [protect, requireHR, enforceTenant], report.exportCSV);
router.get("/trends", [protect, requireHR, enforceTenant], report.getTrends);
router.get("/late-report", [protect, requireHR, enforceTenant], report.getLateReport);

module.exports = router;
