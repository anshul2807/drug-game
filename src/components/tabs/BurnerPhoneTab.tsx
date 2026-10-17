import React, { useState } from 'react';
import { useGame, DARKNET_ITEMS } from '../../context/GameContext';
import { 
  MessageSquare, 
  ShoppingBag, 
  Radio, 
  Send, 
  MapPin, 
  Check, 
  X, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Wifi, 
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Users,
  Sparkles,
  Target,
  Award,
  Trophy,
  Pin
} from 'lucide-react';

export const BurnerPhoneTab: React.FC = () => {
  const { 
    state, 
    setActivePhoneApp, 
    acceptOrder, 
    declineOrder, 
    haggleOrder, 
    pingLocalContacts, 
    buyDarknetItem,
    sellDrugStreet,
    claimMissionReward,
    setActiveMission
  } = useGame();

  const [darknetFilter, setDarknetFilter] = useState<'all' | 'seeds' | 'nutrients' | 'chemicals' | 'packaging' | 'cutting'>('all');
  const [showClientRoster, setShowClientRoster] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');

  const pendingCount = state.messages.filter(m => m.status === 'pending').length;
  const missions = state.missions || [];
  const unclaimedCount = missions.filter(m => m.completed && !m.claimed).length;
  const filteredMissions = selectedChapter === 'all'
    ? missions
    : missions.filter(m => m.chapter === selectedChapter);

  const filteredCatalog = darknetFilter === 'all' 
    ? DARKNET_ITEMS 
    : DARKNET_ITEMS.filter(item => item.category === darknetFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Phone Shell & Sub-App Menu */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
        <div>
          {/* Burner Phone Header */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center mb-4 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>HYLAND 3G SECURE</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>● 4 BARS</span>
              </span>
            </div>
            <h3 className="text-lg font-bold font-hud text-slate-100 tracking-wider">DOPE-OS v4.0</h3>
            <p className="text-[10px] text-slate-500 font-mono">P2P ENCRYPTED SYNDICATE NETWORK</p>
          </div>

          {/* Dynamic District Market Event Banner */}
          {state.marketEvent && (
            <div className="mb-4 bg-gradient-to-r from-amber-950/70 via-slate-950 to-purple-950/60 border border-amber-500/40 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-hud font-bold text-amber-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>MARKET SURGE EVENT</span>
                </span>
                <span className="bg-amber-500/20 border border-amber-400/50 px-1.5 py-0.5 rounded text-amber-200">
                  +{Math.round((state.marketEvent.multiplier - 1) * 100)}% PAYOUT
                </span>
              </div>
              <div className="text-xs font-hud font-bold text-white">{state.marketEvent.title}</div>
              <div className="text-[11px] text-slate-300 leading-snug">{state.marketEvent.desc}</div>
            </div>
          )}

          {/* Phone Apps Selector */}
          <div className="space-y-2">
            <button
              onClick={() => setActivePhoneApp('app-messages')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-hud flex items-center justify-between transition ${
                state.activePhoneApp === 'app-messages'
                  ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 shadow-glow-green'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Client Orders & CRM</span>
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePhoneApp('app-missions')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-hud flex items-center justify-between transition ${
                state.activePhoneApp === 'app-missions'
                  ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300 shadow-glow-cyan'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Syndicate Missions</span>
              </span>
              {unclaimedCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] animate-pulse">
                  {unclaimedCount} READY
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">
                  {missions.filter(m => m.completed).length}/{missions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePhoneApp('app-darknet')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-hud flex items-center justify-between transition ${
                state.activePhoneApp === 'app-darknet'
                  ? 'border-amber-500/50 bg-amber-950/30 text-amber-300 shadow-glow-amber'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>SilkHub Darknet & Adulterants</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">EXPRESS</span>
            </button>

            <button
              onClick={() => setActivePhoneApp('app-scanner')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-hud flex items-center justify-between transition ${
                state.activePhoneApp === 'app-scanner'
                  ? 'border-red-500/50 bg-red-950/30 text-red-300 shadow-glow-red'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400" />
                <span>Police 911 Radio Scanner</span>
              </span>
              <span className="text-[10px] text-red-400 font-mono font-bold animate-pulse">LIVE</span>
            </button>
          </div>
        </div>

        {/* Bottom Quick Action: Ping Contacts */}
        <div className="mt-6 pt-3 border-t border-slate-800">
          <button
            onClick={pingLocalContacts}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-hud text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast SMS (Find Buyer)</span>
          </button>
        </div>
      </div>

      {/* Right Column: Phone Screen View Container */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl min-h-[520px]">
        
        {/* ==================================================== */}
        {/* SUB-APP 1: MESSAGES, CLIENT PROFILES & ORDERS        */}
        {/* ==================================================== */}
        {state.activePhoneApp === 'app-messages' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-hud text-emerald-400 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>INCOMING BUYER INQUIRIES & LOYALTY CRM</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Deliver high-purity batches (85%+) to hook clients and earn +22% tips. Don't let patience timers expire!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClientRoster(!showClientRoster)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-hud font-bold transition flex items-center gap-1.5 ${
                    showClientRoster
                      ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>{showClientRoster ? 'Hide Client Profiles' : `Client CRM (${state.customers?.length || 0})`}</span>
                </button>
              </div>
            </div>

            {/* Persistent Customer Addiction & Loyalty Roster */}
            {showClientRoster && (
              <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-hud font-bold text-purple-300">
                    PERSISTENT CUSTOMER ADDICTION & LOYALTY PROFILES
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    High Addiction (65%+) = 2x Batch Orders
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {(state.customers || []).map(c => (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.avatar}</span>
                          <div>
                            <div className="text-xs font-bold font-hud text-slate-200">{c.name}</div>
                            <div className="text-[10px] font-mono text-cyan-400">{c.district}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-hud px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                          {c.archetype}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div>
                          <div className="flex justify-between text-amber-300 mb-0.5">
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> Addiction</span>
                            <strong>{c.addiction}%</strong>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full" style={{ width: `${c.addiction}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-emerald-300 mb-0.5">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Loyalty</span>
                            <strong>{c.loyalty}%</strong>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full" style={{ width: `${c.loyalty}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Messages */}
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {state.messages.length === 0 ? (
                <div className="text-center py-14 text-slate-500 font-hud">
                  <span className="text-3xl block mb-2 opacity-50">📭</span>
                  No pending inquiries at this moment.<br />
                  <span className="text-xs text-slate-400">
                    Click "Broadcast SMS" on your phone to ping local buyers.
                  </span>
                </div>
              ) : (
                state.messages.map(msg => {
                  const reqReadable = msg.reqItem.replace('pack_', '').replace(/_/g, ' ').toUpperCase();
                  const packStock = state.inv[msg.reqItem] || 0;
                  const custProfile = (state.customers || []).find(c => c.name === msg.name);
                  const isMarketSurge = state.marketEvent && state.marketEvent.district === msg.district;

                  const RAW_REQUIREMENTS: { [key: string]: { rawKey: string; perItem: number } } = {
                    pack_og_dime: { rawKey: 'raw_bud_og', perItem: 1 },
                    pack_og_eighth: { rawKey: 'raw_bud_og', perItem: 5 },
                    pack_og_ounce: { rawKey: 'raw_bud_og', perItem: 28 },
                    pack_sour_dime: { rawKey: 'raw_bud_sour', perItem: 1 },
                    pack_sour_eighth: { rawKey: 'raw_bud_sour', perItem: 5 },
                    pack_purple_eighth: { rawKey: 'raw_bud_purple', perItem: 5 },
                    pack_shatter_gram: { rawKey: 'raw_shatter', perItem: 1 },
                    pack_crystal_gram: { rawKey: 'raw_crystal', perItem: 1 },
                    pack_vape_cart: { rawKey: 'raw_distillate', perItem: 1 },
                    pack_hash_slab: { rawKey: 'raw_hash', perItem: 1 }
                  };
                  const req = RAW_REQUIREMENTS[msg.reqItem];
                  const rawStock = req ? (state.inv[req.rawKey] || 0) : 0;
                  const canFulfill = packStock >= msg.qty || (req && (packStock + Math.floor(rawStock / req.perItem)) >= msg.qty);
                  const needsAutoPack = packStock < msg.qty && canFulfill;
                  const patiencePct = Math.min(100, Math.round((msg.timeRemaining / 240) * 100));

                  return (
                    <div
                      key={msg.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition hover:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{msg.avatar}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold font-hud text-slate-200">{msg.name}</h4>
                              {custProfile && (
                                <span className="text-[10px] font-hud px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-purple-300">
                                  {custProfile.archetype}
                                </span>
                              )}
                              {isMarketSurge && (
                                <span className="text-[10px] font-hud px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/50 text-amber-300">
                                  🔥 SURGE DISTRICT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono">
                              <span className="text-cyan-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-cyan-400" />
                                <span>{msg.district}</span>
                              </span>
                              {custProfile && (
                                <>
                                  <span className="text-amber-300">Addiction: <strong>{custProfile.addiction}%</strong></span>
                                  <span className="text-emerald-300">Loyalty: <strong>{custProfile.loyalty}%</strong></span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold font-hud text-emerald-400 text-glow-green">
                            ${msg.payout.toLocaleString()} CASH
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            DEMAND: {msg.qty}x {reqReadable}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-2.5 italic">
                        "{msg.text}"
                      </p>

                      {/* Customer Patience Countdown Bar */}
                      <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>CLIENT PATIENCE TIMER</span>
                          </span>
                          <span className={patiencePct < 30 ? 'text-red-400 font-bold animate-pulse' : 'text-amber-300'}>
                            {msg.timeRemaining}s remaining
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              patiencePct < 30 ? 'bg-red-500' : patiencePct < 60 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${patiencePct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <div className={`text-[11px] font-mono flex items-center gap-1.5 ${canFulfill ? 'text-emerald-400' : 'text-red-400'}`}>
                          {packStock >= msg.qty ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Packaged in stash ({packStock} available)</span>
                            </>
                          ) : canFulfill ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-cyan-300">Ready to auto-pack ({rawStock}g raw available)</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Missing stock! (Need {msg.qty}x, have {packStock} packaged, {rawStock}g raw)</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => declineOrder(msg.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-hud transition"
                          >
                            Decline
                          </button>

                          <button
                            disabled={msg.haggled}
                            onClick={() => haggleOrder(msg.id)}
                            className={`px-3 py-1 rounded border text-xs font-hud transition flex items-center gap-1 ${
                              msg.haggled
                                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-amber-900/30 hover:bg-amber-800/50 border-amber-700/60 text-amber-300'
                            }`}
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>{msg.haggled ? 'Countered' : 'Haggle (+25%)'}</span>
                          </button>

                          <button
                            disabled={!canFulfill}
                            onClick={() => acceptOrder(msg.id)}
                            className={`px-4 py-1 rounded text-xs font-hud transition flex items-center gap-1 font-bold ${
                              canFulfill
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-glow-green cursor-pointer'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{needsAutoPack ? 'Auto-Pack & Run' : 'Accept & Run'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Street Deal / Direct Wholesale Sell */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-hud text-emerald-400">INSTANT STREET WHOLESALE / DIRECT CASHOUT</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Batch Purity: <strong className="text-emerald-400">{state.batchPurity}%</strong>
                </span>
              </div>

              {([
                { key: 'pack_og_dime', name: 'OG Dime Bag', price: 28, stock: state.inv.pack_og_dime },
                { key: 'pack_og_eighth', name: 'OG Eighth (5g)', price: 125, stock: state.inv.pack_og_eighth },
                { key: 'pack_og_ounce', name: 'OG Ounce (28g)', price: 460, stock: state.inv.pack_og_ounce },
                { key: 'pack_sour_dime', name: 'Sour Dime Bag', price: 30, stock: state.inv.pack_sour_dime },
                { key: 'pack_sour_eighth', name: 'Sour Eighth (5g)', price: 135, stock: state.inv.pack_sour_eighth },
                { key: 'pack_purple_eighth', name: 'Purple Haze (5g)', price: 165, stock: state.inv.pack_purple_eighth },
                { key: 'pack_shatter_gram', name: 'Wax Jar (Shatter)', price: 145, stock: state.inv.pack_shatter_gram },
                { key: 'pack_crystal_gram', name: 'Ice Bag (Crystal)', price: 230, stock: state.inv.pack_crystal_gram },
                { key: 'pack_vape_cart', name: 'THC Vape Cart', price: 190, stock: state.inv.pack_vape_cart },
                { key: 'pack_hash_slab', name: 'Pressed Hash Slab', price: 135, stock: state.inv.pack_hash_slab },
                { key: 'raw_bud_og', name: 'Loose OG Bud (1g)', price: 18, stock: state.inv.raw_bud_og },
                { key: 'raw_bud_sour', name: 'Loose Sour Bud (1g)', price: 20, stock: state.inv.raw_bud_sour },
                { key: 'raw_bud_purple', name: 'Loose Purple (1g)', price: 25, stock: state.inv.raw_bud_purple },
                { key: 'raw_crystal', name: 'Loose Crystal (1g)', price: 120, stock: state.inv.raw_crystal },
                { key: 'raw_shatter', name: 'Loose Shatter (1g)', price: 85, stock: state.inv.raw_shatter }
              ].filter(item => (item.stock || 0) > 0).length === 0) ? (
                <div className="text-center py-3 text-slate-500 text-xs font-mono">
                  No sellable drugs in your inventory yet. Harvest plants in Cultivation Station or synthesize chemicals in Chemistry Lab!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { key: 'pack_og_dime', name: 'OG Dime Bag', price: 28, stock: state.inv.pack_og_dime },
                    { key: 'pack_og_eighth', name: 'OG Eighth (5g)', price: 125, stock: state.inv.pack_og_eighth },
                    { key: 'pack_og_ounce', name: 'OG Ounce (28g)', price: 460, stock: state.inv.pack_og_ounce },
                    { key: 'pack_sour_dime', name: 'Sour Dime Bag', price: 30, stock: state.inv.pack_sour_dime },
                    { key: 'pack_sour_eighth', name: 'Sour Eighth (5g)', price: 135, stock: state.inv.pack_sour_eighth },
                    { key: 'pack_purple_eighth', name: 'Purple Haze (5g)', price: 165, stock: state.inv.pack_purple_eighth },
                    { key: 'pack_shatter_gram', name: 'Wax Jar (Shatter)', price: 145, stock: state.inv.pack_shatter_gram },
                    { key: 'pack_crystal_gram', name: 'Ice Bag (Crystal)', price: 230, stock: state.inv.pack_crystal_gram },
                    { key: 'pack_vape_cart', name: 'THC Vape Cart', price: 190, stock: state.inv.pack_vape_cart },
                    { key: 'pack_hash_slab', name: 'Pressed Hash Slab', price: 135, stock: state.inv.pack_hash_slab },
                    { key: 'raw_bud_og', name: 'Loose OG Bud (1g)', price: 18, stock: state.inv.raw_bud_og },
                    { key: 'raw_bud_sour', name: 'Loose Sour Bud (1g)', price: 20, stock: state.inv.raw_bud_sour },
                    { key: 'raw_bud_purple', name: 'Loose Purple (1g)', price: 25, stock: state.inv.raw_bud_purple },
                    { key: 'raw_crystal', name: 'Loose Crystal (1g)', price: 120, stock: state.inv.raw_crystal },
                    { key: 'raw_shatter', name: 'Loose Shatter (1g)', price: 85, stock: state.inv.raw_shatter }
                  ].filter(item => (item.stock || 0) > 0).map(item => (
                    <div key={item.key} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold font-hud text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">${item.price} each • {item.stock} in stash</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => sellDrugStreet(item.key, 1)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-hud font-bold text-xs transition shadow-sm"
                        >
                          Sell 1
                        </button>
                        {item.stock > 1 && (
                          <button
                            onClick={() => sellDrugStreet(item.key, item.stock)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-hud font-bold text-xs border border-slate-700 transition"
                          >
                            All ({item.stock})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SUB-APP 2: SILKHUB DARKNET SUPPLY CATALOG            */}
        {/* ==================================================== */}
        {state.activePhoneApp === 'app-darknet' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-hud text-amber-400 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <span>SILKHUB DARKNET & ADULTERANTS STORE</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Stealth shipment of seeds, nutrients, lab reagents, packaging & chemical cutting agents.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs font-hud">
                {(['all', 'seeds', 'nutrients', 'chemicals', 'cutting', 'packaging'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setDarknetFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg border uppercase text-[11px] transition ${
                      darknetFilter === cat
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold font-hud text-amber-300">{item.name}</h4>
                      <span className="text-xs font-bold font-mono text-emerald-400">${item.cost}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => buyDarknetItem(item.id)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-hud text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Purchase (${item.cost})</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SUB-APP 3: POLICE RADIO SCANNER                      */}
        {/* ==================================================== */}
        {state.activePhoneApp === 'app-scanner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-hud text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span>POLICE RADIO & 911 DISPATCH SCANNER</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time monitoring of Hyland Police Department patrols, tactical alerts, and district curfew risks.
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 font-mono animate-pulse">
                MONITORING
              </span>
            </div>

            {/* Live Chatter Terminal Feed */}
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs border border-slate-800 h-60 overflow-y-auto space-y-2 text-slate-300">
              {state.scannerLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={log.includes("Dispatch") ? "text-slate-400" : (log.includes("Curfew") ? "text-amber-400" : "text-emerald-400")}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* District Heat Matrix */}
            <div className="pt-2">
              <h4 className="text-xs font-bold font-hud text-slate-300 mb-2">DISTRICT THREAT ASSESSMENT</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
                {state.turfs.map(t => (
                  <div key={t.district} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-hud uppercase">{t.district}</span>
                    <span className={`text-xs font-bold font-mono ${t.bribed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {t.bribed ? 'TURF SECURED' : 'PATROLLED'}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      Gang: {t.gangName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SUB-APP 4: SYNDICATE MISSIONS & CONTRACTS            */}
        {/* ==================================================== */}
        {state.activePhoneApp === 'app-missions' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-hud text-cyan-400 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span>SYNDICATE STORY MISSIONS & CONTRACTS</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Complete tiered objectives to build street respect, earn cash payouts, and dominate Hyland Point.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unclaimedCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-hud font-bold text-xs animate-pulse flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{unclaimedCount} REWARD{unclaimedCount > 1 ? 'S' : ''} READY</span>
                  </span>
                )}
              </div>
            </div>

            {/* Chapter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
              {[
                { id: 'all' as const, label: 'All Contracts' },
                { id: 1, label: 'Ch. 1: Motel Hustle' },
                { id: 2, label: 'Ch. 2: Scaling Up' },
                { id: 3, label: 'Ch. 3: District Kingpin' }
              ].map(tab => (
                <button
                  key={String(tab.id)}
                  onClick={() => setSelectedChapter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold transition ${
                    selectedChapter === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mission Cards Grid */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredMissions.map(m => {
                const isActive = state.activeMissionId === m.id;
                const canClaim = m.completed && !m.claimed;

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition ${
                      m.claimed
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                        : canClaim
                        ? 'bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border-emerald-500/60 shadow-glow-green'
                        : isActive
                        ? 'bg-slate-950 border-cyan-500/60 shadow-glow-cyan'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                            Ch. {m.chapter}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 uppercase">
                            {m.category}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-hud font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950 flex items-center gap-1">
                              <Pin className="w-3 h-3" /> TRACKING
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-hud font-bold text-slate-100 flex items-center gap-2">
                          <span>{m.title}</span>
                          {m.claimed && <span className="text-xs text-slate-500 font-mono font-normal">(Claimed)</span>}
                        </h4>
                        <p className="text-xs text-slate-400 leading-snug">{m.desc}</p>
                      </div>

                      {/* Track Button (if not already claimed and not active) */}
                      {!m.claimed && !isActive && (
                        <button
                          onClick={() => setActiveMission(m.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-hud flex items-center gap-1 transition"
                        >
                          <Pin className="w-3 h-3 text-cyan-400" />
                          <span>Track</span>
                        </button>
                      )}
                    </div>

                    {/* Objectives Progress */}
                    <div className="space-y-2 my-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                      {m.objectives.map(obj => {
                        const pct = Math.min(100, Math.round((obj.current / obj.target) * 100));
                        return (
                          <div key={obj.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="flex items-center gap-2 text-slate-300">
                                <span className={obj.completed ? "text-emerald-400" : "text-slate-600"}>
                                  {obj.completed ? "✓" : "○"}
                                </span>
                                <span className={obj.completed ? "line-through text-slate-500" : "text-slate-200"}>
                                  {obj.text}
                                </span>
                              </span>
                              <span className="text-slate-400 font-bold">
                                {obj.current.toLocaleString()} / {obj.target.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  obj.completed ? 'bg-emerald-400' : 'bg-cyan-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Row: Rewards & Claim */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Reward: <strong>{m.rewardDesc}</strong></span>
                      </div>

                      <div>
                        {m.claimed ? (
                          <span className="text-xs font-hud font-bold text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-slate-600" /> CLAIMED
                          </span>
                        ) : canClaim ? (
                          <button
                            onClick={() => claimMissionReward(m.id)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-hud font-bold text-xs shadow-lg shadow-glow-green transition active:scale-95 animate-pulse flex items-center gap-1.5"
                          >
                            <Award className="w-4 h-4" />
                            <span>CLAIM REWARD</span>
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-slate-500">
                            IN PROGRESS ({m.objectives.filter(o => o.completed).length}/{m.objectives.length})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
