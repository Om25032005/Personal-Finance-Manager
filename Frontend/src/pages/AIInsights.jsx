import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Brain, Target, Coins, Settings, Calendar, Loader2, Sparkles } from 'lucide-react';

const AIInsights = () => {
  const getInitialMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth());
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate 12 months for selector
  const getMonthsList = () => {
    const list = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      list.push({ value: `${y}-${m}`, label: date.toLocaleString('default', { month: 'long', year: 'numeric' }) });
      date.setMonth(date.getMonth() - 1);
    }
    return list;
  };

  const months = getMonthsList();

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/ai/insights/${selectedMonth}`);
      if (res.data.success) {
        setInsights(res.data.insights);
      } else {
        setError('Could not compile tips.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedMonth]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Spending Pattern Analysis':
        return <Brain className="w-6 h-6 text-indigo-400" />;
      case 'Savings Recommendations':
        return <Target className="w-6 h-6 text-emerald-400" />;
      case 'Expense Optimization Suggestions':
        return <Coins className="w-6 h-6 text-rose-400" />;
      case 'Budget Improvement Tips':
        return <Settings className="w-6 h-6 text-amber-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-brand-400" />;
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Spending Pattern Analysis':
        return 'bg-indigo-950/20 border-indigo-800/40 hover:border-indigo-500/20';
      case 'Savings Recommendations':
        return 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-500/20';
      case 'Expense Optimization Suggestions':
        return 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500/20';
      case 'Budget Improvement Tips':
        return 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500/20';
      default:
        return 'bg-slate-900/40 border-slate-800 hover:border-brand-500/20';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          AI Financial Advisor
        </h1>
        <p className="text-slate-400 text-sm">Personalized insights parsed from your cash flow trends</p>
      </div>

      {/* Month Selection Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-400" />
          <span className="text-sm font-semibold text-slate-300">Select Month to Analyze</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="glass-input text-sm bg-slate-900 w-full sm:w-auto"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-10 h-10 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">
            Analyzing spending patterns and compiling advice...
          </p>
        </div>
      ) : error ? (
        <div className="px-4 py-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-6 border rounded-2xl shadow-lg transition-all duration-300 flex items-start gap-4 ${getCategoryStyle(
                insight.category
              )}`}
            >
              {/* Category Icon container */}
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 shrink-0">
                {getCategoryIcon(insight.category)}
              </div>

              {/* Text info */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {insight.category}
                </span>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {insight.tip}
                </p>
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="glass-panel p-12 text-center text-slate-500 text-sm rounded-2xl col-span-2">
              No financial stats found to generate suggestions for this month.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
