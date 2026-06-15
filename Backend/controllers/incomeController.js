const Income = require('../models/Income');

// @desc    Get all incomes for user
// @route   GET /api/income
// @access  Private
exports.getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new income
// @route   POST /api/income
// @access  Private
exports.addIncome = async (req, res, next) => {
  try {
    const { amount, source, description, date } = req.body;

    if (!amount || !source) {
      return res.status(400).json({ success: false, message: 'Please provide amount and source' });
    }

    const income = await Income.create({
      userId: req.user.id,
      amount,
      source,
      description,
      date: date || undefined
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
exports.updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    // Verify ownership
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this income record' });
    }

    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }

    // Verify ownership
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this income record' });
    }

    await income.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
