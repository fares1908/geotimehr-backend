/**
 * Shift.js — Work-shift definitions.
 *
 * A shift describes a time window (start → end) with a grace period
 * and a break duration.  Assigned to users via User.shiftId.
 */

const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "orgId is required"],
    },
    name: {
      type: String,
      required: [true, "Shift name is required"],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required (HH:MM)"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required (HH:MM)"],
    },
    gracePeriodMins: {
      type: Number,
      default: 15,
      min: [0, "Grace period cannot be negative"],
      max: [120, "Grace period cannot exceed 120 minutes"],
    },
    breakTimeMins: {
      type: Number,
      default: 60,
      min: [0, "Break time cannot be negative"],
      max: [480, "Break time cannot exceed 480 minutes"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Indexes                                                            */
/* ------------------------------------------------------------------ */
shiftSchema.index({ orgId: 1 });

module.exports = mongoose.model("Shift", shiftSchema);
