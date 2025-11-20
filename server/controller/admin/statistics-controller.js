const Order = require("../../models/Order");
const Product = require("../../models/Product");


// ======================================================
// 1. TỔNG QUAN DOANH THU
// ======================================================
const getSalesStats = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "delivered" });

    if (!orders.length) {
      return res.status(200).json({
        totalRevenue: 0,
        totalOrders: 0,
        totalProductsSold: 0,
        bestSellers: [],
        worstSellers: [],
        totalRevenueDay: 0,
        totalRevenueMonth: 0,
        totalOrdersDay: 0,
        totalOrdersMonth: 0,
        totalProductsSoldDay: 0,
        totalProductsSoldMonth: 0,
      });
    }

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const monthKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;

    let totalRevenueDay = 0;
    let totalRevenueMonth = 0;
    let totalOrdersDay = 0;
    let totalOrdersMonth = 0;
    let totalProductsSoldDay = 0;
    let totalProductsSoldMonth = 0;

    const productSales = {};

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const keyDay = orderDate.toISOString().slice(0,10);
      const keyMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth()+1).padStart(2,'0')}`;

      // ====== TÍNH NGÀY ======
      if (keyDay === todayStr) {
        totalRevenueDay += order.totalAmount;
        totalOrdersDay += 1;
        order.cartItems.forEach(i => totalProductsSoldDay += i.quantity);
      }

      // ====== TÍNH THÁNG ======
      if (keyMonth === monthKey) {
        totalRevenueMonth += order.totalAmount;
        totalOrdersMonth += 1;
        order.cartItems.forEach(i => totalProductsSoldMonth += i.quantity);
      }

      // ====== Thống kê chung ======
      order.cartItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            title: item.title,
            image: item.image,
            quantity: 0,
            totalRevenue: 0
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
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalOrders: orders.length,
      totalProductsSold,
      bestSellers,
      worstSellers,

      // ======= TRẢ THÊM =======
      totalRevenueDay,
      totalRevenueMonth,
      totalOrdersDay,
      totalOrdersMonth,
      totalProductsSoldDay,
      totalProductsSoldMonth,
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy thống kê", error });
  }
};


// ======================================================
// 2. DOANH THU THEO THÁNG
// ======================================================
const getRevenueByMonth = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const orders = await Order.find({
      orderStatus: "delivered",
      orderDate: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      },
    });

    const monthly = {};

    for (let i = 1; i <= 12; i++) {
      const key = `${year}-${String(i).padStart(2, "0")}`;
      monthly[key] = 0;
    }

    orders.forEach((order) => {
      const d = new Date(order.orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] += order.totalAmount;
    });

    res.status(200).json(monthly);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// ======================================================
// 3. DOANH THU THEO KHOẢNG (from → to)
// ======================================================
const getRevenueByRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to)
      return res.status(400).json({ message: "Thiếu from hoặc to" });

    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59);

    const orders = await Order.find({
      orderStatus: "delivered",
      orderDate: { $gte: start, $lte: end },
    });

    const result = {};
    orders.forEach((order) => {
      const key = order.orderDate.toISOString().slice(0, 10); // YYYY-MM-DD
      result[key] = (result[key] || 0) + order.totalAmount;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// ======================================================
// 4. DOANH THU THEO NGÀY (DAILY)
// ======================================================
const getRevenueDaily = async (req, res) => {
  try {
    const { year, month } = req.query;

    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) - 1;

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const orders = await Order.find({
      orderStatus: "delivered",
      orderDate: { $gte: start, $lte: end },
    });

    const daily = {};

    orders.forEach((o) => {
      const day = o.orderDate.toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + o.totalAmount;
    });

    res.status(200).json(daily);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê theo ngày", err });
  }
};

// ======================================================
// 5. DOANH THU THEO TUẦN
// ======================================================

// Lấy số tuần ISO
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
// ======================================================
// XEM SẢN PHẨM BÁN ĐƯỢC THEO NGÀY / THÁNG / TUẦN / RANGE
// ======================================================
const getSoldProducts = async (req, res) => {
  try {
    const { day, month, week, from, to } = req.query;

    let filter = { orderStatus: "delivered" };

    // --- Theo ngày ---
    if (day) {
      const start = new Date(day);
      const end = new Date(day);
      end.setHours(23, 59, 59);
      filter.orderDate = { $gte: start, $lte: end };
    }

    // --- Theo tháng ---
    else if (month) {
      const [y, m] = month.split("-");
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);
      filter.orderDate = { $gte: start, $lte: end };
    }

    // --- Theo tuần ISO ---
    else if (week) {
      const [year, w] = week.split("-W");
      const weekNum = parseInt(w);

      const start = new Date(year);
      start.setMonth(0);
      start.setDate(1 + (weekNum - 1) * 7);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59);

      filter.orderDate = { $gte: start, $lte: end };
    }

    // --- Theo khoảng ---
    else if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      end.setHours(23, 59, 59);
      filter.orderDate = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter);

    const productStats = {};

    orders.forEach(order => {
      order.cartItems.forEach(item => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            productId: item.productId,
            title: item.title,
            image: item.image,
            quantity: 0,
            revenue: 0
          };
        }

        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      });
    });

    res.status(200).json(Object.values(productStats));

  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm đã bán", err });
  }
};

const getRevenueWeekly = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const orders = await Order.find({
      orderStatus: "delivered",
      orderDate: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      },
    });

    const weekly = {};

    orders.forEach((o) => {
      const key = getISOWeek(o.orderDate);
      weekly[key] = (weekly[key] || 0) + o.totalAmount;
    });

    res.status(200).json(weekly);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê theo tuần", err });
  }
};

const getImportCostByMonth = async (req, res) => {
  try {
    const { month } = req.query; // "2025-11"
    const [y, m] = month.split("-");
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    // Lấy tất cả sản phẩm (có importPrice, variants, stock)
    const products = await Product.find({ /* bạn có filter theo ngày nhập nếu cần */ });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi thống kê vốn nhập", err });
  }
};



module.exports = {
  getSalesStats,
  getRevenueByMonth,
  getRevenueByRange,
  getRevenueDaily,
  getRevenueWeekly,
  getSoldProducts,
  getImportCostByMonth
};
