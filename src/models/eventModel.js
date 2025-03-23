const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: String,
    description: String,
    locationTitle: String,
    locationAddress: String,
    position: Object,
    users: [String],
    authorId: String,
    startAt: Number,
    endAt: Number,
    date: String,  // (Sửa từ `data` thành `date` nếu bạn muốn lưu ngày)
    photoUrl: String,
    price: String,
    category: String,
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
});

// Kiểm tra nếu model đã tồn tại thì sử dụng lại, tránh lỗi OverwriteModelError
const EventModel = mongoose.model('Event', EventSchema);
module.exports = EventModel;
