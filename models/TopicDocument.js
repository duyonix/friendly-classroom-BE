const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const TopicDocument = new mongoose.Schema({
    classId: {
        type: ObjectId,
        ref: 'Classroom'
    },
    topic: {
        type: String,
    }
})

module.exports = mongoose.model('TopicDocument', TopicDocument);