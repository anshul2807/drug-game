import React, { useState } from 'react';
import { useGame, LAB_RECIPES, CUTTING_AGENTS } from '../../context/GameContext';
import { RecipeKey } from '../../types/game';
import { FlaskConical, Flame, CheckCircle, Sparkles, Scale, AlertTriangle } from 'lucide-react';

const CUTTABLE_RAW_ITEMS = [
  { key: 'raw_bud_og', label: 'OG Kush Flower' },
  { key: 'raw_bud_sour', label: 'Sour Diesel Flower' },
  { key: 'raw_bud_purple', label: 'Purple Haze Flower' },
  { key: 'raw_shatter', label: 'Golden Shatter' },
  { key: 'raw_crystal', label: 'Blue Ice Crystal' },
  { key: 'raw_distillate', label: 'THC Distillate' },
  { key: 'raw_hash', label: 'Pressed Hash' }
];

export const ChemistryLab: React.FC = () => {
  const { state, selectLabRecipe, setLabHeatSlider, startLabSynthesis, cutProduct } = useGame();
  const [selectedRaw, setSelectedRaw] = useState<string>('raw_bud_og');

  const activeRecipe = LAB_RECIPES[state.lab.activeRecipe];
  const inSafeZone = state.lab.temp >= state.lab.targetMin && state.lab.temp <= state.lab.targetMax;
  const purity = state.batchPurity ?? 92;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-base font-bold font-hud text-cyan-400 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <span>CHEMISTRY & EXTRACTION LAB</span>
          </h3>
          <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
            state.lab.isCooking 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {state.lab.isCooking ? 'SYNTHESIS ACTIVE' : 'IDLE'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Refine raw plant material into golden shatter wax, synthesize Schedule I blue ice crystal, or stretch product weight on the cutting table.
        </p>

        {/* Recipe Selection Grid */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-hud text-slate-300">SELECT SYNTHESIS FORMULA</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(LAB_RECIPES) as RecipeKey[]).map(key => {
              const r = LAB_RECIPES[key];
              const isSelected = state.lab.activeRecipe === key;
              return (
                <button
                  key={key}
                  disabled={state.lab.isCooking}
                  onClick={() => selectLabRecipe(key)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-glow-cyan'
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60'
                  } ${state.lab.isCooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-bold text-slate-200 font-hud">{r.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{r.reqText}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">
                    Yield: {r.yieldQty}g (${r.unitValue}/g)
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature Reaction Chamber Minigame */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>REACTION TEMPERATURE:</span>
            </span>
            <span className={`font-bold font-hud text-sm ${
              inSafeZone ? 'text-emerald-400' : (state.lab.temp > state.lab.targetMax ? 'text-red-400 animate-pulse' : 'text-blue-400')
            }`}>
              {Math.round(state.lab.temp)}°C {inSafeZone ? '(OPTIMAL)' : '(ADJUST HEAT)'}
            </span>
            <span className="text-emerald-400 font-bold font-hud flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cook Purity: {Math.round(state.lab.purity)}%</span>
            </span>
          </div>

          {/* Temperature Slider */}
          <div>
            <input 
              type="range"
              min="20"
              max="120"
              value={state.lab.temp}
              onChange={(e) => setLabHeatSlider(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1 mt-0.5">
              <span>20°C (Sluggish)</span>
              <span className="text-emerald-400 font-bold font-hud">TARGET: {activeRecipe.targetMin}°C - {activeRecipe.targetMax}°C</span>
              <span className="text-red-400">120°C (Boilover Risk)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>SYNTHESIS PROGRESS</span>
              <span className="text-cyan-400 font-bold">{Math.round(state.lab.progress)}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-200"
                style={{ width: `${state.lab.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-amber-400">
              Requires: {activeRecipe.reqText}
            </span>
            <button
              disabled={state.lab.isCooking}
              onClick={startLabSynthesis}
              className={`px-4 py-2 rounded-lg font-bold font-hud text-xs transition flex items-center gap-1.5 ${
                state.lab.isCooking
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-glow-cyan'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{state.lab.isCooking ? 'SYNTHESIS IN PROGRESS...' : 'START SYNTHESIS'}</span>
            </button>
          </div>
        </div>

        {/* Product Cutting & Adulteration Table ("The Cook" Mechanic) */}
        <div className="mt-4 bg-slate-950/90 border border-purple-500/30 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-hud font-bold text-purple-300 tracking-wide">
                PRODUCT CUTTING & ADULTERATION MIXER
              </span>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
              purity >= 85
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : purity >= 60
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-red-950/80 border-red-500/50 text-red-300 animate-pulse'
            }`}>
              BATCH PURITY: {purity}% {purity >= 85 ? '(+22% TIPS & ADDICTION)' : purity < 60 ? '(OD & HEAT RISK!)' : '(STANDARD)'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Stretch 5g of raw product with an adulterant from SilkHub to create free extra grams. High purity (85%+) hooks customers and pays premium tips; heavy cutting (&lt;60%) risks customer overdose and police heat!
          </div>

          {/* Select Raw Stash to Cut */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CUTTABLE_RAW_ITEMS.map(item => {
              const count = state.inv[item.key] || 0;
              return (
                <button
                  key={item.key}
                  onClick={() => setSelectedRaw(item.key)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                    selectedRaw === item.key
                      ? 'bg-purple-950/80 border-purple-400 text-purple-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}: <strong className="text-white">{count}g</strong>
                </button>
              );
            })}
          </div>

          {/* Cutting Agent Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CUTTING_AGENTS).map(([agentKey, agent]) => {
              const agentStock = state.inv[agentKey] || 0;
              const rawStock = state.inv[selectedRaw] || 0;
              const canCut = agentStock >= 1 && rawStock >= 5;
              return (
                <button
                  key={agentKey}
                  disabled={!canCut}
                  onClick={() => cutProduct(selectedRaw, agentKey)}
                  className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                    canCut
                      ? 'bg-slate-900 hover:bg-purple-950/50 border-purple-500/40 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-hud font-bold text-purple-300">{agent.name}</span>
                    <span className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      Stock: {agentStock}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1">{agent.desc}</div>
                </button>
              );
            })}
          </div>

          {purity < 60 && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-300 bg-red-950/40 border border-red-500/40 px-2.5 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Warning: Batch purity is below 60%! Harvesting fresh plants or cooking clean lab batches will restore purity.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
