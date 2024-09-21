const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    photoUrl: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        default: Date.now()
    },
})

const UserModel = mongoose.model('user:', UserSchema);
module.exports = UserModel;