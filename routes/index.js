/**
 * routes/index.js — Central router.
 *
 * Mounts all feature sub-routers under their prefix and
 * exposes a simple health-check endpoint.
 *
 * Routes:
 * GET    /api/health
 * USE    /api/auth/*
 * USE    /api/users/*
 * USE    /api/locations/*
 * USE    /api/shifts/*
 * USE    /api/attendance/*
 * USE    /api/history/*
 * USE    /api/requests/*
 * USE    /api/notifications/*
 * USE    /api/dashboard/*
 * USE    /api/reports/*
 */

const express = require("express");

const router = express.Router();

/* ── Health check ─────────────────────────────────────────────── */
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "GeoTime HR API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/* ── Feature routers ──────────────────────────────────────────── */
router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/locations", require("./location.routes"));
router.use("/shifts", require("./shift.routes"));
router.use("/attendance", require("./attendance.routes"));
router.use("/history", require("./history.routes"));
router.use("/requests", require("./request.routes"));
router.use("/notifications", require("./notification.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/reports", require("./report.routes"));

module.exports = router;
