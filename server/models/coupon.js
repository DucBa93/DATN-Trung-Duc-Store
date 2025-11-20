const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  maxDiscount: { type: Number, default: 0 },
  minimumAmount: { type: Number, default: 0 },
  expiry: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isHot: { type: Boolean, default: false },
  status: { type: String, default: "active" },
  assignedUsers: [
  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
],
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
