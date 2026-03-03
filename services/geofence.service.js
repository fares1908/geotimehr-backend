const User = require('../models/User');
const Location = require('../models/Location');

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first point in decimal degrees
 * @param {number} lng1 - Longitude of the first point in decimal degrees
 * @param {number} lat2 - Latitude of the second point in decimal degrees
 * @param {number} lng2 - Longitude of the second point in decimal degrees
 * @returns {number} Distance in meters, rounded to 2 decimal places
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = Math.PI / 180;

  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;
  const deltaPhi = (lat2 - lat1) * toRad;
  const deltaLambda = (lng2 - lng1) * toRad;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceRaw = R * c;
  return parseFloat(distanceRaw.toFixed(2));
};

/**
 * Validates if user coordinates are within the radius of a location.
 *
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} locationLat - Location's latitude
 * @param {number} locationLng - Location's longitude
 * @param {number} radiusMeters - Acceptable radius in meters
 * @returns {Object} { isInside: boolean, distanceM: number, radiusMeters: number }
 */
const isInsideGeofence = (userLat, userLng, locationLat, locationLng, radiusMeters) => {
  const distanceM = calculateDistance(userLat, userLng, locationLat, locationLng);
  return {
    isInside: distanceM <= radiusMeters,
    distanceM,
    radiusMeters
  };
};

/**
 * Finds the active location assigned to a user.
 *
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Formatted location document
 * @throws {Error} If no location is assigned or if the location is inactive
 */
const findActiveLocationForUser = async (orgId, userId) => {
  const user = await User.findOne({ _id: userId, orgId });
  if (!user || !user.locationId) {
    const err = new Error('No active location assigned');
    err.statusCode = 400; // Or validation error logic
    throw err;
  }

  const location = await Location.findOne({ _id: user.locationId, orgId });
  
  if (!location) {
    const err = new Error('No active location assigned');
    err.statusCode = 400;
    throw err;
  }

  if (!location.isActive) {
    const err = new Error('Your assigned location is inactive');
    err.statusCode = 400;
    throw err;
  }

  return location;
};

module.exports = {
  calculateDistance,
  isInsideGeofence,
  findActiveLocationForUser
};
