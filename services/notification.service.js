const admin = require('firebase-admin');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User to fetch FCM Token
const config = require('../config/env');

/**
 * Initializes the Firebase Admin app.
 * Called once at server startup.
 */
const initFirebase = () => {
  if (!admin.apps.length) {
    if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey.replace(/\\n/g, '\n')
          }),
        });
        console.log('✅ Firebase Admin initialized successfully');
      } catch (err) {
        console.error('⚠️ Firebase Admin init failed:', err.message);
      }
    } else {
      console.log('⚠️ Firebase credentials not fully provided. Push notifications disabled.');
    }
  }
};

/**
 * Persists a notification to the database.
 * 
 * @param {string} orgId - Organization ID
 * @param {string} userId - Target User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} type - Notification Enum type (e.g. SYSTEM, REQUEST, ATTENDANCE)
 * @param {string} relatedId - Optional referenced document ID
 * @param {string} relatedModel - Optional referenced model type
 * @returns {Promise<Object>} Created notification document
 */
const createNotification = async (orgId, userId, title, body, type, relatedId, relatedModel) => {
  return Notification.create({
    orgId,
    userId,
    title,
    body,
    type,
    relatedId,
    relatedModel
  });
};

/**
 * Sends a push notification to a user via Firebase Cloud Messaging.
 * Does not throw if it fails to prevent breaking main business flows.
 *
 * @param {string} userId - Target User ID
 * @param {string} title - Push title
 * @param {string} body - Push body text
 * @param {Object} data - Optional payload data
 * @returns {Promise<void>}
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId).select('fcmToken');
    if (!user || !user.fcmToken) {
      console.warn(`⚠️ Skipped Push: User ${userId} has no FCM token.`);
      return;
    }

    if (admin.apps.length > 0) {
      await admin.messaging().send({
        notification: { title, body },
        data: { ...data, timestamp: new Date().toISOString() },
        token: user.fcmToken
      });
      console.log(`📡 Push sent successfully to ${userId}`);
    } else {
      console.warn('⚠️ Skipped Push: Firebase not initialized.');
    }
  } catch (err) {
    // We catch it and log so we don't crash requested workflow
    console.error(`❌ FCM Push failed for user ${userId}:`, err.message);
  }
};

/**
 * Helper to notify a user about their request status update (Approve/Reject).
 * 
 * @param {string} orgId - Organization ID
 * @param {string} userId - Requesting User ID
 * @param {string} requestType - (LEAVE, CORRECTION, etc)
 * @param {string} status - (APPROVED, REJECTED)
 * @param {string} rejectionReason - Optional reason if rejected
 */
const notifyRequestUpdate = async (orgId, userId, requestType, status, rejectionReason = '') => {
  const isApproved = status === 'APPROVED';
  const title = isApproved ? '✅ Request Approved' : '❌ Request Rejected';
  let body = `Your ${requestType.toLowerCase()} request was ${status.toLowerCase()}.`;
  
  if (!isApproved && rejectionReason) {
    body += ` Reason: ${rejectionReason}`;
  }

  await createNotification(orgId, userId, title, body, 'REQUEST');
  await sendPushNotification(userId, title, body);
};

/**
 * Helper to notify user about arriving late.
 * 
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {number} lateMins - Minutes late
 */
const notifyLateCheckIn = async (orgId, userId, lateMins) => {
  const title = '⏰ Late Check-in';
  const body = `You checked in ${lateMins} minutes late today.`;

  await createNotification(orgId, userId, title, body, 'ATTENDANCE');
  await sendPushNotification(userId, title, body);
};

/**
 * Helper to notify user about failing to checkout.
 * 
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} date - The date they missed checkout
 */
const notifyMissingCheckout = async (orgId, userId, date) => {
  const title = '⚠️ Missing Check-out';
  const body = `You forgot to check out on ${date}. Session flagged as MISSING_OUT.`;

  await createNotification(orgId, userId, title, body, 'ATTENDANCE');
  await sendPushNotification(userId, title, body);
};

module.exports = {
  initFirebase,
  createNotification,
  sendPushNotification,
  notifyRequestUpdate,
  notifyLateCheckIn,
  notifyMissingCheckout
};
