import React, { useState, useEffect, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Calendar,
  X,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

const Transactions = () => {
  const {
    transactions,
    pagination,
    fetchTransactions,
    updateIncome,
    deleteIncome,
    updateExpense,
    deleteExpense
  } = useContext(FinanceContext);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategoryOrSource, setEditCategoryOrSource] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [deletingTransactionType, setDeletingTransactionType] = useState('');

  const categories = [
    'Food', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Medical', 'Rent', 'Utilities', 'Others'
  ];

  // Fetch with current filters on change
  const handleApplyFilters = (page = 1) => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (typeFilter !== 'all') filters.type = typeFilter;
    if (categoryFilter) filters.category = categoryFilter;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    fetchTransactions(page, 10, filters);
  };

  useEffect(() => {
    handleApplyFilters();
  }, [typeFilter, categoryFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleApplyFilters(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      handleApplyFilters(newPage);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    fetchTransactions(1, 10);
  };

  // --- EDIT MODAL TRIGGER ---
  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setEditAmount(tx.amount);
    setEditCategoryOrSource(tx.categoryOrSource);
    setEditDescription(tx.description || '');
    setEditDate(new Date(tx.date).toISOString().substring(0, 10));
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    const id = editingTransaction.id;
    const isIncome = editingTransaction.type === 'income';

    const payload = {
      amount: parseFloat(editAmount),
      description: editDescription,
      date: editDate
    };

    if (isIncome) {
      payload.source = editCategoryOrSource;
      const res = await updateIncome(id, payload);
      if (res.success) setIsEditModalOpen(false);
    } else {
      payload.category = editCategoryOrSource;
      const res = await updateExpense(id, payload);
      if (res.success) setIsEditModalOpen(false);
    }
    handleApplyFilters(pagination.page);
  };

  // --- DELETE TRIGGER ---
  const openDeleteModal = (id, type) => {
    setDeletingTransactionId(id);
    setDeletingTransactionType(type);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (deletingTransactionType === 'income') {
      await deleteIncome(deletingTransactionId);
    } else {
      await deleteExpense(deletingTransactionId);
    }
    setIsDeleteModalOpen(false);
    handleApplyFilters(pagination.page);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Transaction History</h1>
        <p className="text-slate-400 text-sm">Search, filter, and modify your financial logs</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description..."
              className="w-full glass-input pl-11 py-2 text-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 text-sm py-2 px-4 ${
                showFilters ? 'bg-slate-700/80 border-brand-500/50' : ''
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              Filters
            </button>
            {(searchTerm || typeFilter !== 'all' || categoryFilter || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800 animate-fade-in">
            {/* Type Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Transaction Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="glass-input py-2 text-xs bg-slate-900"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Expense Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={typeFilter === 'income'}
                className="glass-input py-2 text-xs bg-slate-900 disabled:opacity-40"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input py-2 text-xs"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input py-2 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table Card */}
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Type</th>
                <th className="p-4">Source/Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No transactions match the active search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-4">
                      {tx.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Inflow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Outflow
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{tx.categoryOrSource}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{tx.description || '-'}</td>
                    <td className="p-4 text-slate-400 font-medium">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className={`p-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg bg-slate-800/40 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(tx.id, tx.type)}
                          className="p-1.5 rounded-lg bg-rose-950/20 text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-slate-900/20 border-t border-slate-800 flex justify-between items-center text-sm">
            <span className="text-slate-500">
              Showing page <span className="text-slate-300 font-semibold">{pagination.page}</span> of{' '}
              <span className="text-slate-300 font-semibold">{pagination.pages}</span> ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-slate-850 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-slate-850 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-4">
              Edit {editingTransaction?.type === 'income' ? 'Income Source' : 'Expense Category'}
            </h3>

            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="glass-input text-sm"
                />
              </div>

              {editingTransaction?.type === 'income' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Income Source</label>
                  <input
                    type="text"
                    required
                    value={editCategoryOrSource}
                    onChange={(e) => setEditCategoryOrSource(e.target.value)}
                    className="glass-input text-sm"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Expense Category</label>
                  <select
                    value={editCategoryOrSource}
                    onChange={(e) => setEditCategoryOrSource(e.target.value)}
                    className="glass-input text-sm bg-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary py-2">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="glass-panel w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Delete Transaction</h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to permanently delete this transaction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary py-2">
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
