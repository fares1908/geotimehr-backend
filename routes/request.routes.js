/**
 * request.routes.js — Employee request endpoints.
 *
 * Routes:
 * GET    /api/requests                (own requests)
 * POST   /api/requests                (submit new request)
 * GET    /api/requests/admin/pending   (HR — pending queue)
 * GET    /api/requests/:id             (view single request)
 * PATCH  /api/requests/:id/review      (HR — approve/reject)
 */

const express = require("express");

const request = require("../controllers/request.controller");
const protect = require("../middleware/auth");
const { requireHR } = require("../middleware/rbac");
const enforceTenant = require("../middleware/tenantIsolation");
const validate = require("../middleware/validate");
const {
  submitRequestSchema,
  reviewRequestSchema,
} = require("../validators/request.validator");

const router = express.Router();

router.get("/", [protect, enforceTenant], request.getMyRequests);
router.post(
  "/",
  [protect, enforceTenant, validate(submitRequestSchema)],
  request.submitRequest
);

/* /admin/pending must be BEFORE /:id */
router.get(
  "/admin/pending",
  [protect, requireHR, enforceTenant],
  request.getPendingRequests
);

router.get("/:id", [protect, enforceTenant], request.getRequestById);
router.patch(
  "/:id/review",
  [protect, requireHR, enforceTenant, validate(reviewRequestSchema)],
  request.reviewRequest
);

module.exports = router;
