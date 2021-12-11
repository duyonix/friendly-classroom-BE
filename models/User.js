const mongoose = require('mongoose');

const User = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 8,
        },
        password: {
            type: String,
            required: true,
            minlength: 5,
            select: false,
        },
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            $regex: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
        },
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', User);
