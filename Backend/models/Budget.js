const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please specify a category for the budget'],
      // We can also support 'All' or a specific category name
      trim: true
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Please set a monthly limit'],
      min: [0, 'Limit cannot be negative']
    },
    month: {
      type: String,
      required: [true, 'Please specify the month (Format: YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Please use the YYYY-MM format']
    }
  },
  {
    timestamps: true
  }
);

// Compounding unique index to ensure a user only has one budget per category per month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
