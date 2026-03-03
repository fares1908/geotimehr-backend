/**
 * request.validator.js — Joi schemas for employee requests.
 *
 * Uses Joi.when() for conditional validation:
 * - CORRECTION  → targetSessionId, correctedCheckIn/Out
 * - LEAVE       → leaveType, leaveStartDate/EndDate
 * - EXPENSE     → expenseDescription, amount, currency
 * - OVERTIME    → overtimeDate, hours, reason
 */

const Joi = require("joi");
const { REQUEST_TYPES, LEAVE_TYPES, REQUEST_STATUS } = require("../config/constants");

/** Reusable ObjectId pattern */
const objectId = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .message("Invalid ID format");

/** @type {Joi.ObjectSchema} */
const submitRequestSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(REQUEST_TYPES))
    .required()
    .messages({
      "any.only": `Type must be one of: ${Object.values(REQUEST_TYPES).join(", ")}`,
      "any.required": "Request type is required",
    }),

  /* --- CORRECTION ------------------------------------------------ */
  targetSessionId: Joi.when("type", {
    is: REQUEST_TYPES.CORRECTION,
    then: objectId.required().messages({
      "any.required": "Target session ID is required for corrections",
    }),
    otherwise: Joi.forbidden(),
  }),
  correctedCheckIn: Joi.when("type", {
    is: REQUEST_TYPES.CORRECTION,
    then: Joi.date().iso().required().messages({
      "any.required": "Corrected check-in time is required",
    }),
    otherwise: Joi.forbidden(),
  }),
  correctedCheckOut: Joi.when("type", {
    is: REQUEST_TYPES.CORRECTION,
    then: Joi.date().iso().greater(Joi.ref("correctedCheckIn")).required().messages({
      "any.required": "Corrected check-out time is required",
      "date.greater": "Check-out must be after check-in",
    }),
    otherwise: Joi.forbidden(),
  }),

  /* --- LEAVE ----------------------------------------------------- */
  leaveType: Joi.when("type", {
    is: REQUEST_TYPES.LEAVE,
    then: Joi.string()
      .valid(...Object.values(LEAVE_TYPES))
      .required()
      .messages({
        "any.only": `Leave type must be one of: ${Object.values(LEAVE_TYPES).join(", ")}`,
        "any.required": "Leave type is required",
      }),
    otherwise: Joi.forbidden(),
  }),
  leaveStartDate: Joi.when("type", {
    is: REQUEST_TYPES.LEAVE,
    then: Joi.date().iso().required().messages({
      "any.required": "Leave start date is required",
    }),
    otherwise: Joi.forbidden(),
  }),
  leaveEndDate: Joi.when("type", {
    is: REQUEST_TYPES.LEAVE,
    then: Joi.date().iso().min(Joi.ref("leaveStartDate")).required().messages({
      "any.required": "Leave end date is required",
      "date.min": "End date must be on or after start date",
    }),
    otherwise: Joi.forbidden(),
  }),

  /* --- EXPENSE --------------------------------------------------- */
  expenseDescription: Joi.when("type", {
    is: REQUEST_TYPES.EXPENSE,
    then: Joi.string().min(3).max(300).required().messages({
      "any.required": "Expense description is required",
    }),
    otherwise: Joi.forbidden(),
  }),
  expenseAmount: Joi.when("type", {
    is: REQUEST_TYPES.EXPENSE,
    then: Joi.number().min(0.01).max(999999).required().messages({
      "any.required": "Expense amount is required",
      "number.min": "Amount must be at least 0.01",
    }),
    otherwise: Joi.forbidden(),
  }),
  expenseCurrency: Joi.when("type", {
    is: REQUEST_TYPES.EXPENSE,
    then: Joi.string()
      .valid("USD", "EGP", "SAR", "AED", "EUR", "GBP")
      .default("USD")
      .optional(),
    otherwise: Joi.forbidden(),
  }),

  /* --- OVERTIME -------------------------------------------------- */
  overtimeDate: Joi.when("type", {
    is: REQUEST_TYPES.OVERTIME,
    then: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "any.required": "Overtime date is required",
        "string.pattern.base": "Date must be YYYY-MM-DD",
      }),
    otherwise: Joi.forbidden(),
  }),
  overtimeHours: Joi.when("type", {
    is: REQUEST_TYPES.OVERTIME,
    then: Joi.number().min(0.5).max(24).required().messages({
      "any.required": "Overtime hours are required",
    }),
    otherwise: Joi.forbidden(),
  }),
  overtimeReason: Joi.when("type", {
    is: REQUEST_TYPES.OVERTIME,
    then: Joi.string().min(10).max(500).required().messages({
      "any.required": "Overtime reason is required",
      "string.min": "Reason must be at least 10 characters",
    }),
    otherwise: Joi.forbidden(),
  }),
});

/** @type {Joi.ObjectSchema} */
const reviewRequestSchema = Joi.object({
  action: Joi.string()
    .valid(REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED)
    .required()
    .messages({
      "any.only": "Action must be APPROVED or REJECTED",
      "any.required": "Action is required",
    }),
  rejectionReason: Joi.when("action", {
    is: REQUEST_STATUS.REJECTED,
    then: Joi.string().min(10).max(500).required().messages({
      "any.required": "Rejection reason is required when rejecting",
      "string.min": "Reason must be at least 10 characters",
    }),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = {
  submitRequestSchema,
  reviewRequestSchema,
};
