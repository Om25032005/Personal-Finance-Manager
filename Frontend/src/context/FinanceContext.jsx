import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Calculate current month in YYYY-MM format
  const getInitialMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [toastAlert, setToastAlert] = useState(null); // Alert state for budget exceed or goal completion

  // Helper for triggering alert toast
  const triggerToast = (message, type = 'info') => {
    setToastAlert({ message, type });
    setTimeout(() => {
      setToastAlert(null);
    }, 5000);
  };

  // Fetch all finance data for the current month
  const fetchFinanceData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch incomes & expenses
      const [incRes, expRes, budRes, goalRes] = await Promise.all([
        api.get('/income'),
        api.get('/expense'),
        api.get(`/budget/status/${currentMonth}`),
        api.get('/goal')
      ]);

      setIncomes(incRes.data.data);
      setExpenses(expRes.data.data);
      setBudgets(budRes.data.data);
      setGoals(goalRes.data.data);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch paginated unified transactions list
  const fetchTransactions = async (page = 1, limit = 10, filters = {}) => {
    if (!user) return;
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();

      const res = await api.get(`/transactions?${queryParams}`);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching transactions feed:', err);
    }
  };

  // Trigger data fetch on user or month changes
  useEffect(() => {
    if (user) {
      fetchFinanceData();
      fetchTransactions(1, 10);
    } else {
      // Clear state on logout
      setIncomes([]);
      setExpenses([]);
      setBudgets([]);
      setGoals([]);
      setTransactions([]);
    }
  }, [user, currentMonth]);

  // --- CRUD INCOME ---
  const addIncome = async (incomeData) => {
    try {
      const res = await api.post('/income', incomeData);
      if (res.data.success) {
        setIncomes(prev => [res.data.data, ...prev]);
        fetchFinanceData(); // refresh summary metrics
        fetchTransactions(pagination.page, pagination.limit);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error adding income' };
    }
  };

  const updateIncome = async (id, updatedData) => {
    try {
      const res = await api.put(`/income/${id}`, updatedData);
      if (res.data.success) {
        setIncomes(prev => prev.map(inc => inc._id === id ? res.data.data : inc));
        fetchFinanceData();
        fetchTransactions(pagination.page, pagination.limit);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating income' };
    }
  };

  const deleteIncome = async (id) => {
    try {
      const res = await api.delete(`/income/${id}`);
      if (res.data.success) {
        setIncomes(prev => prev.filter(inc => inc._id !== id));
        fetchFinanceData();
        fetchTransactions(pagination.page, pagination.limit);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting income' };
    }
  };

  // --- CRUD EXPENSE ---
  const addExpense = async (expenseData) => {
    try {
      const res = await api.post('/expense', expenseData);
      if (res.data.success) {
        setExpenses(prev => [res.data.data, ...prev]);
        fetchFinanceData();
        fetchTransactions(pagination.page, pagination.limit);
        
        // Notify if budget limit exceeded
        if (res.data.budgetAlert) {
          triggerToast(
            `🚨 Budget Exceeded for ${res.data.budgetAlert.spent > 0 ? expenseData.category : ''}! Spent: $${res.data.budgetAlert.spent.toFixed(2)} / Limit: $${res.data.budgetAlert.limit.toFixed(2)}`,
            'warning'
          );
        }
        return { success: true, budgetAlert: res.data.budgetAlert };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error adding expense' };
    }
  };

  const updateExpense = async (id, updatedData) => {
    try {
      const res = await api.put(`/expense/${id}`, updatedData);
      if (res.data.success) {
        setExpenses(prev => prev.map(exp => exp._id === id ? res.data.data : exp));
        fetchFinanceData();
        fetchTransactions(pagination.page, pagination.limit);

        // Notify if budget limit exceeded
        if (res.data.budgetAlert) {
          triggerToast(
            `🚨 Budget Exceeded! Spent: $${res.data.budgetAlert.spent.toFixed(2)} / Limit: $${res.data.budgetAlert.limit.toFixed(2)}`,
            'warning'
          );
        }
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating expense' };
    }
  };

  const deleteExpense = async (id) => {
    try {
      const res = await api.delete(`/expense/${id}`);
      if (res.data.success) {
        setExpenses(prev => prev.filter(exp => exp._id !== id));
        fetchFinanceData();
        fetchTransactions(pagination.page, pagination.limit);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting expense' };
    }
  };

  // --- CRUD BUDGETS ---
  const saveBudget = async (category, monthlyLimit) => {
    try {
      const res = await api.post('/budget', {
        category,
        monthlyLimit,
        month: currentMonth
      });
      if (res.data.success) {
        fetchFinanceData(); // refresh budget utilization summaries
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error setting budget' };
    }
  };

  const deleteBudget = async (id) => {
    try {
      const res = await api.delete(`/budget/${id}`);
      if (res.data.success) {
        fetchFinanceData();
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting budget' };
    }
  };

  // --- CRUD SAVINGS GOALS ---
  const addGoal = async (goalData) => {
    try {
      const res = await api.post('/goal', goalData);
      if (res.data.success) {
        setGoals(prev => [...prev, res.data.data]);
        
        if (res.data.goalCompleted) {
          triggerToast(`🎉 Awesome! Savings Goal Reached: ${goalData.title}!`, 'success');
        }
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error adding goal' };
    }
  };

  const updateGoal = async (id, updatedData) => {
    try {
      const res = await api.put(`/goal/${id}`, updatedData);
      if (res.data.success) {
        setGoals(prev => prev.map(g => g._id === id ? res.data.data : g));
        
        if (res.data.goalCompleted) {
          triggerToast(`🎉 Awesome! Savings Goal Reached: ${res.data.data.title}!`, 'success');
        }
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating goal' };
    }
  };

  const deleteGoal = async (id) => {
    try {
      const res = await api.delete(`/goal/${id}`);
      if (res.data.success) {
        setGoals(prev => prev.filter(g => g._id !== id));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting goal' };
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        currentMonth,
        setCurrentMonth,
        incomes,
        expenses,
        budgets,
        goals,
        transactions,
        pagination,
        loading,
        toastAlert,
        triggerToast,
        fetchFinanceData,
        fetchTransactions,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        saveBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
