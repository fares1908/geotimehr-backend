/**
 * location.validator.js — Joi schemas for geofenced location CRUD.
 */

const Joi = require("joi");
const { LOCATION_TYPES } = require("../config/constants");

/** @type {Joi.ObjectSchema} */
const createLocationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Location name is required",
  }),
  address: Joi.string().max(300).optional(),
  lat: Joi.number().min(-90).max(90).required().messages({
    "any.required": "Latitude is required",
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    "any.required": "Longitude is required",
  }),
  radiusMeters: Joi.number()
    .integer()
    .min(50)
    .max(5000)
    .default(200)
    .required()
    .messages({
      "number.min": "Radius must be at least 50 metres",
      "number.max": "Radius cannot exceed 5 000 metres",
      "any.required": "Radius is required",
    }),
  locationType: Joi.string()
    .valid(...Object.values(LOCATION_TYPES))
    .default(LOCATION_TYPES.OnSite)
    .optional()
    .messages({
      "any.only": `Location type must be one of: ${Object.values(LOCATION_TYPES).join(", ")}`,
    }),
});

/**
 * Same fields as create, but all optional.
 * At least one field must be provided (.min(1)).
 * @type {Joi.ObjectSchema}
 */
const updateLocationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  address: Joi.string().max(300).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  radiusMeters: Joi.number().integer().min(50).max(5000).optional(),
  locationType: Joi.string()
    .valid(...Object.values(LOCATION_TYPES))
    .optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided",
});

module.exports = {
  createLocationSchema,
  updateLocationSchema,
};
