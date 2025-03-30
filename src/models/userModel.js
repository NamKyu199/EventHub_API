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
    bio: {
        type: String,
    },
    photoUrl: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    fcmTokens: {
        type: [String],
    },
    following: {
        type: [String],
    },
    interest: {
        type: [String],
    },
});

const UserModel = mongoose.model('User:', UserSchema);
module.exports = UserModel;