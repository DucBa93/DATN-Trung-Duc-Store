const Product = require("../../models/product");


// 🟢 Lấy danh sách sản phẩm có lọc, sắp xếp, phân trang
const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = "",
      brand = "",
      color = "",
      size = "",
      sortBy = "price-lowtohigh",
      page = 1,
      limit = 8,
    } = req.query;

    // 🎯 Tạo object filter
    let filters = {};

    // Lọc category
    if (category) {
      const categories = Array.isArray(category)
        ? category
        : category.split(",");
      filters.category = { $in: categories };
    }

    // Lọc brand
    if (brand) {
      const brands = Array.isArray(brand) ? brand : brand.split(",");
      filters.brand = brands.map((b) => b.toLowerCase().replace(/\s+/g, "-"));
    }

    // Lọc theo màu (từ variants)
    if (color) {
      filters["variants.color"] = color;
    }

    // Lọc theo size (từ variants)
    if (size) {
      filters["variants.size"] = size;
    }

    // 🎯 Tạo object sort
    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // 🧮 Tính tổng số sản phẩm để phân trang
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    // 🔍 Lấy dữ liệu theo trang
    const products = await Product.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-importPrice"); // ❗ Ẩn giá nhập cho user

    // 🟢 Trả kết quả
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalProducts,
        totalPages,
      },
    });
  } catch (e) {
    console.error("❌ Error in getFilteredProducts:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching products.",
    });
  }
};




// 🟢 Lấy toàn bộ sản phẩm cho user
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .select("-importPrice"); // ❗ Không trả giá nhập ra ngoài

    res.status(200).json({
      success: true,
      data: products,
      totalProducts: products.length,
    });
  } catch (e) {
    console.error("❌ Error in getAllProducts:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching all products.",
    });
  }
};




// 🟢 Lấy chi tiết 1 sản phẩm theo ID
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select("-importPrice");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.error("❌ Error in getProductDetails:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching product details.",
    });
  }
};



module.exports = { getFilteredProducts, getProductDetails, getAllProducts };
