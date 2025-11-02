const express = require("express");
const {
  getFilteredProducts,
  getProductDetails,
  getAllProducts
} = require("../../controller/shop/products-controller");

const router = express.Router();

// Danh sách sản phẩm có phân trang, lọc, sắp xếp
router.get("/all", getAllProducts);
router.get("/get", getFilteredProducts);

// Chi tiết 1 sản phẩm
router.get("/get/:id", getProductDetails);

module.exports = router;
