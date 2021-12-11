const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const Classroom = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    listHomework: [{
        type: ObjectId,
        ref: 'Homework',
    }, ],
    listDocument: [{
        type: ObjectId,
        ref: 'Document',
    }, ],
    listPost: [{
        type: ObjectId,
        ref: 'Post',
    }, ],
    teacherId: {
        type: ObjectId,
        ref: 'User',
    },
    listStudent: [{
        type: ObjectId,
        ref: 'User',
    }, ],
    numberOfMember: {
        type: Number,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Classroom', Classroom);