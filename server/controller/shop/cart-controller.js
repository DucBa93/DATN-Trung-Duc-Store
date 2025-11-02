const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// 🛒 Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size } = req.body;

    if (!userId || !productId || quantity <= 0 || !size) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ! (Thiếu userId, productId, size hoặc quantity)",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm.",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Nếu giỏ hàng chưa có, tạo mới
      cart = new Cart({ userId, items: [{ productId, quantity, size }] });
    } else {
      // Kiểm tra xem sản phẩm cùng size đã tồn tại chưa
      const findCurrentProductIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId && item.size === size
      );

      if (findCurrentProductIndex === -1) {
        // Chưa có -> thêm mới
        cart.items.push({ productId, quantity, size });
      } else {
        // Có rồi -> tăng số lượng
        cart.items[findCurrentProductIndex].quantity += quantity;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice totalStock",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId?._id,
      image: item.productId?.image,
      title: item.productId?.title,
      price: item.productId?.price,
      salePrice: item.productId?.salePrice,
      quantity: item.quantity,
      size: item.size,
      totalStock: item.productId?.totalStock,
    }));

    res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng thành công",
      data: { ...cart._doc, items: populateCartItems },
    });
  } catch (error) {
    console.error("❌ Lỗi thêm vào giỏ hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm sản phẩm vào giỏ hàng.",
    });
  }
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

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      size: item.size,
    }));

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
    const { userId, productId, size, quantity } = req.body;

    if (!userId || !productId || !size || quantity <= 0) {
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
        item.productId.toString() === productId && item.size === size
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại trong giỏ hàng!",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId?._id,
      image: item.productId?.image,
      title: item.productId?.title || "Không tìm thấy sản phẩm",
      price: item.productId?.price,
      salePrice: item.productId?.salePrice,
      quantity: item.quantity,
      size: item.size,
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
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId, size } = req.params;

    if (!userId || !productId || !size) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu! (userId, productId, size)",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng!",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(item.productId._id.toString() === productId && item.size === size)
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId?._id,
      image: item.productId?.image,
      title: item.productId?.title,
      price: item.productId?.price,
      salePrice: item.productId?.salePrice,
      quantity: item.quantity,
      size: item.size,
    }));

    res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng.",
      data: { ...cart._doc, items: populateCartItems },
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sản phẩm trong giỏ hàng.",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
