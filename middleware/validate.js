/**
 * validate.js — Joi schema validation middleware factory.
 *
 * Validates req.body (default), req.params, or req.query against a
 * Joi schema and returns a 422 with structured error details on failure.
 *
 * Usage:
 *   router.post("/checkin", protect, validate(checkinSchema), controller)
 *   router.get("/users/:id", protect, validate(idSchema, "params"), controller)
 */

const Joi = require("joi");

/**
 * Create a validation middleware for the given Joi schema.
 *
 * @param {Joi.ObjectSchema} schema   — Joi schema to validate against.
 * @param {"body"|"params"|"query"} [property="body"] — Request property to validate.
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    /* Replace with validated + sanitised value */
    req[property] = value;
    return next();
  };
};

module.exports = validate;
