import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  PlusCircle,
  TrendingDown,
  Target,
  FileText,
  Brain,
  User,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Transactions', path: '/transactions', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { name: 'Income & Expense', path: '/income-expense', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'Budgets', path: '/budgets', icon: <TrendingDown className="w-5 h-5" /> },
    { name: 'Savings Goals', path: '/goals', icon: <Target className="w-5 h-5" /> },
    { name: 'AI Insights', path: '/ai-insights', icon: <Brain className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-slate-900 dark:from-brand-100 to-brand-500 bg-clip-text text-transparent">
              WealthFlow
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/10 dark:from-brand-500/20 to-indigo-500/5 dark:to-indigo-500/10 text-brand-600 dark:text-brand-100 border-l-4 border-brand-500 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User logout section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-300 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
