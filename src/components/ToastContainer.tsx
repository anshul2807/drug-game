import React from 'react';
import { useGame } from '../context/GameContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { state, notifications, dismissNotification } = useGame();

  if (state.notificationsMuted || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        let borderClass = 'border-cyan-500/80 bg-slate-900/95 text-cyan-300';
        let Icon = Info;
        if (n.type === 'success') {
          borderClass = 'border-emerald-500/80 bg-slate-900/95 text-emerald-300 shadow-glow-green';
          Icon = CheckCircle2;
        } else if (n.type === 'danger') {
          borderClass = 'border-red-500/80 bg-slate-900/95 text-red-300 shadow-glow-red';
          Icon = AlertOctagon;
        } else if (n.type === 'warning') {
          borderClass = 'border-amber-500/80 bg-slate-900/95 text-amber-300 shadow-glow-amber';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={n.id}
            className={`p-3 rounded-xl border shadow-2xl flex items-center justify-between gap-2.5 text-xs font-mono backdrop-blur-md pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="leading-snug break-words">{n.text}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(n.id);
              }}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition shrink-0 ml-1.5"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
