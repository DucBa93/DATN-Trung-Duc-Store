const express = require("express");
const router = express.Router();
const {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  randomGiftCoupon
} = require("../../controller/shop/coupon-controller");



router.get("/",  getAllCoupons);
router.post("/apply", applyCoupon);
router.post("/create",  createCoupon);
router.put("/update/:id",  updateCoupon);
router.delete("/delete/:id",  deleteCoupon);
router.post("/random-gift", randomGiftCoupon);


// user dùng coupon
router.post("/validate", validateCoupon);

module.exports = router;
