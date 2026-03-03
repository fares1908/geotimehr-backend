/**
 * User.js — Employee / HR / Manager accounts.
 *
 * Scoped to an organisation via orgId.  Passwords are auto-hashed
 * on save and never returned in JSON output.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, USER_STATUS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "orgId is required"],
      index: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Indexes                                                            */
/* ------------------------------------------------------------------ */
userSchema.index({ orgId: 1, email: 1 }, { unique: true });
userSchema.index({ orgId: 1, status: 1 });
userSchema.index({ orgId: 1, role: 1 });

/* ------------------------------------------------------------------ */
/*  Pre-save: auto-hash password when modified                         */
/* ------------------------------------------------------------------ */
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Instance method: compare plain-text password                       */
/* ------------------------------------------------------------------ */

/**
 * Compare a plain-text password against the stored hash.
 * @param {string} plain — The candidate password.
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

/* ------------------------------------------------------------------ */
/*  toJSON transform: strip passwordHash from all output               */
/* ------------------------------------------------------------------ */
userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
