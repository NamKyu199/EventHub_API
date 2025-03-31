const { default: mongoose } = require("mongoose");

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    key: {
        type: String,
        require: true,
    },
    color: {
        type: String,
    },
    description: {
        type: String,
    }
});

const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
module.exports = CategoryModel;