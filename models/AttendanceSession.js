/**
 * AttendanceSession.js — Daily check-in / check-out session.
 *
 * One session per employee per day.  Stores GPS coordinates and
 * distance from the geofence centre at both punch-in and punch-out,
 * plus snapshot copies of shift and location data frozen at punch time.
 */

const mongoose = require("mongoose");
const { SESSION_STATUS, WORK_MODES } = require("../config/constants");

const attendanceSessionSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "orgId is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "locationId is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required (YYYY-MM-DD)"],
    },

    /* --- Check-in ------------------------------------------------- */
    checkInAt: {
      type: Date,
      required: [true, "Check-in time is required"],
    },
    checkInLat: {
      type: Number,
      required: [true, "Check-in latitude is required"],
    },
    checkInLng: {
      type: Number,
      required: [true, "Check-in longitude is required"],
    },
    checkInDistanceM: {
      type: Number,
      required: [true, "Check-in distance is required"],
    },

    /* --- Check-out ------------------------------------------------ */
    checkOutAt: {
      type: Date,
      default: null,
    },
    checkOutLat: {
      type: Number,
      default: null,
    },
    checkOutLng: {
      type: Number,
      default: null,
    },
    checkOutDistanceM: {
      type: Number,
      default: null,
    },

    /* --- Computed / status ---------------------------------------- */
    lateMins: {
      type: Number,
      default: 0,
      min: [0, "Late minutes cannot be negative"],
    },
    totalMins: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.OPEN,
    },
    isLate: {
      type: Boolean,
      default: false,
    },

    /* --- Snapshot fields (frozen at punch time) -------------------- */
    shiftStartSnapshot: {
      type: String,
    },
    shiftEndSnapshot: {
      type: String,
    },
    locationNameSnapshot: {
      type: String,
    },

    workMode: {
      type: String,
      enum: Object.values(WORK_MODES),
      default: WORK_MODES.OFFICE,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Indexes                                                            */
/* ------------------------------------------------------------------ */
attendanceSessionSchema.index(
  { orgId: 1, userId: 1, date: 1 },
  { unique: true }
);
attendanceSessionSchema.index({ orgId: 1, date: 1 });
attendanceSessionSchema.index({ orgId: 1, userId: 1, date: -1 });
attendanceSessionSchema.index({ orgId: 1, status: 1, date: 1 });

module.exports = mongoose.model(
  "AttendanceSession",
  attendanceSessionSchema
);
