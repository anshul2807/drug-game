import React from 'react';
import { useGame } from '../context/GameContext';
import { Home, ShieldCheck } from 'lucide-react';

export const AtmosphereBanner: React.FC = () => {
  const { state } = useGame();

  // Find active / most prestigious owned property
  const currentProperty = state.properties.slice().reverse().find(p => p.owned) || state.properties[0];

  let rankTitle = "Street Hustler";
  let tierBadge = "Tier 1";
  if (state.rep >= 200) { rankTitle = "Kingpin of Hyland Point"; tierBadge = "Tier 5 (Max)"; }
  else if (state.rep >= 100) { rankTitle = "Cartel Syndicate Boss"; tierBadge = "Tier 4"; }
  else if (state.rep >= 50) { rankTitle = "Regional Distributor"; tierBadge = "Tier 3"; }
  else if (state.rep >= 25) { rankTitle = "Trusted Street Supplier"; tierBadge = "Tier 2"; }

  return (
    <div className="relative h-28 sm:h-36 md:h-44 w-full overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Background Neon Atmospheric Image Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-95"></div>
      
      {/* City Neon Grid Lines */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      
      {/* Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

      {/* Banner Content */}
      <div className="absolute bottom-3 left-4 sm:left-8 right-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Home className="w-3.5 h-3.5 inline text-emerald-400" />
            <span>PRIMARY SAFEHOUSE:</span>
            <span className="text-white font-bold">{currentProperty.name} ({currentProperty.district})</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold font-hud text-white tracking-wide drop-shadow-md">
            HYLAND POINT UNDERWORLD
          </h2>
        </div>

        {/* Syndicate Rank Badge */}
        <div className="bg-slate-900/85 border border-slate-700/80 px-3 py-1.5 rounded-lg backdrop-blur text-right shadow-lg">
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>CRIMINAL REPUTATION</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-amber-400 font-hud text-glow-amber">
            {rankTitle}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {tierBadge} • <span className="text-emerald-400 font-bold">{state.rep} Rep</span>
          </div>
        </div>
      </div>
    </div>
  );
};
