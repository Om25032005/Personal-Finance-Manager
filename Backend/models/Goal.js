const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a goal title'],
      trim: true
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please specify the target amount'],
      min: [0.01, 'Target amount must be greater than 0']
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative']
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify a deadline date']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Goal', goalSchema);
