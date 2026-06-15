import React, { useState, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { PlusCircle, TrendingUp, TrendingDown, Check, Loader2 } from 'lucide-react';

const IncomeExpense = () => {
  const { addIncome, addExpense } = useContext(FinanceContext);

  const [activeTab, setActiveTab] = useState('expense'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(''); // for income
  const [category, setCategory] = useState('Food'); // for expense
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Medical', 'Rent', 'Utilities', 'Others'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);

    const payload = {
      amount: parsedAmount,
      description,
      date: date ? new Date(date) : new Date()
    };

    let res;
    if (activeTab === 'income') {
      payload.source = source;
      res = await addIncome(payload);
    } else {
      payload.category = category;
      res = await addExpense(payload);
    }

    if (res.success) {
      setSuccessMsg(`Successfully added ${activeTab}!`);
      setAmount('');
      setDescription('');
      setSource('');
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto max-w-xl mx-auto w-full">
      <div className="w-full glass-panel border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-100">Log Transaction</h2>
          <p className="text-slate-400 text-xs mt-1">Keep your ledger accurate by adding a new log</p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex p-1 bg-slate-950 border border-slate-850 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('expense');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'expense'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Outflow (Expense)
          </button>
          <button
            onClick={() => {
              setActiveTab('income');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'income'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Inflow (Income)
          </button>
        </div>

        {/* Message banners */}
        {errorMsg && (
          <div className="px-4 py-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="px-4 py-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* Transaction Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="glass-input text-sm"
            />
          </div>

          {/* Source/Category toggle input */}
          {activeTab === 'income' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Income Source</label>
              <input
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Salary, Freelance, Investment"
                className="glass-input text-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expense Category</label>
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
          )}

          {/* Description input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add short notes..."
              className="glass-input text-sm"
            />
          </div>

          {/* Date input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving log...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Add {activeTab === 'income' ? 'Income' : 'Expense'}
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default IncomeExpense;
