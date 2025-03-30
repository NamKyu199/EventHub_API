const asyncHandle = require("express-async-handler");
const EventModel = require('../models/eventModel');

const calcDistance = ({ currentLat, currentLong, addressLat, addressLong }) => {
    const r = 6371;
    const dLat = toRoad(addressLat - currentLat);
    const dLong = toRoad(addressLong - currentLong);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(toRoad(currentLat)) *
        Math.cos(toRoad(addressLat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);

    return r * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const toRoad = (value) => (value * Math.PI) / 180;

const addNewEvent = asyncHandle(async (req, res) => {
    try {
        const body = req.body;

        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ message: "Dữ liệu sự kiện không hợp lệ!" });
        }

        // Kiểm tra trường bắt buộc
        const requiredFields = ["title", "description", "locationTitle", "startAt", "endAt"];
        for (const field of requiredFields) {
            if (!body[field]) {
                return res.status(400).json({ message: `Trường '${field}' là bắt buộc!` });
            }
        }

        // Chuyển đổi `startAt` và `endAt` thành `Date`
        body.startAt = new Date(body.startAt);
        body.endAt = new Date(body.endAt);

        // Kiểm tra nếu ngày không hợp lệ
        if (isNaN(body.startAt) || isNaN(body.endAt)) {
            return res.status(400).json({ message: "Thời gian bắt đầu hoặc kết thúc không hợp lệ!" });
        }

        // ✅ Lưu thêm thông tin người tạo
        const newEvent = new EventModel({
            ...body,
            authorIds: body.authorIds,
            authorName: body.authorName,
            authorEmail: body.authorEmail,
        });

        await newEvent.save();

        return res.status(201).json({
            message: "Thêm sự kiện thành công!",
            data: newEvent,
        });

    } catch (error) {
        console.error("❌ Lỗi khi thêm sự kiện:", error);
        return res.status(500).json({ message: "Lỗi server khi thêm sự kiện", error: error.message });
    }
});

const getEvents = asyncHandle(async (req, res) => {
    try {
        const { lat, long, distance, limit } = req.query;
        const maxDistance = distance ? parseFloat(distance) : null;
        const eventLimit = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 0;

        if (lat && long) {
            const events = await EventModel.find({})
                .sort({ createdAt: -1 })
                .limit(eventLimit);

            const filteredEvents = events.reduce((acc, event) => {
                if (!event.position?.lat || !event.position?.long) {
                    return acc;
                }

                const eventDistance = calcDistance({
                    currentLat: parseFloat(lat),
                    currentLong: parseFloat(long),
                    addressLat: parseFloat(event.position.lat),
                    addressLong: parseFloat(event.position.long),
                });

                if (maxDistance === null || eventDistance <= maxDistance) {
                    acc.push({ ...event.toObject(), distance: eventDistance });
                }
                return acc;
            }, []);

            return res.status(200).json({
                message: "Lấy danh sách sự kiện thành công!",
                data: filteredEvents,
            });
        } else {
            const events = await EventModel.find({})
                .sort({ createdAt: -1 })
                .limit(eventLimit);

            return res.status(200).json({
                message: "Lấy danh sách sự kiện thành công!",
                data: events,
            });
        }
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách sự kiện:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách sự kiện", error: error.message });
    }
});

const updateFollowers = asyncHandle(async (req, res) => {
    const body = req.body;
    const { id, followers } = body;

    await EventModel.findByIdAndUpdate(id, { followers, updatedAt: Date.now() });

    res.status(200).json({
        message: "Cập nhật số lượng người tham gia thành công!",
        data: [],
    });
});

const getFollowers = asyncHandle(async (req, res) => {
    const { id } = req.query;

    const event = await EventModel.findById(id);

    if (event) {
        res.status(200).json({
            message: "Lấy danh sách người tham gia thành công!",
            data: event.followers,
        });
    } else {
        res.status(404).json({
            message: "Không tìm thấy sự kiện!",
            data: [],
        });
    }
});

module.exports = { addNewEvent, getEvents, updateFollowers, getFollowers };
