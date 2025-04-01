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
    date: Number,  // (Sửa từ `data` thành `date` nếu bạn muốn lưu ngày)
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
    followers: [String],
    authorIds: { type: mongoose.Schema.Types.ObjectId, ref: 'User:' },
    authorName: { type: String },
    authorEmail: { type: String },
    authorPhotoUrl: { type: String },
});

EventSchema.index({ title: "text" });

// Kiểm tra nếu model đã tồn tại thì sử dụng lại, tránh lỗi OverwriteModelError
const EventModel = mongoose.model('Event', EventSchema);
module.exports = EventModel;
