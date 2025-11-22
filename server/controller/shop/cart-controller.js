const Cart = require("../../models/cart");
const Product = require("../../models/product");
// 🛒 Thêm sản phẩm vào giỏ hàng
// Cart controller: addToCart
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    if (!userId || !productId || quantity <= 0 || !size || !color) {
      return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    const variant = product.variants.find(
      v => v.color.trim().toLowerCase() === color.trim().toLowerCase()
    );
    if (!variant) {
      return res.status(400).json({ success: false, message: "Không tìm thấy phiên bản màu" });
    }

    const sizeObj = variant.sizes.find(
      s => s.size.trim().toLowerCase() === size.trim().toLowerCase()
    );
    if (!sizeObj) {
      return res.status(400).json({ success: false, message: "Không tìm thấy size" });
    }

    const variantImage = variant.mainImage || variant.subImages?.[0] || product.image;
    const stock = sizeObj.stock;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          productId,
          variantId: variant._id,
          variantImage,
          quantity,
          size: size.trim().toLowerCase(),
          color: color.trim().toLowerCase(),
          stock
        }]
      });
    } else {
      const index = cart.items.findIndex(
        i =>
          i.productId.toString() === productId &&
          i.size === size.trim().toLowerCase() &&
          i.color === color.trim().toLowerCase()
      );

      if (index === -1) {
        cart.items.push({
          productId,
          variantId: variant._id,
          variantImage,
          quantity,
          size: size.trim().toLowerCase(),
          color: color.trim().toLowerCase(),
          stock
        });
      } else {

        if (cart.items[index].quantity + quantity > stock) {
          return res.status(400).json({ success: false, message: "Vượt quá số lượng tồn!" });
        }

        cart.items[index].quantity += quantity;
        cart.items[index].stock = stock;
      }
    }

    await cart.save();
    await cart.populate({ path: "items.productId" });

    // 🔥 FIX: trả về dạng object: { _id, items }
    const populatedItems = cart.items.map(item => {
      const prod = item.productId;
      return {
        _id: item._id,
        productId: prod._id,
        title: prod.title,
        price: prod.price,
        salePrice: prod.salePrice,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        image: item.variantImage,
        stock: item.stock
      };
    });

    res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        items: populatedItems
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi thêm vào giỏ hàng" });
  }
};


module.exports = {
  addToCart,
};




// 📦 Lấy danh sách giỏ hàng theo userId
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [] },
      });
    }

    const validItems = cart.items.filter((productItem) => productItem.productId);

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

 const populateCartItems = validItems.map((item) => {
  const product = item.productId;

  if (!product) {
    console.warn("❌ Cart item không có productId:", item);
    return null; // bỏ qua item lỗi
  }

  // Kiểm tra variants
  const variant = product.variants?.find(
    v => v.color?.trim().toLowerCase() === item.color?.trim().toLowerCase()
  );

  const sizeObj = variant?.sizes.find(
    s => s.size.trim().toLowerCase() === item.size.trim().toLowerCase()
  );


  return {
    _id: item._id,
    productId: product._id,
    title: product.title,
    image: item.variantImage,
    price: product.price,
    salePrice: product.salePrice,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    stock: sizeObj?.stock
  };
}).filter(Boolean); // loại bỏ item null



    res.status(200).json({
      success: true,
      data: { ...cart._doc, items: populateCartItems },
    });
  } catch (error) {
    console.error("❌ Lỗi lấy giỏ hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu giỏ hàng.",
    });
  }
};

// 🔁 Cập nhật số lượng sản phẩm
const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, size,color, quantity } = req.body;

    if (!userId || !productId ||!color|| !size || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ (thiếu size hoặc quantity)!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
  (item) =>
    item.productId.toString() === productId &&
    item.size === size &&
    item.color === color  // ✅ thêm color
);

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại trong giỏ hàng!",
      });
    }
    if(quantity > cart.items[findCurrentProductIndex].stock){
  return res.status(400).json({ success: false, message: "Vượt quá số lượng tồn!" });
}
    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId?._id,
      image: item.variantImage,
      title: item.productId?.title || "Không tìm thấy sản phẩm",
      price: item.productId?.price,
      salePrice: item.productId?.salePrice,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      stock: item.stock
    }));

    res.status(200).json({
      success: true,
      message: "Cập nhật số lượng thành công!",
      data: { ...cart._doc, items: populateCartItems },
    });
  } catch (error) {
    console.error("❌ Lỗi cập nhật giỏ hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật giỏ hàng.",
    });
  }
};

// ❌ Xóa sản phẩm khỏi giỏ hàng (có size)
// ❌ Xóa sản phẩm khỏi giỏ hàng (size + color)
// ❌ Xóa sản phẩm khỏi giỏ hàng (size + color)
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId, size, color } = req.body;

    if (!userId || !productId || !size || !color) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // ✅ So sánh chính xác, loại bỏ khoảng trắng và ignore case
    cart.items = cart.items.filter(item => {
  const matchProduct = item.productId.toString() === productId.toString();
  const matchSize = item.size.trim().toLowerCase() === size.trim().toLowerCase();
  const matchColor = item.color.trim().toLowerCase() === color.trim().toLowerCase();

  console.log("COMPARE ITEM:", {
    itemId: item._id.toString(),
    matchProduct,
    matchSize,
    matchColor,
    willDelete: matchProduct && matchSize && matchColor
  });

  return !(matchProduct && matchSize && matchColor);
});


    await cart.save();

    await cart.populate({ path: "items.productId" });

    const populateCartItems = cart.items.map(item => {
      const product = item.productId;
      if (!product) return null;

      const variant = product.variants?.find(
        v => v.color?.trim().toLowerCase() === item.color?.trim().toLowerCase()
      );

      const mainImage =
        (variant?.mainImage && variant.mainImage.trim() !== "" ? variant.mainImage : variant?.subImages?.[0]) ||
        product.image;

      return {
        _id: item._id,
        productId: product._id,
        title: product.title,
        image: item.variantImage,
        price: product.price,
        salePrice: product.salePrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      };
    }).filter(Boolean);

    res.json({
      success: true,
      message: "Item removed",
      data: populateCartItems,
    });
  } catch (error) {
    console.error("❌ Lỗi xóa giỏ hàng:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};






module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
