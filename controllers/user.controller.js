/**
 * user.controller.js — Employee CRUD and profile management.
 *
 * HR can create, update, soft-delete employees.
 * Employees can update their own profile (name + avatar only).
 */

const User = require("../models/User");
const { ROLES, USER_STATUS } = require("../config/constants");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination } = require("../utils/pagination");
const { generateEmployeeId } = require("../utils/employeeId");

/* ------------------------------------------------------------------ */

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = req.scopeQuery({ isActive: true });

    if (req.query.status) filter.status = req.query.status;

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { employeeId: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate("shiftId", "name startTime endTime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, users, total, page, limit);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, jobTitle, department, shiftId, locationId } =
      req.body;

    const existing = await User.findOne({
      orgId: req.user.orgId,
      email,
    });
    if (existing) {
      return sendError(res, "Email already registered in this org", 409);
    }

    const employeeId = await generateEmployeeId(req.user.orgId);

    const user = await User.create({
      orgId: req.user.orgId,
      name,
      email,
      passwordHash: password, // pre-save hook hashes it
      employeeId,
      role,
      jobTitle,
      department,
      shiftId: shiftId || null,
      locationId: locationId || null,
      status: USER_STATUS.ACTIVE,
    });

    return sendSuccess(res, { user }, "Employee created", 201);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne(
      req.scopeQuery({ _id: req.params.id })
    )
      .populate("shiftId")
      .populate("locationId");

    if (!user) {
      return sendError(res, "Employee not found", 404);
    }

    return sendSuccess(res, { user });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne(
      req.scopeQuery({ _id: req.params.id })
    );
    if (!user) {
      return sendError(res, "Employee not found", 404);
    }

    const allowedFields = [
      "name", "jobTitle", "department", "status",
      "shiftId", "locationId", "role",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    /* Sync isActive flag with status */
    if (req.body.status === USER_STATUS.INACTIVE) {
      user.isActive = false;
    } else if (req.body.status === USER_STATUS.ACTIVE) {
      user.isActive = true;
    }

    await user.save();

    return sendSuccess(res, { user });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.userId.toString()) {
      return sendError(res, "Cannot delete your own account", 400);
    }

    const user = await User.findOne(
      req.scopeQuery({ _id: req.params.id })
    );
    if (!user) {
      return sendError(res, "Employee not found", 404);
    }

    /* Soft delete */
    user.isActive = false;
    user.deletedAt = new Date();
    user.status = USER_STATUS.INACTIVE;
    await user.save();

    return sendSuccess(res, {}, "Employee deactivated");
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const updateMyProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    const user = await User.findById(req.user.userId);
    if (name !== undefined) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();

    return sendSuccess(res, { user });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateMyProfile,
};
