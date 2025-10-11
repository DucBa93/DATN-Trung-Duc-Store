const express = require('express')
const {
    register,
    login,
    logout,
    authMiddleWare

} = require('../../controller/auth/auth-controller')

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

module.exports = router