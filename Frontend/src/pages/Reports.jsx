import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, Calendar, Loader2, BarChart2 } from 'lucide-react';

const Reports = () => {
  const getInitialMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth());
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null); // 'pdf' or 'excel'

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

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/summary/${selectedMonth}`);
      if (res.data.success) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonth]);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      const response = await api.get(`/reports/export/${type}/${selectedMonth}`, {
        responseType: 'blob'
      });

      const mimeTypes = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };

      const fileExtensions = {
        pdf: 'pdf',
        excel: 'xlsx'
      };

      const blob = new Blob([response.data], { type: mimeTypes[type] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${selectedMonth}.${fileExtensions[type]}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(`Failed to export ${type} report:`, err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Financial Reports</h1>
        <p className="text-slate-400 text-sm">Download official statements and view monthly summary grids</p>
      </div>

      {/* Month Selection Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-400" />
          <span className="text-sm font-semibold text-slate-300">Select Billing Month</span>
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

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : summaryData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Summary Details */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-7 space-y-6">
            <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-400" />
              Financial Stats Summary
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Inflow (Income)</span>
                <div className="text-lg font-bold text-emerald-400">${summaryData.totalIncome.toFixed(2)}</div>
                <span className="text-[10px] text-slate-500">{summaryData.incomeCount} records</span>
              </div>
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Outflow (Expenses)</span>
                <div className="text-lg font-bold text-rose-400">${summaryData.totalExpense.toFixed(2)}</div>
                <span className="text-[10px] text-slate-500">{summaryData.expenseCount} records</span>
              </div>
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Net Savings</span>
                <div className={`text-lg font-bold ${summaryData.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${summaryData.netSavings.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">Rate: {summaryData.savingsRate}%</span>
              </div>
            </div>

            {/* Category table */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300">Category Expense Outlines</h4>
              
              {Object.keys(summaryData.categoryBreakdown).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No expense breakdown data.</div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-900/60 p-3 grid grid-cols-2 font-bold text-slate-400 border-b border-slate-800">
                    <span>Category</span>
                    <span className="text-right">Spent Amount</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {Object.entries(summaryData.categoryBreakdown).map(([cat, amount]) => (
                      <div key={cat} className="p-3 grid grid-cols-2 font-medium text-slate-200">
                        <span>{cat}</span>
                        <span className="text-right font-bold text-slate-300">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Downloads panel */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 text-base">Export Statements</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Generate and download comprehensive summaries of your monthly transaction ledger. Export formats support both spreadsheet audits and presentation-ready pdf layouts.
              </p>
            </div>

            <div className="space-y-4">
              {/* PDF button */}
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading !== null}
                className="w-full btn-primary py-3 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {downloading === 'pdf' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-bold text-sm">Download PDF Document</span>
              </button>

              {/* Excel button */}
              <button
                onClick={() => handleDownload('excel')}
                disabled={downloading !== null}
                className="w-full btn-secondary py-3 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {downloading === 'excel' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-bold text-sm">Download Excel Audit Sheet</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-slate-500 text-sm rounded-2xl">
          Unable to pull billing month stats summary.
        </div>
      )}
    </div>
  );
};

export default Reports;
