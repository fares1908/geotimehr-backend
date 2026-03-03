/**
 * history.controller.js — Attendance history and monthly summaries.
 *
 * getHistory        → employee's own paginated history
 * getMonthlySummary → aggregate stats for a given month
 * getUserHistory    → HR views any employee's history
 */

const AttendanceSession = require("../models/AttendanceSession");
const User = require("../models/User");
const { SESSION_STATUS } = require("../config/constants");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildDateFilter } = require("../utils/pagination");

/* ------------------------------------------------------------------ */

const getHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = req.scopeQuery({ userId: req.user.userId });

    if (req.query.filter === "LATE") filter.isLate = true;
    if (req.query.filter === "MISSING_OUT") filter.status = SESSION_STATUS.MISSING_OUT;

    const dateFilter = buildDateFilter(req.query.from, req.query.to, "date");
    Object.assign(filter, dateFilter);

    const [sessions, total] = await Promise.all([
      AttendanceSession.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      AttendanceSession.countDocuments(filter),
    ]);

    return sendPaginated(res, sessions, total, page, limit);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getMonthlySummary = async (req, res, next) => {
  try {
    const { month } = req.query; // "YYYY-MM"
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, "month query param required (YYYY-MM)", 400);
    }

    const from = `${month}-01`;
    const to = `${month}-31`;

    const sessions = await AttendanceSession.find(
      req.scopeQuery({
        userId: req.user.userId,
        date: { $gte: from, $lte: to },
      })
    );

    const daysPresent = sessions.length;
    const totalMins = sessions.reduce(
      (sum, s) => sum + (s.totalMins || 0),
      0
    );
    const lateDays = sessions.filter((s) => s.isLate).length;
    const totalLateMins = sessions.reduce(
      (sum, s) => sum + (s.lateMins || 0),
      0
    );
    const missingOutDays = sessions.filter(
      (s) => s.status === SESSION_STATUS.MISSING_OUT
    ).length;

    return sendSuccess(res, {
      month,
      daysPresent,
      totalMins,
      lateDays,
      totalLateMins,
      missingOutDays,
    });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getUserHistory = async (req, res, next) => {
  try {
    /* Verify target user belongs to same org */
    const targetUser = await User.findOne(
      req.scopeQuery({ _id: req.params.userId })
    );
    if (!targetUser) {
      return sendError(res, "Employee not found", 404);
    }

    const { page, limit, skip } = getPagination(req.query);
    const filter = req.scopeQuery({ userId: req.params.userId });

    if (req.query.filter === "LATE") filter.isLate = true;
    if (req.query.filter === "MISSING_OUT") filter.status = SESSION_STATUS.MISSING_OUT;

    const dateFilter = buildDateFilter(req.query.from, req.query.to, "date");
    Object.assign(filter, dateFilter);

    const [sessions, total] = await Promise.all([
      AttendanceSession.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      AttendanceSession.countDocuments(filter),
    ]);

    return sendPaginated(res, sessions, total, page, limit);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getHistory,
  getMonthlySummary,
  getUserHistory,
};
