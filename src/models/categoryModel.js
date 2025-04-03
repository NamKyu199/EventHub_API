const { default: mongoose } = require("mongoose");

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,  // Đảm bảo title là bắt buộc
    },
    key: {
        type: String,
        required: true,  // Đảm bảo key là bắt buộc
        unique: true,    // Đảm bảo key không bị trùng lặp
    },
    color: {
        type: String,
        default: '#000000',  // Mặc định nếu không có giá trị
    },
    description: {
        type: String,
        default: 'No description available', // Mặc định nếu không có mô tả
    }
});

// Kiểm tra nếu model đã tồn tại thì không tạo lại
const CategoryModel = mongoose.model('Category', CategorySchema);

module.exports = CategoryModel;
