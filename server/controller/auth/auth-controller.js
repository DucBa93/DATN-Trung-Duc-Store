const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/user');

//register
const register = async (req, res) => {
    const { userName, email, password } = req.body
    try {
        const checkUser = await User.findOne({ email });
        if (checkUser) return res.json({ success: false, message: 'Email nguoi dung da ton tai !' })


        const hashPassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            userName,
            email,
            password: hashPassword
        })

        await newUser.save()
        res.status(200).json({
            success: true,
            message: 'Register successfully'
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Some errors occured'
        })

    }
}




//login
const login = async (req, res) => {

    const { email, password } = req.body
    try {
        const checkUser = await User.findOne({ email })
        if (!checkUser) return res.json({
            success: false,
            message: "Nguoi dung khong ton tai !, vui long dang ky"
        })

        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password)
        if (!checkPasswordMatch) return res.json({
            success: false,
            message: "Sai mat khau! Hay thu lai."
        })

        const token = jwt.sign({
            id: checkUser._id, role: checkUser.role, email: checkUser.email
        }, 'CLIENT_SECRET_KEY', { expiresIn: '60m' })

        res.cookie('token', token, { httpOnly: true, secure: false }).json({
            success: true,
            message: 'Dang nhap thanh cong !',
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id
            }
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured"
        })

    }
}



//logout
const logout = (res, req) => {
    res.clearCookie("token").json({
        success: true,
        message: "Dang xuat thanh cong !"
    })
}



// auth middleware
const authMiddleWare = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({
        success: false,
        message: "Khong co token! Vui long dang nhap."
    })

    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token khong hop le !"
        })
    }

}


module.exports = { register, login, logout , authMiddleWare}