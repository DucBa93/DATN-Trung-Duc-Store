const mongoose = require("mongoose");

const ShipperSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String, default: "" },
    bankNumber: { type: String, default: "" },
    bankName: { type: String, default: "" }, // ✅ Tên ngân hàng
    qrImage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipper", ShipperSchema);
