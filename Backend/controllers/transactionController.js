const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get all transactions (Income + Expense) with search, filter, pagination
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      type = 'all', // 'all', 'income', 'expense'
      category,     // Category for expenses
      source,       // Source for incomes
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build query filters
    const queryCond = { userId: req.user.id };
    
    if (startDate || endDate) {
      queryCond.date = {};
      if (startDate) queryCond.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryCond.date.$lte = end;
      }
    }

    if (search) {
      queryCond.description = { $regex: search, $options: 'i' };
    }

    let incomes = [];
    let expenses = [];

    // Query Incomes if type is 'all' or 'income'
    if (type === 'all' || type === 'income') {
      const incomeCond = { ...queryCond };
      if (source) {
        incomeCond.source = { $regex: source, $options: 'i' };
      }
      // If there's a search term, also match source
      if (search) {
        incomeCond.$or = [
          { description: { $regex: search, $options: 'i' } },
          { source: { $regex: search, $options: 'i' } }
        ];
        delete incomeCond.description; // Remove single key since we are using $or
      }
      
      // If category is provided, incomes shouldn't match (unless category maps to source)
      if (category) {
        // Categories don't apply to income, so if a category filter is active, return empty income list
        incomes = [];
      } else {
        incomes = await Income.find(incomeCond);
      }
    }

    // Query Expenses if type is 'all' or 'expense'
    if (type === 'all' || type === 'expense') {
      const expenseCond = { ...queryCond };
      if (category) {
        expenseCond.category = category;
      }
      if (search) {
        expenseCond.$or = [
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
        delete expenseCond.description;
      }
      expenses = await Expense.find(expenseCond);
    }

    // Map to uniform structure
    const formattedIncomes = incomes.map(inc => ({
      id: inc._id,
      amount: inc.amount,
      categoryOrSource: inc.source,
      description: inc.description,
      date: inc.date,
      type: 'income',
      createdAt: inc.createdAt
    }));

    const formattedExpenses = expenses.map(exp => ({
      id: exp._id,
      amount: exp.amount,
      categoryOrSource: exp.category,
      description: exp.description,
      date: exp.date,
      type: 'expense',
      createdAt: exp.createdAt
    }));

    // Merge and sort by date descending
    const combined = [...formattedIncomes, ...formattedExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Pagination
    const totalTransactions = combined.length;
    const paginatedData = combined.slice(skip, skip + parsedLimit);
    const totalPages = Math.ceil(totalTransactions / parsedLimit);

    res.status(200).json({
      success: true,
      count: paginatedData.length,
      pagination: {
        total: totalTransactions,
        page: parsedPage,
        limit: parsedLimit,
        pages: totalPages
      },
      data: paginatedData
    });
  } catch (error) {
    next(error);
  }
};
