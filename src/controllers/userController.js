const asyncHandle = require("express-async-handler");
const User = require("../models/userModel"); // Make sure this path is correct
const EventModel = require("../models/eventModel");
const UserModel = require("../models/userModel");

const getAllUsers = asyncHandle(async (req, res) => {

    const users = await UserModel.find({});

    const data = []
    users.forEach((item) => data.push({
        email: item.email ?? '',
        fullName: item.fullName ?? '',
        id: item.id,
    }));

    res.status(200).json({
        message: "Users retrieved successfully",
        data,
    });
});

const getEventsFollowed = asyncHandle(async (req, res) => {
    const { uid } = req.query;

    if (uid) {
        const events = await EventModel.find({ followers: { $in: [uid] } });

        const ids = []

        events.forEach((item) => ids.push(item.id));

        res.status(200).json({
            message: "Get events followed successfully",
            data: ids // Trả về dữ liệu tìm được
        });
    } else {
        res.status(400).json({
            message: "User ID is required",
            data: null
        });
    }
});

const updateFcmToken = asyncHandle(async (req, res) => {
    const { uid, fcmTokens } = req.body

    await UserModel.findByIdAndUpdate(uid, {
        fcmTokens
    });

    res.status(200).json({
        message: 'Lấy FcmTokens thành công',
        data: [],
    });
});

module.exports = { getAllUsers, getEventsFollowed, updateFcmToken };
