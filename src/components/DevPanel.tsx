import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Wrench, 
  X, 
  Zap, 
  ShieldAlert, 
  Sun, 
  Sunset, 
  Moon, 
  DollarSign, 
  PackageCheck, 
  Sparkles, 
  Flame, 
  Navigation,
  Car,
  Clock,
  Camera,
  TrendingUp
} from 'lucide-react';

export const DevPanel: React.FC = () => {
  const { 
    state, 
    toggleDevPanel, 
    updateDevSettings, 
    devAddCash, 
    devSetCash, 
    devSetBank, 
    devMaxInventory, 
    devInstantHarvestPots, 
    devClearHeat, 
    devTeleportToDrop, 
    devCompleteOrderNow,
    devCycleMarketEvent,
    pingLocalContacts
  } = useGame();

  const [activeSubTab, setActiveSubTab] = useState<'speeds' | 'police' | 'world' | 'economy' | 'stash'>('speeds');
  const [customCash, setCustomCash] = useState<string>('');
  const [customBank, setCustomBank] = useState<string>('');

  if (!state.devSettings?.isOpen) return null;

  const dev = state.devSettings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-cyan-500/80 rounded-2xl w-full max-w-3xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-400">
              <Wrench className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-hud text-cyan-300 flex items-center gap-2">
                <span>DEVELOPER DEBUG & CHEAT CONSOLE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                  LIVE OVERRIDE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Control movement speeds, police AI, day/night lighting, camera modes, unlimited cash, and instant deliveries.
              </p>
            </div>
          </div>
          <button
            onClick={toggleDevPanel}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-1 text-xs font-hud">
          <button
            onClick={() => setActiveSubTab('speeds')}
            className={`px-3.5 py-2 rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeSubTab === 'speeds'
                ? 'bg-slate-900 border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Character & Vehicle Speeds</span>
          </button>

          <button
            onClick={() => setActiveSubTab('police')}
            className={`px-3.5 py-2 rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeSubTab === 'police'
                ? 'bg-slate-900 border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Police AI & Heat</span>
          </button>

          <button
            onClick={() => setActiveSubTab('world')}
            className={`px-3.5 py-2 rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeSubTab === 'world'
                ? 'bg-slate-900 border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Day / Night & Camera</span>
          </button>

          <button
            onClick={() => setActiveSubTab('economy')}
            className={`px-3.5 py-2 rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeSubTab === 'economy'
                ? 'bg-slate-900 border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Money & Economy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stash')}
            className={`px-3.5 py-2 rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeSubTab === 'stash'
                ? 'bg-slate-900 border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-purple-400" />
            <span>Stash, Drugs & Drops</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">

          {/* 1. CHARACTER & VEHICLE SPEEDS */}
          {activeSubTab === 'speeds' && (
            <div className="space-y-5">
              {/* Walking Speed */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-hud text-slate-200 flex items-center gap-2">
                    <span>🚶 Character Walking Speed</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {dev.playerWalkSpeed.toFixed(1)} units/frame
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="6.0"
                  step="0.2"
                  value={dev.playerWalkSpeed}
                  onChange={(e) => updateDevSettings({ playerWalkSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => updateDevSettings({ playerWalkSpeed: 1.2 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    Slow Walk (1.2)
                  </button>
                  <button
                    onClick={() => updateDevSettings({ playerWalkSpeed: 1.8 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold"
                  >
                    Default (1.8)
                  </button>
                  <button
                    onClick={() => updateDevSettings({ playerWalkSpeed: 3.2 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold"
                  >
                    Jogger (3.2)
                  </button>
                  <button
                    onClick={() => updateDevSettings({ playerWalkSpeed: 5.5 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold"
                  >
                    Flash Sprint (5.5)
                  </button>
                </div>
              </div>

              {/* Car Speed Multiplier */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-hud text-slate-200 flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>🚗 Vehicle Top Speed Multiplier</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {dev.carSpeedMult.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={dev.carSpeedMult}
                  onChange={(e) => updateDevSettings({ carSpeedMult: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => updateDevSettings({ carSpeedMult: 0.75 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                  >
                    Cruiser (0.75x)
                  </button>
                  <button
                    onClick={() => updateDevSettings({ carSpeedMult: 1.0 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold"
                  >
                    Balanced (1.0x)
                  </button>
                  <button
                    onClick={() => updateDevSettings({ carSpeedMult: 1.8 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold"
                  >
                    Turbo (1.8x)
                  </button>
                  <button
                    onClick={() => updateDevSettings({ carSpeedMult: 3.0 })}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-mono font-bold"
                  >
                    Hyperspeed (3.0x)
                  </button>
                </div>
              </div>

              {/* Car Acceleration Multiplier */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-hud text-slate-200">
                    ⚡ Vehicle Throttle Acceleration
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    {dev.carAccelMult.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={dev.carAccelMult}
                  onChange={(e) => updateDevSettings({ carAccelMult: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* God Mode */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-hud text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>God Mode (Never Busted / Invulnerable)</span>
                  </div>
                  <p className="text-xs text-slate-400">Ignore all police collision interceptions and arrests.</p>
                </div>
                <button
                  onClick={() => updateDevSettings({ godMode: !dev.godMode })}
                  className={`px-4 py-2 rounded-xl text-xs font-hud font-bold transition ${
                    dev.godMode
                      ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dev.godMode ? '✓ GOD MODE ACTIVE' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* 2. POLICE AI & HEAT */}
          {activeSubTab === 'police' && (
            <div className="space-y-5">
              {/* Disable Police Toggle */}
              <div className="bg-slate-950 p-4 rounded-xl border border-red-900/50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-hud text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Freeze & Disable All Police Cruisers</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cops will stop moving, vision cones won't spot you, and pursuits will never trigger.
                  </p>
                </div>
                <button
                  onClick={() => updateDevSettings({ policeDisabled: !dev.policeDisabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-hud font-bold transition ${
                    dev.policeDisabled
                      ? 'bg-red-600 text-white shadow-glow-red animate-pulse'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dev.policeDisabled ? '🚨 COPS FROZEN' : 'POLICE ACTIVE'}
                </button>
              </div>

              {/* Police Patrol Speed */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-hud text-slate-200">
                    🚔 Police Normal Patrol Speed
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {dev.policePatrolSpeed.toFixed(1)} units/frame
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="4.0"
                  step="0.2"
                  value={dev.policePatrolSpeed}
                  onChange={(e) => updateDevSettings({ policePatrolSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Police Chase Speed */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-hud text-slate-200">
                    🚨 Police 30s Pursuit Chase Speed
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                    {dev.policeChaseSpeed.toFixed(1)} units/frame
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="6.0"
                  step="0.2"
                  value={dev.policeChaseSpeed}
                  onChange={(e) => updateDevSettings({ policeChaseSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-red-400 cursor-pointer"
                />
              </div>

              {/* Clear Heat & Strikes Button */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-hud text-slate-200 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Clear City Heat & Reset Arrest Strikes</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Current Heat: {state.heat}% | Strikes: {state.policeChase?.bustedStrikes || 0}/5
                  </p>
                </div>
                <button
                  onClick={devClearHeat}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-hud font-bold transition shadow-glow-green"
                >
                  Clear All Heat (0%)
                </button>
              </div>
            </div>
          )}

          {/* 3. DAY / NIGHT & CAMERA PERSPECTIVE */}
          {activeSubTab === 'world' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-hud text-slate-200 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>24-Hour Day & Night Atmospheric Cycle</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Keep on "Auto Clock Sync" to transition automatically between Daylight (06:00), Sunset (18:00), and Cyberpunk Night (21:00), or lock a manual lighting preset.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => updateDevSettings({ timeOfDay: 'auto' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      dev.timeOfDay === 'auto'
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200 shadow-glow-green'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold font-hud text-xs">Auto 24h Cycle</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Syncs dynamically with in-game clock ({String(state.hour).padStart(2, '0')}:00).</p>
                  </button>

                  <button
                    onClick={() => updateDevSettings({ timeOfDay: 'day' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      dev.timeOfDay === 'day'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-glow-cyan'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span className="font-bold font-hud text-xs">Bright Daylight</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Clear blue sky and high-visibility daytime lighting.</p>
                  </button>

                  <button
                    onClick={() => updateDevSettings({ timeOfDay: 'sunset' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      dev.timeOfDay === 'sunset'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-glow-amber'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sunset className="w-4 h-4 text-orange-400" />
                      <span className="font-bold font-hud text-xs">Golden Sunset</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Warm crimson sky with golden hour building reflections.</p>
                  </button>

                  <button
                    onClick={() => updateDevSettings({ timeOfDay: 'night' })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      dev.timeOfDay === 'night'
                        ? 'border-purple-400 bg-purple-950/40 text-purple-200 shadow-glow-purple'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span className="font-bold font-hud text-xs">Cyberpunk Night</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Dark midnight sky, neon haze, and cruiser strobes.</p>
                  </button>
                </div>
              </div>

              {/* Driving Camera Mode Toggle */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-hud text-cyan-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Driving Camera Perspective (Hotkey: C)</span>
                  </div>
                  <p className="text-xs text-slate-400">Switch between GTA 3rd-Person Chase Cam and 1st-Person Cockpit Dashboard.</p>
                </div>
                <button
                  onClick={() => updateDevSettings({ drivingCameraMode: dev.drivingCameraMode === 'cockpit' ? 'chase' : 'cockpit' })}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-hud font-bold transition"
                >
                  {dev.drivingCameraMode === 'cockpit' ? '🛞 1ST-PERSON COCKPIT' : '🚗 3RD-PERSON CHASE'}
                </button>
              </div>
            </div>
          )}

          {/* 4. MONEY & ECONOMY */}
          {activeSubTab === 'economy' && (
            <div className="space-y-5">
              {/* Quick Cash Buttons */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-hud text-emerald-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Quick Cash Injections</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Current: <strong className="text-emerald-400">${state.cash.toLocaleString()}</strong> Cash | <strong className="text-cyan-400">${state.bank.toLocaleString()}</strong> Bank
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => devAddCash(1000)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-hud text-xs font-bold border border-slate-700 transition"
                  >
                    +$1,000 Cash
                  </button>
                  <button
                    onClick={() => devAddCash(10000)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-hud text-xs font-bold border border-slate-700 transition"
                  >
                    +$10,000 Cash
                  </button>
                  <button
                    onClick={() => devAddCash(50000)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-hud text-xs font-bold border border-slate-700 transition"
                  >
                    +$50,000 Cash
                  </button>
                  <button
                    onClick={() => devAddCash(250000)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-hud text-xs font-bold transition shadow-glow-green"
                  >
                    +$250,000 High Roller
                  </button>
                </div>
              </div>

              {/* Rotate District Market Event */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-hud text-amber-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Cycle District Market Demand Surge</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Active: {state.marketEvent?.title} ({state.marketEvent?.district} • +{Math.round(((state.marketEvent?.multiplier || 1) - 1) * 100)}%)
                  </p>
                </div>
                <button
                  onClick={devCycleMarketEvent}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-hud font-bold transition"
                >
                  Next Market Event
                </button>
              </div>

              {/* Set Exact Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-hud text-slate-300 block">Set Exact Dirty Cash</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={customCash}
                      onChange={(e) => setCustomCash(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const val = parseInt(customCash, 10);
                        if (!isNaN(val)) { devSetCash(val); setCustomCash(''); }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-hud font-bold text-xs"
                    >
                      Set
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-hud text-slate-300 block">Set Exact Clean Bank</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 100000"
                      value={customBank}
                      onChange={(e) => setCustomBank(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const val = parseInt(customBank, 10);
                        if (!isNaN(val)) { devSetBank(val); setCustomBank(''); }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-hud font-bold text-xs"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. STASH, DRUGS & MISSION DROPS */}
          {activeSubTab === 'stash' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  onClick={devMaxInventory}
                  className="p-4 rounded-xl bg-slate-950 border border-purple-500/50 hover:border-purple-400 text-left transition flex items-center justify-between shadow-lg"
                >
                  <div>
                    <h4 className="text-xs font-bold font-hud text-purple-300">📦 Max Out Drug & Adulterant Stash</h4>
                    <p className="text-[11px] text-slate-400">Add +50 of all raw buds, cutting agents, packaged dime/eighth/ounce bags, shatter, crystal, and baggies.</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-hud text-xs font-bold">
                    +50 All
                  </span>
                </button>

                <button
                  onClick={devInstantHarvestPots}
                  className="p-4 rounded-xl bg-slate-950 border border-emerald-500/50 hover:border-emerald-400 text-left transition flex items-center justify-between shadow-lg"
                >
                  <div>
                    <h4 className="text-xs font-bold font-hud text-emerald-300">🌱 Instant Harvest Grow Pots</h4>
                    <p className="text-[11px] text-slate-400">Instantly matures and harvests all safehouse grow pots into loose flower.</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-slate-950 font-hud text-xs font-bold">
                    Harvest
                  </span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold font-hud text-amber-400 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Mission Drops & Teleports</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={devTeleportToDrop}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-hud font-bold text-left transition"
                  >
                    📍 Teleport to Drop Beacon
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">
                      {state.activeOrder ? `${state.activeOrder.name} (${state.activeOrder.district})` : 'No active order'}
                    </span>
                  </button>

                  <button
                    onClick={devCompleteOrderNow}
                    disabled={!state.activeOrder}
                    className={`p-3 rounded-xl border text-xs font-hud font-bold text-left transition ${
                      state.activeOrder
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 hover:bg-emerald-900/80 shadow-glow-green'
                        : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    ✓ Complete Active Order
                    <span className="block text-[10px] font-mono font-normal">
                      Instantly collect payout & rep
                    </span>
                  </button>

                  <button
                    onClick={pingLocalContacts}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-hud font-bold text-left transition"
                  >
                    📱 Spawn Buyer Inquiry
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">
                      Pings new client order on phone
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>HOTKEY: Press ` (Backquote) or F2 to toggle console anytime</span>
          <button
            onClick={toggleDevPanel}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-hud text-xs font-bold transition"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
