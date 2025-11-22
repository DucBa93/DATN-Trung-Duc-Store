const paypal = require("../../helpers/paypal");
const Order = require("../../models/order");
const Cart = require("../../models/cart");
const Product = require("../../models/product");
const Coupon = require("../../models/coupon");
const { notifyAdmin } = require("../../socket");
const User = require("../../models/user");

const Notification = require("../../models/notification")


// tạo đơn hàng + redirect PayPal
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      totalAmount,
      discountValue,
      appliedCoupon,
      orderStatus = "pending",
      paymentMethod = "paypal",
      paymentStatus = "pending",
      orderDate,
      orderUpdateDate,
      shippingFee = 0
    } = req.body;
    console.log("CartItem",cartItems);
    
    if (!cartItems || !cartItems.length)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Convert cart items to ensure color/size correct
    const newCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.title}`);

        // chọn variant đúng màu hoặc lấy variant đầu tiên
        const variant =
          product.variants.find(
            (v) =>
              v.color?.trim().toLowerCase() === item.color?.trim().toLowerCase()
          ) || product.variants[0];

        // chọn size đúng hoặc lấy size đầu tiên
        const sizeObj =
          variant.sizes.find(
            (s) =>
              s.size?.toString().trim() === item.size?.toString().trim()
          ) || variant.sizes[0];

        
        
        return {
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          color: variant.color,
          size: sizeObj.size,
          image: item.image || variant.mainImage || product.image,
        };
      })
    );



    // =============================================================
    // ========================== COD ===============================
    // =============================================================
    if (paymentMethod === "cod") {
      const newOrder = new Order({
        userId,
        cartId,
        cartItems: newCartItems,
        addressInfo,
        orderStatus: "confirmed",
        paymentMethod: "cod",
        paymentStatus: "pending",
        totalAmount,
        shippingFee,
        finalAmount: totalAmount + shippingFee - discountValue,
        discountValue,
        appliedCoupon,
        orderDate,
        orderUpdateDate,
      });

      await newOrder.save();

      // Increase coupon count
      if (appliedCoupon?.code) {
        await Coupon.findOneAndUpdate({ code: appliedCoupon.code }, { $inc: { usedCount: 1 } });
      }

      // decrease stock
      for (const item of newCartItems) {
        const product = await Product.findById(item.productId);
        if (product) {

          // tìm variant theo màu
          const variant = product.variants.find(
            v => v.color.trim().toLowerCase() === item.color.trim().toLowerCase()
          );
          if (!variant) continue;

          // tìm size
          const sizeObj =
          variant.sizes.find(
            (s) =>
              s.size?.toString().trim() === item.size?.toString().trim()
          ) || variant.sizes[0];

          if (!sizeObj) continue;

          // giảm stock đúng size
          sizeObj.stock = Math.max(sizeObj.stock - item.quantity, 0);
          // tăng số lượng đã bán
          product.sold += item.quantity;
          // cập nhật tổng tồn kho
          product.totalStock = product.variants.reduce((sum, v) => {
            return sum + v.sizes.reduce((s, si) => s + si.stock, 0);
          }, 0);

          await product.save();
        }
      }


      // Remove cart
      await Cart.findByIdAndDelete(cartId);

      // Notify admin
      const user = await User.findById(userId);
      const userName = user ? user.userName : "Unknown";
      const message = `🛒 User ${userName} vừa tạo đơn #${newOrder._id} (COD), Tổng: ${(totalAmount + shippingFee - discountValue).toLocaleString()}đ`;

      await Notification.create({ message, type: "order-new", userId: null });
      notifyAdmin(message);

      return res.status(201).json({
        success: true,
        message: "Order created with COD",
        orderId: newOrder._id,
      });
    }



    // =============================================================
    // ======================== PAYPAL =============================
    // =============================================================
    const VND_TO_USD = 0.000040;

    const itemsUSD = newCartItems.map((item) => ({
      name: item.title,
      sku: item.productId,
      price: (Number(item.price) * VND_TO_USD).toFixed(2),
      currency: "USD",
      quantity: Number(item.quantity),
    }));

    const subtotalUSD = itemsUSD.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    const discountUSD = Number(((discountValue || 0) * VND_TO_USD).toFixed(2));
    const shippingUSD = Number((shippingFee * VND_TO_USD).toFixed(2));
    const totalUSD = Number((subtotalUSD - discountUSD + shippingUSD).toFixed(2));

    if (totalUSD < 0.01)
      return res.status(400).json({ success: false, message: "Total too low for PayPal" });


    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: { items: itemsUSD },
          amount: {
            currency: "USD",
            total: totalUSD.toFixed(2),
            details: {
              subtotal: subtotalUSD.toFixed(2),
              shipping: shippingUSD.toFixed(2),
              shipping_discount: `-${discountUSD.toFixed(2)}`,
              tax: "0.00",
            },
          },
          description: `Order from user ${userId} - coupon: ${appliedCoupon || "none"}`,
        },
      ],
    };


    paypal.payment.create(create_payment_json, async (err, payment) => {
      if (err) {
        console.log("PayPal create error:", err.response || err);
        return res
          .status(500)
          .json({ success: false, message: "PayPal create payment error" });
      }

      const approvalURL = payment.links.find((l) => l.rel === "approval_url")?.href;

      const newOrder = new Order({
        userId,
        cartId,
        cartItems: newCartItems,
        addressInfo,
        orderStatus,
        paymentMethod: "paypal",
        paymentStatus,
        totalAmount,
        shippingFee,
        finalAmount: totalAmount + shippingFee - discountValue,
        discountValue,
        appliedCoupon,
        orderDate,
        orderUpdateDate,
      });

      await newOrder.save();

      // coupon usage
      if (appliedCoupon?.code) {
        await Coupon.findOneAndUpdate({ code: appliedCoupon.code }, { $inc: { usedCount: 1 } });
      }

      const user = await User.findById(userId);
      const userName = user ? user.userName : "Unknown";
      const message = `🛒 User ${userName} vừa tạo đơn #${newOrder._id}, tổng: ${(totalAmount + shippingFee - discountValue).toLocaleString()}đ`;

      await Notification.create({ message, type: "order-new", userId: null });
      notifyAdmin(message);

      res.status(201).json({
        success: true,
        orderId: newOrder._id,
        approvalURL,
      });
    });
  } catch (e) {
    console.log("createOrder catch error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};


// capture payment + confirm order
const capturePayment = async (req, res) => {


  try {
    const { paymentId, payerId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Order already paid",
        data: order
      });
    }
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    // giảm stock sản phẩm theo từng variant
    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const variant = product.variants.find(
        v => v.color.trim().toLowerCase() === item.color.trim().toLowerCase()
      );
      if (!variant) continue;

      const sizeObj =
          variant.sizes.find(
            (s) =>
              s.size?.toString().trim() === item.size?.toString().trim()
          ) || variant.sizes[0];


      if (!sizeObj) {
        throw new Error(`Size "${item.size}" not found for product ${item.productId}`);
      }


      // giảm tồn kho đúng size
      sizeObj.stock = Math.max(sizeObj.stock - (item.quantity / 2), 0);
      // tăng số lượng bán
      product.sold = product.sold + (item.quantity / 2);
      // cập nhật tổng tồn kho
      product.totalStock = product.variants.reduce((sum, v) => {
        return sum + v.sizes.reduce((s, si) => s + si.stock, 0);
      }, 0);

      await product.save();
    }


    // xóa cart
    await Cart.findByIdAndDelete(order.cartId);
    await order.save();

    res.status(200).json({ success: true, message: "Order confirmed", data: order });
  } catch (e) {
    console.log("capturePayment error:", e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    if (!orders.length) return res.status(404).json({ success: false, message: "No orders found" });

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

//huỷ đơn
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ❌ Đánh dấu trạng thái hủy
    order.orderStatus = "canceled";
    order.cancelReason = reason;
    await order.save();

    // 🔔 Gửi thông báo cho Admin
    const messageAdmin = `Khách hàng đã hủy đơn ${order._id} (Lý do: ${reason})`;

    await Notification.create({
      userId: null,
      type: "order-cancel",
      message: messageAdmin
    });

    notifyAdmin({
      type: "order-cancel",
      message: messageAdmin
    });

    res.status(200).json({
      message: "Order canceled successfully",
      order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error canceling order" });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  cancelOrder
};
