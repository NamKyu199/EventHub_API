const asyncHandle = require("express-async-handler");
const User = require("../models/userModel"); // Make sure this path is correct
const UserModel = require("../models/userModel");

const getAllUsers = asyncHandle(async (req, res) => {

    const users = await UserModel.find({});

    const data = []
    users.forEach((item) => data.push({
        email: item.email ?? '',
        fullName: item.fullName ?? '',
        id: item.id,
    }));
    console.log(data)

    res.status(200).json({
        message: "Users retrieved successfully",
        data,
    });
});

module.exports = { getAllUsers };
