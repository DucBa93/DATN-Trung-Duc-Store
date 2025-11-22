const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // nếu muốn gửi cho tất cả user
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["info", "warning", "error", "product-add", "product-update", "product-delete", "order-update","order-new", "order-update-admin","order-cancel", "order-deleted"], 
      required: true 
    },
    isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
