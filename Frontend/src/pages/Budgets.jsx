import React, { useState, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { PlusCircle, Trash2, PiggyBank, AlertCircle, Sparkles } from 'lucide-react';

const Budgets = () => {
  const { budgets, saveBudget, deleteBudget, currentMonth } = useContext(FinanceContext);

  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Medical', 'Rent', 'Utilities', 'Others'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      setErrorMsg('Please enter a valid budget limit (0 or more).');
      return;
    }

    setLoading(true);
    const res = await saveBudget(category, parsedLimit);
    if (res.success) {
      setSuccessMsg(`Successfully saved budget for ${category}!`);
      setLimit('');
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Budget Configurations</h1>
        <p className="text-slate-400 text-sm">Control monthly spending ceilings per category for {currentMonth}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Set Budget Form */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-slate-200">Set Monthly Limit</h3>
          </div>

          {errorMsg && (
            <div className="px-4 py-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="px-4 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Select Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input text-sm bg-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Monthly Ceiling ($)</label>
              <input
                type="number"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0.00"
                className="glass-input text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Saving...' : 'Establish Limit'}
            </button>
          </form>
        </div>

        {/* Budget Status View */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-8 flex flex-col space-y-4">
          <h3 className="font-bold text-slate-200">Category Budgets Utilization</h3>
          
          {budgets.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No budgets established for {currentMonth}. Set your first budget!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const percent = budget.utilizationPercentage;
                const isOver = budget.isExceeded;
                return (
                  <div
                    key={budget.id}
                    className={`p-4 border rounded-xl flex flex-col justify-between space-y-3 shadow-sm transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-950/10 border-rose-800/40 hover:border-rose-500/30'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 text-sm">{budget.category}</span>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Spent: ${budget.spent.toFixed(2)}</span>
                        <span>Limit: ${budget.monthlyLimit.toFixed(2)}</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-semibold tracking-wider">
                      <span className={`${isOver ? 'text-rose-400' : 'text-slate-400'}`}>
                        {percent.toFixed(0)}% UTILIZED
                      </span>
                      {isOver && (
                        <span className="flex items-center gap-1 text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" /> OVER BUDGET
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
