const Order = require("../../models/Order");
const Product = require("../../models/Product");

// ✅ Lấy thống kê tổng quát
const getSalesStats = async (req, res) => {
  try {
    // Lấy tất cả đơn hàng đã giao
    const orders = await Order.find({ orderStatus: "delivered" });

    if (!orders.length)
      return res.status(200).json({
        totalRevenue: 0,
        totalOrders: 0,
        totalProductsSold: 0,
        bestSellers: [],
        worstSellers: [],
      });

    // Tổng doanh thu
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Tổng số đơn hàng
    const totalOrders = orders.length;

    // Gom số lượng bán theo sản phẩm
    const productSales = {};
    orders.forEach((order) => {
      order.cartItems.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            title: item.title,
            image: item.image,
            quantity: 0,
            totalRevenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].totalRevenue += item.price * item.quantity;
      });
    });

    const sortedProducts = Object.values(productSales).sort(
      (a, b) => b.quantity - a.quantity
    );

    const bestSellers = sortedProducts.slice(0, 5);
    const worstSellers = sortedProducts.slice(-5);

    const totalProductsSold = sortedProducts.reduce(
      (sum, p) => sum + p.quantity,
      0
    );

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalProductsSold,
      bestSellers,
      worstSellers,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy thống kê", error });
  }
};

// ✅ Doanh thu theo tháng
const getRevenueByMonth = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "delivered" });

    const monthlyRevenue = {};

    orders.forEach((order) => {
      const month = new Date(order.orderDate).toLocaleString("vi-VN", {
        month: "2-digit",
        year: "numeric",
      });
      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) + order.totalAmount;
    });

    res.status(200).json(monthlyRevenue);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi tính doanh thu theo tháng", error });
  }
};

module.exports = { getSalesStats, getRevenueByMonth };
