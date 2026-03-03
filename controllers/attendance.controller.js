/**
 * attendance.controller.js — Check-in, check-out, and today's status.
 *
 * Delegates heavy geofence / session logic to attendance.service.
 * Fires notifications asynchronously (no await) for late check-ins.
 */

const attendanceService = require("../services/attendance.service");
const notificationService = require("../services/notification.service");
const { sendSuccess, sendError } = require("../utils/response");

/* ------------------------------------------------------------------ */

const checkIn = async (req, res, next) => {
  try {
    const { lat, lng, workMode, deviceInfo } = req.body;
    const { userId, orgId } = req.user;

    const session = await attendanceService.checkIn(
      orgId, userId, lat, lng, workMode, deviceInfo
    );

    /* Fire-and-forget late notification */
    if (session.isLate) {
      notificationService
        .notifyLateCheckIn(orgId, userId, session.lateMins)
        .catch(console.error);
    }

    return sendSuccess(res, { session }, "Checked in successfully");
  } catch (err) {
    if (err.code === "OUTSIDE_GEOFENCE") {
      return sendError(res, err.message, 403, "OUTSIDE_GEOFENCE");
    }
    if (err.code === "ALREADY_CHECKED_IN") {
      return sendError(res, "Already checked in today", 409, "ALREADY_CHECKED_IN");
    }
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const checkOut = async (req, res, next) => {
  try {
    const { lat, lng, deviceInfo } = req.body;
    const { userId, orgId } = req.user;

    const session = await attendanceService.checkOut(
      orgId, userId, lat, lng, deviceInfo
    );

    return sendSuccess(res, { session }, "Checked out successfully");
  } catch (err) {
    if (err.code === "NO_ACTIVE_SESSION") {
      return sendError(res, "No active check-in found", 404, "NO_ACTIVE_SESSION");
    }
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getToday = async (req, res, next) => {
  try {
    const { userId, orgId } = req.user;

    const result = await attendanceService.getTodaySession(orgId, userId);

    if (!result.session) {
      return sendSuccess(res, {
        status: "NOT_CHECKED_IN",
        shift: result.shift || null,
      });
    }

    const { session } = result;

    return sendSuccess(res, {
      status: session.status,
      checkInAt: session.checkInAt,
      lateMins: session.lateMins,
      locationName: session.locationNameSnapshot,
      shift: {
        startTime: session.shiftStartSnapshot,
        endTime: session.shiftEndSnapshot,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getToday,
};
