import Notification from "../models/Notification.js"

// GET all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username profilePic")
      .populate("post", "media")
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" })
  }
}

// PATCH mark all as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { read: true })
    res.json({ message: "Marked as read" })
  } catch (err) {
    res.status(500).json({ message: "Error marking read" })
  }
}