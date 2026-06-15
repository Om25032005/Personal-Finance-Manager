import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp as SavingsIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const {
    incomes,
    expenses,
    budgets,
    goals,
    currentMonth,
    loading
  } = useContext(FinanceContext);

  // 1. Math calculations
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Recent Transactions (merge & sort)
  const combinedTx = [
    ...incomes.map(i => ({ ...i, type: 'income', displayCategory: i.source })),
    ...expenses.map(e => ({ ...e, type: 'expense', displayCategory: e.category }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const recentTransactions = combinedTx.slice(0, 5);

  // Group Expenses by Category for Pie Chart
  const expenseBreakdown = {};
  expenses.forEach((exp) => {
    expenseBreakdown[exp.category] = (expenseBreakdown[exp.category] || 0) + exp.amount;
  });

  const pieData = Object.entries(expenseBreakdown).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  })).sort((a, b) => b.value - a.value);

  // Colors for Recharts Pie cells
  const COLORS = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#94a3b8'  // Slate
  ];

  // Bar Chart Data (Monthly Income vs Expense)
  const barData = [
    {
      name: currentMonth,
      Income: parseFloat(totalIncome.toFixed(2)),
      Expense: parseFloat(totalExpense.toFixed(2))
    }
  ];

  // Filter budgets exceeded
  const activeExceededBudgets = budgets.filter(b => b.isExceeded);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-950">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Page Title & Month banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financial Performance</h1>
          <p className="text-slate-400 text-sm">Real-time health overview for {currentMonth}</p>
        </div>
      </div>

      {/* Alert Banner for Exceeded Budgets */}
      {activeExceededBudgets.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3.5 shadow-lg animate-pulse">
          <AlertTriangle className="w-5.5 h-5.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Budget Cap Breached!</h4>
            <p className="text-xs text-rose-400 mt-1">
              You have overrun your spending thresholds for the following categories: {' '}
              <span className="font-semibold">{activeExceededBudgets.map(b => b.category).join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Income Card */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[125px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1.5">${totalIncome.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-2">
            <span>+{incomes.length} inflow items</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[125px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1.5">${totalExpense.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-2">
            <span>{expenses.length} outgoing charges</span>
          </div>
        </div>

        {/* Savings Card */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[125px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Savings</span>
              <h3 className={`text-2xl font-extrabold mt-1.5 ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netSavings < 0 ? '-' : ''}${Math.abs(netSavings).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-2">
            Savings Rate: <span className={`font-semibold ${savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>{savingsRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Active Budgets Cap */}
        <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[125px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Budgets</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1.5">
                {budgets.length}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-accent-amber rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium mt-2">
            Exceeded targets: <span className="font-semibold text-rose-400">{activeExceededBudgets.length}</span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expense Bar chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-7 flex flex-col">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Cash Inflow vs Outflow</h3>
          <div className="h-72 w-full flex-1">
            {totalIncome === 0 && totalExpense === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No financial transactions logged for this month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '10px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense distribution pie chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-5 flex flex-col">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Expense Breakout</h3>
          <div className="h-72 w-full flex-1 relative flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-slate-500 text-sm">No expenses logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${value}`}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '10px' }}
                  />
                  <Legend verticalAlign="bottom" align="center" layout="horizontal" iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Recent Transactions & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions List */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-7 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-200">Recent Transactions</h3>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
                No transactions yet. Add your first transaction!
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3">Source/Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 flex flex-col">
                        <span className="font-semibold text-slate-200">{tx.displayCategory}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{tx.description || '-'}</span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-medium">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className={`py-3.5 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Goals Progress Preview */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-200">Savings Milestones</h3>
            <Link
              to="/goals"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {goals.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
                No active savings goals. Set up a target to track!
              </div>
            ) : (
              goals.slice(0, 3).map((goal) => {
                const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal._id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200 text-sm">{goal.title}</span>
                      <span className="text-xs font-bold text-brand-400">{percent.toFixed(0)}%</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Saved: ${goal.savedAmount.toLocaleString()}</span>
                      <span>Target: ${goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
