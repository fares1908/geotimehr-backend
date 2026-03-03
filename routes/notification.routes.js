/**
 * notification.routes.js — In-app notification endpoints.
 *
 * Routes:
 * GET    /api/notifications              (list + unread count)
 * PATCH  /api/notifications/read-all     (mark all as read)
 * PATCH  /api/notifications/:id/read     (mark single as read)
 */

const express = require("express");

const notification = require("../controllers/notification.controller");
const protect = require("../middleware/auth");
const enforceTenant = require("../middleware/tenantIsolation");

const router = express.Router();

router.get("/", [protect, enforceTenant], notification.getNotifications);

/* /read-all must be BEFORE /:id/read */
router.patch("/read-all", [protect, enforceTenant], notification.markAllAsRead);
router.patch("/:id/read", [protect, enforceTenant], notification.markAsRead);

module.exports = router;
