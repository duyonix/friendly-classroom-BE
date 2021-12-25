const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const Submission = new Schema({
    homeworkId: {
        type: ObjectId,
        ref: 'Homework',
    },
    studentId: {
        type: ObjectId,
        ref: 'User',
    },
    markDone: {
        type: Boolean,
        default: false,
    },
    fileNames: [{
        type: String,
    }],
    attachedFiles: [{
        type: String,
    }, ],
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