const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        size: {
          type: String,
          enum: ["38", "38.5", "39", "40", "41", "42", "42.5", "43"],
          required: true,
        },

        // 🔥 THÊM MỚI 4 FIELD QUAN TRỌNG
        color: {
          type: String,
          default: null,
        },

        variantId: {
          type: String,
          default: null,
        },

        variantImage: {
          type: String,
          default: null,
        },

        stock: {   // ✅ thêm field stock
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
