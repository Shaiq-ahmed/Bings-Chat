const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationSchema');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar')
    // .populate('chat', 'chatName isGroupChat');

  res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error('Not authorized to mark this notification as read');
  }

  notification.read = true;
  await notification.save();

  res.json(notification);
});

// @desc    Clear all notifications for a user
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user.id });
  res.json({ message: 'All notifications cleared' });
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
  clearNotifications
};

