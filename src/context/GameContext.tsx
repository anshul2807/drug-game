import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { 
  GameState, 
  DevSettings,
  Pot, 
  LabRecipe, 
  RecipeKey, 
  ClientOrder, 
  DarknetCatalogItem, 
  Vehicle, 
  Property, 
  StaffMember, 
  LaunderingFront, 
  TurfDistrict, 
  GameNotification, 
  ModalConfig, 
  SaveSlot,
  ActiveTab, 
  PhoneApp,
  DistrictName,
  CustomerProfile,
  StreetDealer,
  MarketEvent,
  Mission,
  MissionObjective
} from '../types/game';
import { sound } from '../audio/soundEngine';

export const LAB_RECIPES: Record<RecipeKey, LabRecipe> = {
  shatter: {
    id: 'shatter',
    name: 'Golden Shatter (Wax)',
    desc: 'Purified butane hash oil concentrate with high amber clarity.',
    reqText: '15g Raw Bud + 1 Butane Canister',
    reqs: { raw_bud_og: 15, butane: 1 },
    yieldItem: 'raw_shatter',
    yieldName: 'Raw Shatter',
    yieldQty: 5,
    unitValue: 140,
    targetMin: 55,
    targetMax: 75
  },
  crystal: {
    id: 'crystal',
    name: 'Blue Ice Crystal',
    desc: 'High-purity crystalline synthetic stimulant cooked in a solvent bath.',
    reqText: '2 Cold Meds + 1 Acetone Solvent',
    reqs: { cold_meds: 2, acetone: 1 },
    yieldItem: 'raw_crystal',
    yieldName: 'Raw Crystal',
    yieldQty: 10,
    unitValue: 220,
    targetMin: 65,
    targetMax: 85
  },
  distillate: {
    id: 'distillate',
    name: 'Pure THC Distillate',
    desc: 'Ultra-refined golden honey oil suited for high-end vape cartridges.',
    reqText: '25g Raw Bud + 1 Acetone',
    reqs: { raw_bud_og: 25, acetone: 1 },
    yieldItem: 'raw_distillate',
    yieldName: 'THC Distillate',
    yieldQty: 8,
    unitValue: 180,
    targetMin: 50,
    targetMax: 70
  },
  hash: {
    id: 'hash',
    name: 'Moroccan Blonde Hash',
    desc: 'Solventless cold-water pressed kief hashish.',
    reqText: '20g Raw Bud + 1 Butane',
    reqs: { raw_bud_og: 20, butane: 1 },
    yieldItem: 'raw_hash',
    yieldName: 'Pressed Hash',
    yieldQty: 7,
    unitValue: 120,
    targetMin: 45,
    targetMax: 65
  }
};

export const DARKNET_ITEMS: DarknetCatalogItem[] = [
  { id: 'seeds_og', name: 'OG Kush Seeds (Pack of 2)', cost: 60, gives: { seeds_og: 2 }, desc: 'Classic earthy indica, high yield & hardy.', category: 'seeds' },
  { id: 'seeds_sour', name: 'Sour Diesel Seeds (Pack of 2)', cost: 130, gives: { seeds_sour: 2 }, desc: 'Pungent diesel aroma sativa, rapid flowering.', category: 'seeds' },
  { id: 'seeds_purple', name: 'Purple Haze Seeds (Pack of 2)', cost: 260, gives: { seeds_purple: 2 }, desc: 'Exotic top-shelf connoisseur strain, max profit.', category: 'seeds' },
  { id: 'fertilizer', name: 'Nutrient Feed Jug (+5)', cost: 45, gives: { fertilizer: 5 }, desc: 'Fast-acting nitrogen & phosphorus solution.', category: 'nutrients' },
  { id: 'butane', name: 'Lab-Grade Butane Canister (x2)', cost: 80, gives: { butane: 2 }, desc: 'Required solvent for Shatter & Hash extraction.', category: 'chemicals' },
  { id: 'cold_meds', name: 'Precursor Cold Medicine Box (x3)', cost: 120, gives: { cold_meds: 3 }, desc: 'Ephedrine precursor for Blue Ice synthesis.', category: 'chemicals' },
  { id: 'acetone', name: 'Purified Acetone Solvent (x2)', cost: 90, gives: { acetone: 2 }, desc: 'Organic crystallization reagent.', category: 'chemicals' },
  { id: 'baggies', name: 'Baggie Bundle (Pack of 30)', cost: 20, gives: { baggies: 30 }, desc: 'Essential packaging for dime bags & grams.', category: 'packaging' },
  { id: 'glass_vials', name: 'Glass Vials & Jars (Pack of 15)', cost: 50, gives: { glass_vials: 15 }, desc: 'Premium packaging for wax & distillate.', category: 'packaging' },
  { id: 'baking_soda', name: 'Sodium Bicarbonate Box (+5g)', cost: 25, gives: { baking_soda: 5 }, desc: 'Standard cutting agent to stretch crystal & powder weight (-7% purity).', category: 'cutting' },
  { id: 'caffeine', name: 'Anhydrous Caffeine Powder (+5g)', cost: 40, gives: { caffeine: 5 }, desc: 'Energizing adulterant that mimics stimulant kick (-5% purity).', category: 'cutting' },
  { id: 'baby_powder', name: 'Talc Baby Powder (+5g)', cost: 15, gives: { baby_powder: 5 }, desc: 'Cheap bulk filler for heavy stretching (-11% purity).', category: 'cutting' },
  { id: 'fentanyl', name: 'Synthetic Potency Booster (+3g)', cost: 110, gives: { fentanyl: 3 }, desc: 'Extreme potency cut (+5g yield boost, -14% purity, high OD risk).', category: 'cutting' }
];

export interface ConvenienceShopItem {
  id: string;
  name: string;
  cost: number;
  category: 'soil' | 'packaging' | 'nutrients' | 'cutting' | 'lab';
  icon: string;
  desc: string;
  gives?: { [key: string]: number };
  actionType?: 'add_pot_soil' | 'topdress_soil' | 'upgrade_pocket';
}

export const CONVENIENCE_SHOP_ITEMS: ConvenienceShopItem[] = [
  {
    id: 'mart_soil_pot',
    name: 'Organic Potting Soil + Hydro Grow Bucket (+1 Pot)',
    cost: 220,
    category: 'soil',
    icon: '🪴',
    desc: 'Rich aerated coco-peat soil & heavy-duty hydro bucket. Adds +1 Cultivation Station to your Safehouse & enriches active pots!',
    actionType: 'add_pot_soil'
  },
  {
    id: 'mart_soil_topdress',
    name: 'Rich Humus Soil Top-Dress & Water Kit',
    cost: 35,
    category: 'soil',
    icon: '🌱',
    desc: 'Fresh worm-casting soil top-dress & distilled water: refills all active pots to 100% Water & 100% Nutrients + 3 Fertilizer!',
    gives: { fertilizer: 3 },
    actionType: 'topdress_soil'
  },
  {
    id: 'mart_fertilizer_5',
    name: 'NPK Liquid Fertilizer Jug (+5)',
    cost: 40,
    category: 'nutrients',
    icon: '🧪',
    desc: 'High-nitrogen & phosphorus bloom booster for rapid indoor crop growth.',
    gives: { fertilizer: 5 }
  },
  {
    id: 'mart_fertilizer_15',
    name: 'Commercial NPK Fertilizer Crate (+15)',
    cost: 105,
    category: 'nutrients',
    icon: '🛢️',
    desc: 'Bulk 15-jug crate of professional hydroponic nutrient solution.',
    gives: { fertilizer: 15 }
  },
  {
    id: 'mart_baggies_30',
    name: 'Clear Zipper Dime Baggies (x30)',
    cost: 18,
    category: 'packaging',
    icon: '🛍️',
    desc: 'Heavy-duty resealable plastic dime baggies for street distribution.',
    gives: { baggies: 30 }
  },
  {
    id: 'mart_baggies_100',
    name: 'Wholesale Zipper Baggie Box (x100)',
    cost: 50,
    category: 'packaging',
    icon: '📦',
    desc: 'Bulk dispenser box of 100 clear zipper baggies for mass packaging.',
    gives: { baggies: 100 }
  },
  {
    id: 'mart_vials_15',
    name: 'Borosilicate Glass Vials & Carts (x15)',
    cost: 45,
    category: 'packaging',
    icon: '🫙',
    desc: 'Airtight glass jars & cartridges for shatter wax and THC distillate.',
    gives: { glass_vials: 15 }
  },
  {
    id: 'mart_baking_soda',
    name: 'Pure Baking Soda Box (+5g)',
    cost: 22,
    category: 'cutting',
    icon: '🧂',
    desc: 'Food-grade sodium bicarbonate for cutting & stretching lab batches (+3g yield).',
    gives: { baking_soda: 5 }
  },
  {
    id: 'mart_caffeine',
    name: 'Anhydrous Caffeine Powder (+5g)',
    cost: 35,
    category: 'cutting',
    icon: '☕',
    desc: 'Pure energizer powder for cutting stimulant batches (+3g yield).',
    gives: { caffeine: 5 }
  },
  {
    id: 'mart_baby_powder',
    name: 'Talc Baby Powder (+5g)',
    cost: 12,
    category: 'cutting',
    icon: '🍼',
    desc: 'Inexpensive bulk filler powder for stretching weight (+4g yield).',
    gives: { baby_powder: 5 }
  },
  {
    id: 'mart_butane',
    name: 'Refined Butane Canisters (x3)',
    cost: 95,
    category: 'lab',
    icon: '🔥',
    desc: 'Ultra-pure solvent canisters for Golden Shatter & Moroccan Hash extraction.',
    gives: { butane: 3 }
  },
  {
    id: 'mart_acetone',
    name: 'Lab-Grade Acetone Solvent (x3)',
    cost: 110,
    category: 'lab',
    icon: '⚗️',
    desc: 'High-purity solvent for Blue Ice Crystal & Pure THC Distillate refining.',
    gives: { acetone: 3 }
  },
  {
    id: 'mart_cold_meds',
    name: 'OTC Cold & Sinus Medicine Pack (x3)',
    cost: 110,
    category: 'lab',
    icon: '💊',
    desc: 'Over-the-counter pseudoephedrine tablets for lab synthesis.',
    gives: { cold_meds: 3 }
  },
  {
    id: 'mart_pocket_bag',
    name: 'Cargo Utility Backpack (+5 Pocket Capacity)',
    cost: 250,
    category: 'packaging',
    icon: '🎒',
    desc: 'Concealed lined utility backpack: permanently increases on-foot Pocket Capacity by +5 packs!',
    actionType: 'upgrade_pocket'
  }
];

export const CUTTING_AGENTS: Record<string, { name: string; yieldBonus: number; purityDrop: number; desc: string }> = {
  baking_soda: { name: 'Baking Soda', yieldBonus: 3, purityDrop: 7, desc: '+3g Bulk Yield • -7% Batch Purity' },
  caffeine: { name: 'Caffeine Powder', yieldBonus: 3, purityDrop: 5, desc: '+3g Stimulant Stretch • -5% Batch Purity' },
  baby_powder: { name: 'Baby Powder', yieldBonus: 4, purityDrop: 11, desc: '+4g Cheap Filler • -11% Batch Purity' },
  fentanyl: { name: 'Synthetic Booster', yieldBonus: 5, purityDrop: 14, desc: '+5g Potent Stretch • -14% Purity (OD Risk)' }
};

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  { id: 'c_alison', name: 'Alison', avatar: '👩‍🎓', district: 'Motel Strip', archetype: 'Street Fiend', addiction: 45, loyalty: 70, favoriteItem: 'pack_og_dime', minPurity: 45 },
  { id: 'c_skeeter', name: 'Skeeter', avatar: '🧢', district: 'Motel Strip', archetype: 'Street Fiend', addiction: 68, loyalty: 65, favoriteItem: 'pack_og_dime', minPurity: 40 },
  { id: 'c_marco', name: 'Marco', avatar: '👨‍🍳', district: 'Downtown Core', archetype: 'Clubber', addiction: 40, loyalty: 60, favoriteItem: 'pack_og_eighth', minPurity: 60 },
  { id: 'c_courtney', name: 'Courtney B.', avatar: '💼', district: 'Downtown Core', archetype: 'VIP Executive', addiction: 52, loyalty: 75, favoriteItem: 'pack_vape_cart', minPurity: 75 },
  { id: 'c_dex', name: 'DJ Dex', avatar: '🎧', district: 'The Docks', archetype: 'Clubber', addiction: 62, loyalty: 72, favoriteItem: 'pack_shatter_gram', minPurity: 65 },
  { id: 'c_briggs', name: 'Capt. Briggs', avatar: '⚓', district: 'The Docks', archetype: 'Smuggler', addiction: 48, loyalty: 68, favoriteItem: 'pack_hash_slab', minPurity: 60 },
  { id: 'c_roxy', name: 'Roxy Neon', avatar: '💃', district: 'Neon District', archetype: 'Clubber', addiction: 74, loyalty: 80, favoriteItem: 'pack_shatter_gram', minPurity: 70 },
  { id: 'c_dmitri', name: 'Dmitri', avatar: '🎰', district: 'Neon District', archetype: 'VIP Executive', addiction: 78, loyalty: 76, favoriteItem: 'pack_crystal_gram', minPurity: 75 },
  { id: 'c_hayes', name: 'Councilman Hayes', avatar: '👔', district: 'Sunset Hills', archetype: 'VIP Executive', addiction: 64, loyalty: 82, favoriteItem: 'pack_crystal_gram', minPurity: 82 },
  { id: 'c_giselle', name: 'Giselle V.', avatar: '💎', district: 'Sunset Hills', archetype: 'VIP Executive', addiction: 55, loyalty: 85, favoriteItem: 'pack_purple_eighth', minPurity: 80 },
  { id: 'c_jax', name: 'Mad Jax', avatar: '🏍️', district: 'Desert Outskirts', archetype: 'Biker', addiction: 70, loyalty: 74, favoriteItem: 'pack_og_ounce', minPurity: 55 }
];

export const INITIAL_DEALERS: StreetDealer[] = [
  { id: 'dealer_motel', name: 'Lil\' Benny', avatar: '🛹', district: 'Motel Strip', cornerName: 'Motel Diner Corner', levelReq: 1, hired: false, hireCost: 300, cutPercent: 20, stock: 0, maxStock: 30, cashCollected: 0, busted: false, coords: { x: 480, y: 230 } },
  { id: 'dealer_downtown', name: 'Slick Victor', avatar: '🧥', district: 'Downtown Core', cornerName: 'Metro Tower Alley', levelReq: 2, hired: false, hireCost: 900, cutPercent: 18, stock: 0, maxStock: 50, cashCollected: 0, busted: false, coords: { x: 1280, y: 380 } },
  { id: 'dealer_docks', name: 'Dockyard Sal', avatar: '🪝', district: 'The Docks', cornerName: 'Pier 4 Cargo Slip', levelReq: 3, hired: false, hireCost: 1800, cutPercent: 15, stock: 0, maxStock: 75, cashCollected: 0, busted: false, coords: { x: 2080, y: 380 } },
  { id: 'dealer_neon', name: 'Karma V.', avatar: '🕶️', district: 'Neon District', cornerName: 'Velvet Club Arcade', levelReq: 4, hired: false, hireCost: 3200, cutPercent: 12, stock: 0, maxStock: 100, cashCollected: 0, busted: false, coords: { x: 1280, y: 980 } }
];

export const MARKET_EVENTS: MarketEvent[] = [
  { id: 'evt_neon_rave', title: 'Neon Rave Weekend', desc: 'Underground clubbers in Neon District are paying +45% for Shatter, Crystal & Vape Carts!', district: 'Neon District', multiplier: 1.45, bonusItem: 'pack_shatter_gram' },
  { id: 'evt_downtown_crackdown', title: 'Downtown Police Sweep', desc: 'Heavy patrol checkpoints in Downtown Core drove street prices up by +35%!', district: 'Downtown Core', multiplier: 1.35 },
  { id: 'evt_docks_armada', title: 'Cargo Fleet Arrival', desc: 'International sailors docked at The Docks — +40% payout on all Hash & Concentrates!', district: 'The Docks', multiplier: 1.40, bonusItem: 'pack_hash_slab' },
  { id: 'evt_sunset_gala', title: 'Sunset Hills VIP Charity Gala', desc: 'Elite executives in Sunset Hills are paying +50% top dollar for high-purity packages!', district: 'Sunset Hills', multiplier: 1.50 },
  { id: 'evt_biker_rally', title: 'Highway 66 Biker Convoy', desc: 'Outlaw chapters gathered in Desert Outskirts — +40% surge on Ounces & Blue Ice!', district: 'Desert Outskirts', multiplier: 1.40, bonusItem: 'pack_og_ounce' }
];

export const INITIAL_PROPERTIES: Property[] = [
  { id: 'motel', name: 'Hyland Motel #104', district: 'Motel Strip', levelReq: 1, cost: 0, owned: true, maxPots: 4, hasLabUpgrade: false, interiorStyle: 'Wood-paneled motel room with bed, CRT TV, UV grow rack & folding lab bench.', desc: 'Starter motel safehouse with walkable 3D interior, bed, lab table & up to 4 cultivation stations.', spawnCoords: { x: 280, y: 80 } },
  { id: 'docks', name: 'Cannery Wharf Warehouse', district: 'The Docks', levelReq: 2, cost: 2500, owned: false, maxPots: 8, hasLabUpgrade: true, interiorStyle: 'Industrial brick & steel cargo loft with shipping crates & 8-pot hydroponic bay.', desc: 'Industrial pier warehouse with full 3D loft interior & up to 8 cultivation stations.', spawnCoords: { x: 1880, y: 80 } },
  { id: 'rv', name: 'Desert Outskirts Superlab RV', district: 'Desert Outskirts', levelReq: 3, cost: 8000, owned: false, maxPots: 12, hasLabUpgrade: true, interiorStyle: 'Metallic superlab bunker with chrome chemical vats & 12-pot high-output LED array.', desc: 'Off-grid desert superlab with walkable 3D lab interior & up to 12 cultivation stations.', spawnCoords: { x: 1880, y: 980 } },
  { id: 'club_safehouse', name: 'Neon Alley Penthouse', district: 'Neon District', levelReq: 4, cost: 22000, owned: false, maxPots: 16, hasLabUpgrade: true, interiorStyle: 'Cyberpunk luxury duplex with neon pillars, VIP sofa & 16-pot glass conservatory.', desc: 'High-rise penthouse above the club strip with 3D neon interior & up to 16 cultivation stations.', spawnCoords: { x: 1480, y: 980 } },
  { id: 'villa', name: 'Sunset Hills Gated Villa', district: 'Sunset Hills', levelReq: 5, cost: 55000, owned: false, maxPots: 24, hasLabUpgrade: true, interiorStyle: 'Marble grand hall with gold columns, cash vault & 24-pot climate-controlled greenhouse.', desc: 'Kingpin mansion estate with 3D marble vault interior & up to 24 cultivation stations.', spawnCoords: { x: 280, y: 980 } }
];

export const getPlayerLevel = (rep: number): number => Math.max(1, Math.floor(rep / 25) + 1);
export const getLevelProgressPct = (rep: number): number => Math.min(100, Math.round(((rep % 25) / 25) * 100));
export const getMaxCultivationStations = (level: number, maxPropertyPots: number): number =>
  Math.min(maxPropertyPots, Math.max(4, 2 + level * 2));

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'runner', name: 'Pete "Sneakers"', role: 'Street Runner', wage: 80, hired: false, desc: 'Dispatches and auto-delivers accepted customer orders every 20s.' },
  { id: 'botanist', name: 'Mama Rosa', role: 'Master Botanist', wage: 120, hired: false, desc: 'Monitors cultivation pots, automatically watering and fertilizing plants.' },
  { id: 'chemist', name: 'Dr. Walter', role: 'Lab Chemist', wage: 190, hired: false, desc: 'Automates extraction synthesis at stable temperatures with 98% purity.' },
  { id: 'enforcer', name: 'Big Tony', role: 'Cartel Enforcer', wage: 150, hired: false, desc: 'Intimidates rivals, speeds up heat dissipation, and prevents police raids.' },
  { id: 'lawyer', name: 'Saul B.', role: 'Defense Attorney', wage: 240, hired: false, desc: 'Reduces money laundering tax fees by 50% and protects cash if raided.' }
];

export const INITIAL_LAUNDERING: LaunderingFront[] = [
  { id: 'laundromat', name: 'Speedy Suds Laundromat', district: 'Motel Strip', cost: 2500, bought: false, dailyWash: 800, fee: 0.15, desc: 'Coin-operated washers wash small cash volumes with a 15% fee.' },
  { id: 'carwash', name: 'Neon Wave Car Wash', district: 'Downtown Core', cost: 11000, bought: false, dailyWash: 3000, fee: 0.10, desc: 'High traffic tunnel wash. Washes $3,000/day at 10% fee.' },
  { id: 'hookah', name: 'Velvet Hookah & Lounge', district: 'Neon District', cost: 32000, bought: false, dailyWash: 9000, fee: 0.08, desc: 'Cash-heavy nightclub with VIP bottle service. 8% fee.' },
  { id: 'shipping', name: 'Hyland Port Logistics Co.', district: 'The Docks', cost: 75000, bought: false, dailyWash: 25000, fee: 0.04, desc: 'International freight forwarding. 4% laundering fee.' }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'beater', name: '1987 Chariot Beater', type: 'Sedan', maxSpeed: 2.8, accel: 0.08, turnSpeed: 0.062, armor: 40, trunkCapacity: 25, cost: 0, owned: true, color: '#10b981', desc: 'Rattly starter sedan. Reliable, responsive handling on city asphalt.' },
  { id: 'van', name: 'Vandura Cargo Van', type: 'Utility Van', maxSpeed: 2.2, accel: 0.055, turnSpeed: 0.050, armor: 85, trunkCapacity: 100, cost: 2200, owned: false, color: '#0284c7', desc: 'Heavy delivery workhorse with massive cargo trunk.' },
  { id: 'muscle', name: 'Dominator 454 V8', type: 'Muscle Car', maxSpeed: 3.6, accel: 0.11, turnSpeed: 0.072, armor: 55, trunkCapacity: 40, cost: 8500, owned: false, color: '#f59e0b', desc: 'Lethal quarter-mile speed for outrunning highway police cruisers.' },
  { id: 'suv', name: 'Blackwatch Armored SUV', type: 'Armored Truck', maxSpeed: 2.9, accel: 0.085, turnSpeed: 0.058, armor: 150, trunkCapacity: 75, cost: 24000, owned: false, color: '#ef4444', desc: 'Reinforced ballistic panels, heavy ramming bumper, radar detector.' }
];

export const INITIAL_TURFS: TurfDistrict[] = [
  { district: 'Motel Strip', gangName: 'Alley Dogs', repRequired: 0, bribed: true, bribeCost: 0, heatReduction: 5, bonusPercent: 0, desc: 'Starting territory. Cheap clients and local street hustlers.' },
  { district: 'Downtown Core', gangName: 'Metropolitan Syndicate', repRequired: 30, bribed: false, bribeCost: 1500, heatReduction: 10, bonusPercent: 15, desc: 'Corporate district. High police scrutiny but rich executives.' },
  { district: 'The Docks', gangName: 'Waterfront Brotherhood', repRequired: 45, bribed: false, bribeCost: 3200, heatReduction: 15, bonusPercent: 20, desc: 'Shipping terminals and smuggling routes with low police patrols.' },
  { district: 'Neon District', gangName: 'Velvet Triad', repRequired: 70, bribed: false, bribeCost: 7500, heatReduction: 20, bonusPercent: 25, desc: 'Casinos and rave clubs with heavy appetite for shatter and crystal.' },
  { district: 'Sunset Hills', gangName: 'Private Security Elite', repRequired: 120, bribed: false, bribeCost: 18000, heatReduction: 25, bonusPercent: 35, desc: 'Ultra-exclusive gated enclave. Massive payouts per delivery.' },
  { district: 'Desert Outskirts', gangName: 'Highway Marauders', repRequired: 160, bribed: false, bribeCost: 25000, heatReduction: 30, bonusPercent: 40, desc: 'Lawless desert highway and RV superlabs.' }
];

export const CUSTOMER_NAMES = [
  { name: "Alison", avatar: "👩‍🎓", district: "Motel Strip", reqItem: "pack_og_dime", minQty: 2, maxQty: 5, unitPrice: 25, text: "Hey! Cramming for finals tonight. Need some dime bags at the motel diner ASAP." },
  { name: "Skeeter", avatar: "🧢", district: "Motel Strip", reqItem: "pack_og_dime", minQty: 3, maxQty: 6, unitPrice: 28, text: "Yo man! Got cash in hand behind room 108. Don't leave me hanging." },
  { name: "Marco", avatar: "👨‍🍳", district: "Downtown Core", reqItem: "pack_og_eighth", minQty: 1, maxQty: 3, unitPrice: 115, text: "Dinner rush was insane. Bring an eighth to the restaurant back alley by the dumpsters." },
  { name: "Courtney B.", avatar: "💼", district: "Downtown Core", reqItem: "pack_vape_cart", minQty: 1, maxQty: 4, unitPrice: 190, text: "High stress board meeting ahead. Need distillate vape carts outside the tower lobby." },
  { name: "DJ Dex", avatar: "🎧", district: "The Docks", reqItem: "pack_shatter_gram", minQty: 2, maxQty: 5, unitPrice: 145, text: "Underground rave starting at midnight. Bring wax jars down to dock warehouse 4." },
  { name: "Capt. Briggs", avatar: "⚓", district: "The Docks", reqItem: "pack_hash_slab", minQty: 1, maxQty: 3, unitPrice: 130, text: "Setting sail on dawn tide. Looking for good old-school pressed hash for the voyage." },
  { name: "Roxy Neon", avatar: "💃", district: "Neon District", reqItem: "pack_shatter_gram", minQty: 2, maxQty: 6, unitPrice: 155, text: "VIP lounge party is popping! We need golden shatter jars immediately!" },
  { name: "Dmitri", avatar: "🎰", district: "Neon District", reqItem: "pack_crystal_gram", minQty: 2, maxQty: 5, unitPrice: 240, text: "High roller suite. Need pure blue ice crystal bags. Discretion guaranteed." },
  { name: "Councilman Hayes", avatar: "👔", district: "Sunset Hills", reqItem: "pack_crystal_gram", minQty: 2, maxQty: 4, unitPrice: 260, text: "Leave the ice package behind the tennis pavilion. Exact cash in envelope." },
  { name: "Giselle V.", avatar: "💎", district: "Sunset Hills", reqItem: "pack_purple_eighth", minQty: 2, maxQty: 4, unitPrice: 220, text: "Only top-shelf Purple Haze accepted at the estate gate. Cash ready." },
  { name: "Mad Jax", avatar: "🏍️", district: "Desert Outskirts", reqItem: "pack_og_ounce", minQty: 1, maxQty: 2, unitPrice: 420, text: "Biker club rally at the highway scrap yard. Bring ounces of green!" },
  { name: "Undercover Fed (?)", avatar: "🕶️", district: "Downtown Core", reqItem: "pack_og_eighth", minQty: 3, maxQty: 5, unitPrice: 160, isTrap: true, text: "Greetings fellow citizen. I wish to buy multiple illegal narcotics packages immediately for cash." }
];

export const PACKAGED_KEYS = [
  'pack_og_dime', 'pack_og_eighth', 'pack_og_ounce',
  'pack_sour_dime', 'pack_sour_eighth', 'pack_purple_eighth',
  'pack_shatter_gram', 'pack_crystal_gram', 'pack_vape_cart', 'pack_hash_slab'
];

export const RAW_DRUG_KEYS = [
  'raw_bud_og', 'raw_bud_sour', 'raw_bud_purple',
  'raw_shatter', 'raw_crystal', 'raw_distillate', 'raw_hash'
];

export const ALL_DRUG_KEYS = [...PACKAGED_KEYS, ...RAW_DRUG_KEYS];

export const getTotalPackagedCount = (inv: Record<string, number>): number => {
  return PACKAGED_KEYS.reduce((sum, key) => sum + (inv[key] || 0), 0);
};

export const getCarriedDrugsCount = (inv: Record<string, number>, hasActiveOrder = false): number => {
  const stashCount = ALL_DRUG_KEYS.reduce((sum, key) => sum + (inv[key] || 0), 0);
  return stashCount + (hasActiveOrder ? 1 : 0);
};

export const getVaultDrugsCount = (vault: Record<string, number> = {}): number => {
  return ALL_DRUG_KEYS.reduce((sum, key) => sum + (vault[key] || 0), 0);
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_first_seed',
    title: 'First Green Sprout',
    chapter: 1,
    chapterTitle: 'Chapter 1: The Motel Strip Hustle',
    desc: 'Plant an OG Kush seed in your Motel #104 grow room pot.',
    category: 'tutorial',
    objectives: [
      { id: 'obj_plant', text: 'Plant 1x Seed in any grow pot', current: 0, target: 1, completed: false }
    ],
    rewardCash: 120,
    rewardRep: 10,
    rewardItems: { baggies: 15 },
    rewardDesc: '+$120 Cash, +10 Rep, +15 Baggies',
    completed: false,
    claimed: false
  },
  {
    id: 'm2_first_pack',
    title: 'Packaging Product',
    chapter: 1,
    chapterTitle: 'Chapter 1: The Motel Strip Hustle',
    desc: 'Package harvested bud into dime bags on your Packaging Bench.',
    category: 'production',
    objectives: [
      { id: 'obj_pack', text: 'Package 3x Dime Bags', current: 0, target: 3, completed: false }
    ],
    rewardCash: 180,
    rewardRep: 15,
    rewardItems: { seeds_og: 2 },
    rewardDesc: '+$180 Cash, +15 Rep, +2 OG Kush Seeds',
    completed: false,
    claimed: false
  },
  {
    id: 'm3_first_delivery',
    title: 'First Street Drop',
    chapter: 1,
    chapterTitle: 'Chapter 1: The Motel Strip Hustle',
    desc: 'Accept a buyer order on Dope-OS and complete the 3D delivery drop.',
    category: 'delivery',
    objectives: [
      { id: 'obj_deliver', text: 'Complete 1x Customer Delivery Drop', current: 0, target: 1, completed: false }
    ],
    rewardCash: 250,
    rewardRep: 20,
    rewardItems: { fertilizer: 4 },
    rewardDesc: '+$250 Cash, +20 Rep, +4 Feed Jugs',
    completed: false,
    claimed: false
  },
  {
    id: 'm4_the_mixer',
    title: 'The Kitchen Mixer',
    chapter: 1,
    chapterTitle: 'Chapter 1: The Motel Strip Hustle',
    desc: 'Use the cutting table in the Chemistry Lab to stretch product with adulterants.',
    category: 'production',
    objectives: [
      { id: 'obj_cut', text: 'Cut 1x Drug Batch with Baking Soda or Caffeine', current: 0, target: 1, completed: false }
    ],
    rewardCash: 220,
    rewardRep: 18,
    rewardItems: { baking_soda: 3 },
    rewardDesc: '+$220 Cash, +18 Rep, +3 Baking Soda',
    completed: false,
    claimed: false
  },
  {
    id: 'm5_lab_chemist',
    title: 'Underground Chemist',
    chapter: 2,
    chapterTitle: 'Chapter 2: Scaling The Syndicate',
    desc: 'Synthesize a batch of Golden Shatter or Blue Ice Crystal in the Lab.',
    category: 'production',
    objectives: [
      { id: 'obj_cook', text: 'Complete 1x Lab Synthesis batch', current: 0, target: 1, completed: false }
    ],
    rewardCash: 450,
    rewardRep: 30,
    rewardItems: { butane: 3, acetone: 2 },
    rewardDesc: '+$450 Cash, +30 Rep, Lab Chemicals',
    completed: false,
    claimed: false
  },
  {
    id: 'm6_wheels',
    title: 'Syndicate Wheels',
    chapter: 2,
    chapterTitle: 'Chapter 2: Scaling The Syndicate',
    desc: 'Upgrade your ride by purchasing the Vandura Cargo Van or Dominator V8.',
    category: 'empire',
    objectives: [
      { id: 'obj_vehicle', text: 'Acquire 1x New Vehicle', current: 0, target: 1, completed: false }
    ],
    rewardCash: 600,
    rewardRep: 35,
    rewardDesc: '+$600 Cash, +35 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm7_partner',
    title: 'Shared-Safehouse Partner',
    chapter: 2,
    chapterTitle: 'Chapter 2: Scaling The Syndicate',
    desc: 'Hire a commission street partner to sell drugs directly from your safehouse.',
    category: 'empire',
    objectives: [
      { id: 'obj_partner', text: 'Hire 1x Commission Partner', current: 0, target: 1, completed: false }
    ],
    rewardCash: 500,
    rewardRep: 30,
    rewardDesc: '+$500 Cash, +30 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm8_laundering',
    title: 'Clean Money Only',
    chapter: 2,
    chapterTitle: 'Chapter 2: Scaling The Syndicate',
    desc: 'Acquire a front business and launder dirty street cash into clean bank funds.',
    category: 'empire',
    objectives: [
      { id: 'obj_wash', text: 'Launder $1,000+ into Clean Bank', current: 0, target: 1000, completed: false }
    ],
    rewardCash: 800,
    rewardRep: 40,
    rewardDesc: '+$800 Cash, +40 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm9_shadow_ghost',
    title: 'Ghost in the Shadows',
    chapter: 3,
    chapterTitle: 'Chapter 3: District Dominance',
    desc: 'Lose an active 30s police pursuit by hiding in any dark alleyway.',
    category: 'stealth',
    objectives: [
      { id: 'obj_escape', text: 'Evade 1x Police Pursuit in a Shadow Alley', current: 0, target: 1, completed: false }
    ],
    rewardCash: 1200,
    rewardRep: 50,
    rewardDesc: '+$1,200 Cash, +50 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm10_kingpin',
    title: 'District Turf Warlord',
    chapter: 3,
    chapterTitle: 'Chapter 3: District Dominance',
    desc: 'Bribe a district gang in the Empire Tab to secure protected turf and boost street drop payouts.',
    category: 'empire',
    objectives: [
      { id: 'obj_turf', text: 'Bribe 1x District Syndicate Gang', current: 0, target: 1, completed: false }
    ],
    rewardCash: 1500,
    rewardRep: 60,
    rewardDesc: '+$1,500 Cash, +60 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm11_safehouse_fortress',
    title: 'Fortress Safehouse',
    chapter: 4,
    chapterTitle: 'Chapter 4: Cartel Rivalry & Expansion',
    desc: 'Install a Carbon Air Scrubber, Reinforced Vault Safe, or Hydroponic Lights in your Safehouse.',
    category: 'empire',
    objectives: [
      { id: 'obj_upgrade_sh', text: 'Install 1x Safehouse Security/Grow Upgrade', current: 0, target: 1, completed: false }
    ],
    rewardCash: 1800,
    rewardRep: 70,
    rewardDesc: '+$1,800 Cash, +70 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm12_real_estate_mogul',
    title: 'Syndicate Real Estate Mogul',
    chapter: 4,
    chapterTitle: 'Chapter 4: Cartel Rivalry & Expansion',
    desc: 'Expand beyond Motel #104 by purchasing a second Safehouse property (RV Lab, Docks, Velvet Penthouse, or Hillside Villa).',
    category: 'empire',
    objectives: [
      { id: 'obj_property', text: 'Own 2+ Safehouse Properties', current: 1, target: 2, completed: false }
    ],
    rewardCash: 2500,
    rewardRep: 85,
    rewardDesc: '+$2,500 Cash, +85 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm13_convenience_supply',
    title: 'Town Supply Chain',
    chapter: 4,
    chapterTitle: 'Chapter 4: Cartel Rivalry & Expansion',
    desc: 'Visit Shopkeeper Gus at the Hyland 24/7 Convenience Mart in town (Press B) and purchase legal cultivation/lab supplies.',
    category: 'production',
    objectives: [
      { id: 'obj_mart', text: 'Buy 1x Supply Item from Town Convenience Mart', current: 0, target: 1, completed: false }
    ],
    rewardCash: 900,
    rewardRep: 45,
    rewardDesc: '+$900 Cash, +45 Rep',
    completed: false,
    claimed: false
  },
  {
    id: 'm14_kingpin_ending',
    title: 'The Final Takeover: Crown of Hyland Point (FINALE)',
    chapter: 5,
    chapterTitle: 'Chapter 5: The Finale — Kingpin Ascension',
    desc: 'Overthrow the remnants of the old Vance Cartel by accumulating $15,000+ Total Net Worth (Cash + Bank) to claim the Crown of Hyland Point and unlock the Game Ending!',
    category: 'empire',
    objectives: [
      { id: 'obj_networth', text: 'Reach $15,000+ Total Net Worth (Unlocks Story Ending)', current: 0, target: 15000, completed: false }
    ],
    rewardCash: 10000,
    rewardRep: 200,
    rewardDesc: '👑 +$10,000 Cash, +200 Rep & UNLOCKS GAME ENDING!',
    completed: false,
    claimed: false
  }
];

export const trackProgressInState = (
  curr: GameState,
  actionType: string,
  amount = 1,
  onMissionCompleted?: (m: Mission) => void
): GameState => {
  if (!curr.missions || curr.missions.length === 0) return curr;

  let anyUpdated = false;
  const updatedMissions = curr.missions.map(mission => {
    if (mission.completed) return mission;

    let missionObjectiveMatched = false;
    const newObjectives = mission.objectives.map(obj => {
      if (obj.completed) return obj;

      let matched = false;
      if (actionType === 'plant_seed' && obj.id === 'obj_plant') matched = true;
      else if (actionType === 'pack_dime' && obj.id === 'obj_pack') matched = true;
      else if (actionType === 'deliver_order' && obj.id === 'obj_deliver') matched = true;
      else if (actionType === 'cut_product' && obj.id === 'obj_cut') matched = true;
      else if (actionType === 'cook_lab' && obj.id === 'obj_cook') matched = true;
      else if (actionType === 'buy_vehicle' && obj.id === 'obj_vehicle') matched = true;
      else if (actionType === 'hire_partner' && obj.id === 'obj_partner') matched = true;
      else if (actionType === 'wash_cash' && obj.id === 'obj_wash') matched = true;
      else if (actionType === 'escape_police' && obj.id === 'obj_escape') matched = true;
      else if (actionType === 'bribe_turf' && obj.id === 'obj_turf') matched = true;
      else if (actionType === 'safehouse_upgrade' && obj.id === 'obj_upgrade_sh') matched = true;
      else if (actionType === 'buy_mart' && obj.id === 'obj_mart') matched = true;
      else if (actionType === 'buy_property' && obj.id === 'obj_property') {
        const ownedCount = curr.properties.filter(p => p.owned).length;
        const newCurrent = Math.max(obj.current, ownedCount);
        const completed = newCurrent >= obj.target;
        if (newCurrent !== obj.current || completed !== obj.completed) {
          anyUpdated = true;
          missionObjectiveMatched = true;
          return { ...obj, current: newCurrent, completed };
        }
        return obj;
      } else if (actionType === 'check_networth' && obj.id === 'obj_networth') {
        const totalNetWorth = curr.cash + curr.bank;
        const newCurrent = Math.max(obj.current, totalNetWorth);
        const completed = newCurrent >= obj.target;
        if (newCurrent !== obj.current || completed !== obj.completed) {
          anyUpdated = true;
          missionObjectiveMatched = true;
          return { ...obj, current: newCurrent, completed };
        }
        return obj;
      }

      if (matched) {
        anyUpdated = true;
        missionObjectiveMatched = true;
        const newCurrent = Math.min(obj.target, obj.current + amount);
        const completed = newCurrent >= obj.target;
        return { ...obj, current: newCurrent, completed };
      }
      return obj;
    });

    if (missionObjectiveMatched) {
      const allDone = newObjectives.every(o => o.completed);
      if (allDone && !mission.completed) {
        if (onMissionCompleted) onMissionCompleted(mission);
        return { ...mission, objectives: newObjectives, completed: true };
      }
      return { ...mission, objectives: newObjectives };
    }

    return mission;
  });

  if (!anyUpdated) return curr;
  return { ...curr, missions: updatedMissions };
};

const INITIAL_POTS: Pot[] = [
  { id: 1, strain: 'OG Kush', seedKey: 'seeds_og', stage: 'flowering', progress: 65, water: 70, nutrients: 60, ready: false, yieldAmount: 28 },
  { id: 2, strain: null, seedKey: null, stage: 'empty', progress: 0, water: 0, nutrients: 0, ready: false, yieldAmount: 0 }
];

export const INITIAL_STATE: GameState = {
  day: 1,
  hour: 8,
  minute: 0,
  speed: 1,
  isPaused: false,
  cash: 250,
  bank: 0,
  rep: 15,
  heat: 5,
  activeTab: 'tab-grow',
  activePhoneApp: 'app-messages',
  showMainMenu: false,
  saveModalOpen: false,
  activePropertyId: 'motel',
  insideSafehouse: false,
  safehouseStoreLevel: 1,
  safehouseVault: {},
  safehouseOdor: 0,
  carbonFilterInstalled: false,
  reinforcedSafeInstalled: false,
  hydroponicLightsInstalled: false,
  missions: INITIAL_MISSIONS,
  activeMissionId: 'm1_first_seed',
  batchPurity: 92,
  maxPocketCapacity: 15,
  inv: {
    seeds_og: 2,
    seeds_sour: 1,
    seeds_purple: 0,
    fertilizer: 4,
    butane: 2,
    cold_meds: 0,
    acetone: 1,
    baggies: 25,
    glass_vials: 5,
    baking_soda: 2,
    caffeine: 1,
    baby_powder: 0,
    fentanyl: 0,
    raw_bud_og: 12,
    raw_bud_sour: 0,
    raw_bud_purple: 0,
    raw_shatter: 2,
    raw_crystal: 0,
    raw_distillate: 0,
    raw_hash: 0,
    pack_og_dime: 5,
    pack_og_eighth: 1,
    pack_og_ounce: 0,
    pack_sour_dime: 0,
    pack_sour_eighth: 0,
    pack_purple_eighth: 0,
    pack_shatter_gram: 1,
    pack_crystal_gram: 0,
    pack_vape_cart: 0,
    pack_hash_slab: 0
  },
  pots: INITIAL_POTS,
  lab: {
    activeRecipe: 'shatter',
    isCooking: false,
    progress: 0,
    temp: 50,
    purity: 92,
    targetMin: 55,
    targetMax: 75
  },
  messages: [
    {
      id: 1,
      name: "Alison",
      avatar: "👩‍🎓",
      district: "Motel Strip",
      text: "Hey! Cramming for finals tonight. Need 3 dime bags at the motel diner ASAP.",
      reqItem: "pack_og_dime",
      qty: 3,
      payout: 85,
      status: "pending",
      isTrap: false,
      timeRemaining: 240,
      dropCoords: { x: 480, y: 230 }
    }
  ],
  activeOrder: null,
  customers: INITIAL_CUSTOMERS,
  streetDealers: INITIAL_DEALERS,
  marketEvent: MARKET_EVENTS[0],
  vehicles: INITIAL_VEHICLES,
  currentVehicleId: 'beater',
  playerOnFoot: false,
  parkedVehicle: null,
  policeChase: {
    detectionTime: 0,
    isChasing: false,
    chaseTimeRemaining: 0,
    hideTime: 0,
    bustedStrikes: 0,
    maxStrikes: 5
  },
  properties: INITIAL_PROPERTIES,
  staff: INITIAL_STAFF,
  laundering: INITIAL_LAUNDERING,
  turfs: INITIAL_TURFS,
  scannerLogs: [
    "[08:00] Dispatch: Hyland Point VHF Channel 3 open. Monitoring district patrol units.",
    "[08:02] Unit 14: Routine sweep along Motel Strip alleyways. All quiet.",
    "[08:05] Advisory: Curfew patrol will deploy if city heat exceeds 60%."
  ],
  stats: {
    totalEarnedCash: 250,
    totalCleanedBank: 0,
    totalHarvestsGrams: 0,
    totalDeliveries: 0,
    raidsSurvived: 0,
    timesBusted: 0
  },
  devSettings: {
    isOpen: false,
    playerWalkSpeed: 1.8,
    carSpeedMult: 1.0,
    carAccelMult: 1.0,
    policePatrolSpeed: 1.4,
    policeChaseSpeed: 2.4,
    policeDisabled: false,
    timeOfDay: 'auto',
    drivingCameraMode: 'chase',
    godMode: false
  }
};

interface GameContextType {
  state: GameState;
  notifications: GameNotification[];
  modal: ModalConfig;
  saveSlots: SaveSlot[];
  showToast: (text: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
  dismissNotification: (id: string) => void;
  openModal: (title: string, body: string, confirmText?: string, onConfirm?: () => void, cancelText?: string) => void;
  closeModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setActivePhoneApp: (app: PhoneApp) => void;
  setSpeed: (speed: number) => void;
  togglePause: () => void;
  toggleAudio: () => boolean;
  toggleNotifications: () => boolean;
  toggleThemeMode: () => void;
  openEndingModal: () => void;
  closeEndingModal: () => void;
  openSaveModal: () => void;
  closeSaveModal: () => void;
  openMainMenu: () => void;
  closeMainMenu: () => void;
  saveGame: (saveAsNew: boolean, slotId?: string, customName?: string) => void;
  loadGame: (slotId: string) => void;
  deleteSaveSlot: (slotId: string) => void;
  startNewGame: () => void;
  continueGame: () => void;
  resetGame: () => void;
  
  // Cultivation
  plantSeed: (potId: number, seedKey: string) => void;
  waterPot: (potId: number) => void;
  fertilizePot: (potId: number) => void;
  harvestPot: (potId: number) => void;
  quickWaterAll: () => void;
  quickFertilizeAll: () => void;
  buyCultivationStation: () => void;

  // Chemistry Lab & Cutting Table
  selectLabRecipe: (recipe: RecipeKey) => void;
  setLabHeatSlider: (temp: number) => void;
  startLabSynthesis: () => void;
  finishLabSynthesis: () => void;
  cutProduct: (rawKey: string, agentKey: string) => void;

  // Packaging
  packItem: (packKey: string) => void;
  bulkPackDimes: () => void;

  // Phone & Orders
  acceptOrder: (orderId: number) => void;
  declineOrder: (orderId: number) => void;
  haggleOrder: (orderId: number) => void;
  pingLocalContacts: () => void;
  completeDelivery: () => void;

  // Darknet, Safehouse Store & Town Convenience Shop
  buyDarknetItem: (itemId: string) => void;
  buyConvenienceShopItem: (itemId: string) => void;
  upgradeSafehouseStore: () => void;
  depositAllDrugsToVault: () => void;
  withdrawAllDrugsFromVault: () => void;
  sleepInSafehouseBed: () => void;

  // Real Estate, Safehouse Interior, Empire & Sub-Dealers
  buyProperty: (propId: string) => void;
  selectProperty: (propId: string) => void;
  setInsideSafehouse: (inside: boolean) => void;
  hireStaff: (staffId: string) => void;
  fireStaff: (staffId: string) => void;
  buyLaunderingFront: (frontId: string) => void;
  washCash: (frontId: string) => void;
  bribeTurfGang: (district: DistrictName) => void;
  buyVehicle: (vehicleId: string) => void;
  selectVehicle: (vehicleId: string) => void;
  hireDealer: (dealerId: string) => void;
  supplyDealer: (dealerId: string, itemKey: string, qty: number) => void;
  collectDealerCash: (dealerId: string) => void;
  bailDealer: (dealerId: string) => void;
  recordPartnerManualSale: (dealerId: string, buyerName?: string) => void;

  // On-Foot, Camera, Pay 'n' Spray & Police Chase Mechanics
  toggleFootMode: (playerPos: { x: number; y: number; angle: number }) => void;
  toggleDrivingCamera: () => void;
  usePayNSpray: (cost?: number, newColor?: string) => boolean;
  recordPoliceSpotted: (dt: number, inShadow: boolean) => void;
  triggerBustedArrest: () => void;

  // Developer Section & Cheats
  toggleDevPanel: () => void;
  updateDevSettings: (settings: Partial<DevSettings>) => void;
  devAddCash: (amount: number) => void;
  devSetCash: (amount: number) => void;
  devSetBank: (amount: number) => void;
  devMaxInventory: () => void;
  devInstantHarvestPots: () => void;
  devClearHeat: () => void;
  devTeleportToDrop: () => void;
  devTeleportToSafehouse: () => void;
  devCompleteOrderNow: () => void;
  devCycleMarketEvent: () => void;

  // Direct Street & Quick Selling
  sellDrugStreet: (itemKey: string, qty?: number) => void;
  sellDrugToPedestrian: (pedId: number, pedName?: string) => boolean;

  // Syndicate Missions & Safehouse Upgrades
  claimMissionReward: (missionId: string) => void;
  setActiveMission: (missionId: string) => void;
  buySafehouseUpgrade: (upgradeId: 'carbon_filter' | 'reinforced_safe' | 'hydroponics') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>(() => {
    try {
      const raw = localStorage.getItem('schedule1_save_slots');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('schedule1_react_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.properties) {
          parsed.properties = parsed.properties.map((p: Property) => {
            const initP = INITIAL_PROPERTIES.find(ip => ip.id === p.id);
            return initP ? { ...initP, owned: p.owned } : p;
          });
        }
        if (parsed.vehicles) {
          parsed.vehicles = parsed.vehicles.map((v: Vehicle) => {
            const initV = INITIAL_VEHICLES.find(iv => iv.id === v.id);
            return initV ? { ...initV, owned: v.owned, color: v.color || initV.color } : v;
          });
        }
        const mergedDealers = INITIAL_DEALERS.map(initD => {
          const foundD = parsed.streetDealers?.find((d: StreetDealer) => d.id === initD.id);
          return foundD ? { ...initD, ...foundD, levelReq: initD.levelReq } : initD;
        });
        return {
          ...INITIAL_STATE,
          ...parsed,
          inv: { ...INITIAL_STATE.inv, ...(parsed.inv || {}) },
          customers: parsed.customers && parsed.customers.length > 0 ? parsed.customers : INITIAL_CUSTOMERS,
          streetDealers: mergedDealers,
          marketEvent: parsed.marketEvent || MARKET_EVENTS[0],
          activePropertyId: parsed.activePropertyId || 'motel',
          insideSafehouse: Boolean(parsed.insideSafehouse),
          safehouseStoreLevel: parsed.safehouseStoreLevel || 1,
          safehouseVault: parsed.safehouseVault || {},
          safehouseOdor: parsed.safehouseOdor || 0,
          carbonFilterInstalled: Boolean(parsed.carbonFilterInstalled),
          reinforcedSafeInstalled: Boolean(parsed.reinforcedSafeInstalled),
          hydroponicLightsInstalled: Boolean(parsed.hydroponicLightsInstalled),
          missions: parsed.missions && parsed.missions.length > 0
            ? INITIAL_MISSIONS.map(im => {
                const savedM = parsed.missions.find((m: Mission) => m.id === im.id);
                return savedM ? { ...im, ...savedM } : im;
              })
            : INITIAL_MISSIONS,
          activeMissionId: parsed.activeMissionId || 'm1_first_seed',
          batchPurity: typeof parsed.batchPurity === 'number' ? parsed.batchPurity : 92,
          maxPocketCapacity: parsed.maxPocketCapacity || 15,
          devSettings: { ...INITIAL_STATE.devSettings, ...(parsed.devSettings || {}) },
          showMainMenu: false,
          saveModalOpen: false
        };
      }
    } catch (e) {
      console.warn("Failed to load local storage save:", e);
    }
    return INITIAL_STATE;
  });

  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    body: '',
    confirmText: 'OK'
  });

  const notificationsMutedRef = useRef<boolean>(Boolean(state.notificationsMuted));
  notificationsMutedRef.current = Boolean(state.notificationsMuted);

  const lastToastRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

  const showToast = useCallback((text: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') => {
    if (notificationsMutedRef.current) return;
    const now = Date.now();
    if (lastToastRef.current.text === text && now - lastToastRef.current.time < 1500) {
      return;
    }
    lastToastRef.current = { text, time: now };

    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const openModal = useCallback((
    title: string, 
    body: string, 
    confirmText = 'Confirm', 
    onConfirm?: () => void,
    cancelText?: string
  ) => {
    setModal({
      isOpen: true,
      title,
      body,
      confirmText,
      cancelText,
      onConfirm
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setActiveTab = (tab: ActiveTab) => setState(prev => ({ ...prev, activeTab: tab }));
  const setActivePhoneApp = (app: PhoneApp) => setState(prev => ({ ...prev, activePhoneApp: app }));

  const setSpeed = (speed: number) => {
    setState(prev => ({ ...prev, speed }));
    showToast(`Simulation speed set to ${speed}x`, 'info');
  };

  const togglePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const toggleAudio = () => {
    const nextMuted = !sound.muted;
    sound.muted = nextMuted;
    if (nextMuted) {
      sound.updateEngineHum(0, false);
      if (sound.radioActive) {
        sound.toggleRadio();
      }
    } else {
      sound.playPing();
    }
    setState(prev => ({ ...prev, audioMuted: nextMuted }));
    if (!notificationsMutedRef.current) {
      showToast(nextMuted ? "🔇 Silent Mode ON (All Audio Muted)" : "🔊 Sound Enabled", 'info');
    }
    return !nextMuted;
  };

  const toggleNotifications = useCallback(() => {
    let nextMuted = false;
    setState(prev => {
      nextMuted = !prev.notificationsMuted;
      notificationsMutedRef.current = nextMuted;
      return {
        ...prev,
        notificationsMuted: nextMuted
      };
    });
    if (nextMuted) {
      setNotifications([]);
    }
    return !nextMuted;
  }, []);

  const toggleThemeMode = useCallback(() => {
    setState(prev => {
      const nextTheme = prev.themeMode === 'light' ? 'dark' : 'light';
      return {
        ...prev,
        themeMode: nextTheme
      };
    });
  }, []);

  const openEndingModal = useCallback(() => {
    sound.playFanfare();
    setState(prev => ({
      ...prev,
      endingUnlocked: true,
      endingModalOpen: true,
      isPaused: true
    }));
  }, []);

  const closeEndingModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      endingModalOpen: false,
      isPaused: false
    }));
  }, []);

  const toggleDrivingCamera = useCallback(() => {
    setState(prev => {
      const nextMode = prev.devSettings.drivingCameraMode === 'chase' ? 'cockpit' : 'chase';
      showToast(
        nextMode === 'cockpit'
          ? "Switched to 1st-Person Cockpit Dashboard View (C)"
          : "Switched to 3rd-Person GTA Chase Camera (C)",
        "info"
      );
      return {
        ...prev,
        devSettings: {
          ...prev.devSettings,
          drivingCameraMode: nextMode
        }
      };
    });
  }, [showToast]);

  const usePayNSpray = useCallback((cost = 150, newColor?: string): boolean => {
    let success = false;
    setState(prev => {
      if (prev.cash < cost) {
        showToast(`Need $${cost} cash for Pay 'n' Spray respray & heat wipe!`, "warning");
        return prev;
      }

      const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#eab308', '#f43f5e'];
      const chosenColor = newColor || COLORS[Math.floor(Math.random() * COLORS.length)];

      sound.playSpray();
      showToast(`🎨 PAY 'N' SPRAY: Vehicle resprayed! Police pursuit cleared & strikes reset to 0/5! (-$${cost})`, "success");
      success = true;

      return {
        ...prev,
        cash: prev.cash - cost,
        heat: Math.max(0, prev.heat - 25),
        vehicles: prev.vehicles.map(v => v.id === prev.currentVehicleId ? { ...v, color: chosenColor } : v),
        policeChase: {
          ...prev.policeChase,
          isChasing: false,
          chaseTimeRemaining: 0,
          detectionTime: 0,
          hideTime: 0,
          bustedStrikes: 0
        }
      };
    });
    return success;
  }, [showToast]);

  // Main Menu & Save Dialog
  const openMainMenu = () => setState(prev => ({ ...prev, showMainMenu: true, isPaused: true }));
  const closeMainMenu = () => setState(prev => ({ ...prev, showMainMenu: false, isPaused: false }));
  const openSaveModal = () => setState(prev => ({ ...prev, saveModalOpen: true }));
  const closeSaveModal = () => setState(prev => ({ ...prev, saveModalOpen: false }));

  // Save Game (New Slot vs Overwrite)
  const saveGame = useCallback((saveAsNew: boolean, slotId?: string, customName?: string) => {
    try {
      const timestamp = new Date().toLocaleString();
      const currentSnapshot = { ...state, showMainMenu: false, saveModalOpen: false };
      
      let updatedSlots: SaveSlot[] = [...saveSlots];

      if (saveAsNew || !slotId) {
        const newId = `slot_${Date.now()}`;
        const slotName = customName || `Save Slot ${saveSlots.length + 1} (Day ${state.day} - $${state.cash.toLocaleString()})`;
        const newSlot: SaveSlot = {
          id: newId,
          name: slotName,
          timestamp,
          day: state.day,
          cash: state.cash,
          bank: state.bank,
          rep: state.rep,
          state: currentSnapshot
        };
        updatedSlots = [newSlot, ...saveSlots];
      } else {
        updatedSlots = updatedSlots.map(s => {
          if (s.id === slotId) {
            return {
              ...s,
              timestamp,
              day: state.day,
              cash: state.cash,
              bank: state.bank,
              rep: state.rep,
              state: currentSnapshot
            };
          }
          return s;
        });
      }

      setSaveSlots(updatedSlots);
      localStorage.setItem('schedule1_save_slots', JSON.stringify(updatedSlots));
      localStorage.setItem('schedule1_react_save', JSON.stringify(currentSnapshot));

      sound.playPing();
      showToast(saveAsNew ? "Saved into a new save slot!" : "Overwrote existing save slot!", "success");
      setState(prev => ({ ...prev, saveModalOpen: false }));
    } catch (e) {
      showToast("Failed to write save slot to storage.", "danger");
    }
  }, [state, saveSlots, showToast]);

  const loadGame = useCallback((slotId: string) => {
    const slot = saveSlots.find(s => s.id === slotId);
    if (!slot) {
      showToast("Save slot not found!", "warning");
      return;
    }
    const updatedVehicles = slot.state.vehicles?.map(v => {
      const initV = INITIAL_VEHICLES.find(iv => iv.id === v.id);
      return initV ? { ...initV, owned: v.owned, color: v.color || initV.color } : v;
    }) || INITIAL_VEHICLES;
    setState({
      ...INITIAL_STATE,
      ...slot.state,
      inv: { ...INITIAL_STATE.inv, ...(slot.state.inv || {}) },
      customers: slot.state.customers || INITIAL_CUSTOMERS,
      streetDealers: slot.state.streetDealers || INITIAL_DEALERS,
      marketEvent: slot.state.marketEvent || MARKET_EVENTS[0],
      missions: slot.state.missions && slot.state.missions.length > 0
        ? INITIAL_MISSIONS.map(im => {
            const savedM = slot.state.missions?.find((m: Mission) => m.id === im.id);
            return savedM ? { ...im, ...savedM } : im;
          })
        : INITIAL_MISSIONS,
      activeMissionId: slot.state.activeMissionId || 'm1_first_seed',
      safehouseOdor: slot.state.safehouseOdor || 0,
      carbonFilterInstalled: Boolean(slot.state.carbonFilterInstalled),
      reinforcedSafeInstalled: Boolean(slot.state.reinforcedSafeInstalled),
      hydroponicLightsInstalled: Boolean(slot.state.hydroponicLightsInstalled),
      vehicles: updatedVehicles,
      showMainMenu: false,
      isPaused: false,
      saveModalOpen: false
    });
    sound.playPing();
    showToast(`Loaded ${slot.name}!`, "success");
  }, [saveSlots, showToast]);

  const deleteSaveSlot = useCallback((slotId: string) => {
    const updated = saveSlots.filter(s => s.id !== slotId);
    setSaveSlots(updated);
    try {
      localStorage.setItem('schedule1_save_slots', JSON.stringify(updated));
      showToast("Deleted save slot.", "info");
    } catch (e) {}
  }, [saveSlots, showToast]);

  const continueGame = () => {
    setState(prev => ({ ...prev, showMainMenu: false, isPaused: false }));
  };

  const startNewGame = () => {
    openModal(
      "START A NEW GAME?",
      "Are you sure you want to begin a fresh syndicate playthrough from Day 1?",
      "Start Fresh",
      () => {
        setState({ ...INITIAL_STATE, showMainMenu: false, isPaused: false });
        sound.playFanfare();
        showToast("Welcome to Hyland Point! New game started.", "success");
      },
      "Cancel"
    );
  };

  const resetGame = () => {
    openModal(
      "RESET ALL DATA?",
      "Are you sure you want to wipe all local saves, safehouses, and inventory data?",
      "Wipe Everything",
      () => {
        try {
          localStorage.removeItem('schedule1_react_save');
          localStorage.removeItem('schedule1_save_slots');
        } catch (e) {}
        setSaveSlots([]);
        setState(INITIAL_STATE);
        showToast("All data wiped. Reset to Day 1.", "info");
      },
      "Cancel"
    );
  };

  // Police Chase, 2s Detection, 30s Chase & 5 Strikes
  const recordPoliceSpotted = useCallback((dt: number, inShadow: boolean) => {
    setState(prev => {
      const pc = { ...prev.policeChase };
      let evadedInShadow = false;

      if (inShadow) {
        pc.detectionTime = Math.max(0, pc.detectionTime - dt * 1.5);
        if (pc.isChasing) {
          pc.hideTime += dt;
          if (pc.hideTime >= 3.0 || pc.chaseTimeRemaining <= 0) {
            pc.isChasing = false;
            pc.chaseTimeRemaining = 0;
            pc.hideTime = 0;
            pc.detectionTime = 0;
            evadedInShadow = true;
            sound.playRadioChirp();
            showToast("Lost police pursuit in the shadows! Cops called off the chase.", "success");
          }
        }
      } else {
        pc.hideTime = 0;
        if (!pc.isChasing) {
          pc.detectionTime += dt;
          if (pc.detectionTime >= 2.0) {
            pc.isChasing = true;
            pc.chaseTimeRemaining = 30.0;
            sound.playSiren();
            showToast("🚨 COPS SPOTTED YOU! 30s PURSUIT ACTIVATED! HIDE IN SHADOWS OR PAY 'N' SPRAY!", "danger");
          }
        } else {
          pc.chaseTimeRemaining = Math.max(0, pc.chaseTimeRemaining - dt);
          if (pc.chaseTimeRemaining <= 0) {
            pc.isChasing = false;
            pc.detectionTime = 0;
            showToast("Pursuit timed out! Police lost your trail.", "info");
          }
        }
      }

      const nextState = { ...prev, policeChase: pc };
      if (evadedInShadow) {
        return trackProgressInState(nextState, 'escape_police', 1, (m) => {
          sound.playMissionTriumph();
          showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
        });
      }
      return nextState;
    });
  }, [showToast]);

  const triggerBustedArrest = useCallback(() => {
    setState(prev => {
      sound.playCrash();
      const pc = { ...prev.policeChase };
      pc.bustedStrikes += 1;
      pc.isChasing = false;
      pc.chaseTimeRemaining = 0;
      pc.detectionTime = 0;
      pc.hideTime = 0;

      if (pc.bustedStrikes >= pc.maxStrikes) {
        sound.playSiren();
        const totalPacks = getTotalPackagedCount(prev.inv);
        const trunkSurcharge = totalPacks > prev.maxPocketCapacity ? (totalPacks - prev.maxPocketCapacity) * 10 : 0;
        const penalty = 100 + trunkSurcharge;
        const totalFunds = prev.cash + prev.bank;

        if (totalFunds < penalty) {
          openModal(
            "💀 BUSTED & BANKRUPT — GAME OVER!",
            `You reached 5 arrest strikes and owe a <strong>$${penalty} bail & contraband penalty</strong>, but you are out of funds ($${totalFunds} total)!<br><br>
            Your syndicate empire has collapsed. <strong>The game will restart now.</strong>`,
            "Restart Empire",
            () => {
              setState({ ...INITIAL_STATE, showMainMenu: false, insideSafehouse: true, playerOnFoot: true });
              showToast("Bankrupt! Game restarted inside your Safehouse.", "danger");
            }
          );
          return { ...prev, cash: 0, bank: 0, insideSafehouse: true, playerOnFoot: true };
        }

        let cash = prev.cash;
        let bank = prev.bank;
        if (cash >= penalty) {
          cash -= penalty;
        } else {
          const rem = penalty - cash;
          cash = 0;
          bank = Math.max(0, bank - rem);
        }

        pc.bustedStrikes = 0;

        openModal(
          "🚨 BUSTED BY HYLAND POLICE!",
          `You were caught 5 times by law enforcement!<br><br>
          <strong>Deducted $${penalty} bail penalty${trunkSurcharge > 0 ? ` (includes $${trunkSurcharge} trunk contraband surcharge)` : ''}.</strong> Your arrest strikes have been reset to 0/5, and you have been released back inside your Safehouse.`,
          "Wake Up in Safehouse"
        );

        return {
          ...prev,
          cash,
          bank,
          heat: 15,
          policeChase: pc,
          insideSafehouse: true,
          playerOnFoot: true,
          parkedVehicle: null,
          stats: {
            ...prev.stats,
            timesBusted: prev.stats.timesBusted + 1
          }
        };
      } else {
        setTimeout(() => {
          showToast(`🚔 Caught by Police! Respawned inside your Safehouse (Strike ${pc.bustedStrikes}/${pc.maxStrikes})`, "warning");
        }, 0);
        return {
          ...prev,
          heat: Math.min(100, prev.heat + 10),
          policeChase: pc,
          insideSafehouse: true,
          playerOnFoot: true,
          parkedVehicle: null
        };
      }
    });
  }, [openModal, showToast]);

  // On-Foot and Enter/Exit Vehicle Mode
  const toggleFootMode = (playerPos: { x: number; y: number; angle: number }) => {
    setState(prev => {
      sound.playPing();
      if (!prev.playerOnFoot) {
        const carriedPacks = getTotalPackagedCount(prev.inv);
        if (carriedPacks > prev.maxPocketCapacity) {
          showToast(`Exited vehicle! Pocket limit: ${prev.maxPocketCapacity} packs (excess stored in parked car trunk).`, "info");
        } else {
          showToast("Exited vehicle! You are now on foot (press E/F near car to re-enter).", "info");
        }
        return {
          ...prev,
          playerOnFoot: true,
          parkedVehicle: {
            x: playerPos.x,
            y: playerPos.y,
            angle: playerPos.angle,
            vehicleId: prev.currentVehicleId
          }
        };
      } else {
        showToast("Entered vehicle! Full trunk inventory accessible.", "success");
        return {
          ...prev,
          playerOnFoot: false,
          parkedVehicle: null
        };
      }
    });
  };

  // Cultivation Operations
  const plantSeed = (potId: number, seedKey: string) => {
    setState(prev => {
      if (prev.inv[seedKey] <= 0) {
        showToast("Out of seeds! Purchase more from the SilkHub Darknet.", "warning");
        return prev;
      }

      let strainName = 'OG Kush';
      let yieldAmt = 26;
      if (seedKey === 'seeds_sour') { strainName = 'Sour Diesel'; yieldAmt = 32; }
      if (seedKey === 'seeds_purple') { strainName = 'Purple Haze'; yieldAmt = 40; }

      const updatedPots = prev.pots.map(p => {
        if (p.id === potId) {
          return {
            ...p,
            strain: strainName,
            seedKey: seedKey,
            stage: 'seedling' as const,
            progress: 5,
            water: 80,
            nutrients: 75,
            ready: false,
            yieldAmount: yieldAmt
          };
        }
        return p;
      });

      sound.playHarvest();
      showToast(`Planted ${strainName} in Pot #${potId}!`, "success");

      const nextState = {
        ...prev,
        inv: { ...prev.inv, [seedKey]: prev.inv[seedKey] - 1 },
        pots: updatedPots
      };

      return trackProgressInState(nextState, 'plant_seed', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  };

  const waterPot = (potId: number) => {
    sound.playBubble();
    setState(prev => ({
      ...prev,
      pots: prev.pots.map(p => p.id === potId ? { ...p, water: Math.min(100, p.water + 40) } : p)
    }));
  };

  const fertilizePot = (potId: number) => {
    setState(prev => {
      if (prev.inv.fertilizer <= 0) {
        showToast("Out of fertilizer! Buy nutrient solution from SilkHub.", "warning");
        return prev;
      }
      sound.playBubble();
      return {
        ...prev,
        inv: { ...prev.inv, fertilizer: prev.inv.fertilizer - 1 },
        pots: prev.pots.map(p => p.id === potId ? { ...p, nutrients: Math.min(100, p.nutrients + 45) } : p)
      };
    });
  };

  const harvestPot = (potId: number) => {
    setState(prev => {
      const target = prev.pots.find(p => p.id === potId);
      if (!target || !target.ready) return prev;

      const rawKey = target.seedKey === 'seeds_purple' ? 'raw_bud_purple' : 
                     (target.seedKey === 'seeds_sour' ? 'raw_bud_sour' : 'raw_bud_og');
      const yieldQty = target.yieldAmount || 25;

      sound.playHarvest();
      showToast(`Harvested +${yieldQty}g of pure ${target.strain}! (+5 Rep, Batch Purity +2%)`, "success");

      const updatedPots = prev.pots.map(p => {
        if (p.id === potId) {
          return {
            ...p,
            strain: null,
            seedKey: null,
            stage: 'empty' as const,
            progress: 0,
            water: 0,
            nutrients: 0,
            ready: false,
            yieldAmount: 0
          };
        }
        return p;
      });

      return {
        ...prev,
        rep: prev.rep + 5,
        batchPurity: Math.min(99, prev.batchPurity + 2),
        inv: {
          ...prev.inv,
          [rawKey]: (prev.inv[rawKey] || 0) + yieldQty
        },
        pots: updatedPots,
        stats: {
          ...prev.stats,
          totalHarvestsGrams: prev.stats.totalHarvestsGrams + yieldQty
        }
      };
    });
  };

  const quickWaterAll = () => {
    sound.playBubble();
    setState(prev => ({
      ...prev,
      pots: prev.pots.map(p => p.stage !== 'empty' ? { ...p, water: Math.min(100, p.water + 45) } : p)
    }));
    showToast("Watered all active plants!", "info");
  };

  const quickFertilizeAll = () => {
    setState(prev => {
      const activeUnfed = prev.pots.filter(p => p.stage !== 'empty' && p.nutrients < 80);
      if (activeUnfed.length === 0) {
        showToast("All plants are well fed!", "info");
        return prev;
      }
      if (prev.inv.fertilizer < activeUnfed.length) {
        showToast(`Need ${activeUnfed.length} fertilizer units! Only have ${prev.inv.fertilizer}.`, "warning");
        return prev;
      }
      sound.playBubble();
      return {
        ...prev,
        inv: { ...prev.inv, fertilizer: prev.inv.fertilizer - activeUnfed.length },
        pots: prev.pots.map(p => p.stage !== 'empty' ? { ...p, nutrients: Math.min(100, p.nutrients + 45) } : p)
      };
    });
  };

  const buyCultivationStation = useCallback(() => {
    setState(prev => {
      const level = getPlayerLevel(prev.rep);
      const activeProp = prev.properties.find(p => p.id === prev.activePropertyId) ||
                         prev.properties.slice().reverse().find(p => p.owned) ||
                         prev.properties[0];
      const maxAllowed = getMaxCultivationStations(level, activeProp.maxPots);

      if (prev.pots.length >= activeProp.maxPots) {
        showToast(`Safehouse limit reached (${prev.pots.length}/${activeProp.maxPots} stations)! Upgrade your Safehouse to fit more Cultivation Stations.`, "warning");
        return prev;
      }

      if (prev.pots.length >= maxAllowed) {
        showToast(`Level ${level} cap reached (${prev.pots.length}/${maxAllowed} stations)! Increase your Level (earn more Rep) to unlock more Cultivation Stations.`, "warning");
        return prev;
      }

      const cost = 250;
      if (prev.cash + prev.bank < cost) {
        showToast(`Need $${cost} to purchase a new Cultivation Station!`, "warning");
        return prev;
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (cash >= cost) {
        cash -= cost;
      } else {
        const rem = cost - cash;
        cash = 0;
        bank -= rem;
      }

      const newPotId = prev.pots.length + 1;
      const newPot: Pot = {
        id: newPotId,
        strain: null,
        seedKey: null,
        stage: 'empty',
        progress: 0,
        water: 0,
        nutrients: 0,
        ready: false,
        yieldAmount: 0
      };

      sound.playHarvest();
      showToast(`🌱 Purchased Cultivation Station #${newPotId}! Added to your Safehouse interior & Grow Room.`, "success");

      return {
        ...prev,
        cash,
        bank,
        rep: prev.rep + 4,
        pots: [...prev.pots, newPot]
      };
    });
  }, [showToast]);

  // Chemistry Lab Operations
  const selectLabRecipe = (recipe: RecipeKey) => {
    setState(prev => ({
      ...prev,
      lab: {
        ...prev.lab,
        activeRecipe: recipe,
        targetMin: LAB_RECIPES[recipe].targetMin,
        targetMax: LAB_RECIPES[recipe].targetMax
      }
    }));
    showToast(`Selected Recipe: ${LAB_RECIPES[recipe].name}`, 'info');
  };

  const setLabHeatSlider = (temp: number) => {
    setState(prev => ({
      ...prev,
      lab: { ...prev.lab, temp }
    }));
  };

  const startLabSynthesis = () => {
    setState(prev => {
      if (prev.lab.isCooking) return prev;
      const rec = LAB_RECIPES[prev.lab.activeRecipe];

      for (const [key, qty] of Object.entries(rec.reqs)) {
        if ((prev.inv[key] || 0) < qty) {
          showToast(`Missing ingredients! Requires ${rec.reqText}`, "warning");
          return prev;
        }
      }

      const newInv = { ...prev.inv };
      for (const [key, qty] of Object.entries(rec.reqs)) {
        newInv[key] -= qty;
      }

      sound.playBubble();
      showToast(`Started synthesis for ${rec.name}! Keep heat within safe gauge!`, "success");

      return {
        ...prev,
        inv: newInv,
        lab: {
          ...prev.lab,
          isCooking: true,
          progress: 0,
          purity: 94
        }
      };
    });
  };

  const finishLabSynthesis = useCallback(() => {
    setState(prev => {
      const rec = LAB_RECIPES[prev.lab.activeRecipe];
      const yieldQty = rec.yieldQty;
      const purityBonus = Math.round((prev.lab.purity / 100) * yieldQty);
      const blendedPurity = Math.round((prev.batchPurity * 0.65) + (prev.lab.purity * 0.35));

      sound.playFanfare();
      showToast(`Lab batch complete! Yielded +${purityBonus}g ${rec.yieldName} (${Math.round(prev.lab.purity)}% lab purity)!`, "success");

      const nextState = {
        ...prev,
        rep: prev.rep + 6,
        safehouseOdor: prev.carbonFilterInstalled ? (prev.safehouseOdor || 0) : Math.min(100, (prev.safehouseOdor || 0) + 20),
        batchPurity: Math.min(99, blendedPurity),
        inv: {
          ...prev.inv,
          [rec.yieldItem]: (prev.inv[rec.yieldItem] || 0) + purityBonus
        },
        lab: {
          ...prev.lab,
          isCooking: false,
          progress: 0,
          purity: 92
        }
      };

      return trackProgressInState(nextState, 'cook_lab', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  }, [showToast]);

  // Product Cutting & Adulteration Mixer ("The Cook" Mechanic)
  const cutProduct = useCallback((rawKey: string, agentKey: string) => {
    setState(prev => {
      const agent = CUTTING_AGENTS[agentKey];
      if (!agent) return prev;

      if ((prev.inv[rawKey] || 0) < 5) {
        showToast("Need at least 5g of raw product on the mixing table to cut a batch!", "warning");
        return prev;
      }
      if ((prev.inv[agentKey] || 0) < 1) {
        showToast(`Out of ${agent.name}! Order cutting agents on SilkHub Darknet.`, "warning");
        return prev;
      }

      const newInv = { ...prev.inv };
      newInv[agentKey] -= 1;
      newInv[rawKey] = (newInv[rawKey] || 0) + agent.yieldBonus;

      const nextPurity = Math.max(25, prev.batchPurity - agent.purityDrop);
      sound.playBubble();
      showToast(
        `🧪 Cut batch with ${agent.name}! Stretched +${agent.yieldBonus}g extra product (Batch Purity: ${nextPurity}%)`,
        nextPurity < 60 ? "warning" : "success"
      );

      const nextState = {
        ...prev,
        inv: newInv,
        safehouseOdor: prev.carbonFilterInstalled ? (prev.safehouseOdor || 0) : Math.min(100, (prev.safehouseOdor || 0) + 8),
        batchPurity: nextPurity
      };

      return trackProgressInState(nextState, 'cut_product', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  }, [showToast]);

  // Packaging Operations (with Vehicle Trunk Capacity enforcement)
  const packItem = (packKey: string) => {
    setState(prev => {
      const currentVeh = prev.vehicles.find(v => v.id === prev.currentVehicleId) || prev.vehicles[0];
      const maxStorage = prev.playerOnFoot ? prev.maxPocketCapacity : currentVeh.trunkCapacity;
      const currentPackaged = getTotalPackagedCount(prev.inv);

      if (currentPackaged >= maxStorage) {
        showToast(
          prev.playerOnFoot
            ? `Pocket limit full (${currentPackaged}/${prev.maxPocketCapacity})! Enter your vehicle or sell stock first.`
            : `Vehicle trunk full (${currentPackaged}/${currentVeh.trunkCapacity})! Upgrade to a bigger vehicle or sell stock.`,
          "warning"
        );
        return prev;
      }

      if (prev.inv.baggies <= 0) {
        showToast("Out of baggies! Order a bundle from SilkHub.", "warning");
        return prev;
      }

      const newInv = { ...prev.inv };
      let successMsg = "";

      if (packKey === 'pack_og_dime') {
        if (newInv.raw_bud_og < 1) { showToast("Need at least 1g raw OG bud!", "warning"); return prev; }
        newInv.raw_bud_og -= 1;
        newInv.baggies -= 1;
        newInv.pack_og_dime += 1;
        successMsg = "Sealed 1g Dime Bag of OG Kush!";
      } else if (packKey === 'pack_og_eighth') {
        if (newInv.raw_bud_og < 5) { showToast("Need at least 5g raw OG bud for an eighth!", "warning"); return prev; }
        newInv.raw_bud_og -= 5;
        newInv.baggies -= 1;
        newInv.pack_og_eighth += 1;
        successMsg = "Packaged 5g Eighth Pack of OG Kush!";
      } else if (packKey === 'pack_og_ounce') {
        if (newInv.raw_bud_og < 28) { showToast("Need at least 28g raw OG bud for an ounce bag!", "warning"); return prev; }
        newInv.raw_bud_og -= 28;
        newInv.baggies -= 2;
        newInv.pack_og_ounce += 1;
        successMsg = "Vacuum-sealed 28g Ounce Bag!";
      } else if (packKey === 'pack_sour_dime') {
        if (newInv.raw_bud_sour < 1) { showToast("Need at least 1g raw Sour Diesel!", "warning"); return prev; }
        newInv.raw_bud_sour -= 1;
        newInv.baggies -= 1;
        newInv.pack_sour_dime += 1;
        successMsg = "Sealed 1g Sour Diesel Dime Bag!";
      } else if (packKey === 'pack_sour_eighth') {
        if (newInv.raw_bud_sour < 5) { showToast("Need at least 5g raw Sour Diesel!", "warning"); return prev; }
        newInv.raw_bud_sour -= 5;
        newInv.baggies -= 1;
        newInv.pack_sour_eighth += 1;
        successMsg = "Packaged 5g Sour Diesel Eighth!";
      } else if (packKey === 'pack_purple_eighth') {
        if (newInv.raw_bud_purple < 5) { showToast("Need at least 5g raw Purple Haze!", "warning"); return prev; }
        newInv.raw_bud_purple -= 5;
        newInv.baggies -= 1;
        newInv.pack_purple_eighth += 1;
        successMsg = "Packaged 5g Purple Haze Connoisseur Eighth!";
      } else if (packKey === 'pack_shatter_gram') {
        if (newInv.raw_shatter < 1) { showToast("Need at least 1g raw shatter wax!", "warning"); return prev; }
        newInv.raw_shatter -= 1;
        newInv.baggies -= 1;
        newInv.pack_shatter_gram += 1;
        successMsg = "Packaged 1g Golden Shatter Wax Jar!";
      } else if (packKey === 'pack_crystal_gram') {
        if (newInv.raw_crystal < 1) { showToast("Need at least 1g raw crystal!", "warning"); return prev; }
        newInv.raw_crystal -= 1;
        newInv.baggies -= 1;
        newInv.pack_crystal_gram += 1;
        successMsg = "Packaged 1g Blue Ice Bag!";
      } else if (packKey === 'pack_vape_cart') {
        if (newInv.raw_distillate < 1) { showToast("Need 1g THC distillate!", "warning"); return prev; }
        newInv.raw_distillate -= 1;
        if (newInv.glass_vials <= 0) { showToast("Need Glass Vials & Cartridges from SilkHub!", "warning"); return prev; }
        newInv.glass_vials -= 1;
        newInv.pack_vape_cart += 1;
        successMsg = "Filled 1g Distillate Vape Cart!";
      } else if (packKey === 'pack_hash_slab') {
        if (newInv.raw_hash < 1) { showToast("Need 1g pressed hash!", "warning"); return prev; }
        newInv.raw_hash -= 1;
        newInv.baggies -= 1;
        newInv.pack_hash_slab += 1;
        successMsg = "Wrapped 1g Moroccan Hash Slab!";
      }

      sound.playPing();
      showToast(successMsg, "success");

      const nextState = {
        ...prev,
        inv: newInv
      };

      const isDime = packKey.includes('dime');
      return trackProgressInState(nextState, isDime ? 'pack_dime' : 'pack_any', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  };

  const bulkPackDimes = () => {
    setState(prev => {
      const currentVeh = prev.vehicles.find(v => v.id === prev.currentVehicleId) || prev.vehicles[0];
      const maxStorage = prev.playerOnFoot ? prev.maxPocketCapacity : currentVeh.trunkCapacity;
      const currentPackaged = getTotalPackagedCount(prev.inv);
      const roomLeft = Math.max(0, maxStorage - currentPackaged);

      if (roomLeft <= 0) {
        showToast(`Storage full (${currentPackaged}/${maxStorage})! Free up trunk/pocket space first.`, "warning");
        return prev;
      }

      const maxCanPack = Math.min(prev.inv.raw_bud_og, prev.inv.baggies, 10, roomLeft);
      if (maxCanPack <= 0) {
        showToast("Need Raw OG Bud and Baggies to bulk-pack dime bags!", "warning");
        return prev;
      }

      sound.playPing();
      showToast(`Bulk-packed ${maxCanPack}x OG Dime Bags!`, "success");

      const nextState = {
        ...prev,
        inv: {
          ...prev.inv,
          raw_bud_og: prev.inv.raw_bud_og - maxCanPack,
          baggies: prev.inv.baggies - maxCanPack,
          pack_og_dime: prev.inv.pack_og_dime + maxCanPack
        }
      };

      return trackProgressInState(nextState, 'pack_dime', maxCanPack, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  };

  // Phone & Orders
  const acceptOrder = (orderId: number) => {
    setState(prev => {
      if (prev.activeOrder) {
        showToast("Complete your current active drop before accepting another!", "warning");
        return prev;
      }

      const order = prev.messages.find(m => m.id === orderId);
      if (!order) return prev;

      let newInv = { ...prev.inv };
      const currentPackStock = newInv[order.reqItem] || 0;

      // Auto-package from raw stash if packaged stock is insufficient!
      if (currentPackStock < order.qty) {
        const needed = order.qty - currentPackStock;
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

        const req = RAW_REQUIREMENTS[order.reqItem];
        if (req && (newInv[req.rawKey] || 0) >= needed * req.perItem) {
          newInv[req.rawKey] -= needed * req.perItem;
          if ((newInv.baggies || 0) >= needed) newInv.baggies -= needed;
          newInv[order.reqItem] = currentPackStock + needed;
          showToast(`Auto-packaged ${needed}x from loose stash!`, "info");
        } else {
          showToast(`Missing product! Need ${order.qty}x of ${order.reqItem.replace('pack_', '').replace(/_/g, ' ')} (or loose flower/lab product).`, "warning");
          return prev;
        }
      }

      if (order.isTrap) {
        sound.playSiren();
        openModal(
          "🚨 UNDERCOVER FED INTERCEPTION!",
          `The client was an undercover federal agent! A task force intercepted your communications.<br><br>
          <strong>Your Heat level spiked by +35%!</strong> The burner number has been burned.`,
          "Cut Losses"
        );
        return {
          ...prev,
          heat: Math.min(100, prev.heat + 35),
          messages: prev.messages.filter(m => m.id !== orderId)
        };
      }

      newInv[order.reqItem] -= order.qty;

      const runner = prev.staff.find(s => s.id === 'runner' && s.hired);
      if (runner) {
        sound.playPing();
        showToast(`Runner Pete dispatched to deliver to ${order.name}!`, "info");
        setTimeout(() => {
          setState(curr => {
            sound.playCash();
            showToast(`Runner completed drop to ${order.name}! +$${order.payout} Cash (+5 Rep)`, "success");
            return {
              ...curr,
              cash: curr.cash + order.payout,
              rep: curr.rep + 5,
              activeOrder: null,
              stats: {
                ...curr.stats,
                totalEarnedCash: curr.stats.totalEarnedCash + order.payout,
                totalDeliveries: curr.stats.totalDeliveries + 1
              }
            };
          });
        }, 7000);

        return {
          ...prev,
          inv: newInv,
          messages: prev.messages.filter(m => m.id !== orderId)
        };
      }

      showToast(`Order accepted! Follow the 3D GPS arrow to ${order.district} in "City Run"!`, "success");
      return {
        ...prev,
        inv: newInv,
        activeOrder: order,
        activeTab: 'tab-city',
        messages: prev.messages.filter(m => m.id !== orderId)
      };
    });
  };

  const declineOrder = (orderId: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== orderId)
    }));
    showToast("Order declined.", "info");
  };

  const haggleOrder = (orderId: number) => {
    setState(prev => {
      const order = prev.messages.find(m => m.id === orderId);
      if (!order || order.haggled) return prev;

      const customer = prev.customers.find(c => c.name === order.name);
      const successChance = customer ? 0.55 + (customer.addiction / 250) + (customer.loyalty / 350) : 0.72;

      if (Math.random() < successChance) {
        const bonus = Math.round(order.payout * 0.25);
        sound.playPing();
        showToast(`Haggle success! ${order.name} agreed to pay $${order.payout + bonus}!`, "success");
        return {
          ...prev,
          messages: prev.messages.map(m => m.id === orderId ? { ...m, payout: m.payout + bonus, haggled: true } : m)
        };
      } else {
        sound.playPing();
        showToast(`${order.name} refused the counter-offer and canceled! (-5 Loyalty)`, "warning");
        return {
          ...prev,
          customers: prev.customers.map(c => c.name === order.name ? { ...c, loyalty: Math.max(10, c.loyalty - 5) } : c),
          messages: prev.messages.filter(m => m.id !== orderId)
        };
      }
    });
  };

  const pingLocalContacts = () => {
    sound.init();
    setState(prev => {
      const template = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
      const custProfile = prev.customers.find(c => c.name === template.name);
      const addictionMult = custProfile && custProfile.addiction >= 65 ? 1.8 : (custProfile && custProfile.addiction >= 45 ? 1.3 : 1.0);
      const baseQty = Math.floor(Math.random() * (template.maxQty - template.minQty + 1)) + template.minQty;
      const qty = Math.max(1, Math.round(baseQty * addictionMult));

      const mktMult = prev.marketEvent && prev.marketEvent.district === template.district ? prev.marketEvent.multiplier : 1.0;
      const payout = Math.round(qty * template.unitPrice * mktMult);

      let dropX = 280;
      let dropY = 80;
      if (template.district === 'Downtown Core') { dropX = 1280; dropY = 380; }
      else if (template.district === 'The Docks') { dropX = 2080; dropY = 380; }
      else if (template.district === 'Neon District') { dropX = 1280; dropY = 980; }
      else if (template.district === 'Sunset Hills') { dropX = 480; dropY = 980; }
      else if (template.district === 'Desert Outskirts') { dropX = 2080; dropY = 1280; }

      const newOrder: ClientOrder = {
        id: Date.now(),
        name: template.name,
        avatar: template.avatar,
        district: template.district as DistrictName,
        text: template.text,
        reqItem: template.reqItem,
        qty: qty,
        payout: payout,
        status: 'pending',
        isTrap: template.isTrap || false,
        timeRemaining: 240,
        dropCoords: { x: dropX, y: dropY }
      };

      sound.playPing();
      showToast(`Incoming ping from ${newOrder.name} (${custProfile?.archetype || 'Client'}) in ${newOrder.district}!`, "info");
      return {
        ...prev,
        messages: [newOrder, ...prev.messages.slice(0, 5)]
      };
    });
  };

  const completeDelivery = useCallback(() => {
    setState(prev => {
      if (!prev.activeOrder) return prev;
      const order = prev.activeOrder;

      const turf = prev.turfs.find(t => t.district === order.district);
      const turfMult = turf && turf.bribed ? 1 + (turf.bonusPercent / 100) : 1;
      const mktMult = prev.marketEvent && prev.marketEvent.district === order.district ? prev.marketEvent.multiplier : 1;

      const cust = prev.customers.find(c => c.name === order.name);
      let purityMult = 1.0;
      let extraHeat = 0;
      let repDelta = 8;
      let addictionDelta = 6;
      let loyaltyDelta = 5;
      let feedbackToast = "";

      if (prev.batchPurity >= 85) {
        purityMult = 1.22; // +22% High-Purity Tip
        addictionDelta = 10;
        loyaltyDelta = 8;
        repDelta = 12;
        feedbackToast = ` 🔥 High Purity (${prev.batchPurity}%) Tip +22%!`;
      } else if (prev.batchPurity < 60) {
        // Heavily adulterated batch risk
        if (Math.random() < 0.45) {
          purityMult = 0.7;
          extraHeat = 28;
          repDelta = -5;
          loyaltyDelta = -15;
          feedbackToast = ` ⚠️ Heavily Cut Batch (${prev.batchPurity}%) caused violent reaction! (+28% Heat)`;
        } else {
          purityMult = 0.9;
          loyaltyDelta = -6;
          feedbackToast = ` (Cut Batch ${prev.batchPurity}% noticed by client)`;
        }
      }

      const finalPayout = Math.round(order.payout * turfMult * mktMult * purityMult);

      sound.playCash();
      showToast(
        `Drop complete to ${order.name}: +$${finalPayout.toLocaleString()} Cash!${feedbackToast}`,
        extraHeat > 0 ? "warning" : "success"
      );

      const updatedCustomers = prev.customers.map(c => {
        if (c.name === order.name) {
          return {
            ...c,
            addiction: Math.min(100, Math.max(0, c.addiction + addictionDelta)),
            loyalty: Math.min(100, Math.max(0, c.loyalty + loyaltyDelta))
          };
        }
        return c;
      });

      const nextState = {
        ...prev,
        cash: prev.cash + finalPayout,
        rep: Math.max(0, prev.rep + repDelta),
        heat: Math.min(100, Math.max(0, prev.heat - 3 + extraHeat)),
        customers: updatedCustomers,
        activeOrder: null,
        stats: {
          ...prev.stats,
          totalEarnedCash: prev.stats.totalEarnedCash + finalPayout,
          totalDeliveries: prev.stats.totalDeliveries + 1
        }
      };

      return trackProgressInState(nextState, 'deliver_order', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  }, [showToast]);

  // Rent a Partner (Commission-Based Drug Sales)
  const hireDealer = useCallback((dealerId: string) => {
    setState(prev => {
      const dealer = prev.streetDealers.find(d => d.id === dealerId);
      if (!dealer || dealer.hired) return prev;

      const level = getPlayerLevel(prev.rep);
      const reqLvl = dealer.levelReq || 1;
      if (level < reqLvl) {
        showToast(`Requires Player Level ${reqLvl} to rent partner ${dealer.name}!`, "warning");
        return prev;
      }

      if (prev.cash + prev.bank < dealer.hireCost) {
        showToast(`Need $${dealer.hireCost.toLocaleString()} to rent sales partner ${dealer.name}!`, "warning");
        return prev;
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (cash >= dealer.hireCost) {
        cash -= dealer.hireCost;
      } else {
        const rem = dealer.hireCost - cash;
        cash = 0;
        bank -= rem;
      }

      sound.playFanfare();
      showToast(`🤝 Rented Commission Partner ${dealer.name} (${dealer.cutPercent}% commission)! Supply them with drugs to sell.`, "success");

      const nextState = {
        ...prev,
        cash,
        bank,
        rep: prev.rep + 10,
        streetDealers: prev.streetDealers.map(d => d.id === dealerId ? { ...d, hired: true } : d)
      };

      return trackProgressInState(nextState, 'hire_partner', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  }, [showToast]);

  const supplyDealer = useCallback((dealerId: string, itemKey: string, qty = 5) => {
    setState(prev => {
      const dealer = prev.streetDealers.find(d => d.id === dealerId);
      if (!dealer || !dealer.hired) return prev;
      if (dealer.busted) {
        showToast(`${dealer.name} is currently detained! Bail them out first.`, "warning");
        return prev;
      }

      const spaceLeft = dealer.maxStock - dealer.stock;
      if (spaceLeft <= 0) {
        showToast(`${dealer.name}'s corner stash is full (${dealer.maxStock}/${dealer.maxStock})!`, "warning");
        return prev;
      }

      const available = prev.inv[itemKey] || 0;
      const transferQty = Math.min(qty, available, spaceLeft);

      if (transferQty <= 0) {
        showToast("You don't have any of that item to supply!", "warning");
        return prev;
      }

      const newInv = { ...prev.inv, [itemKey]: available - transferQty };
      sound.playPing();
      showToast(`Supplied ${transferQty}x units to ${dealer.name} (${dealer.cornerName})!`, "success");

      return {
        ...prev,
        inv: newInv,
        streetDealers: prev.streetDealers.map(d =>
          d.id === dealerId ? { ...d, stock: d.stock + transferQty } : d
        )
      };
    });
  }, [showToast]);

  const collectDealerCash = useCallback((dealerId: string) => {
    setState(prev => {
      const dealer = prev.streetDealers.find(d => d.id === dealerId);
      if (!dealer || dealer.cashCollected <= 0) {
        showToast("No cash envelope ready for collection yet.", "info");
        return prev;
      }

      const payout = dealer.cashCollected;
      sound.playCash();
      showToast(`Collected +$${payout.toLocaleString()} dirty cash from ${dealer.name}! (+4 Rep)`, "success");

      return {
        ...prev,
        cash: prev.cash + payout,
        rep: prev.rep + 4,
        streetDealers: prev.streetDealers.map(d =>
          d.id === dealerId ? { ...d, cashCollected: 0 } : d
        ),
        stats: {
          ...prev.stats,
          totalEarnedCash: prev.stats.totalEarnedCash + payout
        }
      };
    });
  }, [showToast]);

  const bailDealer = useCallback((dealerId: string) => {
    setState(prev => {
      const dealer = prev.streetDealers.find(d => d.id === dealerId);
      if (!dealer || !dealer.busted) return prev;

      const bailCost = 250;
      if (prev.cash < bailCost) {
        showToast(`Need $${bailCost} cash to bail out ${dealer.name}!`, "warning");
        return prev;
      }

      sound.playPing();
      showToast(`Bailed out ${dealer.name}! Back on ${dealer.cornerName}.`, "success");

      return {
        ...prev,
        cash: prev.cash - bailCost,
        streetDealers: prev.streetDealers.map(d =>
          d.id === dealerId ? { ...d, busted: false } : d
        )
      };
    });
  }, [showToast]);

  // Called when the 3D Partner physically walks out of the Safehouse and sells to a Pedestrian NPC on the street!
  const recordPartnerManualSale = useCallback((dealerId: string, buyerName = 'Street Buyer') => {
    setState(prev => {
      const dealer = prev.streetDealers.find(d => d.id === dealerId);
      if (!dealer || !dealer.hired || dealer.busted || dealer.stock <= 0) return prev;

      const mktMult = prev.marketEvent && prev.marketEvent.district === dealer.district ? prev.marketEvent.multiplier : 1.0;
      const grossPerUnit = 45 * mktMult;
      const netEarned = Math.round(grossPerUnit * (1 - dealer.cutPercent / 100));

      sound.playCash();
      showToast(
        `🤝 Partner ${dealer.name} sold 1x drug to ${buyerName}! +$${netEarned} added to Partner Envelope (${dealer.stock - 1} left)`,
        "success"
      );

      return {
        ...prev,
        rep: prev.rep + 2,
        streetDealers: prev.streetDealers.map(d =>
          d.id === dealerId
            ? { ...d, stock: d.stock - 1, cashCollected: d.cashCollected + netEarned }
            : d
        )
      };
    });
  }, [showToast]);

  // Direct Street Dealing & Quick Selling
  const sellDrugStreet = useCallback((itemKey: string, qty = 1) => {
    setState(prev => {
      if ((prev.inv[itemKey] || 0) < qty) {
        showToast("You don't have enough of that product in your stash!", "warning");
        return prev;
      }

      const PRICES: { [key: string]: { price: number; name: string } } = {
        raw_bud_og: { price: 18, name: "Raw OG Bud" },
        raw_bud_sour: { price: 20, name: "Raw Sour Diesel" },
        raw_bud_purple: { price: 25, name: "Raw Purple Haze" },
        raw_shatter: { price: 85, name: "Golden Shatter" },
        raw_crystal: { price: 120, name: "Blue Crystal" },
        raw_distillate: { price: 100, name: "Pure Distillate" },
        raw_hash: { price: 75, name: "Pressed Hash" },
        pack_og_dime: { price: 28, name: "1g Dime Bag (OG)" },
        pack_og_eighth: { price: 125, name: "5g Eighth Pack (OG)" },
        pack_og_ounce: { price: 460, name: "28g Ounce Bag (OG)" },
        pack_sour_dime: { price: 30, name: "1g Dime Bag (Sour)" },
        pack_sour_eighth: { price: 135, name: "5g Eighth Pack (Sour)" },
        pack_purple_eighth: { price: 165, name: "5g Eighth (Purple Haze)" },
        pack_shatter_gram: { price: 145, name: "1g Wax Jar (Shatter)" },
        pack_crystal_gram: { price: 230, name: "1g Ice Bag (Crystal)" },
        pack_vape_cart: { price: 190, name: "1g THC Vape Cartridge" },
        pack_hash_slab: { price: 135, name: "1g Pressed Hash Slab" }
      };

      const info = PRICES[itemKey] || { price: 20, name: itemKey.replace(/_/g, ' ') };
      const purityFactor = prev.batchPurity >= 85 ? 1.15 : (prev.batchPurity < 60 ? 0.85 : 1.0);
      const totalCash = Math.round(info.price * qty * purityFactor);

      sound.playCash();
      showToast(`Street Deal: Sold ${qty}x ${info.name} for +$${totalCash.toLocaleString()} Cash! (+${qty * 2} Rep)`, "success");

      const newInv = { ...prev.inv };
      newInv[itemKey] -= qty;

      return {
        ...prev,
        inv: newInv,
        cash: prev.cash + totalCash,
        rep: prev.rep + qty * 2,
        stats: {
          ...prev.stats,
          totalEarnedCash: prev.stats.totalEarnedCash + totalCash,
          totalDeliveries: prev.stats.totalDeliveries + qty
        }
      };
    });
  }, [showToast]);

  const sellDrugToPedestrian = useCallback((pedId: number, pedName = 'Street Buyer'): boolean => {
    let success = false;
    setState(prev => {
      const sellableKeys = [
        'pack_og_dime', 'pack_sour_dime', 'pack_og_eighth', 'pack_sour_eighth',
        'pack_purple_eighth', 'pack_shatter_gram', 'pack_crystal_gram', 'pack_vape_cart', 'pack_hash_slab',
        'raw_bud_og', 'raw_bud_sour', 'raw_bud_purple', 'raw_crystal', 'raw_shatter', 'raw_hash'
      ];

      const itemToSell = sellableKeys.find(k => (prev.inv[k] || 0) > 0);
      if (!itemToSell) {
        showToast("You have no drugs on hand to sell! Harvest bud or pack dime bags first.", "warning");
        return prev;
      }

      const PRICES: { [key: string]: { price: number; name: string } } = {
        raw_bud_og: { price: 25, name: "1g OG Bud" },
        raw_bud_sour: { price: 28, name: "1g Sour Diesel" },
        raw_bud_purple: { price: 32, name: "1g Purple Haze" },
        raw_shatter: { price: 95, name: "1g Golden Shatter" },
        raw_crystal: { price: 135, name: "1g Blue Crystal" },
        raw_hash: { price: 85, name: "1g Pressed Hash" },
        pack_og_dime: { price: 35, name: "OG Dime Bag" },
        pack_sour_dime: { price: 38, name: "Sour Dime Bag" },
        pack_og_eighth: { price: 140, name: "OG Eighth" },
        pack_sour_eighth: { price: 155, name: "Sour Eighth" },
        pack_purple_eighth: { price: 185, name: "Purple Haze Eighth" },
        pack_shatter_gram: { price: 165, name: "Shatter Wax Jar" },
        pack_crystal_gram: { price: 250, name: "Blue Ice Pack" },
        pack_vape_cart: { price: 210, name: "THC Vape Cart" },
        pack_hash_slab: { price: 150, name: "Moroccan Hash Slab" }
      };

      const info = PRICES[itemToSell] || { price: 30, name: itemToSell };
      const purityMult = prev.batchPurity >= 85 ? 1.2 : 1.0;
      const bonusTip = Math.floor(Math.random() * 15);
      const payout = Math.round(info.price * purityMult) + bonusTip;

      const newInv = { ...prev.inv };
      newInv[itemToSell] -= 1;

      sound.playCash();
      showToast(`🤝 Hand-off to ${pedName}: Sold 1x ${info.name} for +$${payout} Cash! (+3 Rep)`, "success");
      success = true;

      return {
        ...prev,
        inv: newInv,
        cash: prev.cash + payout,
        rep: prev.rep + 3,
        heat: Math.min(100, prev.heat + 2),
        stats: {
          ...prev.stats,
          totalEarnedCash: prev.stats.totalEarnedCash + payout,
          totalDeliveries: prev.stats.totalDeliveries + 1
        }
      };
    });
    return success;
  }, [showToast]);

  // Developer Controls & Cheats
  const toggleDevPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      devSettings: {
        ...prev.devSettings,
        isOpen: !prev.devSettings.isOpen
      }
    }));
  }, []);

  const updateDevSettings = useCallback((settings: Partial<DevSettings>) => {
    setState(prev => ({
      ...prev,
      devSettings: {
        ...prev.devSettings,
        ...settings
      }
    }));
  }, []);

  const devAddCash = useCallback((amount: number) => {
    setState(prev => {
      sound.playCash();
      showToast(`[DEV CHEAT] Added +$${amount.toLocaleString()} Cash!`, "success");
      return {
        ...prev,
        cash: prev.cash + amount,
        stats: {
          ...prev.stats,
          totalEarnedCash: prev.stats.totalEarnedCash + amount
        }
      };
    });
  }, [showToast]);

  const devSetCash = useCallback((amount: number) => {
    setState(prev => {
      sound.playCash();
      showToast(`[DEV CHEAT] Set Cash to $${amount.toLocaleString()}!`, "info");
      return { ...prev, cash: Math.max(0, amount) };
    });
  }, [showToast]);

  const devSetBank = useCallback((amount: number) => {
    setState(prev => {
      sound.playCash();
      showToast(`[DEV CHEAT] Set Bank balance to $${amount.toLocaleString()}!`, "info");
      return { ...prev, bank: Math.max(0, amount) };
    });
  }, [showToast]);

  const devMaxInventory = useCallback(() => {
    setState(prev => {
      sound.playHarvest();
      showToast(`[DEV CHEAT] Stash maxed out! Added +50 to all drugs, cutting agents, seeds & supplies!`, "success");
      const newInv = { ...prev.inv };
      const itemsToAdd = [
        'seeds_og', 'seeds_sour', 'seeds_purple',
        'fertilizer', 'butane', 'cold_meds', 'acetone', 'baggies', 'glass_vials',
        'baking_soda', 'caffeine', 'baby_powder', 'fentanyl',
        'raw_bud_og', 'raw_bud_sour', 'raw_bud_purple', 'raw_shatter', 'raw_crystal', 'raw_distillate', 'raw_hash',
        'pack_og_dime', 'pack_og_eighth', 'pack_og_ounce',
        'pack_sour_dime', 'pack_sour_eighth', 'pack_purple_eighth',
        'pack_shatter_gram', 'pack_crystal_gram', 'pack_vape_cart', 'pack_hash_slab'
      ];
      itemsToAdd.forEach(k => {
        newInv[k] = (newInv[k] || 0) + 50;
      });
      return { ...prev, inv: newInv, batchPurity: 98 };
    });
  }, [showToast]);

  const devInstantHarvestPots = useCallback(() => {
    setState(prev => {
      sound.playHarvest();
      let totalHarvest = 0;
      const newInv = { ...prev.inv };
      const updatedPots = prev.pots.map(pot => {
        const yieldAmt = pot.yieldAmount || 30;
        totalHarvest += yieldAmt;
        newInv['raw_bud_og'] = (newInv['raw_bud_og'] || 0) + yieldAmt;
        return {
          ...pot,
          strain: pot.strain || 'OG Kush',
          seedKey: pot.seedKey || 'seeds_og',
          stage: 'seedling' as const,
          progress: 15,
          water: 80,
          nutrients: 80,
          ready: false,
          yieldAmount: 30
        };
      });
      showToast(`[DEV CHEAT] Harvested +${totalHarvest}g of fresh flower into stash!`, "success");
      return {
        ...prev,
        pots: updatedPots,
        inv: newInv,
        stats: {
          ...prev.stats,
          totalHarvestsGrams: prev.stats.totalHarvestsGrams + totalHarvest
        }
      };
    });
  }, [showToast]);

  const devClearHeat = useCallback(() => {
    setState(prev => {
      showToast(`[DEV CHEAT] Police Heat cleared to 0% and arrest strikes reset!`, "info");
      return {
        ...prev,
        heat: 0,
        policeChase: {
          ...prev.policeChase,
          bustedStrikes: 0,
          isChasing: false,
          chaseTimeRemaining: 0,
          detectionTime: 0,
          hideTime: 0
        }
      };
    });
  }, [showToast]);

  const devTeleportToDrop = useCallback(() => {
    setState(prev => {
      if (!prev.activeOrder) {
        showToast("No active drop order to teleport to! Accept an order first.", "warning");
        return prev;
      }
      showToast(`[DEV CHEAT] Teleporting to drop point in ${prev.activeOrder.district}!`, "success");
      return { ...prev, activeTab: 'tab-city' };
    });
  }, [showToast]);

  const devTeleportToSafehouse = useCallback(() => {
    setState(prev => {
      showToast(`[DEV CHEAT] Teleporting to safehouse spawn!`, "info");
      return { ...prev, activeTab: 'tab-city' };
    });
  }, [showToast]);

  const devCompleteOrderNow = useCallback(() => {
    completeDelivery();
  }, [completeDelivery]);

  const devCycleMarketEvent = useCallback(() => {
    setState(prev => {
      const idx = MARKET_EVENTS.findIndex(e => e.id === prev.marketEvent?.id);
      const nextEvt = MARKET_EVENTS[(idx + 1) % MARKET_EVENTS.length];
      showToast(`📈 Market Event: ${nextEvt.title} (${nextEvt.district})`, "info");
      return { ...prev, marketEvent: nextEvt };
    });
  }, [showToast]);

  // Darknet & Safehouse Store Purchases (with Store Level Discount!)
  const buyDarknetItem = (itemId: string) => {
    setState(prev => {
      const item = DARKNET_ITEMS.find(i => i.id === itemId);
      if (!item) return prev;

      const storeLvl = prev.safehouseStoreLevel || 1;
      const discountMult = storeLvl >= 4 ? 0.65 : (storeLvl === 3 ? 0.75 : (storeLvl === 2 ? 0.85 : 1.0));
      const finalCost = Math.max(5, Math.round(item.cost * discountMult));
      const bonusQtyMult = storeLvl >= 4 ? 2 : 1;

      if (prev.cash + prev.bank < finalCost) {
        showToast(`Not enough funds! Need $${finalCost} for ${item.name}.`, "warning");
        return prev;
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (cash >= finalCost) {
        cash -= finalCost;
      } else {
        const rem = finalCost - cash;
        cash = 0;
        bank -= rem;
      }

      sound.playCash();
      showToast(
        `🏪 Safehouse Store: Purchased ${item.name}${bonusQtyMult > 1 ? ' (2x Bulk Bonus!)' : ''} for $${finalCost}!`,
        "success"
      );

      const newInv = { ...prev.inv };
      for (const [key, qty] of Object.entries(item.gives)) {
        newInv[key] = (newInv[key] || 0) + qty * bonusQtyMult;
      }

      return {
        ...prev,
        cash,
        bank,
        inv: newInv
      };
    });
  };

  // Town 24/7 Convenience Mart Purchases (Sells Everything Except Drugs: Soil, Fertilizer, Packaging, Cutting Agents & Lab Supplies)
  const buyConvenienceShopItem = useCallback((itemId: string) => {
    setState(prev => {
      const item = CONVENIENCE_SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return prev;

      const cost = item.cost;
      if (prev.cash + prev.bank < cost) {
        showToast(`Shopkeeper Gus: "You're short on cash! Need $${cost} for ${item.name}."`, "warning");
        return prev;
      }

      const activeProp =
        prev.properties.find(p => p.id === prev.activePropertyId) ||
        prev.properties.slice().reverse().find(p => p.owned) ||
        prev.properties[0];

      if (item.actionType === 'add_pot_soil') {
        const level = getPlayerLevel(prev.rep);
        const maxAllowed = getMaxCultivationStations(level, activeProp.maxPots);
        if (prev.pots.length >= activeProp.maxPots) {
          showToast(`Shopkeeper Gus: "Your ${activeProp.name} is at max capacity (${prev.pots.length}/${activeProp.maxPots} pots)! Upgrade your Safehouse first."`, "warning");
          return prev;
        }
        if (prev.pots.length >= maxAllowed) {
          showToast(`Shopkeeper Gus: "Level ${level} cap reached (${prev.pots.length}/${maxAllowed} pots)! Earn more Rep to fit more grow buckets."`, "warning");
          return prev;
        }
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (cash >= cost) {
        cash -= cost;
      } else {
        const rem = cost - cash;
        cash = 0;
        bank -= rem;
      }

      const newInv = { ...prev.inv };
      if (item.gives) {
        for (const [key, qty] of Object.entries(item.gives)) {
          newInv[key] = (newInv[key] || 0) + qty;
        }
      }

      let updatedPots = prev.pots;
      let nextPocketCap = prev.maxPocketCapacity;

      if (item.actionType === 'add_pot_soil') {
        const newPotId = prev.pots.length + 1;
        const newPot: Pot = {
          id: newPotId,
          strain: null,
          seedKey: null,
          stage: 'empty',
          progress: 0,
          water: 100,
          nutrients: 100,
          ready: false,
          yieldAmount: 0
        };
        updatedPots = [
          ...prev.pots.map(p =>
            p.stage !== 'empty'
              ? { ...p, water: Math.min(100, p.water + 35), nutrients: Math.min(100, p.nutrients + 35) }
              : p
          ),
          newPot
        ];
        sound.playHarvest();
        showToast(
          `🏪 Shopkeeper Gus: Sold ${item.name}! Added Grow Station #${newPotId} & enriched soil in your Safehouse!`,
          "success"
        );
      } else if (item.actionType === 'topdress_soil') {
        updatedPots = prev.pots.map(p =>
          p.stage !== 'empty'
            ? { ...p, water: 100, nutrients: 100, yieldAmount: Math.max(p.yieldAmount || 26, 30) }
            : p
        );
        sound.playBubble();
        showToast(
          `🏪 Shopkeeper Gus: Top-dressed all pots with organic soil & refilled 100% Water/Nutrients (+3 Fertilizer)!`,
          "success"
        );
      } else if (item.actionType === 'upgrade_pocket') {
        nextPocketCap = (prev.maxPocketCapacity || 15) + 5;
        sound.playFanfare();
        showToast(
          `🏪 Shopkeeper Gus: Equipped Cargo Utility Backpack! Pocket Carry Capacity increased to ${nextPocketCap} packs!`,
          "success"
        );
      } else {
        sound.playCash();
        showToast(`🏪 Convenience Mart: Purchased ${item.name} from Shopkeeper Gus for $${cost}!`, "success");
      }

      const nextState: GameState = {
        ...prev,
        cash,
        bank,
        rep: prev.rep + 2,
        inv: newInv,
        pots: updatedPots,
        maxPocketCapacity: nextPocketCap
      };

      return trackProgressInState(nextState, 'buy_mart', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  }, [showToast]);

  const upgradeSafehouseStore = useCallback(() => {
    setState(prev => {
      const currentLvl = prev.safehouseStoreLevel || 1;
      if (currentLvl >= 4) {
        showToast("Safehouse Store is already at Max Level (Level 4 Wholesale)!", "info");
        return prev;
      }

      const UPGRADE_COSTS: Record<number, number> = { 1: 400, 2: 1000, 3: 2500 };
      const cost = UPGRADE_COSTS[currentLvl] || 1000;

      if (prev.cash + prev.bank < cost) {
        showToast(`Need $${cost.toLocaleString()} (Cash + Bank) to upgrade Safehouse Store to Level ${currentLvl + 1}!`, "warning");
        return prev;
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (cash >= cost) {
        cash -= cost;
      } else {
        const rem = cost - cash;
        cash = 0;
        bank -= rem;
      }

      const nextLvl = currentLvl + 1;
      sound.playFanfare();
      showToast(
        `🏪 Upgraded Safehouse Store to Level ${nextLvl}! Unlocked ${nextLvl === 2 ? '15%' : nextLvl === 3 ? '25%' : '35% + 2x Bulk'} store discount & expanded 3D shelves!`,
        "success"
      );

      return {
        ...prev,
        cash,
        bank,
        rep: prev.rep + 12,
        safehouseStoreLevel: nextLvl
      };
    });
  }, [showToast]);

  // Syndicate Missions & Safehouse Upgrades
  const claimMissionReward = useCallback((missionId: string) => {
    setState(prev => {
      const mission = (prev.missions || []).find(m => m.id === missionId);
      if (!mission) {
        showToast("Mission not found!", "warning");
        return prev;
      }
      if (!mission.completed) {
        showToast("Complete all objectives before claiming reward!", "warning");
        return prev;
      }
      if (mission.claimed) {
        showToast("Mission reward already claimed!", "info");
        return prev;
      }

      const newInv = { ...prev.inv };
      if (mission.rewardItems) {
        for (const [k, qty] of Object.entries(mission.rewardItems)) {
          newInv[k] = (newInv[k] || 0) + (qty as number);
        }
      }

      sound.playFanfare();
      showToast(`🏆 Mission Claimed: "${mission.title}"! Awarded ${mission.rewardDesc}`, "success");

      const updatedMissions = prev.missions.map(m =>
        m.id === missionId ? { ...m, claimed: true } : m
      );

      const isFinale = missionId === 'm14_kingpin_ending';

      return {
        ...prev,
        cash: prev.cash + (mission.rewardCash || 0),
        rep: prev.rep + (mission.rewardRep || 0),
        inv: newInv,
        missions: updatedMissions,
        endingUnlocked: isFinale ? true : prev.endingUnlocked,
        endingModalOpen: isFinale ? true : prev.endingModalOpen,
        isPaused: isFinale ? true : prev.isPaused
      };
    });
  }, [showToast]);

  const setActiveMission = useCallback((missionId: string) => {
    setState(prev => {
      const mission = (prev.missions || []).find(m => m.id === missionId);
      if (!mission) return prev;
      sound.playPing();
      showToast(`📌 Active Mission: "${mission.title}"`, "info");
      return { ...prev, activeMissionId: missionId };
    });
  }, [showToast]);

  const buySafehouseUpgrade = useCallback((upgradeId: 'carbon_filter' | 'reinforced_safe' | 'hydroponics') => {
    setState(prev => {
      let cost = 0;
      let name = '';
      let alreadyInstalled = false;

      if (upgradeId === 'carbon_filter') {
        cost = 800;
        name = 'Carbon Air Scrubber';
        alreadyInstalled = !!prev.carbonFilterInstalled;
      } else if (upgradeId === 'reinforced_safe') {
        cost = 1400;
        name = 'Reinforced Vault Safe';
        alreadyInstalled = !!prev.reinforcedSafeInstalled;
      } else if (upgradeId === 'hydroponics') {
        cost = 2200;
        name = 'Hydroponic High-Yield Lights';
        alreadyInstalled = !!prev.hydroponicLightsInstalled;
      }

      if (alreadyInstalled) {
        showToast(`${name} is already installed in this safehouse!`, "info");
        return prev;
      }

      if (prev.cash + prev.bank < cost) {
        showToast(`Not enough funds! ${name} costs $${cost.toLocaleString()}.`, "warning");
        return prev;
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (cash >= cost) {
        cash -= cost;
      } else {
        const rem = cost - cash;
        cash = 0;
        bank -= rem;
      }

      sound.playCash();
      showToast(`🛠️ Safehouse Upgrade Installed: ${name}!`, "success");

      const nextState: GameState = {
        ...prev,
        cash,
        bank,
        carbonFilterInstalled: upgradeId === 'carbon_filter' ? true : prev.carbonFilterInstalled,
        safehouseOdor: upgradeId === 'carbon_filter' ? 0 : prev.safehouseOdor,
        reinforcedSafeInstalled: upgradeId === 'reinforced_safe' ? true : prev.reinforcedSafeInstalled,
        hydroponicLightsInstalled: upgradeId === 'hydroponics' ? true : prev.hydroponicLightsInstalled
      };

      return trackProgressInState(nextState, 'safehouse_upgrade', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  }, [showToast]);

  const depositAllDrugsToVault = useCallback(() => {
    setState(prev => {
      const carriedCount = getCarriedDrugsCount(prev.inv, false);
      if (carriedCount <= 0) {
        showToast("You aren't carrying any drugs on you right now!", "info");
        return prev;
      }

      const newInv = { ...prev.inv };
      const newVault = { ...(prev.safehouseVault || {}) };

      ALL_DRUG_KEYS.forEach(k => {
        if ((newInv[k] || 0) > 0) {
          newVault[k] = (newVault[k] || 0) + newInv[k];
          newInv[k] = 0;
        }
      });

      sound.playPing();
      showToast(`🔒 Stored ${carriedCount} drug units in Safehouse Vault! You are now CLEAN (Police cannot detect you on the street).`, "success");

      return {
        ...prev,
        inv: newInv,
        safehouseVault: newVault
      };
    });
  }, [showToast]);

  const withdrawAllDrugsFromVault = useCallback(() => {
    setState(prev => {
      const vaultCount = getVaultDrugsCount(prev.safehouseVault);
      if (vaultCount <= 0) {
        showToast("Safehouse Vault is currently empty!", "info");
        return prev;
      }

      const newInv = { ...prev.inv };
      const newVault = { ...(prev.safehouseVault || {}) };

      ALL_DRUG_KEYS.forEach(k => {
        if ((newVault[k] || 0) > 0) {
          newInv[k] = (newInv[k] || 0) + newVault[k];
          newVault[k] = 0;
        }
      });

      sound.playPing();
      showToast(`🎒 Withdrew ${vaultCount} drug units from Safehouse Vault! Watch out for police vision cones on the street.`, "warning");

      return {
        ...prev,
        inv: newInv,
        safehouseVault: newVault
      };
    });
  }, [showToast]);

  const sleepInSafehouseBed = useCallback(() => {
    setState(prev => {
      sound.playFanfare();
      const updatedPots = prev.pots.map(pot => {
        if (pot.stage === 'empty') return pot;
        const nextProg = Math.min(100, pot.progress + 35);
        return {
          ...pot,
          progress: nextProg,
          ready: nextProg >= 100,
          stage: nextProg >= 100 ? ('ready' as const) : (nextProg > 75 ? ('flowering' as const) : ('vegetative' as const))
        };
      });

      showToast(`🛏️ Rested in Safehouse Bed until 08:00 AM (Day ${prev.day + 1})! Plants grew +35% & Police Heat dropped -20%!`, "success");

      return {
        ...prev,
        day: prev.day + 1,
        hour: 8,
        minute: 0,
        heat: Math.max(0, prev.heat - 20),
        pots: updatedPots,
        policeChase: {
          ...prev.policeChase,
          isChasing: false,
          chaseTimeRemaining: 0,
          detectionTime: 0,
          bustedStrikes: 0
        }
      };
    });
  }, [showToast]);

  // Real Estate & Safehouse Upgrades (with Walkable 3D Interiors)
  const buyProperty = (propId: string) => {
    setState(prev => {
      const prop = prev.properties.find(p => p.id === propId);
      if (!prop || prop.owned) return prev;

      const level = getPlayerLevel(prev.rep);
      const reqLvl = prop.levelReq || 1;
      if (level < reqLvl) {
        showToast(`Requires Player Level ${reqLvl} to upgrade to ${prop.name}!`, "warning");
        return prev;
      }

      if (prev.cash + prev.bank < prop.cost) {
        showToast(`Need $${prop.cost.toLocaleString()} (Cash + Bank) to acquire ${prop.name}!`, "warning");
        return prev;
      }

      let cash = prev.cash;
      let bank = prev.bank;
      if (bank >= prop.cost) {
        bank -= prop.cost;
      } else {
        const rem = prop.cost - bank;
        bank = 0;
        cash -= rem;
      }

      sound.playFanfare();
      showToast(`🏠 Acquired ${prop.name}! Walkable 3D Safehouse Interior unlocked in City Run! (+35 Rep)`, "success");

      // Add +2 starter cultivation stations when upgrading safehouse
      const currentPotsCount = prev.pots.length;
      const newPots = [...prev.pots];
      const bonusTarget = Math.min(prop.maxPots, currentPotsCount + 2);
      for (let i = currentPotsCount + 1; i <= bonusTarget; i++) {
        newPots.push({
          id: i,
          strain: null,
          seedKey: null,
          stage: 'empty',
          progress: 0,
          water: 0,
          nutrients: 0,
          ready: false,
          yieldAmount: 0
        });
      }

      const nextState: GameState = {
        ...prev,
        cash,
        bank,
        rep: prev.rep + 35,
        activePropertyId: propId,
        pots: newPots,
        properties: prev.properties.map(p => p.id === propId ? { ...p, owned: true } : p)
      };

      return trackProgressInState(nextState, 'buy_property', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  };

  const selectProperty = useCallback((propId: string) => {
    setState(prev => {
      const prop = prev.properties.find(p => p.id === propId && p.owned);
      if (!prop) return prev;
      sound.playPing();
      showToast(`🏠 Switched Active Safehouse to ${prop.name} (${prop.district})!`, "info");
      return {
        ...prev,
        activePropertyId: propId
      };
    });
  }, [showToast]);

  const setInsideSafehouse = useCallback((inside: boolean) => {
    setState(prev => {
      const activeProp = prev.properties.find(p => p.id === prev.activePropertyId) || prev.properties[0];
      sound.playPing();
      if (inside) {
        showToast(`🏠 Entered ${activeProp.name} 3D Interior! Safe from police patrols.`, "success");
      } else {
        showToast(`🚪 Stepped outside onto ${activeProp.district} street.`, "info");
      }
      return {
        ...prev,
        insideSafehouse: inside,
        playerOnFoot: inside ? true : prev.playerOnFoot,
        policeChase: inside
          ? {
              ...prev.policeChase,
              isChasing: false,
              chaseTimeRemaining: 0,
              detectionTime: 0,
              hideTime: 0
            }
          : prev.policeChase
      };
    });
  }, [showToast]);

  const hireStaff = (staffId: string) => {
    setState(prev => {
      const member = prev.staff.find(s => s.id === staffId);
      if (!member || member.hired) return prev;

      if (prev.cash < member.wage) {
        showToast("Not enough cash to cover initial wage deposit!", "warning");
        return prev;
      }

      sound.playPing();
      showToast(`Hired ${member.name} (${member.role})!`, "success");

      return {
        ...prev,
        cash: prev.cash - member.wage,
        staff: prev.staff.map(s => s.id === staffId ? { ...s, hired: true } : s)
      };
    });
  };

  const fireStaff = (staffId: string) => {
    setState(prev => ({
      ...prev,
      staff: prev.staff.map(s => s.id === staffId ? { ...s, hired: false } : s)
    }));
    showToast("Staff member dismissed.", "info");
  };

  const buyLaunderingFront = (frontId: string) => {
    setState(prev => {
      const front = prev.laundering.find(f => f.id === frontId);
      if (!front || front.bought) return prev;

      if (prev.cash < front.cost) {
        showToast("Not enough dirty cash to acquire front business!", "warning");
        return prev;
      }

      sound.playCash();
      showToast(`Acquired front: ${front.name}!`, "success");

      return {
        ...prev,
        cash: prev.cash - front.cost,
        rep: prev.rep + 20,
        laundering: prev.laundering.map(f => f.id === frontId ? { ...f, bought: true } : f)
      };
    });
  };

  const washCash = (frontId: string) => {
    setState(prev => {
      const front = prev.laundering.find(f => f.id === frontId);
      if (!front || !front.bought) return prev;

      const toWash = Math.min(prev.cash, front.dailyWash);
      if (toWash <= 0) {
        showToast("No cash to wash!", "info");
        return prev;
      }

      const lawyer = prev.staff.find(s => s.id === 'lawyer' && s.hired);
      const effectiveFee = lawyer ? front.fee * 0.5 : front.fee;
      const cleanGain = Math.round(toWash * (1 - effectiveFee));

      sound.playCash();
      showToast(`Cleaned $${toWash.toLocaleString()} -> Deposited $${cleanGain.toLocaleString()} to Safe Bank!`, "success");

      const nextState = {
        ...prev,
        cash: prev.cash - toWash,
        bank: prev.bank + cleanGain,
        stats: {
          ...prev.stats,
          totalCleanedBank: prev.stats.totalCleanedBank + cleanGain
        }
      };

      return trackProgressInState(nextState, 'wash_cash', cleanGain, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  };

  const bribeTurfGang = (district: DistrictName) => {
    setState(prev => {
      const turf = prev.turfs.find(t => t.district === district);
      if (!turf || turf.bribed) return prev;

      if (prev.cash < turf.bribeCost) {
        showToast(`Need $${turf.bribeCost.toLocaleString()} cash to bribe ${turf.gangName}!`, "warning");
        return prev;
      }

      sound.playCash();
      showToast(`Bribed ${turf.gangName}! Gained district protection & payout bonus!`, "success");

      return {
        ...prev,
        cash: prev.cash - turf.bribeCost,
        rep: prev.rep + 15,
        turfs: prev.turfs.map(t => t.district === district ? { ...t, bribed: true } : t)
      };
    });
  };

  const buyVehicle = (vehicleId: string) => {
    setState(prev => {
      const veh = prev.vehicles.find(v => v.id === vehicleId);
      if (!veh || veh.owned) return prev;

      if (prev.cash < veh.cost) {
        showToast("Not enough cash to buy vehicle!", "warning");
        return prev;
      }

      sound.playFanfare();
      showToast(`Purchased ${veh.name} (Trunk Capacity: ${veh.trunkCapacity})! Switched active vehicle.`, "success");

      const nextState = {
        ...prev,
        cash: prev.cash - veh.cost,
        currentVehicleId: vehicleId,
        vehicles: prev.vehicles.map(v => v.id === vehicleId ? { ...v, owned: true } : v)
      };

      return trackProgressInState(nextState, 'buy_vehicle', 1, (m) => {
        sound.playMissionTriumph();
        showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
      });
    });
  };

  const selectVehicle = (vehicleId: string) => {
    setState(prev => {
      const veh = prev.vehicles.find(v => v.id === vehicleId && v.owned);
      if (!veh) return prev;
      showToast(`Selected ${veh.name} (Trunk: ${veh.trunkCapacity} packs) for city runs.`, "info");
      return { ...prev, currentVehicleId: vehicleId };
    });
  };

  // Main Simulation Interval (1000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.isPaused || prev.showMainMenu) return prev;

        // Advance clock (2 game minutes per real second at 1x -> 6 real minutes per Day and 6 real minutes per Night!)
        let min = prev.minute + 2 * prev.speed;
        let hr = prev.hour;
        let day = prev.day;

        if (min >= 60) {
          hr += Math.floor(min / 60);
          min = min % 60;
        }

        let newDayTriggered = false;
        if (hr >= 24) {
          hr = 0;
          day += 1;
          newDayTriggered = true;
        }

        // Rotate District Market Event every 6 hours
        let marketEvent = prev.marketEvent;
        if (min === 0 && hr % 6 === 0) {
          const nextIdx = (MARKET_EVENTS.findIndex(e => e.id === marketEvent?.id) + 1) % MARKET_EVENTS.length;
          marketEvent = MARKET_EVENTS[nextIdx];
        }

        // 1. Update Pot Growth Lifecycle
        const botanistHired = prev.staff.some(s => s.id === 'botanist' && s.hired);
        const updatedPots = prev.pots.map(pot => {
          if (pot.stage === 'empty') return pot;

          let water = pot.water;
          let nutrients = pot.nutrients;
          let progress = pot.progress;
          let stage = pot.stage;
          let ready = pot.ready;

          water = Math.max(0, water - 0.4 * prev.speed);
          nutrients = Math.max(0, nutrients - 0.25 * prev.speed);

          if (botanistHired) {
            if (water < 45) water = 85;
            if (nutrients < 40 && prev.inv.fertilizer > 0) nutrients = 90;
          }

          if (!ready) {
            let growthRate = 1.4 * prev.speed;
            if (water > 40) growthRate *= 1.3;
            if (nutrients > 50) growthRate *= 1.3;
            if (water <= 10) growthRate *= 0.15;
            if (prev.hydroponicLightsInstalled) growthRate *= 1.35; // Section 16: Hydroponic High-Yield Lights

            progress = Math.min(100, progress + growthRate);

            if (progress >= 100) {
              ready = true;
              stage = 'ready';
            } else if (progress > 75) {
              stage = 'flowering';
            } else if (progress > 30) {
              stage = 'vegetative';
            } else {
              stage = 'seedling';
            }
          }

          return { ...pot, water, nutrients, progress, stage, ready };
        });

        // 2. Lab Synthesis Progress
        let lab = { ...prev.lab };
        const chemistHired = prev.staff.some(s => s.id === 'chemist' && s.hired);
        if (lab.isCooking) {
          const jitter = (Math.random() * 6 - 3);
          const currentTemp = chemistHired ? (lab.targetMin + lab.targetMax) / 2 : lab.temp + jitter;
          lab.temp = currentTemp;

          const inSafeZone = currentTemp >= lab.targetMin && currentTemp <= lab.targetMax;
          if (inSafeZone || chemistHired) {
            lab.progress += 3.2 * prev.speed;
            lab.purity = Math.min(99, lab.purity + 0.1);
          } else {
            lab.progress += 0.8 * prev.speed;
            lab.purity = Math.max(50, lab.purity - 0.4);
          }

          if (lab.progress >= 100) {
            setTimeout(() => finishLabSynthesis(), 100);
          }
        }

        // 3. Safehouse Odor Accumulation & Carbon Filtration
        const activeGrowPots = updatedPots.filter(p => p.stage !== 'empty').length;
        let odor = prev.safehouseOdor || 0;
        let odorHeatLeak = 0;
        if (prev.carbonFilterInstalled) {
          odor = Math.max(0, odor - 4 * prev.speed);
        } else {
          if (activeGrowPots > 0) {
            odor = Math.min(100, odor + (0.15 * activeGrowPots * prev.speed));
          }
          if (lab.isCooking) {
            odor = Math.min(100, odor + (0.4 * prev.speed));
          }
          if (odor > 75 && Math.random() < 0.12 * prev.speed) {
            odorHeatLeak = 2.0;
            showToast("⚠️ Pungent weed odor leaking from safehouse to the street! Neighbors calling police (+2% Heat).", "warning");
          }
        }

        // 4. Naturally bleed heat and apply odor leaks
        const enforcerHired = prev.staff.some(s => s.id === 'enforcer' && s.hired);
        const heatDecay = enforcerHired ? 0.35 : 0.09;
        let heat = Math.max(0, prev.heat - heatDecay * prev.speed);
        if (odorHeatLeak > 0) {
          heat = Math.min(100, heat + odorHeatLeak);
        }

        // 5. Sub-Dealer Passive Sales Tick
        const streetDealers = prev.streetDealers.map(dealer => {
          if (!dealer.hired || dealer.busted || dealer.stock <= 0) return dealer;

          // Small chance of police intercept if city heat is very high and no enforcer
          if (heat > 75 && !enforcerHired && Math.random() < 0.015) {
            showToast(`🚓 Street Pusher ${dealer.name} was detained by police in ${dealer.district}!`, "danger");
            return { ...dealer, busted: true };
          }

          if (Math.random() < 0.35 * prev.speed) {
            const soldQty = Math.min(dealer.stock, Math.random() < 0.3 ? 2 : 1);
            const mktMult = marketEvent && marketEvent.district === dealer.district ? marketEvent.multiplier : 1.0;
            const grossPerUnit = 42 * mktMult;
            const netEarned = Math.round(soldQty * grossPerUnit * (1 - dealer.cutPercent / 100));
            return {
              ...dealer,
              stock: dealer.stock - soldQty,
              cashCollected: dealer.cashCollected + netEarned
            };
          }
          return dealer;
        });

        // 6. Handle End of Day (Wages, DEA Raids with Reinforced Safe Protection)
        let cash = prev.cash;
        let staff = [...prev.staff];
        if (newDayTriggered) {
          showToast(`Dawn breaks over Hyland Point: Day ${day}!`, 'info');

          staff = staff.map(m => {
            if (m.hired) {
              if (cash >= m.wage) {
                cash -= m.wage;
                return m;
              } else {
                showToast(`${m.name} resigned due to lack of daily wage!`, "warning");
                return { ...m, hired: false };
              }
            }
            return m;
          });

          if (heat > 85) {
            const lawyer = staff.find(s => s.id === 'lawyer' && s.hired);
            const penaltyPercent = prev.reinforcedSafeInstalled ? (lawyer ? 0.08 : 0.15) : (lawyer ? 0.35 : 0.70);
            const lostCash = Math.round(cash * penaltyPercent);
            cash -= lostCash;
            sound.playSiren();
            const safeNotice = prev.reinforcedSafeInstalled
              ? `<br><br><span style="color:#4ade80">🛡️ REINFORCED VAULT SAFE PROTECTED 85% OF YOUR CASH RESERVES!</span>`
              : '';
            openModal(
              "🚨 DEA SAFE HOUSE RAID!",
              `Your criminal heat exceeded safe levels! Federal agents raided your primary stash.<br><br>
              <strong>Seized $${lostCash.toLocaleString()} dirty cash</strong> from the property! Your bank funds remained safe.${safeNotice}`,
              "Survey Damage"
            );
          }
        }

        // 7. Customer Patience Countdown & Random Incoming Orders
        let customers = [...prev.customers];
        let messages = prev.messages
          .map(m => ({ ...m, timeRemaining: Math.max(0, m.timeRemaining - 4 * prev.speed) }))
          .filter(m => {
            if (m.timeRemaining <= 0) {
              customers = customers.map(c =>
                c.name === m.name ? { ...c, loyalty: Math.max(10, c.loyalty - 6) } : c
              );
              return false;
            }
            return true;
          });

        if (Math.random() < 0.14 && messages.length < 5) {
          const template = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
          const custProfile = customers.find(c => c.name === template.name);
          const addictionMult = custProfile && custProfile.addiction >= 65 ? 1.8 : (custProfile && custProfile.addiction >= 45 ? 1.3 : 1.0);
          const baseQty = Math.floor(Math.random() * (template.maxQty - template.minQty + 1)) + template.minQty;
          const qty = Math.max(1, Math.round(baseQty * addictionMult));

          const mktMult = marketEvent && marketEvent.district === template.district ? marketEvent.multiplier : 1.0;
          const payout = Math.round(qty * template.unitPrice * mktMult);

          let dropX = 280;
          let dropY = 80;
          if (template.district === 'Downtown Core') { dropX = 1280; dropY = 380; }
          else if (template.district === 'The Docks') { dropX = 2080; dropY = 380; }
          else if (template.district === 'Neon District') { dropX = 1280; dropY = 980; }
          else if (template.district === 'Sunset Hills') { dropX = 480; dropY = 980; }
          else if (template.district === 'Desert Outskirts') { dropX = 2080; dropY = 1280; }

          messages.unshift({
            id: Date.now(),
            name: template.name,
            avatar: template.avatar,
            district: template.district as DistrictName,
            text: template.text,
            reqItem: template.reqItem,
            qty: qty,
            payout: payout,
            status: 'pending',
            isTrap: template.isTrap || false,
            timeRemaining: 240,
            dropCoords: { x: dropX, y: dropY }
          });

          sound.playPing();
          showToast(`New SMS from ${template.name}: "${template.reqItem}"`, "info");
        }

        const tickedState: GameState = {
          ...prev,
          day,
          hour: hr,
          minute: min,
          cash,
          heat,
          safehouseOdor: Math.round(odor),
          pots: updatedPots,
          lab,
          staff,
          streetDealers,
          customers,
          marketEvent,
          messages
        };

        return trackProgressInState(tickedState, 'check_networth', 1, (m) => {
          sound.playMissionTriumph();
          showToast(`🎯 Objective Complete! Mission: "${m.title}" Ready to Claim!`, 'success');
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finishLabSynthesis, openModal, showToast]);

  return (
    <GameContext.Provider value={{
      state,
      notifications,
      modal,
      saveSlots,
      showToast,
      dismissNotification,
      openModal,
      closeModal,
      setActiveTab,
      setActivePhoneApp,
      setSpeed,
      togglePause,
      toggleAudio,
      toggleNotifications,
      toggleThemeMode,
      openEndingModal,
      closeEndingModal,
      openSaveModal,
      closeSaveModal,
      openMainMenu,
      closeMainMenu,
      saveGame,
      loadGame,
      deleteSaveSlot,
      startNewGame,
      continueGame,
      resetGame,
      plantSeed,
      waterPot,
      fertilizePot,
      harvestPot,
      quickWaterAll,
      quickFertilizeAll,
      buyCultivationStation,
      selectLabRecipe,
      setLabHeatSlider,
      startLabSynthesis,
      finishLabSynthesis,
      cutProduct,
      packItem,
      bulkPackDimes,
      acceptOrder,
      declineOrder,
      haggleOrder,
      pingLocalContacts,
      completeDelivery,
      buyDarknetItem,
      buyConvenienceShopItem,
      upgradeSafehouseStore,
      depositAllDrugsToVault,
      withdrawAllDrugsFromVault,
      sleepInSafehouseBed,
      buyProperty,
      selectProperty,
      setInsideSafehouse,
      hireStaff,
      fireStaff,
      buyLaunderingFront,
      washCash,
      bribeTurfGang,
      buyVehicle,
      selectVehicle,
      hireDealer,
      supplyDealer,
      collectDealerCash,
      bailDealer,
      recordPartnerManualSale,
      toggleFootMode,
      toggleDrivingCamera,
      usePayNSpray,
      recordPoliceSpotted,
      triggerBustedArrest,
      toggleDevPanel,
      updateDevSettings,
      devAddCash,
      devSetCash,
      devSetBank,
      devMaxInventory,
      devInstantHarvestPots,
      devClearHeat,
      devTeleportToDrop,
      devTeleportToSafehouse,
      devCompleteOrderNow,
      devCycleMarketEvent,
      sellDrugStreet,
      sellDrugToPedestrian,
      claimMissionReward,
      setActiveMission,
      buySafehouseUpgrade
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
