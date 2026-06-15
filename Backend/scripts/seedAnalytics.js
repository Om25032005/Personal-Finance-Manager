const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance-manager';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding analytics data...');

    // Clear existing collections
    await User.deleteMany({});
    await Income.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    console.log('Cleared existing database collections.');

    // 1. Create Test User
    const testUser = await User.create({
      name: 'Omkar Gole',
      email: 'test@test.com',
      password: 'password123'
    });
    console.log('Created Test User: test@test.com (password: password123)');

    const userId = testUser._id;
    const today = new Date();

    const incomesToInsert = [];
    const expensesToInsert = [];
    const budgetsToInsert = [];

    // Categories and Sources List
    const expenseCategories = [
      'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Medical', 'Rent', 'Utilities', 'Investments', 'Others'
    ];

    // Seed 6 months of historical data
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 15);
      const year = targetDate.getFullYear();
      const monthIndex = targetDate.getMonth();
      const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      // Incomes
      incomesToInsert.push(
        {
          userId,
          amount: 4200,
          source: 'Salary',
          description: 'Regular monthly paystub',
          date: new Date(year, monthIndex, 1)
        },
        {
          userId,
          amount: 500 + Math.floor(Math.random() * 400),
          source: 'Freelancing',
          description: 'Side projects payment',
          date: new Date(year, monthIndex, 12)
        },
        {
          userId,
          amount: 100 + Math.floor(Math.random() * 150),
          source: 'Investments',
          description: 'Quarterly ETF yield payouts',
          date: new Date(year, monthIndex, 20)
        }
      );

      // Expenses
      // Rent (fixed)
      expensesToInsert.push({
        userId,
        amount: 1100,
        category: 'Rent',
        description: 'Apartment rent',
        date: new Date(year, monthIndex, 2)
      });

      // Utilities
      expensesToInsert.push({
        userId,
        amount: 120 + Math.floor(Math.random() * 60),
        category: 'Utilities',
        description: 'Gas & Power',
        date: new Date(year, monthIndex, 5)
      });

      // Food (variable, sometimes over budget limit of 350)
      const foodSpend = 280 + Math.floor(Math.random() * 120);
      expensesToInsert.push({
        userId,
        amount: foodSpend,
        category: 'Food',
        description: 'Monthly food/dine-out',
        date: new Date(year, monthIndex, 10)
      });

      // Transport
      expensesToInsert.push({
        userId,
        amount: 100 + Math.floor(Math.random() * 40),
        category: 'Transport',
        description: 'Subway pass & fuel',
        date: new Date(year, monthIndex, 8)
      });

      // Shopping (fluctuates)
      expensesToInsert.push({
        userId,
        amount: 150 + Math.floor(Math.random() * 250),
        category: 'Shopping',
        description: 'Retail stores spend',
        date: new Date(year, monthIndex, 18)
      });

      // Entertainment
      expensesToInsert.push({
        userId,
        amount: 80 + Math.floor(Math.random() * 100),
        category: 'Entertainment',
        description: 'Cinema, outings, events',
        date: new Date(year, monthIndex, 22)
      });

      // Investments (expense category)
      expensesToInsert.push({
        userId,
        amount: 300 + Math.floor(Math.random() * 300),
        category: 'Investments',
        description: 'Mutual fund deposits',
        date: new Date(year, monthIndex, 25)
      });

      // Medical
      if (Math.random() > 0.5) {
        expensesToInsert.push({
          userId,
          amount: 50 + Math.floor(Math.random() * 100),
          category: 'Medical',
          description: 'Pharmacy & checkup',
          date: new Date(year, monthIndex, 14)
        });
      }

      // Others
      expensesToInsert.push({
        userId,
        amount: 40 + Math.floor(Math.random() * 60),
        category: 'Others',
        description: 'Miscellaneous spend',
        date: new Date(year, monthIndex, 28)
      });

      // Budgets
      budgetsToInsert.push(
        { userId, category: 'Food', monthlyLimit: 320, month: monthStr },
        { userId, category: 'Shopping', monthlyLimit: 300, month: monthStr },
        { userId, category: 'Entertainment', monthlyLimit: 150, month: monthStr },
        { userId, category: 'Transport', monthlyLimit: 120, month: monthStr }
      );
    }

    // Insert arrays into collections
    await Income.insertMany(incomesToInsert);
    await Expense.insertMany(expensesToInsert);
    await Budget.insertMany(budgetsToInsert);
    console.log('Seeded 6 months of historical Income, Expense, and Budgets.');

    // 5. Seed Goals
    const goals = [
      {
        userId,
        title: 'Emergency Fund',
        targetAmount: 12000,
        savedAmount: 6000,
        deadline: new Date(today.getFullYear() + 1, today.getMonth(), 1)
      },
      {
        userId,
        title: 'European Vacation',
        targetAmount: 4000,
        savedAmount: 4000, // Completed
        deadline: new Date(today.getFullYear(), today.getMonth() + 2, 1)
      },
      {
        userId,
        title: 'Tesla Downpayment',
        targetAmount: 30000,
        savedAmount: 9500,
        deadline: new Date(today.getFullYear() + 2, today.getMonth(), 1)
      }
    ];

    await Goal.insertMany(goals);
    console.log('Seeded Savings Goals.');

    console.log('Historical database seeder completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding analytics data failed:', err);
    process.exit(1);
  }
};

seedData();
