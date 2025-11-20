const Coupon = require("../../models/coupon");
const User = require("../../models/user");

// ✅ Get all coupons (Admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// ✅ Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const body = req.body;

    // Đảm bảo có mã code viết hoa
    const code = body.code?.toUpperCase();
    if (!code) {
      return res.json({ success: false, message: "Thiếu mã coupon!" });
    }

    // Kiểm tra trùng mã
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.json({ success: false, message: "Mã đã tồn tại!" });
    }

    // Tạo coupon mới với các giá trị mặc định
    const newCoupon = new Coupon({
      code,
      discountPercentage: body.discountPercentage || 0,
      maxDiscount: body.maxDiscount || 0,
      minimumAmount: body.minimumAmount || 0,
      expiry: body.expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // mặc định 7 ngày
      usageLimit: body.usageLimit || 100,
      usedCount: 0,
      isHot: body.isHot || false,
      status: "active",
    });

    await newCoupon.save();
    if (!newCoupon) return res.status(400).json({ success: false, message: "Tạo thất bại!" });

    res.json({ success: true, coupon: newCoupon });
  } catch (err) {
    console.error("❌ Error creating coupon:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const data = req.body;
    if (data.code) data.code = data.code.toUpperCase();

    const updated = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.json({ success: false, message: "Không tìm thấy mã!" });

    res.json({ success: true, coupon: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);

    if (!deleted) return res.json({ success: false, message: "Không tìm thấy mã!" });

    res.json({ success: true, message: "Đã xoá!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Validate user apply coupon
// ✅ Áp dụng mã (chỉ kiểm tra, KHÔNG trừ lượt)
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" });

    if (!coupon) {
      return res.status(404).json({ message: "Mã không tồn tại" });
    }

    // Hết hạn
    if (new Date() > new Date(coupon.expiry)) {
      return res.status(400).json({ message: "Mã đã hết hạn" });
    }

    // Hết lượt
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Mã đã hết lượt sử dụng" });
    }

    // ✅ Cập nhật lượt dùng
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Áp dụng mã thành công",
      coupon,
    });
  } catch (err) {
    console.error("❌ Lỗi applyCoupon:", err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ Validate mã khi thanh toán (vẫn không trừ ở đây)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" });

    if (!coupon)
      return res.json({ success: false, message: "Mã không tồn tại!" });

    if (new Date(coupon.expiry) < new Date())
      return res.json({ success: false, message: "Mã đã hết hạn!" });

    if (cartTotal < coupon.minimumAmount)
      return res.json({
        success: false,
        message: `Đơn tối thiểu ${coupon.minimumAmount.toLocaleString()}đ`,
      });

    if (coupon.usedCount >= coupon.usageLimit)
      return res.json({ success: false, message: "Mã đã đạt giới hạn sử dụng!" });

    return res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//random dícount
// ✅ Random tặng coupon cho user
// ✅ Random tặng coupon cho user
exports.randomGiftCoupon = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu userId!" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user!" });

    // Nếu user đã nhận coupon trước đó
    if (user.giftedCoupons?.length > 0) {
      const couponIds = user.giftedCoupons.map(c => c.couponId);
      
      // Lấy dữ liệu Coupon thực tế
      const coupons = await Coupon.find({
        _id: { $in: couponIds },
        expiry: { $gte: new Date() },
        $expr: { $lt: ["$usedCount", "$usageLimit"] } // chỉ lấy coupon còn lượt
      });

      // Map lại thông tin gửi về FE
      const giftCoupons = coupons.map(coupon => {
        const original = user.giftedCoupons.find(gc => gc.couponId.toString() === coupon._id.toString());
        return {
          couponId: coupon._id,
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          maxDiscount: coupon.maxDiscount,
          expiry: coupon.expiry,
          usageLimit: coupon.usageLimit,
          usedCount: coupon.usedCount,
          receivedAt: original?.receivedAt ?? new Date(),
        };
      });

      return res.json({ success: true, coupons: giftCoupons });
    }

    // Nếu chưa nhận coupon, có thể random coupon như trước
    const coupons = await Coupon.find({
      status: "active",
      expiry: { $gte: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
      assignedUsers: { $ne: user._id }
    });

    if (coupons.length < 2) {
      return res.json({ success: false, message: "Không đủ mã phù hợp" });
    }

    const shuffled = [...coupons].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2);

    user.giftedCoupons = selected.map(coupon => ({
      couponId: coupon._id,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount,
      expiry: coupon.expiry,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      receivedAt: new Date(),
    }));

    // update coupon assignedUsers
    await Promise.all(selected.map(c =>
      Coupon.findByIdAndUpdate(c._id, { $push: { assignedUsers: user._id } })
    ));

    await user.save();

    return res.json({
      success: true,
      coupons: user.giftedCoupons,
    });
  } catch (err) {
    console.error("Gift Coupon Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



