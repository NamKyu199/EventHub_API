const asyncHandle = require("express-async-handler");
const EventModel = require('../models/eventModel');
const CategoryModel = require("../models/categoryModel");
const BillModel = require("../models/billModel");

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
            authorPhotoUrl: body.authorPhotoUrl,
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

        // Kiểm tra xem lat và long có hợp lệ không
        const parsedLat = lat ? parseFloat(lat) : null;
        const parsedLong = long ? parseFloat(long) : null;
        const maxDistance = distance ? parseFloat(distance) : null;
        const eventLimit = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 0;

        // Nếu có lat và long thì tiếp tục xử lý theo phạm vi
        if (parsedLat && parsedLong) {
            // Kiểm tra lat và long có hợp lệ không
            if (isNaN(parsedLat) || isNaN(parsedLong)) {
                return res.status(400).json({ message: "Vị trí không hợp lệ!" });
            }

            const events = await EventModel.find({})
                .sort({ createdAt: -1 })
                .limit(eventLimit);

            const filteredEvents = events.reduce((acc, event) => {
                // Kiểm tra event có thông tin vị trí không
                if (!event.position?.lat || !event.position?.long) {
                    return acc;
                }

                const eventDistance = calcDistance({
                    currentLat: parsedLat,
                    currentLong: parsedLong,
                    addressLat: parseFloat(event.position.lat),
                    addressLong: parseFloat(event.position.long),
                });

                // Nếu khoảng cách nhỏ hơn hoặc bằng khoảng cách tối đa
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
            // Nếu không có lat và long, lấy tất cả sự kiện
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

const ceartCategory = asyncHandle(async (req, res) => {
    try {
        const data = req.body;

        const newCategory = new CategoryModel(data);
        await newCategory.save(); // ✅ Thêm await

        res.status(200).json({
            message: 'Thêm thành công Category',
            data: newCategory,
        });
    } catch (error) {
        console.error("❌ Lỗi khi thêm Category:", error);
        res.status(500).json({ message: "Lỗi khi thêm Category", error: error.message });
    }
});

const getCategories = asyncHandle(async (req, res) => {
    // Sử dụng .lean() để tránh lỗi circular reference
    const items = await CategoryModel.find({}).lean();

    res.status(200).json({
        message: 'Lấy dữ liệu Categories thành công!',
        data: items,
    });
});

const searchEvent = asyncHandle(async (req, res) => {
    const { title } = req.query;
    const events = await EventModel.find({});

    const items = events.filter(element => element.title.toLocaleLowerCase().includes(title.toLocaleLowerCase()))

    return res.status(200).json({
        message: "Lấy danh sách sự kiện thành công!",
        data: items,
    });
});

const getEventCategoryId = asyncHandle(async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Missing category ID in the request.' });
    }

    try {
        // Tìm category bằng ID
        const category = await CategoryModel.findById(id);
        console.log("Category found:", category);

        // Nếu không tìm thấy category, trả về lỗi 404
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        // Lấy key của category
        const key = category.key;

        // Tìm sự kiện có category phù hợp
        const events = await EventModel.find({ category });  // Tìm sự kiện theo category key
        console.log("Events found:", events);

        // Trả về danh sách sự kiện
        res.status(200).json({
            message: 'Lấy thành công danh sách Events theo Category!',
            data: events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const handleAddNewBillDetail = asyncHandle(async (req, res) => {
    try {
        const data = req.body;
        data.price = parseFloat(data.price);

        const bill = new BillModel(data);
        await bill.save();

        res.status(200).json({
            message: 'Add new bill info successfully!',
            data: bill,
        });
    } catch (error) {
        console.error("❌ Error while adding new bill:", error);
        res.status(500).json({
            message: 'Failed to add new bill info!',
            error: error.message,
        });
    }
});

const handleUpdatePaymentSuccess = asyncHandle(async (req, res) => {
    const { billId } = req.query;

    // Cập nhật trạng thái và trả về kết quả mới
    const updatedBill = await BillModel.findByIdAndUpdate(
        billId,
        {
            status: 'success',
            updateAt: Date.now()
        },
        { new: true } // Trả về kết quả sau khi cập nhật
    );

    if (!updatedBill) {
        return res.status(404).json({
            message: 'Bill not found.',
        });
    }

    res.status(200).json({
        message: 'Update bill successfully',
        data: updatedBill, // Trả về bill đã cập nhật
    });
});

module.exports = {
    addNewEvent,
    getEvents,
    updateFollowers,
    getFollowers,
    ceartCategory,
    getCategories,
    searchEvent,
    getEventCategoryId,
    handleAddNewBillDetail,
    handleUpdatePaymentSuccess
};
