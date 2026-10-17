import React from 'react';
import { useGame, getPlayerLevel, getMaxCultivationStations } from '../../context/GameContext';
import { ChemistryLab } from './ChemistryLab';
import { PackagingBench } from './PackagingBench';
import { Sprout, Droplets, FlaskRound as Flask, Sparkles, Scissors, PlusCircle, Home } from 'lucide-react';

export const CultivationTab: React.FC = () => {
  const { 
    state, 
    plantSeed, 
    waterPot, 
    fertilizePot, 
    harvestPot, 
    quickWaterAll, 
    quickFertilizeAll,
    buyCultivationStation,
    setInsideSafehouse,
    setActiveTab
  } = useGame();

  const activeProperty = state.properties.find(p => p.id === state.activePropertyId) ||
                         state.properties.slice().reverse().find(p => p.owned) ||
                         state.properties[0];
  const maxPots = activeProperty.maxPots || 4;
  const playerLevel = getPlayerLevel(state.rep);
  const maxAllowedByLevel = getMaxCultivationStations(playerLevel, maxPots);
  const canBuyMore = state.pots.length < maxAllowedByLevel && (state.cash + state.bank) >= 250;

  return (
    <div className="space-y-6">
      {/* Grow Room & Cultivation Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-hud text-emerald-400 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>CULTIVATION STATIONS — {activeProperty.name.toUpperCase()}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300">
                LVL {playerLevel} ({state.pots.length}/{maxAllowedByLevel} UNLOCKED)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tend grow pots, manage moisture & nutrients, and purchase new Cultivation Stations ($250) as your Level increases!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setInsideSafehouse(true);
                setActiveTab('tab-city');
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-hud font-bold transition flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Walk Inside 3D Safehouse</span>
            </button>
            <button
              disabled={!canBuyMore}
              onClick={buyCultivationStation}
              className={`px-3 py-1.5 rounded-lg border text-xs font-hud font-bold transition flex items-center gap-1.5 ${
                canBuyMore
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-slate-950 shadow-glow-green'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buy +1 Station ($250)</span>
            </button>
            <button
              onClick={quickWaterAll}
              className="px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-blue-300 text-xs font-hud transition flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Water All</span>
            </button>
            <button
              onClick={quickFertilizeAll}
              className="px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/50 text-amber-300 text-xs font-hud transition flex items-center gap-1.5"
            >
              <Flask className="w-3.5 h-3.5 text-amber-400" />
              <span>Feed All ({state.inv.fertilizer})</span>
            </button>
          </div>
        </div>

        {/* Pots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.pots.slice(0, maxPots).map(pot => {
            const isReady = pot.ready || pot.progress >= 100;
            const isEmpty = pot.stage === 'empty';

            if (isEmpty) {
              return (
                <div 
                  key={pot.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                      <span>STATION #{pot.id}</span>
                      <span className="text-slate-600">UNSEEDED</span>
                    </div>
                    <div className="h-28 flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-slate-800/80 rounded-lg mb-3">
                      <span className="text-2xl mb-1 opacity-60">🪴</span>
                      <span className="text-xs text-slate-400 font-hud">Empty Cultivation Pot</span>
                      <span className="text-[10px] text-slate-500">Select seed to plant</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-mono">SELECT SEED:</label>
                    <select 
                      id={`seed-select-${pot.id}`}
                      defaultValue="seeds_og"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-hud"
                    >
                      <option value="seeds_og">OG Kush ({state.inv.seeds_og} seeds)</option>
                      <option value="seeds_sour">Sour Diesel ({state.inv.seeds_sour} seeds)</option>
                      <option value="seeds_purple">Purple Haze ({state.inv.seeds_purple} seeds)</option>
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById(`seed-select-${pot.id}`) as HTMLSelectElement;
                        plantSeed(pot.id, select.value);
                      }}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-hud text-xs transition mt-1 shadow-glow-green"
                    >
                      PLANT SEED
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={pot.id}
                className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition ${
                  isReady ? 'border-emerald-500/60 shadow-glow-green' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">STATION #{pot.id}</span>
                    <span className={isReady ? 'text-emerald-400 font-bold font-hud animate-pulse' : 'text-slate-300 font-hud'}>
                      {isReady ? 'READY TO HARVEST' : `${pot.strain} (${pot.stage.toUpperCase()})`}
                    </span>
                  </div>

                  {/* Plant Stage Graphic */}
                  <div className="h-24 bg-slate-900/60 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center mb-3 relative overflow-hidden">
                    <span className={`text-3xl transition-transform ${isReady ? 'scale-125' : ''}`}>
                      {isReady ? '🌿' : (pot.progress > 50 ? '🪴' : '🌱')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 font-bold">
                      {Math.round(pot.progress)}% Matured
                    </span>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${pot.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Moisture & Nutrient Meters */}
                  <div className="space-y-1.5 text-[11px] font-mono mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">MOISTURE:</span>
                      <span className={pot.water < 25 ? 'text-red-400 font-bold' : 'text-blue-400'}>
                        {Math.round(pot.water)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-blue-500 h-full" style={{ width: `${pot.water}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-slate-400">NUTRIENTS:</span>
                      <span className="text-amber-400">{Math.round(pot.nutrients)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-amber-500 h-full" style={{ width: `${pot.nutrients}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Pot Actions */}
                <div className="pt-2 border-t border-slate-800/80">
                  {isReady ? (
                    <button
                      onClick={() => harvestPot(pot.id)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold font-hud text-xs transition shadow-lg shadow-glow-green flex items-center justify-center gap-1.5"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>HARVEST (~{pot.yieldAmount}g)</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => waterPot(pot.id)}
                        className="py-1 rounded bg-blue-900/40 hover:bg-blue-800 border border-blue-700/50 text-blue-300 font-hud text-[11px] transition flex items-center justify-center gap-1"
                      >
                        <Droplets className="w-3 h-3" />
                        <span>Water (+40)</span>
                      </button>
                      <button
                        onClick={() => fertilizePot(pot.id)}
                        className="py-1 rounded bg-amber-900/40 hover:bg-amber-800 border border-amber-700/50 text-amber-300 font-hud text-[11px] transition flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Feed (+45)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Purchase Next Cultivation Station Card */}
          {state.pots.length < maxPots && (
            <div className="bg-slate-950/60 border-2 border-dashed border-emerald-500/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[240px]">
              <PlusCircle className="w-8 h-8 text-emerald-400 opacity-80" />
              <div className="text-xs font-hud font-bold text-slate-200">
                EXPAND CULTIVATION STATION #{state.pots.length + 1}
              </div>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                {state.pots.length < maxAllowedByLevel
                  ? `Unlocked at Level ${playerLevel}! Add another hydroponic grow station to your safehouse.`
                  : `Reach Player Level ${playerLevel + 1} (earn more Rep) to unlock this station slot.`}
              </p>
              <button
                disabled={!canBuyMore}
                onClick={buyCultivationStation}
                className={`mt-1 px-4 py-2 rounded-lg font-hud font-bold text-xs transition ${
                  canBuyMore
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-green'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {state.pots.length < maxAllowedByLevel ? 'Purchase Station ($250)' : `Requires Level ${playerLevel + 1}`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Chemistry Lab & Packaging Bench Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChemistryLab />
        <PackagingBench />
      </div>
    </div>
  );
};
