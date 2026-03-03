/**
 * Request.js — Employee requests (corrections, leave, expenses, overtime).
 *
 * A single polymorphic collection: the `type` field determines which
 * group of sub-fields is relevant for a given document.
 */

const mongoose = require("mongoose");
const {
  REQUEST_TYPES,
  REQUEST_STATUS,
  LEAVE_TYPES,
} = require("../config/constants");

const requestSchema = new mongoose.Schema(
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
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(REQUEST_TYPES),
      required: [true, "Request type is required"],
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },

    /* --- CORRECTION fields --------------------------------------- */
    targetSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      default: null,
    },
    targetDate: {
      type: String,
      default: null,
    },
    correctedCheckIn: {
      type: Date,
      default: null,
    },
    correctedCheckOut: {
      type: Date,
      default: null,
    },

    /* --- LEAVE fields -------------------------------------------- */
    leaveType: {
      type: String,
      enum: [...Object.values(LEAVE_TYPES), null],
      default: null,
    },
    leaveStartDate: {
      type: Date,
      default: null,
    },
    leaveEndDate: {
      type: Date,
      default: null,
    },

    /* --- EXPENSE fields ------------------------------------------ */
    expenseDescription: {
      type: String,
      default: null,
    },
    expenseAmount: {
      type: Number,
      default: null,
    },
    expenseCurrency: {
      type: String,
      default: "USD",
    },
    receiptUrl: {
      type: String,
      default: null,
    },

    /* --- OVERTIME fields ----------------------------------------- */
    overtimeDate: {
      type: String,
      default: null,
    },
    overtimeHours: {
      type: Number,
      default: null,
    },
    overtimeReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Indexes                                                            */
/* ------------------------------------------------------------------ */
requestSchema.index({ orgId: 1, userId: 1, createdAt: -1 });
requestSchema.index({ orgId: 1, status: 1, createdAt: -1 });
requestSchema.index({ orgId: 1, type: 1, status: 1 });

module.exports = mongoose.model("Request", requestSchema);
