const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    avatar: {
        type: String,
        default: "",
    },
    // Lưu coupon gift mà user đã nhận
    giftedCoupons: [
        {
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Coupon',
            },
            code: String, // lưu luôn code để frontend dễ hiển thị
            discountPercentage: Number, // lưu luôn discount %
            maxDiscount: Number, // lưu maxDiscount nếu có
            expiry: Date,
            usageLimit: Number,   // 🔹 thêm
            usedCount: Number,
            receivedAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
