const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User');

//register
const register = async (req, res) => {
    const { userName, email, password, confirmPassword  } = req.body
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không khớp" });
    }

    try {
        const checkUser = await User.findOne({ email });
        if (checkUser) return res.json({ success: false, message: 'Email đã tốn tại!' })


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
    const { email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser)
            return res.json({
                success: false,
                message: "Người dùng không tồn tại !",
            });

        const checkPasswordMatch = await bcrypt.compare(
            password,
            checkUser.password
        );
        if (!checkPasswordMatch)
            return res.json({
                success: false,
                message: "Mật khẩu không đúng ! Vui lòng nhập lại",
            });

        const token = jwt.sign(
            {
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
            },
            "CLIENT_SECRET_KEY",
            { expiresIn: "60m" }
        );

        res.cookie("token", token, {
            httpOnly: true, secure: false
        }).json({
            success: true,
            message: "Logged in successfully",
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id,
                userName: checkUser.userName,
            },
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Some error occured",
        });
    }
};



//logout
const logout = (req, res) => {
    res.clearCookie("token").json({
        success: true,
        message: "Đăng xuất thành công !"
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


module.exports = { register, login, logout, authMiddleWare }