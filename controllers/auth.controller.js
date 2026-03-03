/**
 * auth.controller.js — Registration, login, and current-user endpoints.
 *
 * registerOrg  → creates org + first HR admin + JWT
 * login        → authenticates by email + password → JWT
 * getMe        → returns currently authenticated user with populated refs
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Organization = require("../models/Organization");

const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { ROLES, USER_STATUS } = require("../config/constants");
const { sendSuccess, sendError } = require("../utils/response");
const { generateEmployeeId } = require("../utils/employeeId");

/**
 * Sign a JWT for the given payload.
 * @param {{ userId: string, orgId: string, role: string }} payload
 * @returns {string}
 */
const signToken = (payload) =>
  jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

/* ------------------------------------------------------------------ */

const registerOrg = async (req, res, next) => {
  try {
    const { orgName, timezone, adminName, email, password } = req.body;

    /* Global email uniqueness check (MVP) */
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, "Email already registered", 409);
    }

    /* Create organisation */
    const org = await Organization.create({ name: orgName, timezone });

    /* Hash password & generate employee ID */
    const passwordHash = await bcrypt.hash(password, 12);
    const employeeId = await generateEmployeeId(org._id);

    /* Create HR admin */
    const user = await User.create({
      orgId: org._id,
      name: adminName,
      email,
      passwordHash,
      employeeId,
      role: ROLES.HR,
      status: USER_STATUS.ACTIVE,
    });

    /* Issue token */
    const token = signToken({
      userId: user._id,
      orgId: org._id,
      role: ROLES.HR,
    });

    return sendSuccess(res, { token, user, org }, "Organization created", 201);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    if (!user.isActive) {
      return sendError(res, "Account deactivated", 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = signToken({
      userId: user._id,
      orgId: user.orgId,
      role: user.role,
    });

    return sendSuccess(res, { token, user, org: user.orgId });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("shiftId", "name startTime endTime gracePeriodMins breakTimeMins")
      .populate("locationId", "name lat lng radiusMeters address");

    return sendSuccess(res, { user });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  registerOrg,
  login,
  getMe,
};
