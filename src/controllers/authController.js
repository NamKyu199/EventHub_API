const bcrypt = require('bcrypt');
const asyncHandle = require('express-async-handler');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Lưu OTP vào bộ nhớ tạm (có thể thay bằng Redis hoặc database)
let otpStore = {};

// Hàm tạo token JWT
const getJsonWebToken = (email, id) => {
    if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined. Check your .env file.');
    }
    return jwt.sign({ email, id }, process.env.SECRET_KEY, { expiresIn: '7d' });
};


// API gửi OTP xác thực email (trả về OTP trong response)
// API gửi OTP xác thực email (trả về OTP trong response)
const verification = asyncHandle(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email không được để trống' });
    }

    // Tạo OTP 4 chữ số
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Lưu OTP vào bộ nhớ tạm với thời gian hết hạn 5 phút
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // In OTP ra console thay vì gửi email
    console.log(`OTP cho ${email}: ${otp}`);

    // Trả về OTP trong response theo yêu cầu
    res.json({
        message: 'OTP đã được tạo thành công',
        data: { otp }
    });
});

// API xác thực OTP
const verifyOtp = asyncHandle(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Thông tin không hợp lệ' });
    }

    // Kiểm tra OTP có tồn tại và còn hiệu lực không
    if (otpStore[email] && otpStore[email].otp === otp && Date.now() < otpStore[email].expires) {
        delete otpStore[email]; // Xóa OTP sau khi xác thực thành công
        return res.json({ message: 'Xác thực thành công' });
    }

    res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' });
});

// API đăng ký
const register = asyncHandle(async (req, res) => {
    const { email, fullName, password } = req.body;

    // Kiểm tra người dùng đã tồn tại chưa
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(401).json({ message: 'Người dùng đã tồn tại' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new UserModel({
        email,
        fullName: fullName ?? '',
        password: hashedPassword
    });

    await newUser.save();

    res.status(200).json({
        message: 'Đăng ký thành công',
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

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
        return res.status(403).json({ message: 'Người dùng không tồn tại' });
    }

    const isMatchPassword = await bcrypt.compare(password, existingUser.password);
    if (!isMatchPassword) {
        return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }

    const accesstoken = getJsonWebToken(email, existingUser.id);
    console.log("Generated Access Token:", accesstoken); // Debug token

    res.status(200).json({
        message: 'Đăng nhập thành công',
        data: {
            id: existingUser.id,
            email: existingUser.email,
            accesstoken: accesstoken,
        }
    });
});

module.exports = {
    register,
    login,
    verification,
    verifyOtp,
};
