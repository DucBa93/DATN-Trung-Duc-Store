const Order = require("../../models/order");
const { notifyUser, notifyAdmin } = require("../../socket")
const Notification = require("../../models/notification")
// 🟢 Lấy tất cả đơn hàng (Admin) - sắp xếp theo ngày mới nhất + phân trang
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments();

    // Tính số trang
    const totalPages = Math.ceil(totalOrders / limit);

    // Lấy danh sách đơn hàng, sắp xếp theo orderDate giảm dần (mới nhất trước)
    // Nếu orderDate không có, fallback dùng createdAt
    const orders = await Order.find({})
      .sort({ orderDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: totalOrders,
      },
    });
  } catch (error) {
    console.error("❌ getAllOrdersOfAllUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching orders",
    });
  }
};

// 🟢 Lấy chi tiết đơn hàng theo ID
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ getOrderDetailsForAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};



// 🟢 Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, shipperId } = req.body; // shipperId: người thay đổi (nếu cần ghi log)

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // 🟠 Lưu trạng thái mới
    order.orderStatus = orderStatus;
    await order.save();

    // ✅ Thông báo cho User
    const messageUser = `📦 Đơn hàng ${order._id} của bạn đã được cập nhật trạng thái: ${orderStatus}`;
    await Notification.create({
      userId: order.userId,
      message: messageUser,
      type: "order-update",
    });
    notifyUser(order.userId, messageUser);

    // ✅ Thông báo cho Admin
    const messageAdmin = `🚚 Shipper đã cập nhật đơn hàng ${order._id} sang trạng thái: ${orderStatus}`;
    await Notification.create({
      userId: null, // null = gửi admin (giống cách bạn làm với product)
      message: messageAdmin,
      type: "order-update-admin",
    });
    notifyAdmin(messageAdmin);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (error) {
    console.error("❌ updateOrderStatus error:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};



// 🟢 Xoá đơn hàng
const deleteOrderForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

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
};
