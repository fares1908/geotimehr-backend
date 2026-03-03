/**
 * attendance.validator.js — Joi schemas for check-in / check-out.
 */

const Joi = require("joi");
const { WORK_MODES } = require("../config/constants");

/** @type {Joi.ObjectSchema} */
const checkInSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    "number.min": "Latitude must be >= -90",
    "number.max": "Latitude must be <= 90",
    "any.required": "Latitude is required",
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    "number.min": "Longitude must be >= -180",
    "number.max": "Longitude must be <= 180",
    "any.required": "Longitude is required",
  }),
  workMode: Joi.string()
    .valid(...Object.values(WORK_MODES))
    .default(WORK_MODES.OFFICE)
    .optional()
    .messages({
      "any.only": `Work mode must be one of: ${Object.values(WORK_MODES).join(", ")}`,
    }),
  deviceInfo: Joi.string().max(200).optional(),
});

/** @type {Joi.ObjectSchema} */
const checkOutSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    "number.min": "Latitude must be >= -90",
    "number.max": "Latitude must be <= 90",
    "any.required": "Latitude is required",
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    "number.min": "Longitude must be >= -180",
    "number.max": "Longitude must be <= 180",
    "any.required": "Longitude is required",
  }),
  deviceInfo: Joi.string().max(200).optional(),
});

module.exports = {
  checkInSchema,
  checkOutSchema,
};
