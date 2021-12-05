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
            // select: false,
        },
        gmail: {
            type: String,
            required: true,
        },
        sex: {
            type: String,
            required: true,
            enum: ['male', 'female'],
        },
        refreshToken: {
            type: String,
        },
        classes: {
            type: Array,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', User);
