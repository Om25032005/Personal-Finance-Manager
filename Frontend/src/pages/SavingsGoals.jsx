import React, { useState, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { Target, Calendar, PlusCircle, Trash2, Edit, CheckCircle, Loader2 } from 'lucide-react';

const SavingsGoals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useContext(FinanceContext);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update Savings Amount inline
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contribution, setContribution] = useState('');
  const [isContributionLoading, setIsContributionLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const target = parseFloat(targetAmount);
    const saved = parseFloat(savedAmount) || 0;

    if (!title || isNaN(target) || target <= 0 || !deadline) {
      setErrorMsg('Please specify a valid title, target amount (>0), and deadline date.');
      return;
    }

    setLoading(true);
    const res = await addGoal({
      title,
      targetAmount: target,
      savedAmount: saved,
      deadline
    });

    if (res.success) {
      setSuccessMsg('Successfully created savings goal!');
      setTitle('');
      setTargetAmount('');
      setSavedAmount('');
      setDeadline('');
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !contribution) return;

    const amountToAdd = parseFloat(contribution);
    if (isNaN(amountToAdd)) return;

    setIsContributionLoading(true);

    const newSavedAmount = selectedGoal.savedAmount + amountToAdd;

    const res = await updateGoal(selectedGoal._id, {
      savedAmount: Math.max(0, newSavedAmount) // prevent negative savings
    });

    if (res.success) {
      setContribution('');
      setSelectedGoal(null);
    }
    setIsContributionLoading(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Savings Goals</h1>
        <p className="text-slate-400 text-sm">Create and track savings goals for key milestones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Create Goal Form */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-slate-200">Establish Savings Goal</h3>
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
              <label className="text-xs font-semibold text-slate-400 uppercase">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Emergency Fund, New Laptop"
                className="glass-input text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Target Amount ($)</label>
              <input
                type="number"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className="glass-input text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Initial Saved Amount ($)</label>
              <input
                type="number"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
                placeholder="0.00"
                className="glass-input text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Deadline Date</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="glass-input text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </div>

        {/* Goals Grid */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <h3 className="font-bold text-slate-200">Active Goals Status</h3>

          {goals.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500 text-sm rounded-2xl">
              No savings goals established. Set a milestone to begin tracking your progress!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                const isCompleted = goal.savedAmount >= goal.targetAmount;
                const dateStr = new Date(goal.deadline).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={goal._id}
                    className={`glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden ${
                      isCompleted ? 'border-emerald-500/30' : ''
                    }`}
                  >
                    {/* Goal Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 text-base flex items-center gap-2">
                          {goal.title}
                          {isCompleted && <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />}
                        </h4>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          Target: {dateStr}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteGoal(goal._id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Saved: ${goal.savedAmount.toLocaleString()}</span>
                        <span>Target: ${goal.targetAmount.toLocaleString()}</span>
                      </div>

                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-500 to-indigo-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider">
                        <span>{percent.toFixed(0)}% ACCOMPLISHED</span>
                        {isCompleted && <span className="text-emerald-400">TARGET MET</span>}
                      </div>
                    </div>

                    {/* Contribute button */}
                    <div className="pt-2">
                      {selectedGoal?._id === goal._id ? (
                        <form onSubmit={handleContribute} className="flex gap-2 items-center">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Add amount (+/-)"
                            value={contribution}
                            onChange={(e) => setContribution(e.target.value)}
                            className="glass-input py-1 px-3 text-xs w-full placeholder-slate-600"
                          />
                          <button
                            type="submit"
                            disabled={isContributionLoading}
                            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedGoal(null)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setSelectedGoal(goal)}
                          className="w-full text-center py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/40 transition-colors"
                        >
                          Modify Savings Ledger
                        </button>
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

export default SavingsGoals;
