/**
 * location.routes.js — Geofenced location endpoints.
 *
 * Routes:
 * GET    /api/locations            (any authenticated)
 * POST   /api/locations            (HR)
 * PUT    /api/locations/:id        (HR)
 * PATCH  /api/locations/:id/toggle (HR)
 * DELETE /api/locations/:id        (HR)
 */

const express = require("express");

const location = require("../controllers/location.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");
const validate = require("../middleware/validate");
const {
  createLocationSchema,
  updateLocationSchema,
} = require("../validators/location.validator");

const router = express.Router();

router.get("/", [protect, enforceTenant], location.getLocations);
router.post(
  "/",
  [protect, requireHR, enforceTenant, validate(createLocationSchema)],
  location.createLocation
);
router.put(
  "/:id",
  [protect, requireHR, enforceTenant, validate(updateLocationSchema)],
  location.updateLocation
);
router.patch(
  "/:id/toggle",
  [protect, requireHR, enforceTenant],
  location.toggleLocation
);
router.delete("/:id", [protect, requireHR, enforceTenant], location.deleteLocation);

module.exports = router;
