const { Binary } = require('bson')
const mongoose = require('mongoose')

const Homework = new mongoose.Schema({
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
    filename: {
        type: String
    },
    createDate: {
        type: Date
    },
    deadline: {
        type: Date
    },
    data: {
        type: String
    }
})

module.exports = mongoose.model('Homework', Homework)