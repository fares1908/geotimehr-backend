/**
 * report.controller.js — HR reporting and CSV export.
 *
 * getTimesheet → monthly summary per employee
 * exportCSV    → same data as downloadable CSV
 * getTrends    → weekly average hours for a month
 * getLateReport → late-frequency ranking per employee
 */

const AttendanceSession = require("../models/AttendanceSession");
const User = require("../models/User");
const Organization = require("../models/Organization");

const { SESSION_STATUS } = require("../config/constants");
const csvService = require("../services/csv.service");
const { sendSuccess, sendError } = require("../utils/response");
const { formatDuration } = require("../utils/dateTime");

/* ------------------------------------------------------------------ */

/**
 * Gather sessions for a month, optionally filtered by department.
 * Returns { sessions, userMap }.
 */
const _gatherMonthData = async (req, month) => {
  const from = `${month}-01`;
  const to = `${month}-31`;

  const orgScope = req.scopeQuery();

  let userIds = null;

  if (req.query.department) {
    const deptUsers = await User.find({
      ...orgScope,
      department: req.query.department,
      isActive: true,
    }).select("_id name employeeId department");

    userIds = deptUsers.map((u) => u._id);
  }

  const sessionFilter = {
    ...orgScope,
    date: { $gte: from, $lte: to },
  };
  if (userIds) sessionFilter.userId = { $in: userIds };

  const sessions = await AttendanceSession.find(sessionFilter)
    .populate("userId", "name employeeId department")
    .sort({ date: 1 });

  /* Build a quick user lookup map */
  const userMap = {};
  sessions.forEach((s) => {
    if (!s.userId) return;
    const uid = s.userId._id.toString();
    if (!userMap[uid]) {
      userMap[uid] = {
        userId: uid,
        name: s.userId.name,
        employeeId: s.userId.employeeId,
        department: s.userId.department,
        sessions: [],
      };
    }
    userMap[uid].sessions.push(s);
  });

  return { sessions, userMap };
};

/**
 * Build per-employee stats from grouped sessions.
 */
const _buildEmployeeStats = (userMap) =>
  Object.values(userMap).map((emp) => {
    const daysPresent = emp.sessions.length;
    const totalMins = emp.sessions.reduce((s, x) => s + (x.totalMins || 0), 0);
    const lateDays = emp.sessions.filter((x) => x.isLate).length;
    const totalLateMins = emp.sessions.reduce((s, x) => s + (x.lateMins || 0), 0);
    const missingOutDays = emp.sessions.filter(
      (x) => x.status === SESSION_STATUS.MISSING_OUT
    ).length;

    return {
      userId: emp.userId,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      daysPresent,
      totalMins,
      totalHoursFormatted: formatDuration(totalMins),
      lateDays,
      totalLateMins,
      missingOutDays,
    };
  });

/* ------------------------------------------------------------------ */

const getTimesheet = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, "month query param required (YYYY-MM)", 400);
    }

    const { userMap } = await _gatherMonthData(req, month);
    const employees = _buildEmployeeStats(userMap);

    const totalHours = employees.reduce((s, e) => s + e.totalMins, 0) / 60;
    const avgPerEmployee = employees.length
      ? +(totalHours / employees.length).toFixed(1)
      : 0;

    return sendSuccess(res, {
      month,
      summary: {
        totalEmployees: employees.length,
        totalHours: +totalHours.toFixed(1),
        avgPerEmployee,
      },
      employees,
    });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const exportCSV = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, "month query param required (YYYY-MM)", 400);
    }

    const { userMap } = await _gatherMonthData(req, month);
    const employees = _buildEmployeeStats(userMap);

    const csvString = csvService.generateTimesheetCSV(employees, month);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=timesheet-${month}.csv`
    );
    return res.send(csvString);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getTrends = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, "month query param required (YYYY-MM)", 400);
    }

    const { sessions } = await _gatherMonthData(req, month);

    /* Group sessions by week (1-7, 8-14, 15-21, 22-28, 29-31) */
    const weeks = [
      { label: "Week 1", from: 1, to: 7, totalMins: 0, count: 0 },
      { label: "Week 2", from: 8, to: 14, totalMins: 0, count: 0 },
      { label: "Week 3", from: 15, to: 21, totalMins: 0, count: 0 },
      { label: "Week 4", from: 22, to: 28, totalMins: 0, count: 0 },
      { label: "Week 5", from: 29, to: 31, totalMins: 0, count: 0 },
    ];

    sessions.forEach((s) => {
      const day = parseInt(s.date.split("-")[2], 10);
      const week = weeks.find((w) => day >= w.from && day <= w.to);
      if (week) {
        week.totalMins += s.totalMins || 0;
        week.count += 1;
      }
    });

    const result = weeks
      .filter((w) => w.count > 0)
      .map((w) => ({
        label: w.label,
        avgHours: +(w.totalMins / w.count / 60).toFixed(1),
        sessions: w.count,
      }));

    return sendSuccess(res, { month, weeks: result });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getLateReport = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, "month query param required (YYYY-MM)", 400);
    }

    const from = `${month}-01`;
    const to = `${month}-31`;

    const sessions = await AttendanceSession.find(
      req.scopeQuery({ date: { $gte: from, $lte: to }, isLate: true })
    ).populate("userId", "name employeeId department");

    /* Group by user */
    const map = {};
    sessions.forEach((s) => {
      if (!s.userId) return;
      const uid = s.userId._id.toString();
      if (!map[uid]) {
        map[uid] = {
          userId: uid,
          name: s.userId.name,
          employeeId: s.userId.employeeId,
          department: s.userId.department,
          lateCount: 0,
          totalLateMins: 0,
        };
      }
      map[uid].lateCount += 1;
      map[uid].totalLateMins += s.lateMins || 0;
    });

    const employees = Object.values(map)
      .map((e) => ({
        ...e,
        avgLateMins: +(e.totalLateMins / e.lateCount).toFixed(1),
      }))
      .sort((a, b) => b.totalLateMins - a.totalLateMins);

    return sendSuccess(res, { month, employees });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getTimesheet,
  exportCSV,
  getTrends,
  getLateReport,
};
