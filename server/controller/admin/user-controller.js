const User = require("../../models/User");
const bcrypt = require("bcryptjs"); // ✅ Thêm bcrypt

// ✅ Lấy tất cả user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ẩn mật khẩu
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách user" });
  }
};

// ✅ Lấy user theo ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy user" });
  }
};

// ✅ Tạo user mới
const createUser = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // 👉 Gán mật khẩu mặc định nếu không nhập
    const finalPassword = password || "123456";

    // 🔒 Hash mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword, // dùng password đã hash
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({
      message: "Tạo tài khoản thành công",
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role,
      }, // không trả về password
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo user:", err.message);
    res.status(500).json({ message: "Lỗi server khi tạo tài khoản", error: err.message });
  }
};

// ✅ Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { userName, email, role, password } = req.body;

    // Tìm user trước
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Nếu có password mới, hash trước khi lưu
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Cập nhật các trường khác
    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: "Cập nhật thành công",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      }, // không trả về password
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi cập nhật user", error: err.message });
  }
};


// ✅ Xóa user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xóa user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
