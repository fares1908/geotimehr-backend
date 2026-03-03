/**
 * location.controller.js — Geofenced location CRUD.
 *
 * HR can create, update, toggle active/inactive, and delete locations.
 * Deletion is blocked if attendance records reference the location.
 */

const Location = require("../models/Location");
const AttendanceSession = require("../models/AttendanceSession");
const { sendSuccess, sendError } = require("../utils/response");

/* ------------------------------------------------------------------ */

const getLocations = async (req, res, next) => {
  try {
    const filter = req.scopeQuery();

    if (req.query.activeOnly === "true") {
      filter.isActive = true;
    }

    const locations = await Location.find(filter).sort({ createdAt: -1 });

    return sendSuccess(res, { locations });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const createLocation = async (req, res, next) => {
  try {
    const location = await Location.create({
      ...req.body,
      orgId: req.user.orgId,
    });

    return sendSuccess(res, { location }, "Location created", 201);
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findOneAndUpdate(
      req.scopeQuery({ _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return sendError(res, "Location not found", 404);
    }

    return sendSuccess(res, { location });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const toggleLocation = async (req, res, next) => {
  try {
    const location = await Location.findOne(
      req.scopeQuery({ _id: req.params.id })
    );

    if (!location) {
      return sendError(res, "Location not found", 404);
    }

    location.isActive = !location.isActive;
    await location.save();

    return sendSuccess(res, {
      isActive: location.isActive,
      message: location.isActive
        ? "Location activated"
        : "Location deactivated",
    });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const deleteLocation = async (req, res, next) => {
  try {
    const sessionCount = await AttendanceSession.countDocuments({
      locationId: req.params.id,
    });

    if (sessionCount > 0) {
      return sendError(
        res,
        "Cannot delete location with existing attendance records",
        409
      );
    }

    const location = await Location.findOneAndDelete(
      req.scopeQuery({ _id: req.params.id })
    );

    if (!location) {
      return sendError(res, "Location not found", 404);
    }

    return sendSuccess(res, {}, "Location deleted");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  toggleLocation,
  deleteLocation,
};
