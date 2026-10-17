import React, { useEffect, useRef } from 'react';
import { useGame, getPlayerLevel, getLevelProgressPct } from '../context/GameContext';
import { Volume2, VolumeX, Bell, BellOff, Sun, Moon, Crown, Save, Pause, Play, AlertTriangle, ShieldAlert, Menu, Siren, Wrench, Award, Target, Activity } from 'lucide-react';

export const HeaderHUD: React.FC = () => {
  const { 
    state, 
    setSpeed, 
    togglePause, 
    toggleAudio, 
    toggleNotifications,
    toggleThemeMode,
    openEndingModal,
    openSaveModal, 
    openMainMenu, 
    toggleDevPanel,
    setActiveTab,
    setActivePhoneApp
  } = useGame();

  const fpsValRef = useRef<HTMLSpanElement | null>(null);
  const frameRateHzRef = useRef<HTMLSpanElement | null>(null);
  const frameTimeMsRef = useRef<HTMLSpanElement | null>(null);
  const fpsMinMaxRef = useRef<HTMLSpanElement | null>(null);
  const fpsDotRef = useRef<HTMLSpanElement | null>(null);
  const fpsSparklineRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const frameTimestamps: number[] = [];
    const recentDeltas: number[] = [];
    let lastFrameTime = performance.now();
    let lastUiUpdateTime = lastFrameTime;
    let rafId: number;

    const tick = (now: number) => {
      const rawDtMs = now - lastFrameTime;
      lastFrameTime = now;

      // Record exact high-resolution timestamp in a 1000ms sliding window
      frameTimestamps.push(now);
      while (frameTimestamps.length > 0 && now - frameTimestamps[0] > 1000) {
        frameTimestamps.shift();
      }

      if (rawDtMs > 0.5 && rawDtMs < 500) {
        recentDeltas.push(rawDtMs);
        if (recentDeltas.length > 48) {
          recentDeltas.shift();
        }
      }

      // Update live telemetry DOM every ~80ms so real-time fluctuations are immediately visible
      if (now - lastUiUpdateTime >= 80 && recentDeltas.length >= 2) {
        lastUiUpdateTime = now;

        // 1. Sliding-window 1-second FPS count
        const windowSpanMs = frameTimestamps.length > 1
          ? now - frameTimestamps[0]
          : rawDtMs;
        const exactFps = windowSpanMs > 0
          ? ((frameTimestamps.length - 1) * 1000) / windowSpanMs
          : 1000 / Math.max(1, rawDtMs);
        const rollingFpsInt = Math.max(1, Math.round(exactFps));

        // 2. Instantaneous Frame Rate from latest frame deltas (un-smoothed decimal precision)
        const lastDelta = recentDeltas[recentDeltas.length - 1];
        const prevDelta = recentDeltas[recentDeltas.length - 2] || lastDelta;
        const liveDeltaMs = (lastDelta + prevDelta) * 0.5;
        const instantFrameRateHz = 1000 / Math.max(0.5, liveDeltaMs);

        // 3. Min / Max FPS over the recent window
        let maxDt = recentDeltas[0];
        let minDt = recentDeltas[0];
        for (let i = 1; i < recentDeltas.length; i++) {
          if (recentDeltas[i] > maxDt) maxDt = recentDeltas[i];
          if (recentDeltas[i] < minDt) minDt = recentDeltas[i];
        }
        const lowFps = Math.max(1, Math.round(1000 / maxDt));
        const peakFps = Math.max(1, Math.round(1000 / minDt));

        if (fpsValRef.current) {
          fpsValRef.current.textContent = `${rollingFpsInt} FPS`;
          fpsValRef.current.className =
            rollingFpsInt >= 50
              ? 'font-extrabold font-hud text-emerald-400'
              : rollingFpsInt >= 30
              ? 'font-extrabold font-hud text-amber-400'
              : 'font-extrabold font-hud text-rose-400';
        }
        if (frameRateHzRef.current) {
          frameRateHzRef.current.textContent = `${instantFrameRateHz.toFixed(1)} fps`;
        }
        if (frameTimeMsRef.current) {
          frameTimeMsRef.current.textContent = `${liveDeltaMs.toFixed(2)} ms`;
        }
        if (fpsMinMaxRef.current) {
          fpsMinMaxRef.current.textContent = `[1%Low:${lowFps} Peak:${peakFps}]`;
        }
        if (fpsDotRef.current) {
          fpsDotRef.current.className =
            rollingFpsInt >= 50
              ? 'inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse'
              : rollingFpsInt >= 30
              ? 'inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse'
              : 'inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping';
        }

        // Draw live real-time frame-rate waveform on sparkline canvas
        const canvas = fpsSparklineRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);

            // 60 FPS reference line
            const refY = h - Math.min(h - 2, Math.max(2, (60 / 120) * h));
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.beginPath();
            ctx.moveTo(0, refY);
            ctx.lineTo(w, refY);
            ctx.stroke();

            // Waveform of recent frame rates
            ctx.strokeStyle = rollingFpsInt >= 50 ? '#34d399' : (rollingFpsInt >= 30 ? '#fbbf24' : '#fb7185');
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const len = recentDeltas.length;
            for (let i = 0; i < len; i++) {
              const fRate = Math.min(144, 1000 / Math.max(1, recentDeltas[i]));
              const x = (i / Math.max(1, 47)) * w;
              const y = h - 2 - Math.min(h - 4, (fRate / 120) * (h - 4));
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const hrStr = String(state.hour).padStart(2, '0');
  const minStr = String(state.minute).padStart(2, '0');
  const heatClamped = Math.min(100, Math.max(0, Math.round(state.heat)));
  const strikes = state.policeChase?.bustedStrikes || 0;
  const playerLevel = getPlayerLevel(state.rep);
  const levelPct = getLevelProgressPct(state.rep);
  const isLightMode = state.themeMode === 'light';

  const activeMission = (state.missions || []).find(m => m.id === state.activeMissionId) ||
    (state.missions || []).find(m => !m.completed) ||
    state.missions?.[0];
  const activeObj = activeMission?.objectives.find(o => !o.completed) || activeMission?.objectives[0];

  const handleSpeedToggle = () => {
    const nextSpeed = state.speed === 1 ? 2 : (state.speed === 2 ? 4 : 1);
    setSpeed(nextSpeed);
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-40 px-3 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title, Syndicate Tag & Always-On-Top Live FPS / Frame Rate Counter */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={openMainMenu}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-hud"
            title="Open Main Menu"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-bold">MENU</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-glow-green"></span>
            <h1 className="text-xl sm:text-2xl font-bold font-hud tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              SCHEDULE I
            </h1>
          </div>

          {/* Always-Visible Real-Time Live FPS & Frame Rate Monitor on Top */}
          <div
            className="bg-slate-950/95 border border-emerald-500/50 px-2.5 py-1 rounded-lg flex items-center gap-2 shadow-inner"
            title="Real-Time Sliding-Window FPS, Instantaneous Frame Rate, Frame Time (ms), 1% Low/Peak & Live Waveform"
          >
            <span ref={fpsDotRef} className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Activity className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <canvas
              ref={fpsSparklineRef}
              width={44}
              height={16}
              className="rounded border border-slate-800 bg-slate-950 flex-shrink-0"
            />
            <div className="flex items-center gap-1.5 text-xs font-mono leading-none">
              <span ref={fpsValRef} className="font-extrabold font-hud text-emerald-400">-- FPS</span>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] text-slate-400">RATE:</span>
              <span ref={frameRateHzRef} className="text-[11px] text-cyan-300 font-bold">-- fps</span>
              <span className="text-slate-600">•</span>
              <span ref={frameTimeMsRef} className="text-[10px] text-amber-300 font-mono">-- ms</span>
              <span ref={fpsMinMaxRef} className="hidden md:inline text-[9px] text-slate-400 font-mono"></span>
            </div>
          </div>

          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono hidden xl:inline-block">
            HYLAND POINT SYNDICATE
          </span>
        </div>

        {/* Quick Stats HUD Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono">
          
          {/* Active Mission HUD Tracker */}
          {activeMission && (
            <button
              onClick={() => {
                setActiveTab('tab-phone');
                setActivePhoneApp('app-missions');
              }}
              className="bg-slate-950/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 px-2.5 py-1 rounded flex items-center gap-2 text-left transition shadow-inner group cursor-pointer"
              title="Click to open Syndicate Missions & Contracts"
            >
              <Target className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-hud font-bold">
                  <span className="truncate max-w-[110px] sm:max-w-[150px]">{activeMission.title}</span>
                  {activeMission.completed && !activeMission.claimed && (
                    <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded animate-pulse font-extrabold">REWARD</span>
                  )}
                </div>
                {activeObj && (
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[120px] sm:max-w-[160px]">
                    {activeObj.current}/{activeObj.target} {activeObj.completed ? '✓' : ''}
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Player Level & XP Progress */}
          <div className="bg-slate-950/90 border border-amber-500/40 px-2.5 py-1 rounded flex items-center gap-2" title="Player Level (Unlocks Cultivation Stations, Commission Partners & Safehouses)">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-amber-300 font-hud font-bold">
                <span>LVL {playerLevel}</span>
                <span className="text-slate-400 font-mono">{state.rep} XP</span>
              </div>
              <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${levelPct}%` }} />
              </div>
            </div>
          </div>

          {/* Day & Clock + Speed Controls */}
          <div className="bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded flex items-center gap-1.5 shadow-inner" title="In-Game Time (6 real min per Day / 6 real min per Night at 1x)">
            <span className="font-bold text-slate-300 font-hud">Day {state.day}</span>
            <span className="text-amber-400 font-hud font-bold">{hrStr}:{minStr}</span>
            
            <button 
              onClick={togglePause}
              className="ml-1 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={state.isPaused ? "Resume Time" : "Pause Time"}
            >
              {state.isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
            </button>

            <button 
              onClick={handleSpeedToggle}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-hud border border-slate-700 text-[11px] font-bold transition"
              title="Toggle Speed (1x, 2x, 4x)"
            >
              {state.speed}x
            </button>
          </div>

          {/* Stash Dirty Cash */}
          <div className="bg-slate-950/90 border border-emerald-900/50 px-2.5 py-1 rounded flex items-center gap-1.5 shadow-glow-green" title="Street Cash">
            <span className="text-emerald-500 font-bold text-base">💵</span>
            <div>
              <span className="text-[10px] text-slate-400 block -mb-1 font-mono uppercase">CASH</span>
              <span className="font-bold text-emerald-400 font-hud text-glow-green text-sm sm:text-base">
                ${state.cash.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Clean Laundered Bank Funds */}
          <div className="bg-slate-950/90 border border-cyan-900/50 px-2.5 py-1 rounded flex items-center gap-1.5 shadow-glow-cyan" title="Bank Balance">
            <span className="text-cyan-500 font-bold text-base">🏦</span>
            <div>
              <span className="text-[10px] text-slate-400 block -mb-1 font-mono uppercase">BANK</span>
              <span className="font-bold text-cyan-400 font-hud text-sm sm:text-base">
                ${state.bank.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Police & DEA Heat Meter */}
          <div className="bg-slate-950/90 border border-red-950/60 px-2.5 py-1 rounded flex items-center gap-2" title="Police Heat Level">
            <span className={`font-bold ${heatClamped > 65 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`}>
              {heatClamped > 65 ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </span>
            <div>
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 font-mono">
                <span>HEAT</span>
                <span className={`font-bold ${heatClamped > 60 ? 'text-red-400' : (heatClamped > 30 ? 'text-amber-400' : 'text-emerald-400')}`}>
                  {heatClamped}%
                </span>
              </div>
              <div className="w-16 sm:w-20 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${heatClamped > 70 ? 'bg-red-500 animate-pulse' : (heatClamped > 40 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                  style={{ width: `${heatClamped}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Arrest Strikes Indicator if > 0 */}
          {strikes > 0 && (
            <div className="bg-red-950/80 border border-red-700/80 px-2 py-1 rounded flex items-center gap-1.5 text-xs text-red-300 font-hud animate-pulse" title="Arrest strikes: 5 strikes = BUSTED">
              <Siren className="w-3.5 h-3.5 text-red-400" />
              <span>STRIKES: <strong>{strikes}/5</strong></span>
            </div>
          )}

          {/* Universal Light Mode, Silent Button, Notification Off Button & Save Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleThemeMode}
              className={`px-2 py-1 rounded border transition text-xs font-hud font-bold flex items-center gap-1 ${
                isLightMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title="Toggle Universal Light Mode / Dark Mode across the entire application"
            >
              {isLightMode ? <Sun className="w-3.5 h-3.5 text-slate-950" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isLightMode ? 'LIGHT' : 'DARK'}</span>
            </button>

            <button 
              onClick={toggleAudio}
              className={`px-2 py-1 rounded border transition text-xs font-hud font-bold flex items-center gap-1 ${
                state.audioMuted
                  ? 'bg-red-950/80 border-red-500/70 text-red-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
              }`}
              title={state.audioMuted ? "Silent Mode ON (Click to Unmute Audio)" : "Click to Silence All Audio (Silent Mode)"}
            >
              {state.audioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{state.audioMuted ? 'SILENT' : 'SOUND'}</span>
            </button>

            <button 
              onClick={toggleNotifications}
              className={`px-2 py-1 rounded border transition text-xs font-hud font-bold flex items-center gap-1 ${
                state.notificationsMuted
                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
              }`}
              title={state.notificationsMuted ? "Notifications OFF (Click to Turn On)" : "Click to Turn Off Popup Notifications"}
            >
              {state.notificationsMuted ? <BellOff className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{state.notificationsMuted ? 'NOTIF OFF' : 'NOTIF ON'}</span>
            </button>

            <button 
              onClick={openEndingModal}
              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition text-xs font-hud font-bold flex items-center gap-1"
              title="View Syndicate Story Ending & Career Scorecard"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>ENDING</span>
            </button>

            <button 
              onClick={openSaveModal}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-xs font-hud flex items-center gap-1"
              title="Save Syndicate State"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>SAVE</span>
            </button>

            <button 
              onClick={toggleDevPanel}
              className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition text-xs font-hud font-bold flex items-center gap-1 shadow-glow-cyan"
              title="Open Developer Debug Console (` or F2)"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>DEV</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
