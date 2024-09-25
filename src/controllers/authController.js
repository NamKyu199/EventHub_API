const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const asyncHandle = require('express-async-handler');
const jwt = require('jsonwebtoken');

// Hàm tạo token JWT
const getJsonWebToken = (email, id) => {
    const payload = { email, id };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
    return token;
};

// API đăng ký
const register = asyncHandle(async (req, res) => {
    const { email, fullName, password } = req.body;

    // Kiểm tra người dùng đã tồn tại chưa
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        res.status(401);
        throw new Error('User already exists!');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = new UserModel({
        email,
        fullName: fullName ?? '',
        password: hashedPassword
    });

    await newUser.save();

    res.status(200).json({
        message: 'Register new user successfully',
        data: {
            email: newUser.email,
            id: newUser.id,
            accesstoken: await getJsonWebToken(email, newUser.id),
        },
    });
});

// API đăng nhập
const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
        res.status(403).json({
            message: 'User not found!!!'
        })
        throw new Error('User not found!');
    }

    // So sánh mật khẩu
    const isMatchPassword = await bcrypt.compare(password, existingUser.password);
    if (!isMatchPassword) {
        res.status(401);
        throw new Error('Incorrect password!');
    }

    // Trả về token nếu thành công
    res.status(200).json({
        message: 'Login successfully !!!',
        data: {
            id: existingUser.id,
            email: existingUser.email,
            accesstoken: await getJsonWebToken(email, existingUser.id),
        }
    });
});

module.exports = {
    register,
    login,
};
