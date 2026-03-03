/**
 * user.routes.js — Employee management endpoints.
 *
 * Routes:
 * GET    /api/users               (HR)
 * POST   /api/users               (HR)
 * GET    /api/users/me/profile     (any authenticated)
 * PATCH  /api/users/me/profile     (any authenticated)
 * GET    /api/users/:id            (HR)
 * PUT    /api/users/:id            (HR)
 * DELETE /api/users/:id            (HR)
 */

const express = require("express");

const user = require("../controllers/user.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");
const validate = require("../middleware/validate");
const {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
} = require("../validators/user.validator");

const router = express.Router();

/* ── Self-service profile (BEFORE :id to avoid conflict) ──── */
router.get("/me/profile", [protect, enforceTenant], user.updateMyProfile);
router.patch(
  "/me/profile",
  [protect, enforceTenant, validate(updateProfileSchema)],
  user.updateMyProfile
);

/* ── HR-only CRUD ─────────────────────────────────────────── */
router.get("/", [protect, requireHR, enforceTenant], user.getUsers);
router.post(
  "/",
  [protect, requireHR, enforceTenant, validate(createUserSchema)],
  user.createUser
);
router.get("/:id", [protect, requireHR, enforceTenant], user.getUserById);
router.put(
  "/:id",
  [protect, requireHR, enforceTenant, validate(updateUserSchema)],
  user.updateUser
);
router.delete("/:id", [protect, requireHR, enforceTenant], user.deleteUser);

module.exports = router;
