/**
 * user.validator.js — Joi schemas for user management routes.
 *
 * Covers HR creating/updating users and employees updating
 * their own profile.
 */

const Joi = require("joi");
const { ROLES, USER_STATUS } = require("../config/constants");

/** Reusable ObjectId pattern */
const objectId = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .message("Invalid ID format");

/** @type {Joi.ObjectSchema} */
const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages({
      "any.only": `Role must be one of: ${Object.values(ROLES).join(", ")}`,
      "any.required": "Role is required",
    }),
  jobTitle: Joi.string().max(100).optional(),
  department: Joi.string().max(100).optional(),
  shiftId: objectId.optional(),
  locationId: objectId.optional(),
});

/** @type {Joi.ObjectSchema} */
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  jobTitle: Joi.string().max(100).optional(),
  department: Joi.string().max(100).optional(),
  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .optional()
    .messages({
      "any.only": `Status must be one of: ${Object.values(USER_STATUS).join(", ")}`,
    }),
  shiftId: objectId.optional(),
  locationId: objectId.optional(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .optional()
    .messages({
      "any.only": `Role must be one of: ${Object.values(ROLES).join(", ")}`,
    }),
});

/** @type {Joi.ObjectSchema} — Employee updating their own profile. */
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  avatarUrl: Joi.string().uri().optional(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
};
