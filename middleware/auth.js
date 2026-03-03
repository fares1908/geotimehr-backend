/**
 * auth.js — JWT authentication middleware.
 *
 * Verifies the Bearer token from the Authorization header, looks up
 * the user in the database, and attaches a trimmed user object to req.
 * Rejects with 401 if anything is wrong.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret } = require("../config/env");

/**
 * Express middleware — verifies JWT and attaches req.user.
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const protect = async (req, res, next) => {
  try {
    /* 1. Extract token ------------------------------------------------ */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    /* 2. Verify token ------------------------------------------------- */
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (_err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    }

    /* 3. Lookup user -------------------------------------------------- */
    const user = await User.findOne({
      _id: decoded.userId,
      orgId: decoded.orgId,
      isActive: true,
    }).select("-passwordHash");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Account deactivated" });
    }

    /* 4. Attach to request -------------------------------------------- */
    req.user = {
      userId: user._id,
      orgId: user.orgId,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = protect;
