import React from 'react';
import { useGame } from '../context/GameContext';
import { Sprout, Smartphone, MapPin, Building2, BookOpen } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { state, setActiveTab } = useGame();

  const readyPotsCount = state.pots.filter(p => p.ready).length;
  const pendingOrdersCount = state.messages.filter(m => m.status === 'pending').length;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-2 sm:px-4 shadow-sm sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2">
        {/* Tab 1: Grow & Lab */}
        <button
          onClick={() => setActiveTab('tab-grow')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium font-hud transition flex items-center gap-2 border whitespace-nowrap ${
            state.activeTab === 'tab-grow'
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-glow-green'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>GROW & LAB</span>
          {readyPotsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-slate-950 font-bold animate-pulse">
              {readyPotsCount} READY
            </span>
          )}
        </button>

        {/* Tab 2: Burner Phone */}
        <button
          onClick={() => setActiveTab('tab-phone')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium font-hud transition flex items-center gap-2 border whitespace-nowrap ${
            state.activeTab === 'tab-phone'
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-glow-green'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>BURNER PHONE</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Tab 3: City Run */}
        <button
          onClick={() => setActiveTab('tab-city')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium font-hud transition flex items-center gap-2 border whitespace-nowrap ${
            state.activeTab === 'tab-city'
              ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>CITY RUN (ACTIVE MAP)</span>
          {state.activeOrder && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold animate-pulse">
              DROP
            </span>
          )}
        </button>

        {/* Tab 4: Empire & Vault */}
        <button
          onClick={() => setActiveTab('tab-empire')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium font-hud transition flex items-center gap-2 border whitespace-nowrap ${
            state.activeTab === 'tab-empire'
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-glow-green'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>EMPIRE & VAULT</span>
        </button>

        {/* Tab 5: Guide */}
        <button
          onClick={() => setActiveTab('tab-guide')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium font-hud transition flex items-center gap-2 border whitespace-nowrap ${
            state.activeTab === 'tab-guide'
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-glow-green'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>GUIDE</span>
        </button>
      </div>
    </nav>
  );
};
