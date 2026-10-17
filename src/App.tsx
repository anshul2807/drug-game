import React from 'react';
import { useGame } from './context/GameContext';
import { HeaderHUD } from './components/HeaderHUD';
import { AtmosphereBanner } from './components/AtmosphereBanner';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { Modal } from './components/Modal';
import { SaveModal } from './components/SaveModal';
import { MainMenu } from './components/MainMenu';
import { DevPanel } from './components/DevPanel';

import { CultivationTab } from './components/tabs/CultivationTab';
import { BurnerPhoneTab } from './components/tabs/BurnerPhoneTab';
import { CityRunCanvas } from './components/tabs/CityRunCanvas';
import { EmpireTab } from './components/tabs/EmpireTab';
import { GuideTab } from './components/tabs/GuideTab';

export const AppContent: React.FC = () => {
  const { state, toggleDevPanel, closeEndingModal, startNewGame } = useGame();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~' || e.key === 'F2') {
        e.preventDefault();
        toggleDevPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDevPanel]);

  React.useEffect(() => {
    const isLight = state.themeMode === 'light';
    document.body.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('light-mode', isLight);
  }, [state.themeMode]);

  const completedMissionsCount = (state.missions || []).filter(m => m.completed || m.claimed).length;
  const totalMissionsCount = (state.missions || []).length || 14;
  const unlockedUpgradesCount =
    (state.carbonFilterInstalled ? 1 : 0) +
    (state.reinforcedSafeInstalled ? 1 : 0) +
    (state.hydroponicLightsInstalled ? 1 : 0) +
    Math.max(0, (state.safehouseStoreLevel || 1) - 1);
  const activeRunnersCount = (state.streetDealers || []).filter(d => d.hired).length;
  const ownedPropertiesCount =
    (state.properties || []).filter(p => p.owned).length +
    (state.laundering || []).filter(l => l.bought).length;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden relative selection:bg-emerald-500 selection:text-slate-950 font-sans transition-colors duration-200 ${state.themeMode === 'light' ? 'light-mode' : ''}`}>
      {/* Scanline CRT overlay */}
      <div className="scanlines absolute inset-0 z-50 pointer-events-none opacity-40"></div>

      {/* Main Menu Fullscreen Overlay */}
      <MainMenu />

      {/* Save Slot Dialog */}
      <SaveModal />

      {/* Developer Debug & Cheats Panel */}
      <DevPanel />

      {/* Floating Notifications Toast Container */}
      <ToastContainer />

      {/* Modal Dialog */}
      <Modal />

      {/* Cinematic Story Ending Modal */}
      {state.endingModalOpen && (
        <div className="fixed inset-0 z-[95] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold tracking-widest uppercase mb-3">
                🏆 OFFICIAL CAMPAIGN FINALE • CHAPTER V COMPLETE
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-400 tracking-tight font-mono">
                👑 SUPREME KINGPIN OF HYLAND POINT
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                Every district, safehouse, laundering front, and street crew now answers to your syndicate.
              </p>
            </div>

            {/* 5-Act Epilogue Narrative */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-h-64 overflow-y-auto">
              <p>
                <strong className="text-emerald-400 font-mono">ACT I — THE ASHES OF THE OLD CREW:</strong> When the federal raid shattered your uncle&apos;s operation, you arrived in Hyland Point with nothing but a rusty RV, $250 in crumpled bills, and a single grow tent. While rival crews wrote you off, you quietly rebuilt from the ground up in the back alleys of the Motel Strip.
              </p>
              <p>
                <strong className="text-cyan-400 font-mono">ACT II — THE CHEMIST&apos;S BREAKTHROUGH:</strong> Behind reinforced doors and carbon scrubbers, your laboratory mastered high-purity synthesis—engineering amber shatter, blue crystal, golden distillate, and temple hash that commanded top dollar across all six districts.
              </p>
              <p>
                <strong className="text-purple-400 font-mono">ACT III — THE SHADOW NETWORK:</strong> With autonomous street partners holding down corners and Ravi&apos;s 24/7 Convenience Mart supplying bulk agricultural gear and packaging, your distribution web expanded from Downtown high-rises to the heavily patrolled Docks.
              </p>
              <p>
                <strong className="text-amber-400 font-mono">ACT IV — WHITE-COLLAR IMMUNITY:</strong> Through the Coin Laundromat, Neon Nightclub, Luxury Auto Wash, and Offshore Shell Corp, millions in street cash flowed into clean corporate accounts. Even the Hyland Point task force found only legitimate tax filings and airtight alibis.
              </p>
              <p>
                <strong className="text-rose-400 font-mono">ACT V — THE CROWN OF HYLAND POINT:</strong> Tonight, looking out from the top balcony of your Sunset Hills Cartel Villa over the neon skyline, the city is unmistakably yours. You have survived every raid, outsmarted every patrol, and cemented your legacy as the Supreme Kingpin of Hyland Point.
              </p>
            </div>

            {/* Career Syndicate Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Days Survived</div>
                <div className="text-lg font-extrabold font-mono text-amber-400">Day {state.day}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Lifetime Revenue</div>
                <div className="text-lg font-extrabold font-mono text-emerald-400">${(state.stats?.totalEarnedCash || 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Net Worth (Cash+Bank)</div>
                <div className="text-lg font-extrabold font-mono text-cyan-400">${(state.cash + state.bank).toLocaleString()}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Street Respect</div>
                <div className="text-lg font-extrabold font-mono text-purple-400">{state.rep.toLocaleString()} REP</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Missions Completed</div>
                <div className="text-base font-bold font-mono text-slate-200">{completedMissionsCount} / {totalMissionsCount}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Product Harvested</div>
                <div className="text-base font-bold font-mono text-slate-200">{(state.stats?.totalHarvestsGrams || 0).toLocaleString()}g</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Active Crew & Assets</div>
                <div className="text-base font-bold font-mono text-slate-200">{activeRunnersCount} Crew • {ownedPropertiesCount} Assets</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Safehouse Upgrades</div>
                <div className="text-base font-bold font-mono text-slate-200">{unlockedUpgradesCount} Installed</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={startNewGame}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs font-bold bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 transition cursor-pointer"
              >
                🔄 Start New Syndicate Run
              </button>
              <button
                onClick={closeEndingModal}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs sm:text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                👑 Continue in Endgame Sandbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Global HUD Bar */}
      <HeaderHUD />

      {/* Hero Atmospheric Banner */}
      <AtmosphereBanner />

      {/* Main Navigation Tabs */}
      <Navigation />

      {/* Main Game Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        {state.activeTab === 'tab-grow' && <CultivationTab />}
        {state.activeTab === 'tab-phone' && <BurnerPhoneTab />}
        {state.activeTab === 'tab-city' && <CityRunCanvas />}
        {state.activeTab === 'tab-empire' && <EmpireTab />}
        {state.activeTab === 'tab-guide' && <GuideTab />}
      </main>

      {/* Subtle Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-3 px-4 text-center text-[11px] font-mono text-slate-500">
        Schedule I: Hyland Point Syndicate • React + Vite Edition • All Safehouse Data Encrypted
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
