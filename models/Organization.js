/**
 * Organization.js — Tenant / company document.
 *
 * Each organisation is the top-level tenant. Every other collection
 * references an orgId that points back here.
 */

const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      default: "Africa/Cairo",
    },
    defaultGraceMins: {
      type: Number,
      default: 15,
      min: [0, "Grace minutes cannot be negative"],
      max: [60, "Grace minutes cannot exceed 60"],
    },
    defaultShiftStart: {
      type: String,
      default: "09:00",
    },
    defaultShiftEnd: {
      type: String,
      default: "18:00",
    },
    logoUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
