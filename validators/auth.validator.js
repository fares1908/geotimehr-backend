/**
 * auth.validator.js — Joi schemas for authentication routes.
 *
 * Covers organisation registration (with first admin) and login.
 */

const Joi = require("joi");

/** @type {Joi.ObjectSchema} */
const registerOrgSchema = Joi.object({
  orgName: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Organization name must be at least 2 characters",
    "any.required": "Organization name is required",
  }),
  timezone: Joi.string()
    .required()
    .valid(
      "Africa/Cairo",
      "Asia/Riyadh",
      "Europe/London",
      "America/New_York",
      "Asia/Dubai",
      "UTC"
    )
    .messages({
      "any.only": "Unsupported timezone",
      "any.required": "Timezone is required",
    }),
  adminName: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Admin name must be at least 2 characters",
    "any.required": "Admin name is required",
  }),
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must have uppercase, lowercase and number",
      "any.required": "Password is required",
    }),
});

/** @type {Joi.ObjectSchema} */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

module.exports = {
  registerOrgSchema,
  loginSchema,
};
