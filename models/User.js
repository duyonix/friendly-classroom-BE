const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const User = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    fullname: {
        type: String,
        required: true,
    },
    gmail: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        $regex: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
    },
    classes: [{
        id: {
            type: ObjectId,
            ref: 'Classroom',
        },
        role: {
            type: String,
            enum: ['TEACHER', 'STUDENT'],
        },
        className: {
            type: String
        }
    }],
    avatar: {
        type: String,
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model('User', User);