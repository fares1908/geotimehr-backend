/**
 * shift.controller.js — Work-shift CRUD.
 *
 * HR can create, update, and soft-delete shifts.
 * Deletion is blocked if active employees are assigned to the shift.
 */

const Shift = require("../models/Shift");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

/* ------------------------------------------------------------------ */

const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find(
      req.scopeQuery({ isActive: true })
    ).sort({ createdAt: -1 });

    return sendSuccess(res, { shifts });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const createShift = async (req, res, next) => {
  try {
    const shift = await Shift.create({
      ...req.body,
      orgId: req.user.orgId,
    });

    return sendSuccess(res, { shift }, "Shift created", 201);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOneAndUpdate(
      req.scopeQuery({ _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    );

    if (!shift) {
      return sendError(res, "Shift not found", 404);
    }

    return sendSuccess(res, { shift });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const deleteShift = async (req, res, next) => {
  try {
    const assignedCount = await User.countDocuments({
      shiftId: req.params.id,
      isActive: true,
    });

    if (assignedCount > 0) {
      return sendError(
        res,
        "Cannot delete shift assigned to active employees",
        409
      );
    }

    const shift = await Shift.findOne(
      req.scopeQuery({ _id: req.params.id })
    );

    if (!shift) {
      return sendError(res, "Shift not found", 404);
    }

    shift.isActive = false;
    await shift.save();

    return sendSuccess(res, {}, "Shift archived");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
};
