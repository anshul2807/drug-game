import React, { useState } from 'react';
import {
  useGame,
  getPlayerLevel,
  getLevelProgressPct,
  getMaxCultivationStations,
  getCarriedDrugsCount,
  getVaultDrugsCount
} from '../../context/GameContext';
import { 
  Home, 
  Sprout, 
  Briefcase, 
  MapPin, 
  Check, 
  PackagePlus,
  DollarSign,
  AlertOctagon,
  DoorOpen,
  Award,
  PlusCircle,
  Lock,
  ShoppingBag,
  ShieldCheck,
  Wind,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';

const CONSIGNMENT_ITEMS = [
  { key: 'pack_og_dime', label: 'OG Dime Bags' },
  { key: 'pack_og_eighth', label: 'OG Eighths' },
  { key: 'pack_sour_dime', label: 'Sour Dime Bags' },
  { key: 'pack_shatter_gram', label: 'Shatter Wax Jars' },
  { key: 'pack_crystal_gram', label: 'Blue Ice Bags' },
  { key: 'pack_vape_cart', label: 'THC Vape Carts' },
  { key: 'raw_bud_og', label: 'Loose OG Bud (g)' }
];

export const EmpireTab: React.FC = () => {
  const { 
    state, 
    buyProperty, 
    selectProperty,
    setInsideSafehouse,
    setActiveTab,
    buyCultivationStation,
    upgradeSafehouseStore,
    buySafehouseUpgrade,
    depositAllDrugsToVault,
    withdrawAllDrugsFromVault,
    hireDealer,
    supplyDealer,
    collectDealerCash,
    bailDealer
  } = useGame();

  const [selectedSupplyItem, setSelectedSupplyItem] = useState<string>('pack_og_dime');

  const playerLevel = getPlayerLevel(state.rep);
  const levelProgress = getLevelProgressPct(state.rep);
  const activeProp = state.properties.find(p => p.id === state.activePropertyId) ||
                     state.properties.slice().reverse().find(p => p.owned) ||
                     state.properties[0];
  const maxStationsForLevel = getMaxCultivationStations(playerLevel, activeProp.maxPots);
  const canBuyStation = state.pots.length < maxStationsForLevel && (state.cash + state.bank) >= 250;
  const storeLevel = state.safehouseStoreLevel || 1;
  const storeDiscountPct = storeLevel === 1 ? 0 : storeLevel === 2 ? 15 : storeLevel === 3 ? 25 : 35;
  const nextStoreCost = storeLevel === 1 ? 500 : storeLevel === 2 ? 1500 : 3500;
  const carriedDrugs = getCarriedDrugsCount(state.inv, Boolean(state.activeOrder));
  const vaultDrugs = getVaultDrugsCount(state.safehouseVault);

  const handleEnterHouseInterior = (propId: string) => {
    selectProperty(propId);
    setInsideSafehouse(true);
    setActiveTab('tab-city');
  };

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. PLAYER LEVEL & UPGRADE PROGRESSION BANNER         */}
      {/* ==================================================== */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-hud font-extrabold text-lg shadow-glow-amber">
              L{playerLevel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-hud text-white">
                  PLAYER LEVEL {playerLevel} — UPGRADES, SAFEHOUSE STORE & PARTNERS
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  {state.rep} REP XP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upgrade your <strong className="text-emerald-300">Cultivation Stations</strong>, <strong className="text-pink-300">In-House Safehouse Store & Drug Vault</strong>, <strong className="text-purple-300">Shared-Safehouse Street Partner</strong>, and <strong className="text-cyan-300">3D Safehouses</strong>.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Level (Lvl {playerLevel + 1})</span>
              </span>
              <span className="text-amber-400 font-bold">{levelProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. PURCHASE CULTIVATION STATIONS & SAFEHOUSE STORE   */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-hud text-emerald-400 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>1A. CULTIVATION STATION UPGRADES</span>
            </h3>
            <p className="text-xs text-slate-400">
              Each Player Level unlocks additional Cultivation Station slots inside your active Safehouse (<strong className="text-slate-200">{activeProp.name}</strong>).
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                OWNED: <strong className="text-emerald-400 font-hud">{state.pots.length}</strong>
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                LVL {playerLevel} CAP: <strong className="text-amber-400 font-hud">{maxStationsForLevel}</strong>
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                HOUSE MAX: <strong className="text-cyan-400 font-hud">{activeProp.maxPots}</strong>
              </span>
            </div>
          </div>

          <button
            disabled={!canBuyStation}
            onClick={buyCultivationStation}
            className={`w-full py-2.5 rounded-xl font-hud font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg ${
              canBuyStation
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-green cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {state.pots.length >= activeProp.maxPots
                ? `Safehouse Full (${activeProp.maxPots}/${activeProp.maxPots})`
                : state.pots.length >= maxStationsForLevel
                ? `Reach Level ${playerLevel + 1} for Next Station`
                : 'Buy +1 Cultivation Station ($250)'}
            </span>
          </button>
        </section>

        <section className="bg-slate-900 border border-pink-500/40 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-hud text-pink-400 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              <span>1B. IN-HOUSE SAFEHOUSE STORE & DRUG VAULT</span>
            </h3>
            <p className="text-xs text-slate-400">
              Upgrade the 3D Store & Steel Vault inside your Safehouse for bulk supply discounts (<strong className="text-pink-300">{storeDiscountPct}% OFF</strong>{storeLevel >= 4 ? ' + 2x Bulk Bundle!' : ''}) and stash drugs in the Vault so police cannot detect you on the street!
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                STORE TIER: <strong className="text-pink-400 font-hud">LVL {storeLevel}/4</strong>
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                CARRIED DRUGS: <strong className={carriedDrugs > 0 ? 'text-amber-400 font-hud' : 'text-emerald-400 font-hud'}>{carriedDrugs}</strong>
              </span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                VAULT SAFE: <strong className="text-cyan-400 font-hud">{vaultDrugs}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {storeLevel < 4 ? (
              <button
                onClick={upgradeSafehouseStore}
                className="flex-1 py-2.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-hud font-bold text-xs transition shadow-lg"
              >
                ⬆️ Upgrade Store to Lvl {storeLevel + 1} (${nextStoreCost.toLocaleString()})
              </button>
            ) : (
              <div className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 border border-pink-500/40 text-pink-300 font-hud font-bold text-xs text-center">
                ✅ MAX LEVEL 4 STORE (35% OFF + 2x BULK)
              </div>
            )}
            <button
              disabled={carriedDrugs <= 0}
              onClick={depositAllDrugsToVault}
              className={`py-2.5 px-3 rounded-xl font-hud font-bold text-xs transition flex items-center gap-1 ${
                carriedDrugs > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Stash all carried drugs in your Safehouse Vault so Police cannot detect you!"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Stash Drugs ({carriedDrugs})</span>
            </button>
            {vaultDrugs > 0 && (
              <button
                onClick={withdrawAllDrugsFromVault}
                className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs transition"
              >
                Withdraw ({vaultDrugs})
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ==================================================== */}
      {/* 1C. SAFEHOUSE ODOR & TACTICAL STRUCTURAL UPGRADES    */}
      {/* ==================================================== */}
      <section className="bg-slate-900 border border-teal-500/40 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-hud text-teal-400 flex items-center gap-2">
              <Wind className="w-5 h-5 text-teal-400" />
              <span>1C. SAFEHOUSE ODOR & TACTICAL STRUCTURAL UPGRADES</span>
            </h3>
            <p className="text-xs text-slate-400">
              Active weed cultivation pots and lab cooking generate odor. When odor exceeds 75 ppm, smell leaks to the street and generates police heat! Install scrubbers, high-yield lights, and reinforced safes.
            </p>
          </div>

          {/* Odor Status Gauge */}
          <div className="w-full sm:w-72 bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Odor Level:</span>
              </span>
              <span className={`font-hud font-bold ${
                (state.safehouseOdor || 0) > 75 
                  ? 'text-red-400 animate-pulse' 
                  : (state.safehouseOdor || 0) > 40 
                  ? 'text-amber-400' 
                  : 'text-emerald-400'
              }`}>
                {state.safehouseOdor || 0} PPM {state.carbonFilterInstalled ? '(SCRUBBED)' : ''}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  (state.safehouseOdor || 0) > 75 
                    ? 'bg-red-500' 
                    : (state.safehouseOdor || 0) > 40 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, state.safehouseOdor || 0)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>0 PPM (Neutral)</span>
              <span>75 PPM (Smell Leaks)</span>
            </div>
          </div>
        </div>

        {/* 3 Tactical Upgrade Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Upgrade 1: Carbon Air Scrubber */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud font-bold text-teal-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>Carbon Air Scrubber</span>
                </span>
                {state.carbonFilterInstalled ? (
                  <span className="text-[10px] font-hud font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded">
                    INSTALLED ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-300">$800</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Activated charcoal filtration system that scrubs grow-room terpene odors and lab vapors before they leak to street vents.
              </p>
              <div className="text-[10px] font-mono text-emerald-400">
                • 100% Odor Neutralization<br />
                • Prevents street odor heat spikes
              </div>
            </div>

            <button
              disabled={state.carbonFilterInstalled || (state.cash + state.bank) < 800}
              onClick={() => buySafehouseUpgrade('carbon_filter')}
              className={`w-full py-2 rounded-lg font-hud font-bold text-xs transition ${
                state.carbonFilterInstalled
                  ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-default'
                  : (state.cash + state.bank) >= 800
                  ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer shadow-md'
                  : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              {state.carbonFilterInstalled ? 'ACTIVE IN SAFEHOUSE' : 'Install Scrubber ($800)'}
            </button>
          </div>

          {/* Upgrade 2: Reinforced Vault Safe */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud font-bold text-cyan-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Reinforced Safe</span>
                </span>
                {state.reinforcedSafeInstalled ? (
                  <span className="text-[10px] font-hud font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded">
                    INSTALLED ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-300">$1,400</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Heavy steel-reinforced lockbox bolted to concrete foundation. Protects 85% of cash from federal DEA safehouse busts.
              </p>
              <div className="text-[10px] font-mono text-cyan-400">
                • 85% Cash Protection on DEA Raids<br />
                • Heavy tamper-resistant steel
              </div>
            </div>

            <button
              disabled={state.reinforcedSafeInstalled || (state.cash + state.bank) < 1400}
              onClick={() => buySafehouseUpgrade('reinforced_safe')}
              className={`w-full py-2 rounded-lg font-hud font-bold text-xs transition ${
                state.reinforcedSafeInstalled
                  ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-default'
                  : (state.cash + state.bank) >= 1400
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md'
                  : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              {state.reinforcedSafeInstalled ? 'ACTIVE IN SAFEHOUSE' : 'Install Safe ($1,400)'}
            </button>
          </div>

          {/* Upgrade 3: Hydroponic High-Yield Lights */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Hydroponic Lights</span>
                </span>
                {state.hydroponicLightsInstalled ? (
                  <span className="text-[10px] font-hud font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded">
                    INSTALLED ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-300">$2,200</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Full-spectrum commercial grow LEDs and automated nutrient drips that accelerate plant vegetative and flowering cycles.
              </p>
              <div className="text-[10px] font-mono text-amber-400">
                • +35% Pot Growth Rate<br />
                • Faster turn-around per harvest
              </div>
            </div>

            <button
              disabled={state.hydroponicLightsInstalled || (state.cash + state.bank) < 2200}
              onClick={() => buySafehouseUpgrade('hydroponics')}
              className={`w-full py-2 rounded-lg font-hud font-bold text-xs transition ${
                state.hydroponicLightsInstalled
                  ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-default'
                  : (state.cash + state.bank) >= 2200
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                  : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              {state.hydroponicLightsInstalled ? 'ACTIVE IN SAFEHOUSE' : 'Install Lights ($2,200)'}
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. RENT A PARTNER (COMMISSION-BASED DRUG SALES)      */}
      {/* ==================================================== */}
      <section className="bg-slate-900 border border-purple-500/40 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-hud text-purple-400 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>2. RENT A PARTNER (COMMISSION-BASED DRUG SALES)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Rent a trusted street partner as your Level increases. Hand them drugs from your stash — they automatically sell them and take a small commission cut!
            </p>
          </div>

          {/* Select which product to hand to partner */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 px-1.5">DRUG TO SUPPLY:</span>
            {CONSIGNMENT_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => setSelectedSupplyItem(item.key)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                  selectedSupplyItem === item.key
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label} ({state.inv[item.key] || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(state.streetDealers || []).map(dealer => {
            const reqLvl = dealer.levelReq || 1;
            const unlocked = playerLevel >= reqLvl;
            const stockPct = Math.min(100, Math.round((dealer.stock / dealer.maxStock) * 100));
            const availToSupply = state.inv[selectedSupplyItem] || 0;

            return (
              <div
                key={dealer.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  dealer.busted
                    ? 'bg-red-950/25 border-red-500/60'
                    : dealer.hired
                    ? 'bg-slate-950 border-purple-500/50 shadow-glow-purple'
                    : unlocked
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/50 border-slate-800/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{dealer.avatar}</span>
                      <div>
                        <h4 className="text-sm font-bold font-hud text-slate-200">{dealer.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{dealer.district}</span>
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      dealer.busted
                        ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                        : dealer.hired
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : unlocked
                        ? 'bg-slate-900 text-amber-400 border border-slate-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {dealer.busted ? 'DETAINED' : dealer.hired ? 'PARTNERED' : `LVL ${reqLvl}`}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 mb-2">
                    Commission Cut: <strong className="text-amber-300">{dealer.cutPercent}%</strong> • You Keep: <strong className="text-emerald-400">{100 - dealer.cutPercent}%</strong>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 mb-3">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">PARTNER STOCK:</span>
                      <span className="text-cyan-300 font-bold">{dealer.stock} / {dealer.maxStock} units</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full transition-all" style={{ width: `${stockPct}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">EARNED FOR YOU:</span>
                      <span className="text-emerald-400 font-bold font-hud">${dealer.cashCollected.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!dealer.hired ? (
                  <button
                    disabled={!unlocked || (state.cash + state.bank) < dealer.hireCost}
                    onClick={() => hireDealer(dealer.id)}
                    className={`w-full py-2 rounded-lg font-bold text-xs font-hud transition flex items-center justify-center gap-1.5 ${
                      unlocked && (state.cash + state.bank) >= dealer.hireCost
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {!unlocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlocks at Level {reqLvl}</span>
                      </>
                    ) : (
                      <span>Rent Partner (${dealer.hireCost} Deposit)</span>
                    )}
                  </button>
                ) : dealer.busted ? (
                  <button
                    onClick={() => bailDealer(dealer.id)}
                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-hud transition flex items-center justify-center gap-1.5"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Bail Out Partner ($250)</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      disabled={availToSupply <= 0 || dealer.stock >= dealer.maxStock}
                      onClick={() => supplyDealer(dealer.id, selectedSupplyItem, 5)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-hud font-bold transition flex items-center justify-center gap-1 ${
                        availToSupply > 0 && dealer.stock < dealer.maxStock
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      <span>Give +5</span>
                    </button>
                    <button
                      disabled={dealer.cashCollected <= 0}
                      onClick={() => collectDealerCash(dealer.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-hud font-bold transition flex items-center justify-center gap-1 ${
                        dealer.cashCollected > 0
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-green'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Collect ${dealer.cashCollected}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. SAFEHOUSE UPGRADES (WITH WALKABLE 3D INTERIORS)   */}
      {/* ==================================================== */}
      <section className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-hud text-cyan-400 flex items-center gap-2">
              <Home className="w-5 h-5 text-cyan-400" />
              <span>3. SAFEHOUSE UPGRADES (WALKABLE 3D INTERIORS IN CITY RUN)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Every Safehouse has its own custom walkable 3D interior room in <strong className="text-white">City Run</strong> with live 3D grow pots, chemistry bench, packaging table, and commission partner desk!
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            PAY WITH CASH OR BANK
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {state.properties.map(prop => {
            const reqLvl = prop.levelReq || 1;
            const unlocked = playerLevel >= reqLvl;
            const isActive = activeProp.id === prop.id;
            const canAfford = (state.cash + state.bank) >= prop.cost;

            return (
              <div
                key={prop.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  isActive
                    ? 'bg-slate-950 border-cyan-400 shadow-glow-cyan'
                    : prop.owned
                    ? 'bg-slate-950 border-emerald-500/50'
                    : unlocked
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/50 border-slate-800/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                      LVL {reqLvl} HOUSE
                    </span>
                    <span className={`text-xs font-mono font-bold ${prop.owned ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {prop.owned ? 'OWNED' : `$${prop.cost.toLocaleString()}`}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold font-hud text-slate-100 mt-1">{prop.name}</h4>
                  <div className="text-[10px] text-cyan-400 font-mono mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{prop.district}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {prop.interiorStyle || prop.desc}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-3">
                    <span>MAX STATIONS:</span>
                    <span className="text-emerald-400 font-bold">{prop.maxPots} POTS</span>
                  </div>
                </div>

                {prop.owned ? (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleEnterHouseInterior(prop.id)}
                      className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <DoorOpen className="w-4 h-4" />
                      <span>Enter 3D Interior</span>
                    </button>
                    {isActive && (
                      <div className="text-center text-[10px] font-hud text-cyan-300 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> Active Safehouse
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    disabled={!unlocked || !canAfford}
                    onClick={() => buyProperty(prop.id)}
                    className={`w-full py-2 rounded-lg font-bold text-xs font-hud transition flex items-center justify-center gap-1.5 ${
                      unlocked && canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-glow-amber'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {!unlocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlocks at Lvl {reqLvl}</span>
                      </>
                    ) : (
                      <span>Upgrade (${prop.cost.toLocaleString()})</span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
