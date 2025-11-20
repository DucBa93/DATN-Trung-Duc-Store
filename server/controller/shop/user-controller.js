// server/controllers/shop/user-controller.js
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const cloudinary = require("../../helpers/cloudinary"); // bên dưới giả sử bạn có helper cloudinary.js
const { imageUploadUtil } = require("../../helpers/cloudinary");

// --- Update name & email ---
const updateUser = async (req, res) => {
  try {
    const { userId, userName, email } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // optional: validate email uniqueness
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    user.userName = userName ?? user.userName;
    user.email = email ?? user.email;

    await user.save();

    // Remove sensitive fields
    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(200).json({ success: true, message: "Updated", user: userSafe });
  } catch (err) {
    console.error("Error updateUser:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// --- Update password ---
const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing userId or newPassword" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(200).json({ success: true, message: "Password updated", user: userSafe });
  } catch (err) {
    console.error("Error updatePassword:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// --- Upload avatar (multer must have populated req.file) ---
const uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Upload lên Cloudinary
    const result = await imageUploadUtil(req.file.path);

    // ✅ Cập nhật avatar trong MongoDB
    user.avatar = result.secure_url;
    await user.save();

    // ✅ Loại bỏ mật khẩu & trả user mới về client
    const userSafe = user.toObject();
    delete userSafe.password;

    console.log("✅ Avatar uploaded successfully:", userSafe.avatar);

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded",
      user: userSafe, // 🔥 BẮT BUỘC phải có dòng này
    });
  } catch (err) {
    console.error("Error uploadAvatar:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


module.exports = { updateUser, updatePassword, uploadAvatar };
