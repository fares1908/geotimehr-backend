/**
 * notification.controller.js — In-app notification management.
 *
 * Employees view their notifications, mark individual or all as read.
 */

const Notification = require("../models/Notification");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

/* ------------------------------------------------------------------ */

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = req.scopeQuery({ userId: req.user.userId });

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({
        ...req.scopeQuery({ userId: req.user.userId }),
        isRead: false,
      }),
    ]);

    return sendSuccess(res, { notifications, unreadCount });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      req.scopeQuery({ _id: req.params.id, userId: req.user.userId }),
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    return sendSuccess(res, {}, "Marked as read");
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      req.scopeQuery({ userId: req.user.userId, isRead: false }),
      { isRead: true }
    );

    return sendSuccess(res, {}, "All notifications marked as read");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
