/**
 * constants.js — Application-wide enumerations for GeoTime HR.
 *
 * Every object is frozen so values cannot be mutated at runtime.
 * These strings are the single source of truth for Mongoose schema
 * enum values, query filters, and business-logic checks.
 *
 *   This file must have ZERO dependencies (no require calls).
 */

/** @type {Readonly<{EMPLOYEE: "EMPLOYEE", HR: "HR", MANAGER: "MANAGER"}>} */
const ROLES = Object.freeze({
  EMPLOYEE: "EMPLOYEE",
  HR: "HR",
  MANAGER: "MANAGER",
});

/** @type {Readonly<{ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", ON_LEAVE: "ON_LEAVE"}>} */
const USER_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
});

/** @type {Readonly<{HQ: "HQ", WAREHOUSE: "WAREHOUSE", BRANCH: "BRANCH", LAB: "LAB", OnSite: "OnSite", REMOTE: "REMOTE"}>} */
const LOCATION_TYPES = Object.freeze({
  OnSite: "OnSite",
  WAREHOUSE: "WAREHOUSE",
  BRANCH: "BRANCH",
  LAB: "LAB",
  EVENT: "EVENT",
  REMOTE: "REMOTE",
});

/** @type {Readonly<{OPEN: "OPEN", COMPLETE: "COMPLETE", MISSING_OUT: "MISSING_OUT"}>} */
const SESSION_STATUS = Object.freeze({
  OPEN: "OPEN",
  COMPLETE: "COMPLETE",
  MISSING_OUT: "MISSING_OUT",
});

/** @type {Readonly<{CHECKIN: "CHECKIN", CHECKOUT: "CHECKOUT", REJECTED: "REJECTED", CORRECTION_APPLIED: "CORRECTION_APPLIED"}>} */
const EVENT_TYPES = Object.freeze({
  CHECKIN: "CHECKIN",
  CHECKOUT: "CHECKOUT",
  REJECTED: "REJECTED",
  CORRECTION_APPLIED: "CORRECTION_APPLIED",
});

/** @type {Readonly<{OUTSIDE_GEOFENCE: "OUTSIDE_GEOFENCE", ALREADY_CHECKED_IN: "ALREADY_CHECKED_IN", NO_ACTIVE_SESSION: "NO_ACTIVE_SESSION"}>} */
const REJECTION_REASONS = Object.freeze({
  OUTSIDE_GEOFENCE: "OUTSIDE_GEOFENCE",
  ALREADY_CHECKED_IN: "ALREADY_CHECKED_IN",
  NO_ACTIVE_SESSION: "NO_ACTIVE_SESSION",
});

/** @type {Readonly<{CORRECTION: "CORRECTION", LEAVE: "LEAVE", EXPENSE: "EXPENSE", OVERTIME: "OVERTIME"}>} */
const REQUEST_TYPES = Object.freeze({
  CORRECTION: "CORRECTION",
  LEAVE: "LEAVE",
  EXPENSE: "EXPENSE",
  OVERTIME: "OVERTIME",
});

/** @type {Readonly<{PENDING: "PENDING", APPROVED: "APPROVED", REJECTED: "REJECTED"}>} */
const REQUEST_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
});

/** @type {Readonly<{ANNUAL: "ANNUAL", SICK: "SICK", VACATION: "VACATION", WORK_FROM_HOME: "WORK_FROM_HOME", UNPAID: "UNPAID"}>} */
const LEAVE_TYPES = Object.freeze({
  ANNUAL: "ANNUAL",
  SICK: "SICK",
  VACATION: "VACATION",
  WORK_FROM_HOME: "WORK_FROM_HOME",
  UNPAID: "UNPAID",
});

/** @type {Readonly<{OFFICE: "OFFICE", REMOTE: "REMOTE", FIELD: "FIELD"}>} */
const WORK_MODES = Object.freeze({
  OFFICE: "OFFICE",
  REMOTE: "REMOTE",
  FIELD: "FIELD",
});

/** @type {Readonly<{REQUEST_UPDATE: "REQUEST_UPDATE", LATE_ALERT: "LATE_ALERT", MISSING_OUT: "MISSING_OUT", SYSTEM: "SYSTEM"}>} */
const NOTIFICATION_TYPES = Object.freeze({
  REQUEST_UPDATE: "REQUEST_UPDATE",
  LATE_ALERT: "LATE_ALERT",
  MISSING_OUT: "MISSING_OUT",
  SYSTEM: "SYSTEM",
});

module.exports = {
  ROLES,
  USER_STATUS,
  LOCATION_TYPES,
  SESSION_STATUS,
  EVENT_TYPES,
  REJECTION_REASONS,
  REQUEST_TYPES,
  REQUEST_STATUS,
  LEAVE_TYPES,
  WORK_MODES,
  NOTIFICATION_TYPES,
};
