import React, { useContext } from 'react';
import { FinanceContext } from '../../context/FinanceContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toastAlert, triggerToast } = useContext(FinanceContext);

  if (!toastAlert) return null;

  const { message, type } = toastAlert;

  const styles = {
    warning: {
      bg: 'bg-rose-950/80 border-rose-500/50 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />
    },
    success: {
      bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
    },
    info: {
      bg: 'bg-slate-900/80 border-brand-500/50 text-slate-200',
      icon: <Info className="w-5 h-5 text-brand-400" />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-md shadow-2xl ${currentStyle.bg} max-w-sm`}>
        {currentStyle.icon}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={() => triggerToast(null)}
          className="text-slate-400 hover:text-slate-100 p-0.5 rounded-lg hover:bg-slate-800/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
