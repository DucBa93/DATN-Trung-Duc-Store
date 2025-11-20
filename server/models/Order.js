const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,

  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: Number,
      quantity: Number,
      color: String,
      size: String,
    },
  ],

  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },

  orderStatus: {
    type: String,
    default: "pending",
  },

  // 🔥 Thêm enum hỗ trợ COD
  paymentMethod: {
    type: String,
    enum: ["paypal", "cod"],
    default: "paypal",
  },

  // 🔥 COD = pending, Paypal = paid khi capture
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },

  totalAmount: Number,

  shippingFee: {
    type: Number,
    default: 0,
  },

  finalAmount: {
    type: Number,
    default: 0,
  },

  orderDate: Date,
  orderUpdateDate: Date,

  paymentId: String,
  payerId: String,

  discountValue: {
    type: Number,
    default: 0,
  },

  appliedCoupon: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
