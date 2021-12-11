const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const Submission = new Schema({
    classId: {
        type: ObjectId,
        ref: 'Classroom'
    },
    title: {
        type: String
    },
    studentName: {
        type: String
    },
    status: {
        type: String,
        enum: ['TO DO', 'DONE', 'OVERDUE'],
    },
    attachedFiles: [{
        type: String,
    }],
    comment: {
        type: String,
    },
    score: {
        type: Number,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Submission', Submission);