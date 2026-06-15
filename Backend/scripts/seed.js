const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// Load environment variables
dotenv.config();

const getTargetMonth = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance-manager');
    console.log('MongoDB Connected for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Income.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create Test User
    const testUser = await User.create({
      name: 'Omkar Gole',
      email: 'test@test.com',
      password: 'password123' // Will be automatically hashed by User pre-save hook
    });
    console.log('Created Test User: test@test.com (password: password123)');

    const userId = testUser._id;
    const currentMonthStr = getTargetMonth();
    const today = new Date();

    // 2. Seed Incomes
    const incomes = [
      {
        userId,
        amount: 4500,
        source: 'Primary Salary',
        description: 'Monthly payroll deposit',
        date: new Date(today.getFullYear(), today.getMonth(), 1)
      },
      {
        userId,
        amount: 850,
        source: 'Freelance Design',
        description: 'Website redesign payout',
        date: new Date(today.getFullYear(), today.getMonth(), 10)
      },
      {
        userId,
        amount: 150,
        source: 'Dividends',
        description: 'Stock quarterly payouts',
        date: new Date(today.getFullYear(), today.getMonth(), 15)
      }
    ];

    await Income.insertMany(incomes);
    console.log('Seeded Income transactions.');

    // 3. Seed Expenses
    const expenses = [
      {
        userId,
        amount: 1200,
        category: 'Rent',
        description: 'Monthly apartment rent',
        date: new Date(today.getFullYear(), today.getMonth(), 1)
      },
      {
        userId,
        amount: 142.50,
        category: 'Utilities',
        description: 'Electricity & Internet bills',
        date: new Date(today.getFullYear(), today.getMonth(), 5)
      },
      {
        userId,
        amount: 85.20,
        category: 'Food',
        description: 'Grocery restocking',
        date: new Date(today.getFullYear(), today.getMonth(), 4)
      },
      {
        userId,
        amount: 45.00,
        category: 'Food',
        description: 'Friday dinner out',
        date: new Date(today.getFullYear(), today.getMonth(), 8)
      },
      {
        userId,
        amount: 120.00,
        category: 'Transport',
        description: 'Monthly transit pass',
        date: new Date(today.getFullYear(), today.getMonth(), 2)
      },
      {
        userId,
        amount: 250.00,
        category: 'Shopping',
        description: 'New mechanical keyboard',
        date: new Date(today.getFullYear(), today.getMonth(), 12)
      },
      {
        userId,
        amount: 95.00,
        category: 'Entertainment',
        description: 'Concert tickets',
        date: new Date(today.getFullYear(), today.getMonth(), 14)
      },
      {
        userId,
        amount: 60.00,
        category: 'Medical',
        description: 'Prescription refills',
        date: new Date(today.getFullYear(), today.getMonth(), 6)
      }
    ];

    await Expense.insertMany(expenses);
    console.log('Seeded Expense transactions.');

    // 4. Seed Budgets
    const budgets = [
      {
        userId,
        category: 'Food',
        monthlyLimit: 120, // Sum of food expenses is 85.20 + 45.00 = 130.20 (which is exceeded! triggers alerts)
        month: currentMonthStr
      },
      {
        userId,
        category: 'Transport',
        monthlyLimit: 150,
        month: currentMonthStr
      },
      {
        userId,
        category: 'Entertainment',
        monthlyLimit: 100,
        month: currentMonthStr
      },
      {
        userId,
        category: 'Shopping',
        monthlyLimit: 300,
        month: currentMonthStr
      }
    ];

    await Budget.insertMany(budgets);
    console.log('Seeded Category Budgets.');

    // 5. Seed Savings Goals
    const goals = [
      {
        userId,
        title: 'Emergency Fund',
        targetAmount: 5000,
        savedAmount: 2500,
        deadline: new Date(today.getFullYear() + 1, today.getMonth(), 30)
      },
      {
        userId,
        title: 'New Laptop',
        targetAmount: 1500,
        savedAmount: 1500, // Completed goal!
        deadline: new Date(today.getFullYear(), today.getMonth() + 1, 15)
      }
    ];

    await Goal.insertMany(goals);
    console.log('Seeded Savings Goals.');

    console.log('Database Seeding Successful! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
