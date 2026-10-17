import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Play, PlusCircle, FolderOpen, Volume2, VolumeX, Trash2, Clock, ShieldCheck, DollarSign, ArrowLeft } from 'lucide-react';

export const MainMenu: React.FC = () => {
  const { 
    state, 
    saveSlots, 
    continueGame, 
    startNewGame, 
    loadGame, 
    deleteSaveSlot, 
    toggleAudio 
  } = useGame();

  const [view, setView] = useState<'main' | 'load'>('main');

  if (!state.showMainMenu) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-black pointer-events-none"></div>

      <div className="relative max-w-lg w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-glow-green text-center">
        
        {/* Title & Branding */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-[11px] font-mono text-emerald-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>HYLAND POINT UNDERWORLD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-hud tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            SCHEDULE I
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">EMPIRE SYNDICATE SIMULATOR</p>
        </div>

        {/* View 1: Main Menu Primary Actions */}
        {view === 'main' && (
          <div className="space-y-3.5 max-w-sm mx-auto">
            {/* Continue Game */}
            <button
              onClick={continueGame}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold font-hud text-sm tracking-wide transition shadow-lg shadow-glow-green active:scale-95 flex items-center justify-center gap-2.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CONTINUE GAME</span>
            </button>

            {/* Start New Game */}
            <button
              onClick={startNewGame}
              className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold font-hud text-sm transition active:scale-95 flex items-center justify-center gap-2.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>START NEW GAME</span>
            </button>

            {/* Load Game */}
            <button
              onClick={() => setView('load')}
              className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold font-hud text-sm transition active:scale-95 flex items-center justify-center gap-2.5"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>LOAD GAME ({saveSlots.length} SAVES)</span>
            </button>

            {/* Audio Toggle & Version */}
            <div className="pt-4 flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80">
              <button
                onClick={toggleAudio}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio Settings</span>
              </button>
              <span>v3.5 React+Vite</span>
            </div>
          </div>
        )}

        {/* View 2: Load Game Slot Browser */}
        {view === 'load' && (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <button
                onClick={() => setView('main')}
                className="text-xs font-hud text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Menu</span>
              </button>
              <span className="text-xs font-mono text-amber-400 font-bold">SELECT SAVE SLOT</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {saveSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-hud">
                  <span className="text-2xl block mb-2 opacity-40">📂</span>
                  No saved games found yet.<br />
                  <span className="text-xs text-slate-400">Save your game while playing to create restore points.</span>
                </div>
              ) : (
                saveSlots.map(slot => (
                  <div
                    key={slot.id}
                    className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold font-hud text-slate-100 truncate">{slot.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{slot.timestamp}</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">${slot.cash.toLocaleString()} Cash</span>
                        <span>•</span>
                        <span className="text-amber-400">{slot.rep} Rep</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => deleteSaveSlot(slot.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 transition"
                        title="Delete Save"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => loadGame(slot.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-hud transition shadow-sm"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
