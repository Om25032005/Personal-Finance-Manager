const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add an expense amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Please specify the expense category'],
      enum: {
        values: [
          'Food',
          'Transport',
          'Shopping',
          'Education',
          'Entertainment',
          'Medical',
          'Rent',
          'Utilities',
          'Investments',
          'Others'
        ],
        message: '{VALUE} is not a valid category'
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
