const { default: mongoose } = require("mongoose");

const BillSchema = new mongoose.Schema({
    createAt: {
        type: Date,
        default: Date.now(),
    },
    createBy: {
        type: String,
        require: true,
    },
    eventId: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    authorId: {
        type: String,
    },
    status: {
        type: String,
        default: 'pending',
    },
    updateAt: {
        type: Date,
        default: Date.now(),
    }
});

const BillModel = mongoose.model('Bill', BillSchema);

module.exports = BillModel;
