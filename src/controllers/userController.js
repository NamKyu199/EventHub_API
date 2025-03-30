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

const getProfile = asyncHandle(async (req, res) => {
    const { uid } = req.query;

    if (uid) {
        // ✅ Thử tìm bằng _id thay vì id
        const profile = await UserModel.findOne({ _id: uid });

        if (!profile) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng",
                data: null
            });
        }

        res.status(200).json({
            message: "Lấy thông tin Profile thành công",
            data: {
                uid: profile._id,
                createAt: profile.createAt,
                updateAt: profile.updateAt,
                following: profile.following ?? [],
                interest: profile.interest ?? '',
                fullName: profile.fullName ?? '',
                email: profile.email ?? '',
                bio: profile.bio ?? '',
                photoUrl: profile.photoUrl ?? '',
                followers: profile.followers ?? [],
            },
        });
    } else {
        res.status(400).json({
            message: "Lỗi không thể lấy ra thông tin Profile",
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

const getFollowers = asyncHandle(async (req, res) => {
    const { uid } = req.query;

    if (uid) {
        const users = await UserModel.find({ following: { $all: uid } });

        const ids = []

        if (users.length > 0) {
            users.forEach((user) => ids.push(user._id))
        }

        res.status(200).json({
            message: "Get users followers successfully",
            data: ids
        });
    } else {
        res.status(400).json({
            message: "User ID is required",
            data: null
        });
    }
});

const updateProfile = asyncHandle(async (req, res) => {
    const body = req.body;
    const { uid } = req.query;

    if (uid && body) {

        await UserModel.findByIdAndUpdate(uid, body)

        res.status(200).json({
            message: 'Cập nhập thông tin người dùng thành công',
            data: body,
        })
    } else {
        res.status(401).json({
            message: 'Cập nhập thông tin người dùng thất bại',
            data: [],
        })
    }


})


module.exports = { getAllUsers, getEventsFollowed, updateFcmToken, getProfile, getFollowers, updateProfile };
