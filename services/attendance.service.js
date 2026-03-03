const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const AttendanceSession = require('../models/AttendanceSession');
const AttendanceEvent = require('../models/AttendanceEvent');
const User = require('../models/User');
const Shift = require('../models/Shift');
const Location = require('../models/Location');
const { isInsideGeofence, findActiveLocationForUser } = require('./geofence.service');

const CONSTANTS = require('../config/constants'); // If needed, although mostly strings used directly based on instructions

/**
 * Retrieves the current day's attendance session for a user.
 *
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
const getTodaySession = async (orgId, userId) => {
  const dateStr = dayjs().format('YYYY-MM-DD');
  return AttendanceSession.findOne({ orgId, userId, date: dateStr });
};

/**
 * Calculates late minutes based on shift rules and user check-in time.
 *
 * @param {Date|dayjs.Dayjs} checkInAt - The actual check-in time
 * @param {string} shiftStartTime - "HH:MM" string indicating shift start time
 * @param {number} gracePeriodMins - Grace period in minutes
 * @param {string} orgTimezone - Organization timezone string
 * @returns {Object} { lateMins: number, isLate: boolean }
 */
const calculateLateMins = (checkInAt, shiftStartTime, gracePeriodMins, orgTimezone) => {
  const checkIn = dayjs(checkInAt).tz(orgTimezone);
  
  // shiftStartTime is "HH:MM", we map it to today
  const [hours, minutes] = shiftStartTime.split(':');
  
  // Create the deadline (start time + grace period) in the org's timezone
  let expectedStart = dayjs().tz(orgTimezone).hour(parseInt(hours)).minute(parseInt(minutes)).second(0).millisecond(0);
  const deadline = expectedStart.add(gracePeriodMins, 'minute');

  const diffMins = checkIn.diff(deadline, 'minute');
  const lateMins = Math.max(0, diffMins); // floor essentially

  return {
    lateMins,
    isLate: lateMins > 0
  };
};

/**
 * Handles the logic required to securely check-in a user.
 *
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {number} lat - Check-in latitude
 * @param {number} lng - Check-in longitude
 * @param {string} workMode - Enum for work mode (OFFICE, REMOTE, etc.)
 * @param {string} deviceInfo - Device metadata
 * @returns {Promise<Object>} Created session
 */
const checkIn = async (orgId, userId, lat, lng, workMode, deviceInfo) => {
  // 1. Get user with shift and location
  const user = await User.findOne({ _id: userId, orgId }).populate('shiftId').populate('locationId');
  if (!user || !user.shiftId) {
    throw new Error('User has no assigned shift');
  }

  // 2. findActiveLocationForUser
  const location = await findActiveLocationForUser(orgId, userId);

  // 3. isInsideGeofence
  const geofenceResult = isInsideGeofence(lat, lng, location.lat, location.lng, location.radiusMeters);

  // 4. Validate geofence
  if (!geofenceResult.isInside) {
    await AttendanceEvent.create({
      orgId,
      userId,
      type: 'REJECTED',
      deviceInfo,
      reason: 'OUTSIDE_GEOFENCE',
      lat,
      lng
    });

    const err = new Error('You are outside the geofence area.');
    err.code = 'OUTSIDE_GEOFENCE';
    err.distanceM = geofenceResult.distanceM;
    err.radiusMeters = geofenceResult.radiusMeters;
    err.statusCode = 403;
    throw err;
  }

  // 5. Existing OPEN session
  const existingSession = await getTodaySession(orgId, userId);
  if (existingSession) {
    const err = new Error('You have already checked in today.');
    err.code = 'ALREADY_CHECKED_IN';
    err.statusCode = 409;
    throw err;
  }

  // 6 - 7. Calculate rules and lateness
  const shift = user.shiftId;
  const now = new Date(); // Or dayjs() basically
  // Defaulting timezone to a hypothetical fallback, ideally we fetch Org timezone
  // For simplicity based on prompt, passing common default or assume it's "Africa/Cairo" via user or org defaults,
  // we will pass "Africa/Cairo" as requested earlier if no lookup applies here, but let's use global 'UTC' if undefined
  const orgTimezone = 'Africa/Cairo'; // Ideally fetched from org
  const { lateMins, isLate } = calculateLateMins(now, shift.startTime, shift.gracePeriodMins, orgTimezone);

  // 8. Create Session
  const session = await AttendanceSession.create({
    orgId,
    userId,
    date: dayjs(now).format('YYYY-MM-DD'),
    status: 'OPEN',
    checkInAt: now,
    checkInLat: lat,
    checkInLng: lng,
    checkInDistanceM: geofenceResult.distanceM,
    lateMins,
    isLate,
    shiftStartSnapshot: shift.startTime,
    shiftEndSnapshot: shift.endTime,
    locationNameSnapshot: location.name,
    workMode,
    deviceInfo
  });

  // 9. Write Event
  await AttendanceEvent.create({
    orgId,
    userId,
    sessionId: session._id,
    type: 'CHECKIN',
    deviceInfo,
    lat,
    lng
  });

  return session;
};

/**
 * Handles the logic to check-out a user and close their daily session.
 *
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {number} lat - Check-out latitude
 * @param {number} lng - Check-out longitude
 * @param {string} deviceInfo - Device metadata
 * @returns {Promise<Object>} Updated session
 */
const checkOut = async (orgId, userId, lat, lng, deviceInfo) => {
  // 1. Find OPEN session for today
  const dateStr = dayjs().format('YYYY-MM-DD');
  const session = await AttendanceSession.findOne({ orgId, userId, date: dateStr, status: 'OPEN' });

  if (!session) {
    const err = new Error('No active check-in session found for today.');
    err.code = 'NO_ACTIVE_SESSION';
    err.statusCode = 404;
    throw err;
  }

  // Try to grab location to log distance on checkout too
  let checkOutDistanceM = null;
  try {
    const location = await findActiveLocationForUser(orgId, userId);
    const geofenceResult = isInsideGeofence(lat, lng, location.lat, location.lng, location.radiusMeters);
    checkOutDistanceM = geofenceResult.distanceM;
  } catch (err) {
    // If they were unassigned midway or disabled log quietly
  }

  const now = new Date();
  const checkInAt = session.checkInAt;
  const totalMins = Math.floor((now.getTime() - checkInAt.getTime()) / 60000);

  session.checkOutAt = now;
  session.checkOutLat = lat;
  session.checkOutLng = lng;
  session.checkOutDistanceM = checkOutDistanceM;
  session.totalMins = totalMins;
  session.status = 'COMPLETE';

  await session.save();

  await AttendanceEvent.create({
    orgId,
    userId,
    sessionId: session._id,
    type: 'CHECKOUT',
    deviceInfo,
    lat,
    lng
  });

  return session;
};

/**
 * Scans for OPEN sessions from yesterday and flags them as missing check-outs.
 * Called by a cron job every midnight.
 *
 * @param {string} orgId - Organization ID
 * @returns {Promise<number>} Count of flagged sessions
 */
const flagMissingCheckouts = async (orgId) => {
  const yesterdayDateStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  
  const openSessions = await AttendanceSession.find({
    orgId,
    status: 'OPEN',
    date: yesterdayDateStr
  });

  let flaggedCount = 0;

  for (const session of openSessions) {
    session.status = 'MISSING_OUT';
    await session.save();
    flaggedCount++;
  }

  return flaggedCount;
};

module.exports = {
  getTodaySession,
  calculateLateMins,
  checkIn,
  checkOut,
  flagMissingCheckouts
};
