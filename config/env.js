/**
 * env.js — Centralised environment-variable loader for GeoTime HR.
 *
 * Reads process.env, validates that every required variable is present,
 * and exports a single, pre-parsed config object so the rest of the app
 * never touches process.env directly.
 *
 * @module config/env
 */

const { env } = process;

/* ------------------------------------------------------------------ */
/*  Required variables — fail fast if any are missing                  */
/* ------------------------------------------------------------------ */

const REQUIRED = ["PORT", "MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];

const missing = REQUIRED.filter((key) => !env[key] || env[key].trim() === "");

if (missing.length > 0) {
  throw new Error(
    `❌ Missing required environment variable(s): ${missing.join(", ")}.\n` +
      "   Copy .env.example → .env and fill in the values before starting the server."
  );
}

/* ------------------------------------------------------------------ */
/*  Parsed config object                                               */
/* ------------------------------------------------------------------ */

/**
 * Pre-parsed environment configuration.
 *
 * @type {{
 *   port: number,
 *   mongoUri: string,
 *   jwtSecret: string,
 *   jwtExpiresIn: string,
 *   nodeEnv: string,
 *   isProduction: boolean,
 *   clientUrl: string,
 *   cloudinary: { cloudName: string, apiKey: string, apiSecret: string },
 *   firebase: { projectId: string, privateKey: string, clientEmail: string }
 * }}
 */
const config = {
  port: Number(env.PORT) || 3000,
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,

  nodeEnv: env.NODE_ENV || "development",
  isProduction: env.NODE_ENV === "production",

  clientUrl: env.CLIENT_URL || "",

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: env.CLOUDINARY_API_KEY || "",
    apiSecret: env.CLOUDINARY_API_SECRET || "",
  },

  firebase: {
    projectId: env.FIREBASE_PROJECT_ID || "",
    privateKey: env.FIREBASE_PRIVATE_KEY || "",
    clientEmail: env.FIREBASE_CLIENT_EMAIL || "",
  },
};

module.exports = config;
