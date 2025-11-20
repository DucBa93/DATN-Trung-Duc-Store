const express = require('express')
const {
    register,
    login,
    logout,
    authMiddleWare,
    forgotPassword,
    resetPassword
} = require('../../controller/auth/auth-controller')
const crypto = require('crypto');
const User = require('../../models/user');
const nodemailer = require('nodemailer');

const router = express.Router()


router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/check-auth', authMiddleWare, (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        message: "Nguoi dung hop le !",
        user
    })
})
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router