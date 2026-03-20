const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { sendPaginatedResponse } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');

const buildNotificationFilter = (user) => ({
  $or: [
    { recipients: user._id },
    { recipientRoles: user.role },
    { recipients: { $size: 0 }, recipientRoles: { $size: 0 } }
  ]
});

const getNotifications = asyncHandler(async (req, res) => {
  const filter = buildNotificationFilter(req.user);
  const result = await sendPaginatedResponse({
    model: Notification,
    filter,
    query: req.query,
    populate: { path: 'createdBy', select: 'name' }
  });

  const unreadCount = await Notification.countDocuments({
    ...filter,
    readBy: { $ne: req.user._id }
  });

  res.json({
    ...result,
    unreadCount
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!notification.readBy.some((entry) => entry.toString() === req.user._id.toString())) {
    notification.readBy.push(req.user._id);
    await notification.save();
  }

  res.json(notification);
});

const createManualNotification = asyncHandler(async (req, res) => {
  const notification = await createNotification({
    title: req.body.title,
    message: req.body.message,
    type: req.body.type,
    module: req.body.module,
    recipients: req.body.recipients || [],
    recipientRoles: req.body.recipientRoles || [],
    createdBy: req.user._id,
    actionUrl: req.body.actionUrl || ''
  });

  res.status(201).json(notification);
});

module.exports = {
  getNotifications,
  markNotificationRead,
  createManualNotification
};

