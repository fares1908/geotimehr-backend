const cron = require('node-cron');
const Organization = require('../models/Organization');
const attendanceService = require('./attendance.service');
const notificationService = require('./notification.service');
const dayjs = require('dayjs'); // Optional, to pass dates to notification

/**
 * Initializes all background cron jobs.
 * This is executed once when the server boots.
 */
const initCronJobs = () => {
  console.log('⏳ Initializing scheduled cron jobs...');

  /**
   * Job 1: Midnight Auto-flag missing checkouts.
   * Runs exactly at 00:00 server time.
   */
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🕛 Cron triggers: [Missing Checkouts Check]');
      const orgs = await Organization.find({}).select('_id');
      
      let totalFlagged = 0;
      const yesterdayDateStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

      for (const org of orgs) {
        // Flag sessions inside the Org
        const flaggedCount = await attendanceService.flagMissingCheckouts(org._id);
        totalFlagged += flaggedCount;

        // If your business rule demands notifying each user:
        // You'd ideally return flagged session objects rather than pure counts to grab userIds here.
        // Assuming the prompt requested: "For each flagged session: notifyMissingCheckout" we should
        // re-fetch or modify flagMissingCheckouts to return the sessions. Let's fetch them post-update for purity:
        const flaggedSessions = await require('../models/AttendanceSession').find({
          orgId: org._id,
          date: yesterdayDateStr,
          status: 'MISSING_OUT'
        });

        for (const session of flaggedSessions) {
          await notificationService.notifyMissingCheckout(org._id, session.userId, yesterdayDateStr);
        }
      }

      console.log(`🕛 Cron: flagged ${totalFlagged} missing checkouts system-wide.`);
    } catch (err) {
      console.error('❌ Cron [Missing Checkouts Check] failed:', err.message);
    }
  });

  /**
   * Job 2: AM Health Log.
   * Runs exactly at 08:00 AM server time.
   */
  cron.schedule('0 8 * * *', () => {
    console.log(`✅ GeoTime HR API is healthy — ${new Date().toISOString()}`);
  });
};

module.exports = {
  initCronJobs
};
