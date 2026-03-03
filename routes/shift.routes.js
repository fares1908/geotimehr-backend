/**
 * shift.routes.js — Work-shift endpoints.
 *
 * Routes:
 * GET    /api/shifts        (HR)
 * POST   /api/shifts        (HR)
 * PUT    /api/shifts/:id    (HR)
 * DELETE /api/shifts/:id    (HR)
 */

const express = require("express");
const Joi = require("joi");

const shift = require("../controllers/shift.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");
const validate = require("../middleware/validate");

const router = express.Router();

/* ── Inline Joi schemas ───────────────────────────────────── */

const createShiftSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  startTime: Joi.string()
    .required()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .message("startTime must be HH:MM format"),
  endTime: Joi.string()
    .required()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .message("endTime must be HH:MM format"),
  gracePeriodMins: Joi.number().integer().min(0).max(120).default(15),
  breakTimeMins: Joi.number().integer().min(0).max(480).default(60),
});

const updateShiftSchema = createShiftSchema.fork(
  ["name", "startTime", "endTime"],
  (field) => field.optional()
);

/* ── Routes ───────────────────────────────────────────────── */

router.get("/", [protect, requireHR, enforceTenant], shift.getShifts);
router.post(
  "/",
  [protect, requireHR, enforceTenant, validate(createShiftSchema)],
  shift.createShift
);
router.put(
  "/:id",
  [protect, requireHR, enforceTenant, validate(updateShiftSchema)],
  shift.updateShift
);
router.delete("/:id", [protect, requireHR, enforceTenant], shift.deleteShift);

module.exports = router;
