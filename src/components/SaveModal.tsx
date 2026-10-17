import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Save, PlusCircle, CheckCircle, Trash2, X, Clock, DollarSign, Calendar } from 'lucide-react';

export const SaveModal: React.FC = () => {
  const { state, saveSlots, saveGame, closeSaveModal, deleteSaveSlot } = useGame();
  const [customName, setCustomName] = useState('');
  const [activeMode, setActiveMode] = useState<'new' | 'overwrite'>(saveSlots.length > 0 ? 'overwrite' : 'new');

  if (!state.saveModalOpen) return null;

  const defaultNewName = `Slot ${saveSlots.length + 1}: Day ${state.day} ($${state.cash.toLocaleString()})`;

  const handleSaveNew = () => {
    saveGame(true, undefined, customName.trim() || defaultNewName);
    setCustomName('');
  };

  const handleOverwrite = (slotId: string) => {
    saveGame(false, slotId);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative shadow-glow-amber animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeSaveModal}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-amber-400 font-bold font-hud text-lg mb-2">
          <Save className="w-5 h-5 text-amber-400" />
          <span>SAVE GAME STATE</span>
        </div>
        <p className="text-xs text-slate-400 mb-5 font-sans">
          Choose whether to store your progress in a new save slot or overwrite an existing save.
        </p>

        {/* Choice Switcher Tabs */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 mb-4 font-hud text-xs">
          <button
            onClick={() => setActiveMode('new')}
            className={`flex-1 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
              activeMode === 'new'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Slot</span>
          </button>
          <button
            onClick={() => setActiveMode('overwrite')}
            disabled={saveSlots.length === 0}
            className={`flex-1 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
              activeMode === 'overwrite'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            } ${saveSlots.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Overwrite Existing ({saveSlots.length})</span>
          </button>
        </div>

        {/* Mode A: Save As New Slot */}
        {activeMode === 'new' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                SLOT LABEL (OPTIONAL):
              </label>
              <input
                type="text"
                value={customName}
                placeholder={defaultNewName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-hud focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Current In-Game Date:</span>
                <span className="text-slate-200 font-bold">Day {state.day} (08:00)</span>
              </div>
              <div className="flex justify-between">
                <span>Cash on Hand:</span>
                <span className="text-emerald-400 font-bold">${state.cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Clean Bank Balance:</span>
                <span className="text-cyan-400 font-bold">${state.bank.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeSaveModal}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-hud transition shadow-glow-green"
              >
                Save New Slot
              </button>
            </div>
          </div>
        )}

        {/* Mode B: Overwrite Existing Slot */}
        {activeMode === 'overwrite' && (
          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {saveSlots.map(slot => (
                <div
                  key={slot.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold font-hud text-slate-200 truncate">{slot.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{slot.timestamp}</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">${slot.cash.toLocaleString()} Cash</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => deleteSaveSlot(slot.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 transition"
                      title="Delete slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOverwrite(slot.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-hud transition"
                    >
                      Overwrite
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={closeSaveModal}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
