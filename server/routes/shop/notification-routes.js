const express = require("express");
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
} = require("../../controller/shop/notification-controller");

router.post("/", createNotification);
router.get("/:userId", getUserNotifications);
router.put("/mark-as-read/:userId", markAsRead); // mark tất cả notification user
router.put("/mark-all-as-read/:userId", markAsRead);

module.exports = router;
