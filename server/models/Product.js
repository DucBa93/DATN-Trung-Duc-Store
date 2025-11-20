const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  mainImage: { type: String, default: "" },       // ảnh chính của màu
  subImages: { type: [String], default: [] },     // ảnh phụ của màu
  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, default: 0 },
    },
  ],
});

const ProductSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },      // ảnh chính sản phẩm
    subImages: { type: [String], default: [] },   // ảnh phụ sản phẩm
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    brand: { type: String, default: "" },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    importPrice: { type: Number, default: 0 },
    variants: [VariantSchema],
    totalStock: { type: Number, default: 0 },
    averageReview: { type: Number, default: 0 },
    sold: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Tự động tính tổng stock
ProductSchema.pre("save", function (next) {
  let total = 0;
  if (this.variants?.length > 0) {
    this.variants.forEach((v) => {
      v.sizes.forEach((s) => (total += s.stock));
    });
  }
  this.totalStock = total;
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
