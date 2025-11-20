const express = require("express");

const {
  handleImageUpload,
  handleMultipleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controller/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);

// ✅ Upload nhiều ảnh phụ
router.post("/upload-sub-images", upload.array("sub_files", 10), handleMultipleImageUpload);

router.post("/add", express.json({ limit: "5mb" }), addProduct);
router.put("/edit/:id", express.json({ limit: "5mb" }), editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

module.exports = router;
