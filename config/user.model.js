const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 8
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    gmail: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true,
        unique: true
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

const User = mongoose.model('user', userSchema)
module.exports = User