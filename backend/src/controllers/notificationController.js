import Notification from '../models/Notification.js';

// Create and optionally emit a notification
export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, body, channel = 'database', meta } = req.body;
    const n = await Notification.create({ userId, type, title, body, channel, meta });
    // Emit via socket if available
    try {
      const io = req.app?.locals?.io;
      if (io && userId) io.to(userId.toString()).emit('notification', n);
    } catch (e) {
      // ignore socket failures
    }
    // TODO: send email via configured mailer when channel includes 'email'
    res.status(201).json(n);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json(n);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default { createNotification, getNotifications, markRead };
