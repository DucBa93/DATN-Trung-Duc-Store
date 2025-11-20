const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/product");
const User = require("../../models/user"); // 👈 thêm dòng này
const { notifyUser } = require("../../socket");
const Notification = require("../../models/notification");

// Upload ảnh chính
const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await imageUploadUtil(url);

    res.json({ success: true, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error occured" });
  }
};


// Upload nhiều ảnh phụ
const handleMultipleImageUpload = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    let urls = [];
    for (let file of files) {
      if (!file.buffer) continue; // tránh lỗi undefined
      const b64 = Buffer.from(file.buffer).toString("base64");
      const url = "data:" + file.mimetype + ";base64," + b64;
      const result = await imageUploadUtil(url);
      urls.push(result.url);
    }

    res.json({ success: true, urls });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Multiple upload failed" });
  }
};


// 🔹 Hàm gửi thông báo tới tất cả user (trừ admin)
async function notifyAllUsers(message, type = "system") {
  const users = await User.find({ role: "user" }); // chỉ lấy user thường
  for (const user of users) {
    await Notification.create({ userId: user._id, message, type });
    notifyUser(user._id.toString(), message);
  }
}

// Fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || "";

    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const listOfProducts = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listOfProducts,
      pagination: {
        page,
        totalPages,
        limit,
      },
    });
  } catch (e) {
    console.log("❌ fetchAllProducts error:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

//add products
const addProduct = async (req, res) => {
  try {
    const {
      image, subImages,
      title, description, category, brand,
      price, salePrice, importPrice,
      variants
    } = req.body;

    const newProduct = new Product({
      image,
      subImages: subImages || [],
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      importPrice,
      variants: variants?.map(v => ({
        color: v.color,
        mainImage: v.mainImage || "",
        subImages: v.subImages || [],
        sizes: v.sizes?.map(s => ({
          size: s.size,
          stock: s.stock ?? 0
        })) || [],
      })) || [],
    });

    await newProduct.save();

    await notifyAllUsers(
      `🆕 Sản phẩm mới: '${title}' đã được thêm`,
      "product-add"
    );

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.log("❌ addProduct error:", error);
    res.status(500).json({ success: false, message: "Error occured" });
  }
};






// Edit product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image, subImages,
      title, description, category, brand,
      price, salePrice, importPrice,
      variants
    } = req.body;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.price = price ?? product.price;
    product.salePrice = salePrice ?? product.salePrice;
    product.importPrice = importPrice ?? product.importPrice;
    if (image) product.image = image;
    if (subImages) product.subImages = subImages;

    if (variants) {
      product.variants = variants.map(v => ({
        color: v.color,
        mainImage: v.mainImage || "",
        subImages: v.subImages || [],
        sizes: v.sizes?.map(s => ({
          size: s.size,
          stock: s.stock ?? 0
        })) || [],
      }));
    }

    await product.save();

    await notifyAllUsers(
      `✏️ Sản phẩm '${product.title}' đã được cập nhật`,
      "product-update"
    );

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("❌ editProduct error:", error);
    res.status(500).json({ success: false, message: "Error occured" });
  }
};




// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    // 🟢 Chỉ gửi user
    await notifyAllUsers(`❌ Sản phẩm '${product.title}' đã bị xóa khỏi hệ thống`, "product-delete");

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error occured" });
  }
};

module.exports = {
  handleImageUpload,
  handleMultipleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
