const express = require("express");
const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controller/shop/cart-controller");

const router = express.Router();

router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);

// DELETE NOW SUPPORT COLOR
router.delete("/remove", deleteCartItem);

router.put("/update-cart", updateCartItemQty);

module.exports = router;
