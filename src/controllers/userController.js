const asyncHandle = require("express-async-handler");
const User = require("../models/userModel"); // Make sure this path is correct
const EventModel = require("../models/eventModel");
const UserModel = require("../models/userModel");

const getAllUsers = asyncHandle(async (req, res) => {

    const users = await UserModel.find({});

    const data = []
    users.forEach((item) => data.push({
        id: item.id,
        email: item.email ?? '',
        fullName: item.fullName ?? '',
        followers: item.followers ?? '',
        following: item.following ?? '',
        photoUrl: item.photoUrl ?? '',
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
                interests: profile.interests ?? '',
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


});

const updateInterests = asyncHandle(async (req, res) => {
    const body = req.body; // Đây là mảng interests được gửi từ client
    const { uid } = req.query; // ID người dùng

    // Kiểm tra uid và body
    if (uid && body) {
        await UserModel.findByIdAndUpdate(
            uid, // ✅ Tham số đầu tiên phải là ObjectId của người dùng
            { interests: body }, // ✅ Tham số thứ hai là đối tượng cập nhật
            { new: true } // Tùy chọn trả về document sau khi cập nhật
        );

        res.status(200).json({
            message: 'Update Interests Successful!',
            data: body,
        });
    } else {
        res.status(404).json({
            message: 'Update Interests Failed!',
            data: '',
        });
    }
});

const toggleFollowing = asyncHandle(async (req, res) => {
    const { uid, authorId } = req.body;

    // Bắt buộc phải có cả uid và authorId
    if (!uid || !authorId) {
        console.log("❌ Cần cung cấp đầy đủ uid và authorId");
        return res.status(400).json({
            message: "Thiếu uid hoặc authorId",
            data: [],
        });
    }

    try {
        // Tìm user và author
        const user = await UserModel.findById(uid);
        const author = await UserModel.findById(authorId);

        // Kiểm tra kết quả truy vấn
        if (!user) {
            console.log("❌ Không tìm thấy người dùng với uid:", uid);
            return res.status(404).json({
                message: "Không tìm thấy người dùng",
                data: [],
            });
        }

        if (!author) {
            console.log("❌ Không tìm thấy người dùng với authorId:", authorId);
            return res.status(404).json({
                message: "Không tìm thấy tác giả",
                data: [],
            });
        }

        // Xử lý theo dõi
        const { following = [] } = user;
        const index = following.findIndex(element => element === authorId);

        if (index !== -1) {
            following.splice(index, 1); // Hủy theo dõi
        } else {
            following.push(authorId); // Theo dõi
        }

        // Cập nhật danh sách following
        await UserModel.findByIdAndUpdate(uid, { following }, { new: true });

        console.log("✅ Đã xử lý theo dõi thành công");
        res.status(200).json({
            message: "✅ Đã xử lý thành công",
            data: following,
        });
    } catch (error) {
        console.log("❌ Lỗi xử lý:", error);
        res.status(500).json({
            message: "❌ Xử lý thất bại",
            error,
        });
    }
});

const getFollowing = asyncHandle(async (req, res) => {
    const { uid } = req.query;

    if (uid) {
        const users = await UserModel.findById(uid)

        res.status(200).json({
            message: "Get users followers successfully",
            data: users.following
        });
    } else {
        res.status(400).json({
            message: "User ID is required",
            data: null
        });
    }
});

// Lưu danh sách người được mời vào CSDL hoặc một biến toàn cục
let invitedUsers = []; // Giải pháp tạm thời

const pushInviteNotification = asyncHandle(async (req, res) => {
    const { id, eventId } = req.body;
    invitedUsers = []; // Reset danh sách

    const sender = await UserModel.findById(id);

    if (!sender || !sender.following) {
        return res.status(400).json({
            message: "Không tìm thấy danh sách following từ người dùng.",
            data: [],
        });
    }

    for (const fid of sender.following) {
        const friend = await UserModel.findById(fid);
        if (friend) {
            const { fullName, email, photoUrl } = friend;
            invitedUsers.push({
                userId: fid,
                fullName,
                email,
                photoUrl,
                eventId,
            });
        }
    }

    res.status(200).json({
        message: 'Thông tin người dùng đã được lấy thành công.',
        data: invitedUsers,
    });
});

// Hàm lấy danh sách người được mời
const getInvitedUsers = asyncHandle(async (req, res) => {
    if (invitedUsers.length === 0) {
        return res.status(404).json({
            message: "Không có lời mời nào.",
            data: [],
        });
    }

    res.status(200).json({
        message: 'Lấy danh sách người được mời thành công.',
        data: invitedUsers,
    });
});

module.exports = {
    getAllUsers,
    getEventsFollowed,
    updateFcmToken,
    getProfile,
    getFollowers,
    updateProfile,
    updateInterests,
    toggleFollowing,
    getFollowing,
    pushInviteNotification,
    getInvitedUsers
};
