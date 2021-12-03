const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const Calendar = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
    },
    homework_list: [
      {
        type: ObjectId,
        ref: 'Homework',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Calendar', Calendar);
