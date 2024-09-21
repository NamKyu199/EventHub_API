const UserModel = require('../models/userModel');
const bcryp = require('bcrypt')
const asyncHandle = require('express-async-handler')
const jwt = require('jsonwebtoken')

const getJsonWebToken = (email, _id) => {
    const payload = {
        email, _id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '7d',
    })

    return token;
}

const register = asyncHandle(async (req, res) => {
    const { email, fullName, password } = req.body;

    const exitstingUser = await UserModel.findOne({ email });

    if (exitstingUser) {
        res.status(401)
        throw new Error('User has already exits!!!')
    }

    const salt = await bcryp.genSalt(10);
    const hashedPassword = await bcryp.hash(password, salt);

    const newUser = new UserModel({
        email,
        fullName: fullName ?? '',
        password: hashedPassword
    })

    await newUser.save()

    res.status(200).json({
        mess: 'Register new user successfully',
        data: {
            ...newUser,
            accesstoken: await getJsonWebToken(email, newUser._id),
        },
    });
});

module.exports = {
    register,
}