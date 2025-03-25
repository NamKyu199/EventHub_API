const asyncHandle = require("express-async-handler");
const User = require("../models/userModel"); // Make sure this path is correct
const EventModel = require("../models/eventModel");

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

const getEventsFollowed = asyncHandle(async (req, res) => {
    const { uid } = req.query;

    if (uid) {
        const events = await EventModel.find({ followers: { $in: [uid] } });

        const ids =[]

        events.forEach((item) => ids.push(item.id));
        console.log(ids)

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

module.exports = { getAllUsers, getEventsFollowed };
