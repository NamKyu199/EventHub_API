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

        console.log("📥 Dữ liệu nhận từ client:", body);

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

        // Lưu sự kiện vào MongoDB
        const newEvent = new EventModel(body);
        await newEvent.save();

        console.log("🆕 Sự kiện mới được lưu:", newEvent);

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
        const { lat, long, distance } = req.query;

        if (!lat || !long) {
            return res.status(400).json({ message: "Thiếu tọa độ vị trí hiện tại" });
        }

        const maxDistance = distance ? parseFloat(distance) : null; // Chuyển đổi `distance` thành số

        const events = await EventModel.find({});

        // Mảng chứa sự kiện hợp lệ
        const filteredEvents = events
            .map(event => {
                if (!event.position || !event.position.lat || !event.position.long) {
                    console.log(`⚠️ Sự kiện '${event.title}' không có vị trí hợp lệ`);
                    return null;
                }

                const eventDistance = calcDistance({
                    currentLat: parseFloat(lat),
                    currentLong: parseFloat(long),
                    addressLat: parseFloat(event.position.lat),
                    addressLong: parseFloat(event.position.long),
                });

                console.log(`📍 Sự kiện '${event.title}' cách ${eventDistance.toFixed(2)} km`);

                return { ...event.toObject(), distance: eventDistance };
            })
            .filter(event => event !== null && (maxDistance === null || event.distance <= maxDistance)); // Lọc khoảng cách hợp lệ

        return res.status(200).json({
            message: "Lấy danh sách sự kiện thành công!",
            data: filteredEvents,
        });

    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách sự kiện:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách sự kiện", error: error.message });
    }
});

module.exports = { addNewEvent, getEvents };
