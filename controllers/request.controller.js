/**
 * request.controller.js — Employee requests (corrections, leave, etc.)
 *
 * Employees submit requests; HR reviews (approve/reject).
 * Approved corrections are applied to the target attendance session.
 */

const Request = require("../models/Request");
const User = require("../models/User");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceEvent = require("../models/AttendanceEvent");

const {
  REQUEST_STATUS,
  REQUEST_TYPES,
  ROLES,
  SESSION_STATUS,
  EVENT_TYPES,
  NOTIFICATION_TYPES,
} = require("../config/constants");
const notificationService = require("../services/notification.service");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

/* ------------------------------------------------------------------ */

const getMyRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = req.scopeQuery({ userId: req.user.userId });

    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Request.countDocuments(filter),
    ]);

    return sendPaginated(res, requests, total, page, limit);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const submitRequest = async (req, res, next) => {
  try {
    const { orgId, userId } = req.user;

    const request = await Request.create({
      ...req.body,
      orgId,
      userId,
      status: REQUEST_STATUS.PENDING,
    });

    /* Fire-and-forget: notify HR users */
    User.find(req.scopeQuery({ role: ROLES.HR, isActive: true }))
      .then((hrUsers) => {
        hrUsers.forEach((hr) => {
          notificationService
            .createNotification(
              orgId,
              hr._id,
              "New Request",
              `${req.user.name} submitted a ${request.type} request`,
              NOTIFICATION_TYPES.REQUEST_UPDATE,
              request._id,
              "REQUEST"
            )
            .catch(console.error);
        });
      })
      .catch(console.error);

    return sendSuccess(res, { request }, "Request submitted", 201);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Request.find(
      req.scopeQuery({ status: REQUEST_STATUS.PENDING })
    )
      .populate("userId", "name avatarUrl employeeId department")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { requests });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findOne(
      req.scopeQuery({ _id: req.params.id })
    )
      .populate("userId", "name avatarUrl")
      .populate("reviewedBy", "name");

    if (!request) {
      return sendError(res, "Request not found", 404);
    }

    /* Employees may only view their own requests */
    if (
      req.user.role === ROLES.EMPLOYEE &&
      request.userId._id.toString() !== req.user.userId.toString()
    ) {
      return sendError(res, "Request not found", 404);
    }

    return sendSuccess(res, { request });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const reviewRequest = async (req, res, next) => {
  try {
    const request = await Request.findOne(
      req.scopeQuery({ _id: req.params.id })
    );

    if (!request) {
      return sendError(res, "Request not found", 404);
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return sendError(res, "Request already reviewed", 400);
    }

    const { action, rejectionReason } = req.body;

    request.status = action;
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    if (action === REQUEST_STATUS.REJECTED) {
      request.rejectionReason = rejectionReason;
    }

    await request.save();

    /* Apply correction if approved and type is CORRECTION */
    if (
      action === REQUEST_STATUS.APPROVED &&
      request.type === REQUEST_TYPES.CORRECTION
    ) {
      const checkInAt = new Date(request.correctedCheckIn);
      const checkOutAt = new Date(request.correctedCheckOut);
      const totalMins = Math.round(
        (checkOutAt.getTime() - checkInAt.getTime()) / 60000
      );

      await AttendanceSession.findByIdAndUpdate(request.targetSessionId, {
        checkInAt,
        checkOutAt,
        totalMins,
        status: SESSION_STATUS.COMPLETE,
      });

      await AttendanceEvent.create({
        orgId: req.user.orgId,
        userId: request.userId,
        sessionId: request.targetSessionId,
        type: EVENT_TYPES.CORRECTION_APPLIED,
        reason: `Correction approved by ${req.user.name}`,
      });
    }

    /* Fire-and-forget: notify employee */
    notificationService
      .notifyRequestUpdate(
        req.user.orgId,
        request.userId,
        request.type,
        action,
        rejectionReason
      )
      .catch(console.error);

    return sendSuccess(
      res,
      { request },
      `Request ${action.toLowerCase()}`
    );
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMyRequests,
  submitRequest,
  getPendingRequests,
  getRequestById,
  reviewRequest,
};
