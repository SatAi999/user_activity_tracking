const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getNotifications, markRead, markAllRead };
