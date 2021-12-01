const mongoose = require('mongoose')

const Document = new mongoose.Schema({
    classId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 8
    },
    description: {
        type: String
    },
    data: {
        type: Buffer
    }
})

module.exports = mongoose.model('Document', Document)