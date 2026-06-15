import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  Activity,
  Calendar,
  SlidersHorizontal,
  Brain,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle,
  HelpCircle,
  TrendingUp as SavingsIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const Analytics = () => {
  // Filter States
  const getInitialMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [expenseDistribution, setExpenseDistribution] = useState([]);
  const [budgetUtilization, setBudgetUtilization] = useState([]);
  const [savingsTrend, setSavingsTrend] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [financialHealth, setFinancialHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoriesList = [
    'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Medical', 'Rent', 'Utilities', 'Investments', 'Others'
  ];

  const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#94a3b8'  // Slate
  ];

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (selectedMonth) queryParams.append('month', selectedMonth);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedSource) queryParams.append('source', selectedSource);

      const qs = queryParams.toString();

      // Trigger all aggregate requests concurrently
      const [
        dashRes,
        trendsRes,
        distRes,
        budgetRes,
        savingsRes,
        sourcesRes,
        healthRes
      ] = await Promise.all([
        api.get(`/analytics/dashboard?${qs}`),
        api.get(`/analytics/monthly-income-expense?${qs}`),
        api.get(`/analytics/expense-distribution?${qs}`),
        api.get(`/analytics/budget-utilization?${qs}`),
        api.get(`/analytics/savings-trend?${qs}`),
        api.get(`/analytics/income-sources?${qs}`),
        api.get(`/analytics/financial-health?${qs}`)
      ]);

      setDashboardData(dashRes.data.data);
      setMonthlyTrends(trendsRes.data.data);
      setExpenseDistribution(distRes.data.data);
      setBudgetUtilization(budgetRes.data.data);
      setSavingsTrend(savingsRes.data.data);
      setIncomeSources(sourcesRes.data.data);
      setFinancialHealth(healthRes.data.data);

    } catch (err) {
      console.error('Error fetching analytics details:', err);
      setError('Failed to fetch detailed financial metrics. Please ensure you have added transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMonth, startDate, endDate, selectedCategory, selectedSource]);

  const handleClearFilters = () => {
    setSelectedMonth(getInitialMonth());
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setSelectedSource('');
  };

  // 1. Generate Intelligent Rule-Based Insights
  const generateAIInsights = () => {
    if (!dashboardData || !financialHealth) return [];
    const insights = [];

    const kpis = dashboardData.kpis;
    const score = financialHealth.score;

    // Financial Score insight
    if (score >= 85) {
      insights.push({
        type: 'success',
        text: `Superb! Your financial health score is ${score}/100 (Excellent). Your spending and saving patterns are highly optimized.`
      });
    } else if (score >= 70) {
      insights.push({
        type: 'info',
        text: `Your financial health score is ${score}/100 (Good). Look for minor budget overruns to cross into the excellent tier.`
      });
    } else {
      insights.push({
        type: 'warning',
        text: `Your score is ${score}/100 (${financialHealth.rating}). Prioritize trimming discretionary expenses and setting savings targets.`
      });
    }

    // Expense & Income Insights
    if (kpis.expense.pctChange > 15) {
      insights.push({
        type: 'warning',
        text: `Heads up! Your expenses increased by ${kpis.expense.pctChange}% compared to last month. Consider review category spend.`
      });
    }

    // Savings insights
    const currentSavingsRate = financialHealth.score > 0 
      ? (kpis.savings.value / kpis.income.value) * 100 
      : 0;

    if (currentSavingsRate < 20 && kpis.income.value > 0) {
      insights.push({
        type: 'warning',
        text: `Your savings rate dropped to ${currentSavingsRate.toFixed(1)}% this month (recommended minimum is 20%).`
      });
    } else if (currentSavingsRate >= 30) {
      insights.push({
        type: 'success',
        text: `Exceptional saving! You are saving ${currentSavingsRate.toFixed(1)}% of your monthly cash flow.`
      });
    }

    // Budget check insights
    const exceededBudgets = budgetUtilization.filter(b => b.isExceeded);
    if (exceededBudgets.length > 0) {
      insights.push({
        type: 'warning',
        text: `Budget cap breaches detected! You ran over limits in: ${exceededBudgets.map(b => b.category).join(', ')}.`
      });
    }

    // Goal checks
    const activeGoals = dashboardData.kpis.activeGoals.value;
    if (activeGoals === 0 && kpis.savings.value > 0) {
      insights.push({
        type: 'info',
        text: `You have no active goals in progress. Create a savings goal to allocate your leftover cash.`
      });
    }

    return insights;
  };

  const compiledInsights = generateAIInsights();

  // Loading State Spinner
  if (loading && !dashboardData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-dark-950 space-y-4">
        <Loader2 className="w-10 h-10 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Assembling financial intelligence reports...</p>
      </div>
    );
  }

  const kpiDetails = dashboardData?.kpis || {};

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Deep statistics and structural breakdown of your personal wealth</p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 text-sm ${showFilters ? 'bg-slate-700/80 border-brand-500/50' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          Advanced Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass-panel p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in border-brand-500/10">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Analysis Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="glass-input py-2 text-xs bg-slate-900"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }).map((_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const val = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                return <option key={val} value={val}>{label}</option>;
              })}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input py-2 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input py-2 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Expense Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input py-2 text-xs bg-slate-900"
            >
              <option value="">All Categories</option>
              {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 justify-end">
            <button
              onClick={handleClearFilters}
              className="btn-secondary py-2 text-xs hover:bg-slate-800 text-slate-400"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* 1. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI: Income */}
        <div className="glass-card p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Income</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">${kpiDetails.income?.value.toLocaleString() || '0'}</h3>
            <span className={`text-[10px] font-semibold ${kpiDetails.income?.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {kpiDetails.income?.pctChange >= 0 ? '+' : ''}{kpiDetails.income?.pctChange || '0'}% MoM
            </span>
          </div>
        </div>

        {/* KPI: Expenses */}
        <div className="glass-card p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">${kpiDetails.expense?.value.toLocaleString() || '0'}</h3>
            <span className={`text-[10px] font-semibold ${kpiDetails.expense?.pctChange <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {kpiDetails.expense?.pctChange >= 0 ? '+' : ''}{kpiDetails.expense?.pctChange || '0'}% MoM
            </span>
          </div>
        </div>

        {/* KPI: Savings */}
        <div className="glass-card p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Savings</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Wallet className="w-4 h-4" /></div>
          </div>
          <div className="mt-2">
            <h3 className={`text-xl font-extrabold ${kpiDetails.savings?.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${kpiDetails.savings?.value.toLocaleString() || '0'}
            </h3>
            <span className={`text-[10px] font-semibold ${kpiDetails.savings?.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {kpiDetails.savings?.pctChange >= 0 ? '+' : ''}{kpiDetails.savings?.pctChange || '0'}% MoM
            </span>
          </div>
        </div>

        {/* KPI: Budget Util */}
        <div className="glass-card p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Util.</span>
            <div className="p-2 bg-amber-500/10 text-accent-amber rounded-lg"><PiggyBank className="w-4 h-4" /></div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{kpiDetails.budgetUtilization?.value || '0'}%</h3>
            <span className={`text-[10px] font-semibold ${kpiDetails.budgetUtilization?.pctChange <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {kpiDetails.budgetUtilization?.pctChange >= 0 ? '+' : ''}{kpiDetails.budgetUtilization?.pctChange || '0'}% change
            </span>
          </div>
        </div>

        {/* KPI: Active Goals */}
        <div className="glass-card p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Goals</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg"><Target className="w-4 h-4" /></div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{kpiDetails.activeGoals?.value || '0'}</h3>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Goals in target progress</span>
          </div>
        </div>

        {/* KPI: Financial Score */}
        <div className="glass-card p-4 flex flex-col justify-between min-h-[110px] border-brand-500/20 bg-brand-950/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Health Score</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg"><Activity className="w-4 h-4 animate-pulse" /></div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{kpiDetails.financialHealth?.value || '0'}/100</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              kpiDetails.financialHealth?.rating === 'Excellent' ? 'text-emerald-400' :
              kpiDetails.financialHealth?.rating === 'Good' ? 'text-indigo-400' :
              kpiDetails.financialHealth?.rating === 'Average' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {kpiDetails.financialHealth?.rating || 'Calculating...'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN TREND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Monthly Income vs Expense */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-7 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Income vs Expense vs Savings Trend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historical overview of monthly balance flows</p>
          </div>
          
          <div className="h-72 w-full flex-1">
            {monthlyTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No monthly transactions logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="savings" name="Net Savings" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Area Chart: Savings Trend & Rate */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Savings Growth & Rate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly net savings and savings rate percentage</p>
          </div>

          <div className="h-72 w-full flex-1">
            {savingsTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No savings data found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area yAxisId="left" type="monotone" dataKey="savings" name="Net Savings ($)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSavings)" />
                  <Line yAxisId="right" type="monotone" dataKey="savingsRate" name="Savings Rate (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3. BUDGET COMPLIANCE & TOP SPENDING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Budget Utilization comparative */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-7 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Budget Limit vs Spending Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparative overview of allocated ceilings vs actual expense loads</p>
          </div>
          
          <div className="h-72 w-full flex-1">
            {budgetUtilization.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No active budgets established for this month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="allocated" name="Budget Limit" fill="#4f46e5" radius={[4, 4, 0, 0]} opacity={0.65} />
                  <Bar dataKey="spent" name="Amount Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Horizontal Bar Chart: Top Spending Categories */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Top Spending Categories</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Categorized outflows ranked highest to lowest</p>
          </div>

          <div className="h-72 w-full flex-1">
            {expenseDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No expense logs found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={expenseDistribution.slice(0, 5)}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" name="Total Spend ($)" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {expenseDistribution.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. EXPENSE BREAKDOWN & INCOME SOURCES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart: Expense Distribution */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Expense Allocation Weight</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Structural category contribution rates</p>
          </div>
          
          <div className="h-72 w-full flex-1 flex items-center justify-center relative">
            {expenseDistribution.length === 0 ? (
              <div className="text-slate-500 text-xs">No expense logs.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v}`} />
                  <Legend verticalAlign="bottom" layout="horizontal" iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Income Sources */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Income Inflow Sources</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Aggregated inflow items and percentages</p>
          </div>

          <div className="h-72 w-full flex-1 flex items-center justify-center relative">
            {incomeSources.length === 0 ? (
              <div className="text-slate-500 text-xs">No income logs.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {incomeSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 5. HEALTH METRIC PILLARS & AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart: Financial Health Breakdown */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Financial Health Radar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scoring performance breakdown across key wealth pillars</p>
          </div>
          
          <div className="h-72 w-full flex-1 flex items-center justify-center">
            {financialHealth ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={[
                    { subject: 'Savings Rate', A: financialHealth.breakdown.savingsRateScore, B: 30, fullMark: 30 },
                    { subject: 'Budget Compliance', A: financialHealth.breakdown.budgetComplianceScore, B: 30, fullMark: 30 },
                    { subject: 'Goal Progress', A: financialHealth.breakdown.goalCompletionScore, B: 20, fullMark: 20 },
                    { subject: 'Income Stability', A: financialHealth.breakdown.incomeStabilityScore, B: 20, fullMark: 20 }
                  ]}
                >
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 30]} stroke="#64748b" />
                  <Radar name="Your Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Radar name="Target Score" dataKey="B" stroke="#10b981" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">Computing rating metrics...</div>
            )}
          </div>
        </div>

        {/* AI Insight list panel */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              Automated Advisor Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recommendations and alerts based on cash flow trends</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[260px] pr-2">
            {compiledInsights.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs py-12">
                No active insights. Keep adding logs to let the engine analyze trends.
              </div>
            ) : (
              compiledInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 border rounded-xl flex items-start gap-3 text-xs font-medium ${
                    insight.type === 'warning'
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      : insight.type === 'success'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-200'
                  }`}
                >
                  {insight.type === 'warning' ? (
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{insight.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
