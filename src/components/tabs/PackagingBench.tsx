import React from 'react';
import { useGame, getTotalPackagedCount } from '../../context/GameContext';
import { Scale, PackageCheck, Layers, Car, User, Sparkles } from 'lucide-react';

export const PackagingBench: React.FC = () => {
  const { state, packItem, bulkPackDimes, sellDrugStreet } = useGame();

  const currentVeh = state.vehicles.find(v => v.id === state.currentVehicleId) || state.vehicles[0];
  const carriedPacks = getTotalPackagedCount(state.inv);
  const maxCarry = state.playerOnFoot ? state.maxPocketCapacity : currentVeh.trunkCapacity;
  const loadPct = Math.min(100, Math.round((carriedPacks / maxCarry) * 100));
  const purity = state.batchPurity ?? 92;

  const PACKAGING_RECIPES = [
    { key: 'pack_og_dime', name: '1g Dime Bag (OG Kush)', req: '1g Raw OG Bud + 1 Baggie', stock: state.inv.pack_og_dime, color: 'text-emerald-400' },
    { key: 'pack_og_eighth', name: '5g Eighth Pack (OG Kush)', req: '5g Raw OG Bud + 1 Baggie', stock: state.inv.pack_og_eighth, color: 'text-emerald-400' },
    { key: 'pack_og_ounce', name: '28g Ounce Bag (OG Kush)', req: '28g Raw OG Bud + 2 Baggies', stock: state.inv.pack_og_ounce, color: 'text-emerald-400' },
    { key: 'pack_sour_dime', name: '1g Dime Bag (Sour Diesel)', req: '1g Raw Sour Bud + 1 Baggie', stock: state.inv.pack_sour_dime, color: 'text-emerald-300' },
    { key: 'pack_sour_eighth', name: '5g Eighth Pack (Sour Diesel)', req: '5g Raw Sour Bud + 1 Baggie', stock: state.inv.pack_sour_eighth, color: 'text-emerald-300' },
    { key: 'pack_purple_eighth', name: '5g Connoisseur Eighth (Purple Haze)', req: '5g Raw Purple Bud + 1 Baggie', stock: state.inv.pack_purple_eighth, color: 'text-purple-400' },
    { key: 'pack_shatter_gram', name: '1g Wax Jar (Golden Shatter)', req: '1g Shatter + 1 Baggie', stock: state.inv.pack_shatter_gram, color: 'text-amber-400' },
    { key: 'pack_crystal_gram', name: '1g Ice Bag (Blue Crystal)', req: '1g Crystal + 1 Baggie', stock: state.inv.pack_crystal_gram, color: 'text-cyan-400' },
    { key: 'pack_vape_cart', name: '1g Pure THC Vape Cartridge', req: '1g Distillate + 1 Glass Vial', stock: state.inv.pack_vape_cart, color: 'text-teal-300' },
    { key: 'pack_hash_slab', name: '1g Pressed Hash Slab', req: '1g Pressed Hash + 1 Baggie', stock: state.inv.pack_hash_slab, color: 'text-yellow-500' }
  ];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-base font-bold font-hud text-amber-400 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span>PACKAGING & SORTING BENCH</span>
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PURITY: {purity}%</span>
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>BAGGIES: <strong className="text-white font-bold">{state.inv.baggies}</strong></span>
            </span>
          </div>
        </div>

        {/* Vehicle Trunk vs. On-Foot Pocket Storage Capacity Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-hud">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              {state.playerOnFoot ? <User className="w-3.5 h-3.5 text-cyan-400" /> : <Car className="w-3.5 h-3.5 text-emerald-400" />}
              <span>
                {state.playerOnFoot
                  ? `ON-FOOT JACKET POCKETS (MAX ${state.maxPocketCapacity})`
                  : `${currentVeh.name.toUpperCase()} TRUNK STORAGE`}
              </span>
            </span>
            <span className={`font-mono font-bold ${carriedPacks >= maxCarry ? 'text-red-400' : 'text-emerald-400'}`}>
              {carriedPacks} / {maxCarry} PACKS ({loadPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                carriedPacks >= maxCarry
                  ? 'bg-red-500'
                  : loadPct > 75
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${loadPct}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex justify-between">
            <span>On-Foot Limit: {state.maxPocketCapacity} packs</span>
            <span>Active Vehicle ({currentVeh.name}): {currentVeh.trunkCapacity} packs</span>
          </div>
        </div>

        {/* Loose Inventory Totals Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center mb-4">
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">OG KUSH</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 font-hud">{state.inv.raw_bud_og}g</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">SOUR DIESEL</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-300 font-hud">{state.inv.raw_bud_sour}g</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">PURPLE HAZE</span>
            <span className="text-xs sm:text-sm font-bold text-purple-400 font-hud">{state.inv.raw_bud_purple}g</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">SHATTER</span>
            <span className="text-xs sm:text-sm font-bold text-amber-400 font-hud">{state.inv.raw_shatter}g</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">CRYSTAL</span>
            <span className="text-xs sm:text-sm font-bold text-cyan-400 font-hud">{state.inv.raw_crystal}g</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono">DISTILLATE</span>
            <span className="text-xs sm:text-sm font-bold text-teal-300 font-hud">{state.inv.raw_distillate}g</span>
          </div>
        </div>

        {/* Packaging Options List */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {PACKAGING_RECIPES.map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              <div>
                <div className={`text-xs font-bold font-hud ${item.color}`}>{item.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{item.req}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {item.stock} in stash
                </span>
                <button
                  onClick={() => packItem(item.key)}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-hud transition shadow-sm active:scale-95"
                >
                  Pack (+1)
                </button>
                {item.stock > 0 && (
                  <button
                    onClick={() => sellDrugStreet(item.key, 1)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-hud transition shadow-sm active:scale-95"
                    title="Sell 1x directly to street contacts for cash"
                  >
                    Sell 1x
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Pack Action */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-hud">
        <span className="text-slate-400 font-mono text-[11px]">Keep your inventory stocked for pending customer SMS!</span>
        <button
          onClick={bulkPackDimes}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold transition flex items-center gap-1.5"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Mass Pack Dime Bags</span>
        </button>
      </div>
    </section>
  );
};
