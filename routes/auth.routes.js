/**
 * auth.routes.js — Authentication endpoints.
 *
 * Routes:
 * POST   /api/auth/register-org
 * POST   /api/auth/login
 * GET    /api/auth/me
 */

const express = require("express");

const { registerOrg, login, getMe } = require("../controllers/auth.controller");
const protect = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { registerOrgSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register-org", [authLimiter, validate(registerOrgSchema)], registerOrg);
router.post("/login", [authLimiter, validate(loginSchema)], login);
router.get("/me", [protect], getMe);

module.exports = router;
