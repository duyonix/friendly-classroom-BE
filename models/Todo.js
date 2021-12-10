const { Binary } = require('bson')
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types;

const Todo = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['FINISHED', 'NOT FINISHED']
    },
    homeworkNeedToDo: [{
        type: ObjectId,
        ref: 'Homework'
    }]
})

module.exports = mongoose.model('Todo', Todo)