import React from 'react';
import { useGame } from '../../context/GameContext';
import { 
  BookOpen, 
  RotateCcw, 
  Save, 
  Crown,
  Target,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export const GuideTab: React.FC = () => {
  const {
    state,
    openSaveModal,
    resetGame,
    openEndingModal,
    setActiveTab,
    setActivePhoneApp,
    toggleThemeMode
  } = useGame();

  const STORY_CHAPTERS = [
    {
      chapter: "Act I — Chapter 1: The Motel Strip Hustle",
      badge: "Missions 1–4",
      summary:
        "After the federal indictment of Victor Vance fractured the old Vance Cartel, Hyland Point's six districts were left without a supplier. You arrive in town with $250, a rusted 1987 beater sedan, and the keys to Room #104 at the Hyland Motel. Your first objective is survival: cultivate your first OG Kush harvest, weigh dime bags on a digital pocket scale, cut your first batch, and make your first street drops along the Motel Strip."
    },
    {
      chapter: "Act II — Chapter 2: Scaling The Syndicate",
      badge: "Missions 5–7",
      summary:
        "Street flower alone won't topple rival crews. You assemble a borosilicate fractional distillation rig inside your safehouse to refine Golden Shatter Wax and Blue Ice Crystal, upgrade your getaway vehicle at the syndicate garage, and rent a shared-safehouse Commission Partner who walks out your front door to deal hand-to-hand on the avenues."
    },
    {
      chapter: "Act III — Chapter 3: Clean Money & District Dominance",
      badge: "Missions 8–10",
      summary:
        "As your cash reserves swell, DEA task forces and Hyland PD interceptors tighten their patrols. You learn to lose 30-second police pursuits in dark shadow alleys, acquire legitimate front businesses (Speedy Suds Laundromat, Neon Wave Car Wash, Velvet Club) to wash dirty cash into clean bank funds, and bribe local turf gangs for district protection."
    },
    {
      chapter: "Act IV — Chapter 4: Cartel Rivalry & Expansion",
      badge: "Missions 11–13",
      summary:
        "With clean bank capital, you partner with Shopkeeper Gus at the Hyland 24/7 Convenience Mart for bulk organic soil, hydro buckets, and lab solvents, fortify your safehouses with Carbon Air Scrubbers and Reinforced Bank Vaults, and expand into the Cannery Docks, Velvet Penthouse, and Desert Outskirts."
    },
    {
      chapter: "Act V — Chapter 5: The Final Takeover — Crown of Hyland Point (GAME ENDING)",
      badge: "Mission 14 (Finale)",
      summary:
        "The final showdown for control of the city. By building a $15,000+ Total Net Worth (Cash + Bank) across your empire and claiming Mission 14 ('The Final Takeover: Crown of Hyland Point'), you buy out the remaining crooked commissioners, unite all six districts under your banner, and unlock the Cinematic Kingpin Ending & Endgame Sandbox!"
    }
  ];

  const GUIDE_SECTIONS = [
    {
      title: "1. Grow Room, Organic Soil & Plant Botany",
      icon: "🌱",
      content: `Plant seeds in your safehouse hydro buckets (OG Kush, Sour Diesel, Purple Haze). Keep soil moisture above 40% and add NPK fertilizer. Visit Shopkeeper Gus at the 24/7 Convenience Mart (Press B in City Run) to buy Organic Potting Soil + Hydro Grow Buckets (+1 Pot Station) and Soil Top-Dress Kits.`
    },
    {
      title: "2. Chemistry & Fractional Distillation Lab",
      icon: "⚗️",
      content: `Refine raw cannabis into Golden Shatter Wax using butane, or synthesize Blue Ice Crystal with cold medicine and acetone. Use the reaction heat slider to maintain temperature within the green target zone (55°C–75°C) for 95%+ purity and maximum payout.`
    },
    {
      title: "3. Packaging Bench & Burner Phone Orders",
      icon: "⚖️",
      content: `Weigh your raw harvest and lab concentrates into dime bags, eighths, wax jars, and vape cartridges on the packaging bench. Customers on your Dope-OS burner phone will only buy pre-packaged units. Haggle on orders for a +25% payout bonus!`
    },
    {
      title: "4. 3D Open-World City, Map & 24/7 Convenience Mart",
      icon: "🗺️",
      content: `Explore Hyland Point in 3D: drive or walk on foot, press SPACE to jump, press H to enter your walkable 3D Safehouse interior, and press B to shop with Shopkeeper Gus at the 24/7 Convenience Mart (sells everything except drugs: soil, fertilizer, baggies, vials, cutting agents & lab solvents). Check the GPS Map for your Safehouse, Partner, My Car, Convenience Shop, and Police (shown when chasing).`
    },
    {
      title: "5. Police 2s Spotting Delay, 30s Chase & Safe Vault",
      icon: "🚓",
      content: `Police only detect you when you are carrying drugs outside your Safehouse Safe Zone. Stash drugs in your Safehouse Vault to walk 100% clean! When police catch sight of you with drugs, a 2.0-second countdown bar fills before the 30-second chase begins. Police cruisers move at 1/3rd of your top speed.`
    },
    {
      title: "6. Money Laundering, Syndicate Crew & Game Ending",
      icon: "👑",
      content: `Wash dirty street cash through laundering fronts into your Clean Bank so it's protected and ready to buy new Safehouses. Complete the 14 Story Missions on your Burner Phone (or reach $15,000+ Net Worth) to claim the Chapter 5 Finale and trigger the Kingpin Story Ending!`
    }
  ];

  const completedMissionsCount = (state.missions || []).filter(m => m.completed).length;
  const totalMissionsCount = (state.missions || []).length || 14;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-xl font-bold font-hud text-emerald-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>SYNDICATE STORYLINE, KINGPIN HANDBOOK & SETTINGS</span>
            </h3>
            <p className="text-xs text-slate-400">
              Follow the 5-Chapter Storyline of Hyland Point, master every underworld mechanic, and unlock the Kingpin Ending.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleThemeMode}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-hud text-xs transition flex items-center gap-1.5 shadow"
            >
              {state.themeMode === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{state.themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('tab-phone');
                setActivePhoneApp('app-missions');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-hud text-xs transition flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Missions ({completedMissionsCount}/{totalMissionsCount})</span>
            </button>
            <button
              onClick={openEndingModal}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold font-hud text-xs transition flex items-center gap-1.5 shadow-lg"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>View Story Ending</span>
            </button>
            <button
              onClick={openSaveModal}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-hud text-xs transition flex items-center gap-1.5 shadow-glow-green"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Progress</span>
            </button>
            <button
              onClick={resetGame}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-hud text-xs transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Lifetime Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 text-center">
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">TOTAL EARNED CASH</span>
            <span className="text-sm font-bold text-emerald-400 font-hud">${state.stats.totalEarnedCash.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">LAUNDERED BANK</span>
            <span className="text-sm font-bold text-cyan-400 font-hud">${state.stats.totalCleanedBank.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">TOTAL HARVESTED</span>
            <span className="text-sm font-bold text-amber-400 font-hud">{state.stats.totalHarvestsGrams}g Bud</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">DELIVERIES DONE</span>
            <span className="text-sm font-bold text-teal-300 font-hud">{state.stats.totalDeliveries} Drops</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">STORY CAMPAIGN</span>
            <span className="text-sm font-bold text-purple-400 font-hud">{completedMissionsCount}/{totalMissionsCount} Missions</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* THE STORY OF HYLAND POINT & 5-CHAPTER CAMPAIGN ARC                */}
        {/* ================================================================= */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-xl p-5 mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold font-hud text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>📖 THE OFFICIAL STORYLINE: RISE OF THE HYLAND POINT KINGPIN</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete all 5 Story Chapters in the Burner Phone Missions app (or reach $15,000+ Net Worth) to unlock the Final Ending.
              </p>
            </div>
            <button
              onClick={openEndingModal}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-hud font-bold transition flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{state.endingUnlocked ? '👑 Replay Kingpin Ending' : '👑 Preview Story Ending'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STORY_CHAPTERS.map((ch, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  idx === STORY_CHAPTERS.length - 1
                    ? 'md:col-span-2 bg-slate-900/90 border-amber-500/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-hud font-bold text-cyan-300">{ch.chapter}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {ch.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ch.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gameplay Guide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDE_SECTIONS.map((sec, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition space-y-2">
              <h4 className="text-xs sm:text-sm font-bold font-hud text-amber-300 flex items-center gap-2">
                <span className="text-lg">{sec.icon}</span>
                <span>{sec.title}</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{sec.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
