const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Gmail system account
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thaibaduckk2003@gmail.com", // Gmail hệ thống
    pass: "qctv guji tsfi tqjd",       // App Password
  },
});

// Register
const register = async (req, res) => {
  const { userName, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không khớp" });

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) return res.json({ success: false, message: 'Email đã tồn tại!' });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ userName, email, password: hashPassword });
    await newUser.save();

    res.status(200).json({ success: true, message: 'Register successfully' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "Người dùng không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Mật khẩu không đúng!" });

    const token = jwt.sign({
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
    }, "CLIENT_SECRET_KEY", { expiresIn: "60m" });

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: { 
        email: user.email, 
        role: user.role, 
        id: user._id, 
        userName: user.userName,
        avatar: user.avatar || null,   // <-- thêm avatar ở đây
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Logout
const logout = (req, res) => {
  res.clearCookie("token").json({ success: true, message: "Đăng xuất thành công!" });
};

// Auth middleware
const authMiddleWare = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Vui lòng đăng nhập!" });

  try {
    const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token không hợp lệ!" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Email không tồn tại!" });

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    // Gửi email đến user
    await transporter.sendMail({
      to: email,
      subject: "Khôi phục mật khẩu",
      html: `
        <h3>Yêu cầu khôi phục mật khẩu</h3>
        <p>Click link dưới để đặt mật khẩu mới (có hiệu lực 15 phút):</p>
        <a href="${resetURL}">${resetURL}</a>
      `,
    });

    res.json({ success: true, message: "Email khôi phục mật khẩu đã được gửi!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  authMiddleWare,
  forgotPassword,
  resetPassword
};
