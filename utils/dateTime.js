/**
 * dateTime.js — Timezone-aware date and time helpers.
 *
 * Uses dayjs with utc + timezone plugins so all date logic is
 * consistent across server timezone and organisation timezone.
 */

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get today's date string in a given timezone.
 * @param {string} tz — IANA timezone, e.g. "Africa/Cairo".
 * @returns {string} "YYYY-MM-DD"
 */
const getTodayString = (tz) => dayjs().tz(tz).format("YYYY-MM-DD");

/**
 * Get yesterday's date string in a given timezone.
 * @param {string} tz — IANA timezone.
 * @returns {string} "YYYY-MM-DD"
 */
const getYesterdayString = (tz) =>
  dayjs().tz(tz).subtract(1, "day").format("YYYY-MM-DD");

/**
 * Combine a date string and HH:MM time into a dayjs object in the
 * given timezone.
 *
 * @param {string} dateString — "YYYY-MM-DD"
 * @param {string} timeHHMM  — "HH:MM" (24-hour)
 * @param {string} tz         — IANA timezone.
 * @returns {import('dayjs').Dayjs}
 *
 * @example
 * buildShiftDateTime("2025-10-14", "09:00", "Africa/Cairo")
 */
const buildShiftDateTime = (dateString, timeHHMM, tz) =>
  dayjs.tz(`${dateString} ${timeHHMM}`, tz);

/**
 * Calculate how many minutes late a check-in is, considering the
 * grace period.
 *
 * @param {Date}   checkInAt       — JS Date of actual check-in.
 * @param {import('dayjs').Dayjs} shiftStart — dayjs shift-start time.
 * @param {number} gracePeriodMins — Allowed grace minutes.
 * @returns {number} Late minutes (0 if on time).
 */
const calcLateMins = (checkInAt, shiftStart, gracePeriodMins) => {
  const deadline = shiftStart.add(gracePeriodMins, "minute");
  const diffMins = dayjs(checkInAt).diff(deadline, "minute");
  return Math.max(0, diffMins);
};

/**
 * Convert total minutes to a human-readable duration string.
 * @param {number} totalMins
 * @returns {string} e.g. "8h 48m", "0m"
 */
const formatDuration = (totalMins) => {
  if (!totalMins || totalMins <= 0) return "0m";
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

module.exports = {
  dayjs,
  getTodayString,
  getYesterdayString,
  buildShiftDateTime,
  calcLateMins,
  formatDuration,
};
