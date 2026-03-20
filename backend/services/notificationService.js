const Notification = require('../models/Notification');
const { getIo } = require('../utils/socket');

const createNotification = async ({
  title,
  message,
  type = 'info',
  module = 'dashboard',
  recipients = [],
  recipientRoles = [],
  createdBy = null,
  actionUrl = '',
  metadata = {}
}) => {
  const notification = await Notification.create({
    title,
    message,
    type,
    module,
    recipients,
    recipientRoles,
    createdBy,
    actionUrl,
    metadata
  });

  const io = getIo();
  if (io) {
    io.emit('notification:new', notification);
  }

  return notification;
};

module.exports = {
  createNotification
};

