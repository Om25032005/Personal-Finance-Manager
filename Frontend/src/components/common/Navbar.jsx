import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FinanceContext } from '../../context/FinanceContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Menu, Calendar, User, Sun, Moon } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const { currentMonth, setCurrentMonth } = useContext(FinanceContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Generate a list of recent months for selection (last 12 months)
  const getMonthsList = () => {
    const list = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      list.push({ value: `${y}-${m}`, label: date.toLocaleString('default', { month: 'short', year: 'numeric' }) });
      date.setMonth(date.getMonth() - 1);
    }
    return list;
  };

  const months = getMonthsList();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/85 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30">
      {/* Left section: mobile hamburger & title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100 hidden md:block">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
            Here is your financial status overview
          </p>
        </div>
      </div>

      {/* Right section: month selector and avatar */}
      <div className="flex items-center gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Calendar className="w-4 h-4 text-brand-500 dark:text-brand-400" />
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* User profile avatar link */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            <span className="block text-xs text-slate-500">{user?.email}</span>
          </div>

          {/* Avatar frame */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center border border-slate-300 dark:border-slate-700/50 shadow-md">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ''; // Clear image src to show fallback icon
                }}
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
