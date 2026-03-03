/**
 * dashboard.controller.js — HR dashboard stats and live view.
 *
 * getStats → aggregate counts (present, absent, late, pending requests)
 * getLive  → currently checked-in employees
 */

const AttendanceSession = require("../models/AttendanceSession");
const User = require("../models/User");
const Request = require("../models/Request");
const Organization = require("../models/Organization");

const { SESSION_STATUS, REQUEST_STATUS, ROLES } = require("../config/constants");
const { sendSuccess, sendError } = require("../utils/response");
const { getTodayString } = require("../utils/dateTime");

/* ------------------------------------------------------------------ */

const getStats = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.orgId);
    if (!org) {
      return sendError(res, "Organization not found", 404);
    }

    const today = getTodayString(org.timezone);
    const orgScope = req.scopeQuery();

    const [
      totalActive,
      checkedInToday,
      presentNow,
      lateToday,
      pendingRequests,
      recentRequests,
    ] = await Promise.all([
      User.countDocuments({
        ...orgScope,
        isActive: true,
        role: ROLES.EMPLOYEE,
      }),
      AttendanceSession.countDocuments({ ...orgScope, date: today }),
      AttendanceSession.countDocuments({
        ...orgScope,
        date: today,
        status: SESSION_STATUS.OPEN,
      }),
      AttendanceSession.countDocuments({
        ...orgScope,
        date: today,
        isLate: true,
      }),
      Request.countDocuments({
        ...orgScope,
        status: REQUEST_STATUS.PENDING,
      }),
      Request.find({ ...orgScope, status: REQUEST_STATUS.PENDING })
        .populate("userId", "name avatarUrl")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const absentToday = totalActive - checkedInToday;

    return sendSuccess(res, {
      presentNow,
      absentToday,
      lateToday,
      pendingRequests,
      recentRequests,
    });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getLive = async (req, res, next) => {
  try {
    const sessions = await AttendanceSession.find(
      req.scopeQuery({ status: SESSION_STATUS.OPEN })
    )
      .populate("userId", "name avatarUrl jobTitle")
      .sort({ checkInAt: -1 });

    return sendSuccess(res, {
      activeSessions: sessions,
      count: sessions.length,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getStats,
  getLive,
};
