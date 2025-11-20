const mongoose = require("mongoose");
const Notification = require("../../models/notification");
const { notifyUser } = require("../../socket");

// 🟢 Tạo notification mới
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    const notification = await Notification.create({
      userId: userId || null,
      message,
      type,
      isRead: false, // ✅ đảm bảo field này tồn tại
    });

    // Gửi realtime đến user (nếu có userId)
    if (userId) {
      notifyUser(userId, { message, type });
    }

    res.json(notification);
  } catch (err) {
    console.error("❌ Error in createNotification:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟡 Lấy notification theo userId
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    let notifications;

    if (userId === "admin") {
      // Admin nhận tất cả noti có userId rỗng (gửi cho toàn hệ thống)
      notifications = await Notification.find({
        $or: [{ userId: null }, { userId: "" }],
      }).sort({ createdAt: -1 });
    } else {
      // 🔧 Fix: không convert sang ObjectId, vì userId trong DB có thể là string
      notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    }

    res.json(notifications);
  } catch (err) {
    console.error("❌ Error in getUserNotifications:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟣 Đánh dấu tất cả là đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === "admin") {
      await Notification.updateMany(
        { $or: [{ userId: null }, { userId: "" }], isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in markAsRead:", err);
    res.status(500).json({ message: err.message });
  }
};
