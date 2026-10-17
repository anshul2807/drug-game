// Game Domain Data Models & Types for Schedule I: Hyland Point Syndicate

export type ActiveTab = 'tab-grow' | 'tab-phone' | 'tab-city' | 'tab-empire' | 'tab-guide';
export type PhoneApp = 'app-messages' | 'app-darknet' | 'app-scanner' | 'app-missions';

export type DistrictName = 
  | 'Motel Strip' 
  | 'Downtown Core' 
  | 'The Docks' 
  | 'Neon District' 
  | 'Sunset Hills' 
  | 'Desert Outskirts';

export interface Pot {
  id: number;
  strain: string | null;
  seedKey: string | null;
  stage: 'empty' | 'seedling' | 'vegetative' | 'flowering' | 'ready';
  progress: number; // 0 to 100
  water: number; // 0 to 100
  nutrients: number; // 0 to 100
  ready: boolean;
  yieldAmount: number;
}

export type RecipeKey = 'shatter' | 'crystal' | 'distillate' | 'hash';

export interface LabRecipe {
  id: RecipeKey;
  name: string;
  desc: string;
  reqText: string;
  reqs: { [key: string]: number };
  yieldItem: string;
  yieldName: string;
  yieldQty: number;
  unitValue: number;
  targetMin: number;
  targetMax: number;
}

export type CustomerArchetype = 'Street Fiend' | 'Clubber' | 'VIP Executive' | 'Biker' | 'Smuggler';

export interface CustomerProfile {
  id: string;
  name: string;
  avatar: string;
  district: DistrictName;
  archetype: CustomerArchetype;
  favoriteItem: string;
  addiction: number; // 0 to 100
  loyalty: number;   // 0 to 100
  minPurity: number; // 0 to 100
}

export interface StreetDealer {
  id: string;
  name: string;
  avatar: string;
  district: DistrictName;
  cornerName: string;
  coords: { x: number; y: number };
  levelReq?: number;
  hired: boolean;
  hireCost: number;
  cutPercent: number; // Commission % taken by partner (e.g. 20%)
  stock: number;
  maxStock: number;
  cashCollected: number;
  busted: boolean;
}

export interface MarketEvent {
  id: string;
  title: string;
  desc: string;
  district: DistrictName | 'All Districts';
  multiplier: number;
  bonusItem?: string;
}

export interface CivilianCar {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  color: string;
}

export interface PayNSpray {
  id: string;
  name: string;
  x: number;
  y: number;
  cost: number;
}

export interface ClientOrder {
  id: number;
  customerId?: string;
  name: string;
  avatar: string;
  district: DistrictName;
  archetype?: CustomerArchetype;
  text: string;
  reqItem: string;
  qty: number;
  payout: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';
  isTrap: boolean;
  timeRemaining: number;
  maxTime?: number;
  haggled?: boolean;
  dropCoords: { x: number; y: number };
}

export interface DarknetCatalogItem {
  id: string;
  name: string;
  cost: number;
  gives: { [key: string]: number };
  desc: string;
  category: 'seeds' | 'nutrients' | 'chemicals' | 'cutting' | 'packaging' | 'tools';
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  maxSpeed: number;
  accel: number;
  turnSpeed: number;
  armor: number; // collision resilience
  trunkCapacity: number;
  cost: number;
  owned: boolean;
  color: string;
  desc: string;
}

export interface PoliceUnit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  alert: boolean;
  patrolPath: { x: number; y: number }[];
  targetIdx: number;
  speed: number;
  visionDist: number;
  visionAngle: number;
}

export interface Pedestrian {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  avatar: string;
  color: string;
  name: string;
  talkText?: string;
  talkTimer?: number;
  walkTimer: number;
  fleeing?: boolean;
}

export interface Property {
  id: string;
  name: string;
  district: DistrictName;
  levelReq?: number;
  cost: number;
  owned: boolean;
  maxPots: number;
  hasLabUpgrade: boolean;
  interiorStyle?: string;
  desc: string;
  spawnCoords: { x: number; y: number };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  wage: number;
  hired: boolean;
  desc: string;
}

export interface LaunderingFront {
  id: string;
  name: string;
  district: DistrictName;
  cost: number;
  bought: boolean;
  dailyWash: number;
  fee: number;
  desc: string;
}

export interface TurfDistrict {
  district: DistrictName;
  gangName: string;
  repRequired: number;
  bribed: boolean;
  bribeCost: number;
  heatReduction: number;
  bonusPercent: number;
  desc: string;
}

export interface GameNotification {
  id: string;
  text: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  body: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: string;
  day: number;
  cash: number;
  bank: number;
  rep: number;
  state: GameState;
}

export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  district: DistrictName;
  color?: string;
}

export interface ShadowAlley {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
}

export interface DevSettings {
  isOpen: boolean;
  playerWalkSpeed: number; // default 1.8
  carSpeedMult: number;    // default 1.0 (multiplier on vehicle maxSpeed)
  carAccelMult: number;    // default 1.0 (multiplier on vehicle accel)
  policePatrolSpeed: number; // default 1.4
  policeChaseSpeed: number;  // default 2.4
  policeDisabled: boolean;   // default false (freeze cops, no chase, no arrest)
  timeOfDay: 'auto' | 'day' | 'sunset' | 'night'; // default 'auto'
  drivingCameraMode: 'chase' | 'cockpit'; // default 'chase'
  godMode: boolean; // default false
}

export interface MissionObjective {
  id: string;
  text: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  chapter: number;
  chapterTitle: string;
  desc: string;
  category: 'tutorial' | 'production' | 'delivery' | 'empire' | 'stealth';
  objectives: MissionObjective[];
  rewardCash: number;
  rewardRep: number;
  rewardItems?: { [key: string]: number };
  rewardDesc: string;
  completed: boolean;
  claimed: boolean;
}

export interface GameState {
  day: number;
  hour: number;
  minute: number;
  speed: number;
  isPaused: boolean;
  notificationsMuted?: boolean;
  audioMuted?: boolean;
  themeMode?: 'dark' | 'light';
  endingUnlocked?: boolean;
  endingModalOpen?: boolean;
  cash: number;
  bank: number;
  rep: number;
  heat: number;
  batchPurity: number; // 0 to 100 average purity of current stash
  maxPocketCapacity: number; // default 15
  activeTab: ActiveTab;
  activePhoneApp: PhoneApp;
  showMainMenu: boolean;
  saveModalOpen: boolean;
  activePropertyId: string; // ID of active safehouse ('motel', 'docks', 'rv', 'club_safehouse', 'villa')
  insideSafehouse: boolean; // Whether player is currently inside the 3D walkable safehouse interior
  safehouseStoreLevel: number; // 1 to 4 (upgradable store inside safehouse)
  safehouseVault: { [key: string]: number }; // Drugs stored safely in the safehouse vault (not carried on street)
  safehouseOdor: number; // 0 to 100 safehouse smell level
  carbonFilterInstalled: boolean; // safehouse odor scrubber
  reinforcedSafeInstalled: boolean; // protects 75% dirty cash from DEA raids
  hydroponicLightsInstalled: boolean; // +35% pot growth speed
  missions: Mission[];
  activeMissionId: string | null;
  
  // Inventory
  inv: {
    // Seeds
    seeds_og: number;
    seeds_sour: number;
    seeds_purple: number;
    // Supplies
    fertilizer: number;
    butane: number;
    cold_meds: number;
    acetone: number;
    baggies: number;
    glass_vials: number;
    // Cutting Agents / Adulterants
    baking_soda: number;
    caffeine: number;
    baby_powder: number;
    fentanyl: number;
    // Raw
    raw_bud_og: number;
    raw_bud_sour: number;
    raw_bud_purple: number;
    raw_shatter: number;
    raw_crystal: number;
    raw_distillate: number;
    raw_hash: number;
    // Packaged
    pack_og_dime: number;
    pack_og_eighth: number;
    pack_og_ounce: number;
    pack_sour_dime: number;
    pack_sour_eighth: number;
    pack_purple_eighth: number;
    pack_shatter_gram: number;
    pack_crystal_gram: number;
    pack_vape_cart: number;
    pack_hash_slab: number;
    [key: string]: number;
  };

  pots: Pot[];
  
  lab: {
    activeRecipe: RecipeKey;
    isCooking: boolean;
    progress: number;
    temp: number;
    purity: number;
    targetMin: number;
    targetMax: number;
  };

  messages: ClientOrder[];
  activeOrder: ClientOrder | null;
  customers: CustomerProfile[];
  streetDealers: StreetDealer[];
  marketEvent: MarketEvent | null;

  vehicles: Vehicle[];
  currentVehicleId: string;

  // On-foot mode state
  playerOnFoot: boolean;
  parkedVehicle: {
    x: number;
    y: number;
    angle: number;
    vehicleId: string;
  } | null;

  // Police 2s Detection, 30s Chase & 5 Busted Strikes
  policeChase: {
    detectionTime: number; // 0 to 2 seconds while spotted
    isChasing: boolean; // active 30s pursuit
    chaseTimeRemaining: number; // 30s countdown
    hideTime: number; // time spent hidden in shadow during chase
    bustedStrikes: number; // 0 to 5 strikes
    maxStrikes: number; // 5
  };

  properties: Property[];
  staff: StaffMember[];
  laundering: LaunderingFront[];
  turfs: TurfDistrict[];
  scannerLogs: string[];

  // Stats
  stats: {
    totalEarnedCash: number;
    totalCleanedBank: number;
    totalHarvestsGrams: number;
    totalDeliveries: number;
    raidsSurvived: number;
    timesBusted: number;
  };

  devSettings: DevSettings;
}
