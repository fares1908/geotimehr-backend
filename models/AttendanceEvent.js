/**
 * AttendanceEvent.js — Immutable audit log for attendance actions.
 *
 * Every check-in, check-out, rejection, or correction is recorded as
 * an event.  Documents are append-only: updates are forbidden.
 * Only createdAt is stored (no updatedAt).
 */

const mongoose = require("mongoose");
const { EVENT_TYPES } = require("../config/constants");

const attendanceEventSchema = new mongoose.Schema(
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
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(EVENT_TYPES),
      required: [true, "Event type is required"],
    },
    reason: {
      type: String,
      default: null,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    distanceM: {
      type: Number,
      default: null,
    },
    deviceInfo: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

/* ------------------------------------------------------------------ */
/*  Pre-save guard: prevent updates to existing documents              */
/* ------------------------------------------------------------------ */
attendanceEventSchema.pre("save", function (next) {
  if (!this.isNew) {
    return next(
      new Error("AttendanceEvent documents are immutable and cannot be updated")
    );
  }
  return next();
});

/* ------------------------------------------------------------------ */
/*  Indexes                                                            */
/* ------------------------------------------------------------------ */
attendanceEventSchema.index({ orgId: 1, userId: 1, createdAt: -1 });
attendanceEventSchema.index({ orgId: 1, sessionId: 1 });
attendanceEventSchema.index({ orgId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("AttendanceEvent", attendanceEventSchema);
