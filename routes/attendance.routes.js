/**
 * attendance.routes.js — Check-in / check-out / today endpoints.
 *
 * Routes:
 * POST   /api/attendance/checkin
 * POST   /api/attendance/checkout
 * GET    /api/attendance/today
 */

const express = require("express");

const attendance = require("../controllers/attendance.controller");
const protect = require("../middleware/auth");
const enforceTenant = require("../middleware/tenantIsolation");
const validate = require("../middleware/validate");
const {
  checkInSchema,
  checkOutSchema,
} = require("../validators/attendance.validator");

const router = express.Router();

router.post(
  "/checkin",
  [protect, enforceTenant, validate(checkInSchema)],
  attendance.checkIn
);
router.post(
  "/checkout",
  [protect, enforceTenant, validate(checkOutSchema)],
  attendance.checkOut
);
router.get("/today", [protect, enforceTenant], attendance.getToday);

module.exports = router;
