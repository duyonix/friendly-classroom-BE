const { Binary } = require('bson')
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
    creatorName: {
        type: String,
        required: true
    },
    attachedFiles: [{
        // filename
        type: String,
        unique: true
    }]
})

module.exports = mongoose.model('Document', Document)