/**
 * Location.js — Geofenced work locations.
 *
 * Each location belongs to an organisation and defines a GPS centre
 * point plus a radius in metres for geofence validation.
 */

const mongoose = require("mongoose");
const { LOCATION_TYPES } = require("../config/constants");

const locationSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "orgId is required"],
    },
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be >= -90"],
      max: [90, "Latitude must be <= 90"],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be >= -180"],
      max: [180, "Longitude must be <= 180"],
    },
    radiusMeters: {
      type: Number,
      required: [true, "Radius is required"],
      default: 200,
      min: [50, "Radius must be at least 50 m"],
      max: [5000, "Radius cannot exceed 5 000 m"],
    },
    locationType: {
      type: String,
      enum: Object.values(LOCATION_TYPES),
      default: LOCATION_TYPES.OnSite,
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
locationSchema.index({ orgId: 1, isActive: 1 });
locationSchema.index({ orgId: 1 });

module.exports = mongoose.model("Location", locationSchema);
