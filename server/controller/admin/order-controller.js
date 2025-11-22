const Order = require("../../models/order");
const Notification = require("../../models/notification");
const { notifyUser, notifyAdmin } = require("../../socket");

// 🟢 Lấy tất cả đơn hàng (Admin)
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({})
      .sort({ orderDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, totalPages, totalItems: totalOrders },
    });
  } catch (error) {
    console.error("❌ getAllOrdersOfAllUsers error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// 🟢 Chi tiết đơn hàng cho admin
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ getOrderDetailsForAdmin error:", error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// 🟢 User yêu cầu huỷ đơn hàng
const userRequestCancelOrder = async (req, res) => {
  try {
    const { orderId, userId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    order.orderStatus = "cancel_requested";
    order.cancelReason = reason;
    await order.save();

    // 📢 Lưu thông báo cho Admin
    const message = `📮 Người dùng yêu cầu hủy đơn #${orderId}. Lý do: ${reason}`;

    await Notification.create({
      userId: null,
      message,
      type: "order-cancel-request",
    });

    // 📢 Gửi socket đến Admin
    notifyAdmin({
      type: "order-cancel-request",
      orderId,
      userId,
      reason,
      message,
    });

    res.json({ success: true, message: "Đã gửi yêu cầu huỷ đơn!" });
  } catch (err) {
    console.error("❌ userRequestCancelOrder:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// 🟢 Cập nhật trạng thái đơn hàng (Admin/Shipper)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    order.orderStatus = orderStatus;
    await order.save();

    // 📩 Message gửi User
    const userMessage = `Đơn hàng #${order._id} đã được cập nhật sang trạng thái: ${orderStatus}`;

    await Notification.create({
      userId: order.userId,
      message: userMessage,
      type: "order-update",
    });

    // 📩 Gửi socket cho User
    notifyUser(order.userId, {
      type: "order-update",
      orderId: order._id,
      message: userMessage,
    });

    // 📩 Gửi socket + lưu cho Admin
    const adminMessage = `📦 Đơn hàng #${order._id} được cập nhật trạng thái: ${orderStatus}`;
    await Notification.create({
      userId: null,
      message: adminMessage,
      type: "order-update-admin",
    });

    notifyAdmin({
      type: "order-update-admin",
      orderId: order._id,
      message: adminMessage,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (error) {
    console.error("❌ updateOrderStatus error:", error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// 🟢 Xoá đơn hàng (Admin)
const deleteOrderForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    // 📩 Lưu & gửi socket cho User
    const message = `🚫 Đơn hàng #${id} của bạn đã được huỷ thành công.`;

    await Notification.create({
      userId: order.userId,
      message,
      type: "order-deleted",
    });

    notifyUser(order.userId, {
      type: "order-deleted",
      orderId: id,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully!",
    });
  } catch (error) {
    console.error("❌ deleteOrderForAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting order",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  deleteOrderForAdmin,
  userRequestCancelOrder,
};
