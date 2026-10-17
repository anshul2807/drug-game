import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  useGame,
  getTotalPackagedCount,
  getCarriedDrugsCount,
  getVaultDrugsCount,
  getPlayerLevel,
  getMaxCultivationStations,
  CONVENIENCE_SHOP_ITEMS
} from '../../context/GameContext';
import { sound, RADIO_TRACKS } from '../../audio/soundEngine';
import { Building, ShadowAlley, PoliceUnit, CivilianCar, PayNSpray, Property } from '../../types/game';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { NPCManager } from '../entities/NPC';
import { City3DScene, INTERIOR_CENTER_X, INTERIOR_CENTER_Z, CONVENIENCE_SHOP_COORDS } from './City3DScene';
import { CockpitModel } from './CockpitModel';
import { 
  Navigation, 
  Car, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  User, 
  Maximize, 
  Minimize, 
  Siren, 
  Eye, 
  Crosshair,
  Wrench,
  MapPin,
  Camera,
  Radio,
  Sparkles,
  Package,
  Home,
  DoorOpen,
  Sprout,
  FlaskConical,
  Briefcase,
  ShoppingBag,
  ShieldCheck,
  BedDouble,
  Store,
  ArrowUp,
  Volume2,
  VolumeX,
  Bell,
  BellOff
} from 'lucide-react';

const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 1700;
const ROAD_XS = [80, 480, 880, 1280, 1680, 2080, 2480];
const ROAD_YS = [80, 380, 680, 980, 1280, 1580];

const WORLD_BUILDINGS: Building[] = [
  // 1. Motel Strip
  { x: 120, y: 125, w: 140, h: 210, label: "Hyland Motel #104", district: "Motel Strip", color: "#1e293b" },
  { x: 300, y: 125, w: 140, h: 210, label: "Neon 24/7 Diner", district: "Motel Strip", color: "#1e293b" },
  { x: 120, y: 425, w: 140, h: 210, label: "Speedy Suds Laundry", district: "Motel Strip", color: "#1e293b" },
  { x: 300, y: 425, w: 140, h: 210, label: "Sunset Pawn & Loan", district: "Motel Strip", color: "#1e293b" },

  // 2. Downtown Core
  { x: 920, y: 125, w: 140, h: 210, label: "Metropolitan Tower", district: "Downtown Core", color: "#0f172a" },
  { x: 1100, y: 125, w: 140, h: 210, label: "First Hyland Bank", district: "Downtown Core", color: "#0f172a" },
  { x: 1320, y: 125, w: 140, h: 210, label: "City Hall Plaza", district: "Downtown Core", color: "#0f172a" },
  { x: 1500, y: 125, w: 140, h: 210, label: "Exchange Financial", district: "Downtown Core", color: "#0f172a" },
  { x: 920, y: 425, w: 140, h: 210, label: "Neon Wave Car Wash", district: "Downtown Core", color: "#0f172a" },
  { x: 1100, y: 425, w: 140, h: 210, label: "Grand Mall Plaza", district: "Downtown Core", color: "#0f172a" },
  { x: 1320, y: 425, w: 140, h: 210, label: "Metro Police HQ", district: "Downtown Core", color: "#1e1b4b" },
  { x: 1500, y: 425, w: 140, h: 210, label: "Downtown Transit Hub", district: "Downtown Core", color: "#0f172a" },

  // 3. The Industrial Docks
  { x: 1720, y: 125, w: 140, h: 210, label: "Cannery Wharf Whse", district: "The Docks", color: "#182234" },
  { x: 1900, y: 125, w: 140, h: 210, label: "Freight Cargo Bay 1", district: "The Docks", color: "#182234" },
  { x: 2120, y: 125, w: 140, h: 210, label: "Port Cranes Yard", district: "The Docks", color: "#182234" },
  { x: 2300, y: 125, w: 140, h: 210, label: "Harbor Cold Storage", district: "The Docks", color: "#182234" },
  { x: 1720, y: 425, w: 140, h: 210, label: "Hyland Port Logistics", district: "The Docks", color: "#182234" },
  { x: 1900, y: 425, w: 140, h: 210, label: "Drydock Slipway #4", district: "The Docks", color: "#182234" },
  { x: 2120, y: 425, w: 140, h: 210, label: "Marine Fuel Depot", district: "The Docks", color: "#182234" },
  { x: 2300, y: 425, w: 140, h: 210, label: "Seafood Packing Pier", district: "The Docks", color: "#182234" },

  // 4. Sunset Hills
  { x: 120, y: 725, w: 140, h: 210, label: "Hayes Private Estate", district: "Sunset Hills", color: "#022c22" },
  { x: 300, y: 725, w: 140, h: 210, label: "Tennis Pavilion", district: "Sunset Hills", color: "#022c22" },
  { x: 120, y: 1025, w: 140, h: 210, label: "Sunset Hills Villa", district: "Sunset Hills", color: "#022c22" },
  { x: 300, y: 1025, w: 140, h: 210, label: "Hillside Mansion #12", district: "Sunset Hills", color: "#022c22" },

  // 5. Neon Entertainment District
  { x: 920, y: 725, w: 140, h: 210, label: "Velvet Hookah Club", district: "Neon District", color: "#3b0764" },
  { x: 1100, y: 725, w: 140, h: 210, label: "Golden Dice Casino", district: "Neon District", color: "#3b0764" },
  { x: 1320, y: 725, w: 140, h: 210, label: "Starlight Strip Lounge", district: "Neon District", color: "#3b0764" },
  { x: 1500, y: 725, w: 140, h: 210, label: "Neon Alley Penthouse", district: "Neon District", color: "#3b0764" },
  { x: 920, y: 1025, w: 140, h: 210, label: "Midnight Rave Arena", district: "Neon District", color: "#3b0764" },
  { x: 1100, y: 1025, w: 140, h: 210, label: "Velvet Hotel Suites", district: "Neon District", color: "#3b0764" },
  { x: 1320, y: 1025, w: 140, h: 210, label: "Hyland Cabaret", district: "Neon District", color: "#3b0764" },
  { x: 1500, y: 1025, w: 140, h: 210, label: "Neon Cinema Lounge", district: "Neon District", color: "#3b0764" },

  // 6. Desert Outskirts
  { x: 1720, y: 725, w: 140, h: 210, label: "Scrap Yard Wreckers", district: "Desert Outskirts", color: "#451a03" },
  { x: 1900, y: 725, w: 140, h: 210, label: "Highway Diner Depot", district: "Desert Outskirts", color: "#451a03" },
  { x: 2120, y: 725, w: 140, h: 210, label: "Smuggler Canyon Depot", district: "Desert Outskirts", color: "#451a03" },
  { x: 2300, y: 725, w: 140, h: 210, label: "Desert Auto Wrecking", district: "Desert Outskirts", color: "#451a03" },
  { x: 1720, y: 1025, w: 140, h: 210, label: "Desert Mobile RV Lab", district: "Desert Outskirts", color: "#451a03" },
  { x: 1900, y: 1025, w: 140, h: 210, label: "Biker Club Hideout", district: "Desert Outskirts", color: "#451a03" },
  { x: 2120, y: 1025, w: 140, h: 210, label: "Highway Gas Oasis", district: "Desert Outskirts", color: "#451a03" },
  { x: 2300, y: 1025, w: 140, h: 210, label: "Border Checkpoint", district: "Desert Outskirts", color: "#451a03" }
];

const SHADOW_ALLEYS: ShadowAlley[] = [
  { x: 265, y: 125, w: 30, h: 210, name: "Motel Dumpster Alley" },
  { x: 265, y: 425, w: 30, h: 210, name: "Pawnshop Backcut" },
  { x: 1065, y: 125, w: 30, h: 210, name: "Metro Tower Shadows" },
  { x: 1465, y: 125, w: 30, h: 210, name: "Bank Service Corridor" },
  { x: 1065, y: 425, w: 30, h: 210, name: "Car Wash Underpass" },
  { x: 1865, y: 125, w: 30, h: 210, name: "Dock Cargo Containers" },
  { x: 2265, y: 125, w: 30, h: 210, name: "Slipway Drydock Alley" },
  { x: 265, y: 725, w: 30, h: 210, name: "Tennis Court Hedge Walk" },
  { x: 265, y: 1025, w: 30, h: 210, name: "Villa Pine Corridor" },
  { x: 1065, y: 725, w: 30, h: 210, name: "Casino Service Alley" },
  { x: 1465, y: 725, w: 30, h: 210, name: "Velvet Strip Backcut" },
  { x: 1865, y: 725, w: 30, h: 210, name: "Scrap Yard Container Row" },
  { x: 1865, y: 1025, w: 30, h: 210, name: "RV Canyon Shade" }
];

const PAY_N_SPRAYS: PayNSpray[] = [
  { id: 'spray_downtown', name: 'Downtown Auto Respray', x: 880, y: 380, cost: 150 },
  { id: 'spray_outskirts', name: 'Outskirts Customs Bay', x: 1680, y: 980, cost: 150 }
];

const INITIAL_CIVILIAN_CARS: CivilianCar[] = [
  { id: 1, x: 400, y: 72, vx: 0.78, vy: 0, angle: 0, speed: 0.78, color: '#3b82f6' },
  { id: 2, x: 1400, y: 88, vx: -0.74, vy: 0, angle: Math.PI, speed: 0.74, color: '#eab308' },
  { id: 3, x: 700, y: 372, vx: 0.82, vy: 0, angle: 0, speed: 0.82, color: '#ec4899' },
  { id: 4, x: 1900, y: 388, vx: -0.76, vy: 0, angle: Math.PI, speed: 0.76, color: '#f97316' },
  { id: 5, x: 550, y: 672, vx: 0.72, vy: 0, angle: 0, speed: 0.72, color: '#8b5cf6' },
  { id: 6, x: 1650, y: 688, vx: -0.84, vy: 0, angle: Math.PI, speed: 0.84, color: '#14b8a6' },
  { id: 7, x: 950, y: 972, vx: 0.78, vy: 0, angle: 0, speed: 0.78, color: '#e11d48' },
  { id: 8, x: 2100, y: 988, vx: -0.72, vy: 0, angle: Math.PI, speed: 0.72, color: '#cbd5e1' },
  { id: 9, x: 488, y: 300, vx: 0, vy: 0.75, angle: Math.PI / 2, speed: 0.75, color: '#06b6d4' },
  { id: 10, x: 1272, y: 850, vx: 0, vy: -0.78, angle: -Math.PI / 2, speed: 0.78, color: '#84cc16' },
  { id: 11, x: 888, y: 520, vx: 0, vy: 0.76, angle: Math.PI / 2, speed: 0.76, color: '#f43f5e' },
  { id: 12, x: 1672, y: 1120, vx: 0, vy: -0.72, angle: -Math.PI / 2, speed: 0.72, color: '#38bdf8' },
  { id: 13, x: 1150, y: 1272, vx: 0.76, vy: 0, angle: 0, speed: 0.76, color: '#a855f7' },
  { id: 14, x: 2050, y: 1288, vx: -0.80, vy: 0, angle: Math.PI, speed: 0.80, color: '#10b981' },
  { id: 15, x: 320, y: 1572, vx: 0.74, vy: 0, angle: 0, speed: 0.74, color: '#fbbf24' },
  { id: 16, x: 2088, y: 450, vx: 0, vy: 0.76, angle: Math.PI / 2, speed: 0.76, color: '#64748b' }
];

const INITIAL_COPS: PoliceUnit[] = [
  { id: 1, x: 80, y: 80, vx: 1.4, vy: 0, angle: 0, alert: false, speed: 1.4, patrolPath: [{ x: 80, y: 80 }, { x: 480, y: 80 }, { x: 480, y: 380 }, { x: 80, y: 380 }], targetIdx: 1, visionDist: 210, visionAngle: 0.48 },
  { id: 2, x: 880, y: 80, vx: 1.5, vy: 0, angle: 0, alert: false, speed: 1.5, patrolPath: [{ x: 880, y: 80 }, { x: 1680, y: 80 }, { x: 1680, y: 380 }, { x: 880, y: 380 }], targetIdx: 1, visionDist: 230, visionAngle: 0.48 },
  { id: 3, x: 1680, y: 80, vx: 1.4, vy: 0, angle: 0, alert: false, speed: 1.4, patrolPath: [{ x: 1680, y: 80 }, { x: 2480, y: 80 }, { x: 2480, y: 380 }, { x: 1680, y: 380 }], targetIdx: 1, visionDist: 210, visionAngle: 0.45 },
  { id: 4, x: 80, y: 680, vx: 0, vy: 1.5, angle: Math.PI / 2, alert: false, speed: 1.5, patrolPath: [{ x: 80, y: 680 }, { x: 480, y: 680 }, { x: 480, y: 1280 }, { x: 80, y: 1280 }], targetIdx: 1, visionDist: 220, visionAngle: 0.48 },
  { id: 5, x: 880, y: 680, vx: 1.4, vy: 0, angle: 0, alert: false, speed: 1.4, patrolPath: [{ x: 880, y: 680 }, { x: 1680, y: 680 }, { x: 1680, y: 1280 }, { x: 880, y: 1280 }], targetIdx: 1, visionDist: 220, visionAngle: 0.45 },
  { id: 6, x: 1680, y: 680, vx: 1.4, vy: 0, angle: 0, alert: false, speed: 1.4, patrolPath: [{ x: 1680, y: 680 }, { x: 2480, y: 680 }, { x: 2480, y: 1280 }, { x: 1680, y: 1280 }], targetIdx: 1, visionDist: 200, visionAngle: 0.45 }
];

// Precompute Road Intersection Graph Nodes for Police A* / Greedy Pathfinding
const ROAD_GRAPH_NODES: { x: number; y: number }[] = [];
ROAD_XS.forEach(rx => {
  ROAD_YS.forEach(ry => {
    ROAD_GRAPH_NODES.push({ x: rx, y: ry });
  });
});

// Raycast Line-of-Sight check against all city buildings
const hasLineOfSight = (x1: number, y1: number, x2: number, y2: number, pad = 2): boolean => {
  const steps = Math.max(4, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 22));
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    for (let i = 0; i < WORLD_BUILDINGS.length; i++) {
      const b = WORLD_BUILDINGS[i];
      if (px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad) {
        return false;
      }
    }
  }
  return true;
};

// Police Road-Graph Pathfinding Algorithm: finds best reachable road intersection toward target
const getNextRoadGraphWaypoint = (
  copX: number,
  copY: number,
  targetX: number,
  targetY: number
): { x: number; y: number } => {
  if (hasLineOfSight(copX, copY, targetX, targetY, 6)) {
    return { x: targetX, y: targetY };
  }

  let bestNode = { x: targetX, y: targetY };
  let bestScore = Infinity;

  for (let i = 0; i < ROAD_GRAPH_NODES.length; i++) {
    const node = ROAD_GRAPH_NODES[i];
    const distFromCop = Math.hypot(node.x - copX, node.y - copY);
    if (distFromCop < 12) continue;

    // Must have clear path from cop to this road intersection node
    if (hasLineOfSight(copX, copY, node.x, node.y, 4)) {
      const distToTarget = Math.hypot(targetX - node.x, targetY - node.y);
      // A* heuristic f(n) = g(n)*0.35 + h(n)
      const score = distFromCop * 0.35 + distToTarget;
      if (score < bestScore) {
        bestScore = score;
        bestNode = node;
      }
    }
  }

  return bestNode;
};

export const City3DView: React.FC = () => {
  const { 
    state, 
    completeDelivery, 
    selectVehicle, 
    selectProperty,
    setInsideSafehouse,
    plantSeed,
    harvestPot,
    quickWaterAll,
    quickFertilizeAll,
    buyCultivationStation,
    buyDarknetItem,
    buyConvenienceShopItem,
    upgradeSafehouseStore,
    depositAllDrugsToVault,
    withdrawAllDrugsFromVault,
    sleepInSafehouseBed,
    recordPartnerManualSale,
    startLabSynthesis,
    bulkPackDimes,
    hireDealer,
    supplyDealer,
    collectDealerCash,
    toggleFootMode, 
    toggleDrivingCamera,
    toggleAudio,
    toggleNotifications,
    usePayNSpray,
    triggerBustedArrest,
    sellDrugToPedestrian,
    toggleDevPanel,
    showToast
  } = useGame();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullMapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Direct DOM Refs for 60 FPS Telemetry HUD
  const fpsDomRef = useRef<HTMLSpanElement | null>(null);
  const frameRateDomRef = useRef<HTMLSpanElement | null>(null);
  const speedDomRef = useRef<HTMLSpanElement | null>(null);
  const stealthDomRef = useRef<HTMLSpanElement | null>(null);
  const strikesDomRef = useRef<HTMLSpanElement | null>(null);
  const detectionBoxRef = useRef<HTMLDivElement | null>(null);
  const detectionBarRef = useRef<HTMLDivElement | null>(null);
  const detectionTextRef = useRef<HTMLSpanElement | null>(null);
  const pursuitBannerRef = useRef<HTMLDivElement | null>(null);
  const pursuitTextRef = useRef<HTMLDivElement | null>(null);
  const deliverButtonRef = useRef<HTMLDivElement | null>(null);
  const carPromptRef = useRef<HTMLDivElement | null>(null);
  const pedPromptRef = useRef<HTMLDivElement | null>(null);
  const pedTextRef = useRef<HTMLSpanElement | null>(null);
  const sprayPromptRef = useRef<HTMLDivElement | null>(null);
  const sprayTextRef = useRef<HTMLSpanElement | null>(null);
  const safehousePromptRef = useRef<HTMLDivElement | null>(null);
  const safehouseTextRef = useRef<HTMLSpanElement | null>(null);
  const shopPromptRef = useRef<HTMLDivElement | null>(null);
  const shopTextRef = useRef<HTMLSpanElement | null>(null);
  const gpsPromptRef = useRef<HTMLDivElement | null>(null);
  const gpsTextRef = useRef<HTMLSpanElement | null>(null);
  const partnerStatusRef = useRef<HTMLSpanElement | null>(null);

  const nearPedRef = useRef<{ id: number; name: string } | null>(null);
  const nearSprayRef = useRef<PayNSpray | null>(null);
  const nearSafehouseRef = useRef<Property | null>(null);
  const nearConvenienceShopRef = useRef<boolean>(false);

  // Town Convenience Shop Modal & Category Filter State
  const [convenienceShopOpen, setConvenienceShopOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<'all' | 'soil' | 'packaging' | 'nutrients' | 'cutting' | 'lab'>('all');
  const [fullMapOpen, setFullMapOpen] = useState(false);

  // Inside 3D Safehouse station proximity & manual selection state
  const [activeInteriorZone, setActiveInteriorZone] = useState<
    'none' | 'exit' | 'grow' | 'lab' | 'pack' | 'partner' | 'store' | 'bed'
  >('store');
  const activeInteriorZoneRef = useRef<
    'none' | 'exit' | 'grow' | 'lab' | 'pack' | 'partner' | 'store' | 'bed'
  >('store');
  const manualInteriorZoneRef = useRef<
    'none' | 'exit' | 'grow' | 'lab' | 'pack' | 'partner' | 'store' | 'bed' | null
  >('store');

  const handleSelectSafehouseStation = useCallback((zone: 'exit' | 'grow' | 'lab' | 'pack' | 'partner' | 'store' | 'bed') => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    manualInteriorZoneRef.current = zone;
    activeInteriorZoneRef.current = zone;
    setActiveInteriorZone(zone);
  }, []);

  const handleOpenConvenienceShop = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    sound.playDoor();
    setConvenienceShopOpen(true);
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [radioState, setRadioState] = useState<{ playing: boolean; trackName: string }>({
    playing: sound.radioActive,
    trackName: RADIO_TRACKS[sound.currentTrackIdx].name
  });

  // Mutable Game Simulation Refs
  const currentVehicleRef = useRef(state.vehicles.find(v => v.id === state.currentVehicleId) || state.vehicles[0]);
  currentVehicleRef.current = state.vehicles.find(v => v.id === state.currentVehicleId) || state.vehicles[0];

  const stateRef = useRef(state);
  stateRef.current = state;

  // Player Physics State (with Ackermann Steering, Velocity Vector, Drift Slip, Suspension & Jumping)
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const playerRef = useRef({
    x: 280,
    y: 80,
    vx: 0,
    vy: 0,
    interiorX: INTERIOR_CENTER_X,
    interiorZ: INTERIOR_CENTER_Z + 5,
    angle: 0,
    speed: 0,
    steerAngle: 0,
    bodyRoll: 0,
    bodyPitch: 0,
    isBraking: false,
    pitch: 0,
    yawOffset: 0,
    footYaw: 0,
    footPitch: 0,
    inShadow: false,
    invulnTimer: 0,
    walkBob: 0,
    stepTimer: 0,
    turnDir: 0,
    jumpY: 0,
    jumpVy: 0,
    isGrounded: true
  });

  const handleManualJump = useCallback(() => {
    const p = playerRef.current;
    if ((stateRef.current.playerOnFoot || stateRef.current.insideSafehouse) && p.isGrounded) {
      p.jumpVy = 7.8;
      p.isGrounded = false;
      sound.playFootstep();
    }
  }, []);

  // 3D Partner AI Simulation State (Shares same Safehouse + Exits Door to Sell Drugs to Pedestrians Manually)
  const partnerSimRef = useRef({
    inSafehouse: true,
    x: 280,
    y: 80,
    interiorX: INTERIOR_CENTER_X + 7,
    interiorZ: INTERIOR_CENTER_Z,
    angle: 0,
    targetPedId: -1,
    dealTimer: 0,
    lastSoldPedId: -1,
    isMoving: false,
    isDealing: false
  });

  const pursuitRef = useRef({
    detectionTime: 0,
    isChasing: false,
    chaseTimeRemaining: 0,
    hideTime: 0,
    lastKnownX: 280,
    lastKnownY: 80
  });

  const camFollowPosRef = useRef(new THREE.Vector3(280 - 13.0, 4.5, 80));
  const prevOnFootRef = useRef(state.playerOnFoot);

  const copsRef = useRef<PoliceUnit[]>(INITIAL_COPS);
  const civilianCarsRef = useRef<CivilianCar[]>(INITIAL_CIVILIAN_CARS);
  const npcManagerRef = useRef<NPCManager>(new NPCManager(WORLD_WIDTH, WORLD_HEIGHT));

  // Enter or Exit the Walkable 3D Safehouse Interior
  const handleToggleSafehouseInterior = useCallback((targetProp?: Property) => {
    const p = playerRef.current;
    const curr = stateRef.current;

    if (!curr.insideSafehouse) {
      // Release pointer lock when entering Safehouse so mouse cursor can freely click all options!
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }

      const chosenProp = targetProp ||
        nearSafehouseRef.current ||
        curr.properties.find(pr => pr.id === curr.activePropertyId && pr.owned) ||
        curr.properties.slice().reverse().find(pr => pr.owned) ||
        curr.properties[0];

      if (chosenProp.id !== curr.activePropertyId) {
        selectProperty(chosenProp.id);
      }

      p.interiorX = INTERIOR_CENTER_X;
      p.interiorZ = INTERIOR_CENTER_Z + 5.5;
      p.footYaw = 0;
      p.footPitch = 0;
      p.speed = 0;
      p.vx = 0;
      p.vy = 0;
      sound.updateEngineHum(0, false);

      pursuitRef.current.isChasing = false;
      pursuitRef.current.chaseTimeRemaining = 0;
      pursuitRef.current.detectionTime = 0;
      pursuitRef.current.hideTime = 0;

      manualInteriorZoneRef.current = 'store';
      activeInteriorZoneRef.current = 'store';
      setActiveInteriorZone('store');

      sound.playDoor();
      setInsideSafehouse(true);
    } else {
      const activeProp = curr.properties.find(pr => pr.id === curr.activePropertyId) || curr.properties[0];
      p.x = activeProp.spawnCoords.x;
      p.y = activeProp.spawnCoords.y;
      p.speed = 0;
      p.vx = 0;
      p.vy = 0;
      p.footYaw = -Math.PI / 2;
      p.footPitch = 0;
      manualInteriorZoneRef.current = null;
      setActiveInteriorZone('none');
      activeInteriorZoneRef.current = 'none';
      sound.playDoor();
      setInsideSafehouse(false);
    }
  }, [selectProperty, setInsideSafehouse]);

  const handleToggleFoot = useCallback(() => {
    if (stateRef.current.insideSafehouse) {
      handleToggleSafehouseInterior();
      return;
    }
    const p = playerRef.current;
    if (!stateRef.current.playerOnFoot) {
      const carX = p.x;
      const carY = p.y;
      const carAngle = p.angle;

      const exitAngle = carAngle - Math.PI / 2;
      p.x += Math.cos(exitAngle) * 2.8;
      p.y += Math.sin(exitAngle) * 2.8;
      p.speed = 0;
      p.vx = 0;
      p.vy = 0;
      p.footYaw = -carAngle - Math.PI / 2;
      p.footPitch = 0;
      sound.updateEngineHum(0, false);
      sound.playDoor();

      toggleFootMode({ x: carX, y: carY, angle: carAngle });
    } else {
      const parked = stateRef.current.parkedVehicle;
      if (parked) {
        const dist = Math.hypot(p.x - parked.x, p.y - parked.y);
        if (dist > 50) return;
        p.x = parked.x;
        p.y = parked.y;
        p.angle = parked.angle;
        p.speed = 0;
        p.vx = 0;
        p.vy = 0;
      }
      sound.playDoor();
      toggleFootMode({ x: p.x, y: p.y, angle: p.angle });
    }
  }, [toggleFootMode, handleToggleSafehouseInterior]);

  const handleToggleRadio = useCallback(() => {
    const isPlaying = sound.toggleRadio();
    const trackName = sound.getCurrentTrack().name;
    setRadioState({ playing: isPlaying, trackName });
    showToast(isPlaying ? `📻 Radio ON: ${trackName}` : "📻 Vehicle Radio OFF", "info");
  }, [showToast]);

  const handleNextRadioTrack = useCallback(() => {
    const track = sound.nextRadioTrack();
    setRadioState({ playing: sound.radioActive, trackName: track.name });
    showToast(`📻 Tuned to: ${track.name} (${track.genre})`, "info");
  }, [showToast]);

  const handleTriggerPayNSpray = useCallback(() => {
    if (!nearSprayRef.current) return;
    const ok = usePayNSpray(nearSprayRef.current.cost);
    if (ok) {
      pursuitRef.current.isChasing = false;
      pursuitRef.current.chaseTimeRemaining = 0;
      pursuitRef.current.detectionTime = 0;
      pursuitRef.current.hideTime = 0;
      copsRef.current.forEach(c => { c.alert = false; });
    }
  }, [usePayNSpray]);

  const { keysRef, setVirtualKey } = usePlayerControls({
    canDeliver: true,
    onDeliver: completeDelivery,
    onToggleVehicle: handleToggleFoot
  });

  const checkBuildingCollision = (testPX: number, testPY: number, customMargin?: number) => {
    const margin = customMargin !== undefined ? customMargin : (stateRef.current.playerOnFoot ? 1.5 : 4.8);
    for (let i = 0; i < WORLD_BUILDINGS.length; i++) {
      const b = WORLD_BUILDINGS[i];
      if (
        testPX >= b.x - margin &&
        testPX <= b.x + b.w + margin &&
        testPY >= b.y - margin &&
        testPY <= b.y + b.h + margin
      ) {
        return b;
      }
    }
    return null;
  };

  const handleResetPosition = () => {
    const currentProp = stateRef.current.properties.find(p => p.id === stateRef.current.activePropertyId && p.owned) ||
                        stateRef.current.properties.slice().reverse().find(p => p.owned) ||
                        stateRef.current.properties[0];
    const p = playerRef.current;
    p.x = currentProp.spawnCoords.x;
    p.y = currentProp.spawnCoords.y;
    p.speed = 0;
    p.vx = 0;
    p.vy = 0;
    p.angle = 0;
    p.pitch = 0;
    p.yawOffset = 0;
    camFollowPosRef.current.set(p.x - 13.0, 4.5, p.y);
    if (stateRef.current.insideSafehouse) {
      setInsideSafehouse(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => setIsFullscreen(true));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Trigger resize after fullscreen toggle so WebGL canvas fills 100% of screen
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Hotkeys: H (Enter/Exit Safehouse), B (Town Convenience Shop), G (Street Deal), C (Camera), R (Pay 'n' Spray), M/N (Radio)
  useEffect(() => {
    const handleHotkeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();
      if (key === 'h') {
        e.preventDefault();
        handleToggleSafehouseInterior();
      } else if (key === 'b') {
        e.preventDefault();
        if (document.pointerLockElement) document.exitPointerLock?.();
        setConvenienceShopOpen(prev => !prev);
      } else if (key === 'g') {
        if (!stateRef.current.insideSafehouse && stateRef.current.playerOnFoot && nearPedRef.current) {
          e.preventDefault();
          sellDrugToPedestrian(nearPedRef.current.id, nearPedRef.current.name);
        }
      } else if (key === 'c') {
        if (!stateRef.current.insideSafehouse && !stateRef.current.playerOnFoot) {
          e.preventDefault();
          toggleDrivingCamera();
        }
      } else if (key === 'r') {
        if (!stateRef.current.insideSafehouse && !stateRef.current.playerOnFoot && nearSprayRef.current) {
          e.preventDefault();
          handleTriggerPayNSpray();
        }
      } else if (key === 'm') {
        e.preventDefault();
        handleToggleRadio();
      } else if (key === 'n') {
        e.preventDefault();
        handleNextRadioTrack();
      }
    };
    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, [handleToggleSafehouseInterior, sellDrugToPedestrian, toggleDrivingCamera, handleTriggerPayNSpray, handleToggleRadio, handleNextRadioTrack]);

  // Mouse Drag & Pointer Lock Look Controls
  useEffect(() => {
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === mountRef.current);
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const isLocked = document.pointerLockElement === mountRef.current;
      if (!isMouseDown && !isLocked) return;

      const dx = isLocked ? e.movementX : (e.clientX - lastMouseX);
      const dy = isLocked ? e.movementY : (e.clientY - lastMouseY);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      const p = playerRef.current;
      const isFpv = stateRef.current.playerOnFoot || stateRef.current.insideSafehouse;

      if (isFpv) {
        p.footYaw -= dx * 0.0035;
        p.footPitch = Math.max(-1.1, Math.min(1.1, p.footPitch - dy * 0.0035));
      } else {
        p.yawOffset += dx * 0.0035;
        p.pitch = Math.max(-0.6, Math.min(0.6, p.pitch - dy * 0.0035));
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const mount = mountRef.current;
    if (mount) {
      mount.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('pointerlockchange', handlePointerLockChange);
    }

    return () => {
      if (mount) mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  // Main Three.js Scene Initialization
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 960;
    const height = mount.clientHeight || 540;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = false;
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const cityScene = new City3DScene({
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      buildings: WORLD_BUILDINGS,
      shadowAlleys: SHADOW_ALLEYS,
      payNSprays: PAY_N_SPRAYS,
      properties: stateRef.current.properties
    });

    cityScene.initPoliceCruisers(copsRef.current);
    cityScene.initCivilianTraffic(civilianCarsRef.current);
    cityScene.initPedestrians(npcManagerRef.current.getPedestrians());

    const cockpit = new CockpitModel(currentVehicleRef.current.color || '#10b981');
    cityScene.scene.add(cockpit.group);

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    const webglFrameTimes: number[] = [];
    let fpsLastUiUpdate = lastTime;
    let lastOwnedCount = stateRef.current.properties.filter(pr => pr.owned).length;

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth || 960;
      const h = mount.clientHeight || window.innerHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Real-Time WebGL Render & Physics Loop
    const animate = (currentTime: number) => {
      const rawDtMs = currentTime - lastTime;
      const dt = Math.min(0.05, rawDtMs / 1000);
      lastTime = currentTime;
      frameCount++;

      // Record exact frame timestamp in 1000ms sliding window
      webglFrameTimes.push(currentTime);
      while (webglFrameTimes.length > 0 && currentTime - webglFrameTimes[0] > 1000) {
        webglFrameTimes.shift();
      }

      if (currentTime - fpsLastUiUpdate >= 80 && rawDtMs > 0.5) {
        fpsLastUiUpdate = currentTime;
        const windowSpanMs = webglFrameTimes.length > 1
          ? currentTime - webglFrameTimes[0]
          : rawDtMs;
        const rollingFps = Math.max(
          1,
          Math.round(
            windowSpanMs > 0
              ? ((webglFrameTimes.length - 1) * 1000) / windowSpanMs
              : 1000 / rawDtMs
          )
        );
        const instantFrameRate = 1000 / rawDtMs;

        if (fpsDomRef.current) {
          fpsDomRef.current.textContent = `${rollingFps} FPS`;
          fpsDomRef.current.className =
            rollingFps >= 50
              ? 'text-emerald-400 font-extrabold font-hud'
              : rollingFps >= 30
              ? 'text-amber-400 font-extrabold font-hud'
              : 'text-rose-400 font-extrabold font-hud';
        }
        if (frameRateDomRef.current) {
          frameRateDomRef.current.textContent = `${instantFrameRate.toFixed(1)} fps • ${rawDtMs.toFixed(2)} ms`;
        }
      }

      const p = playerRef.current;
      const keys = keysRef.current;
      const currentState = stateRef.current;
      const isInside = currentState.insideSafehouse;
      const isOnFoot = currentState.playerOnFoot;
      const v = currentVehicleRef.current;
      const pursuit = pursuitRef.current;
      const dev = currentState.devSettings;

      const ownedNow = currentState.properties.filter(pr => pr.owned).length;
      if (ownedNow !== lastOwnedCount) {
        lastOwnedCount = ownedNow;
        cityScene.buildSafehouseDoors(currentState.properties);
      }

      cityScene.updateSafehouseBeacons(currentTime);

      const baseWalkSpeed = dev?.playerWalkSpeed || 1.8;
      const walkSpeed = baseWalkSpeed * (keys.sprint ? 1.65 : 1.0);
      const carSpeedMult = dev?.carSpeedMult || 1.0;
      const carAccelMult = dev?.carAccelMult || 1.0;
      const policeDisabled = dev?.policeDisabled || false;
      // Requirement #2: Police speed is always 1/3rd of player's top speed
      const playerTopSpeed = (v.maxSpeed || 2.8) * carSpeedMult;
      const copPatrolSpeed = playerTopSpeed / 3;
      const copChaseSpeed = playerTopSpeed / 3;
      const godMode = dev?.godMode || false;
      const rawTimeSetting = dev?.timeOfDay || 'auto';
      const drivingCamMode = dev?.drivingCameraMode || 'chase';

      const activeProp =
        currentState.properties.find(pr => pr.id === currentState.activePropertyId) ||
        currentState.properties.slice().reverse().find(pr => pr.owned) ||
        currentState.properties[0];

      const layout = cityScene.buildSafehouseInterior(
        activeProp.id,
        currentState.pots.length,
        currentState.safehouseStoreLevel || 1
      );

      // ====================================================================
      // 0. 3D PARTNER AI: SHARES SAME SAFEHOUSE + MANUALLY WALKS TO PEOPLE & SELLS DRUGS
      // ====================================================================
      const activePartner =
        currentState.streetDealers.find(d => d.hired) || currentState.streetDealers[0];
      const pSim = partnerSimRef.current;

      if (activePartner && activePartner.hired) {
        if (activePartner.stock > 0) {
          if (pSim.inSafehouse) {
            // Partner has drugs! Walk from his Safehouse desk to the Safehouse exit door
            const dx = layout.exitDoorPos.x - pSim.interiorX;
            const dz = layout.exitDoorPos.z - pSim.interiorZ;
            const dist = Math.hypot(dx, dz);
            if (dist < 1.3) {
              // Step through the Safehouse Door onto the 3D Street!
              pSim.inSafehouse = false;
              pSim.x = activeProp.spawnCoords.x;
              pSim.y = activeProp.spawnCoords.y;
              pSim.isMoving = true;
              pSim.isDealing = false;
            } else {
              pSim.interiorX += (dx / dist) * 0.16;
              pSim.interiorZ += (dz / dist) * 0.16;
              pSim.angle = Math.atan2(dx, dz);
              pSim.isMoving = true;
              pSim.isDealing = false;
            }
          } else {
            // Partner is outside on the 3D street: find nearest Pedestrian NPC and sell manually!
            const peds = npcManagerRef.current.getPedestrians();
            let targetPed = peds.find(ped => ped.id === pSim.targetPedId);
            if (!targetPed || targetPed.id === pSim.lastSoldPedId) {
              let bestDist = Infinity;
              targetPed = undefined;
              for (const ped of peds) {
                if (ped.id === pSim.lastSoldPedId) continue;
                const d = Math.hypot(ped.x - pSim.x, ped.y - pSim.y);
                if (d < bestDist) {
                  bestDist = d;
                  targetPed = ped;
                }
              }
              if (targetPed) pSim.targetPedId = targetPed.id;
            }

            if (targetPed) {
              const dx = targetPed.x - pSim.x;
              const dy = targetPed.y - pSim.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 16) {
                // Reached pedestrian! Pause for manual hand-to-hand drug sale
                pSim.isMoving = false;
                pSim.isDealing = true;
                pSim.angle = Math.atan2(dy, dx);
                pSim.dealTimer += dt;
                if (pSim.dealTimer >= 2.0) {
                  pSim.dealTimer = 0;
                  pSim.isDealing = false;
                  pSim.lastSoldPedId = targetPed.id;
                  pSim.targetPedId = -1;
                  recordPartnerManualSale(activePartner.id, targetPed.name);
                }
              } else {
                pSim.isDealing = false;
                pSim.isMoving = true;
                pSim.dealTimer = 0;
                const step = 2.15;
                pSim.angle = Math.atan2(dy, dx);
                pSim.x += (dx / dist) * step;
                pSim.y += (dy / dist) * step;
              }
            }
          }
        } else {
          // Partner has 0 stock: return to the shared Safehouse!
          pSim.isDealing = false;
          pSim.dealTimer = 0;
          if (!pSim.inSafehouse) {
            const dx = activeProp.spawnCoords.x - pSim.x;
            const dy = activeProp.spawnCoords.y - pSim.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 18) {
              // Walked back through the Safehouse door!
              pSim.inSafehouse = true;
              pSim.interiorX = layout.exitDoorPos.x;
              pSim.interiorZ = layout.exitDoorPos.z - 0.8;
              pSim.isMoving = true;
            } else {
              pSim.isMoving = true;
              pSim.angle = Math.atan2(dy, dx);
              pSim.x += (dx / dist) * 2.2;
              pSim.y += (dy / dist) * 2.2;
            }
          } else {
            // Inside Safehouse: walk back to Partner Desk
            const dx = layout.partnerDeskPos.x - 1.1 - pSim.interiorX;
            const dz = layout.partnerDeskPos.z - pSim.interiorZ;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.4) {
              pSim.interiorX += (dx / dist) * 0.14;
              pSim.interiorZ += (dz / dist) * 0.14;
              pSim.angle = Math.atan2(dx, dz);
              pSim.isMoving = true;
            } else {
              pSim.isMoving = false;
              pSim.angle = -Math.PI / 2;
            }
          }
        }
      } else {
        pSim.inSafehouse = true;
        pSim.interiorX = layout.partnerDeskPos.x - 1.1;
        pSim.interiorZ = layout.partnerDeskPos.z;
        pSim.isMoving = false;
        pSim.isDealing = false;
      }

      cityScene.updatePartner3D(
        {
          hired: Boolean(activePartner?.hired),
          inSafehouse: pSim.inSafehouse,
          x: pSim.x,
          y: pSim.y,
          interiorX: pSim.interiorX,
          interiorZ: pSim.interiorZ,
          angle: pSim.angle,
          isMoving: pSim.isMoving,
          isDealing: pSim.isDealing,
          stock: activePartner?.stock || 0
        },
        isInside,
        currentTime
      );

      if (partnerStatusRef.current) {
        if (!activePartner?.hired) {
          partnerStatusRef.current.textContent = 'UNHIRED';
          partnerStatusRef.current.className = 'text-slate-400 font-bold';
        } else if (activePartner.stock > 0) {
          partnerStatusRef.current.textContent = pSim.inSafehouse
            ? `EXITING DOOR (${activePartner.stock} BAGS)`
            : pSim.isDealing
            ? `SELLING TO CUSTOMER (${activePartner.stock} LEFT)`
            : `ON STREET SELLING (${activePartner.stock} BAGS)`;
          partnerStatusRef.current.className = 'text-emerald-400 font-bold';
        } else {
          partnerStatusRef.current.textContent = pSim.inSafehouse
            ? 'IN SAFEHOUSE (IDLE)'
            : 'RETURNING TO SAFEHOUSE';
          partnerStatusRef.current.className = 'text-cyan-400 font-bold';
        }
      }

      // Smooth continuous Day / Sunset / Night sky, fog, sun & streetlight transitions
      cityScene.updateTimeOfDaySmooth(
        currentState.hour + (currentState.minute || 0) / 60,
        rawTimeSetting,
        isInside,
        dt
      );

      // ====================================================================
      // BRANCH A: PLAYER IS INSIDE WALKABLE 3D SAFEHOUSE INTERIOR
      // ====================================================================
      if (isInside) {
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        cityScene.updateInteriorPots(currentState.pots, currentTime);

        cockpit.group.visible = false;
        cityScene.updatePlayerCar(0, 0, 0, '', false);
        cityScene.updateGpsArrow(0, 0, null, false, currentTime);
        sound.updateEngineHum(0, false);

        if (keys.turnLeft) p.footYaw += dt * 2.5;
        if (keys.turnRight) p.footYaw -= dt * 2.5;

        let moveForward = 0;
        let moveStrafe = 0;
        if (keys.up) moveForward += 1;
        if (keys.down) moveForward -= 1;
        if (keys.left) moveStrafe -= 1;
        if (keys.right) moveStrafe += 1;

        if (moveForward !== 0 || moveStrafe !== 0) {
          const len = Math.hypot(moveForward, moveStrafe);
          const normF = moveForward / len;
          const normS = moveStrafe / len;

          const forwardX = -Math.sin(p.footYaw);
          const forwardZ = -Math.cos(p.footYaw);
          const rightX = Math.cos(p.footYaw);
          const rightZ = -Math.sin(p.footYaw);

          const indoorSpeed = 0.24 * (walkSpeed / 1.8);
          p.interiorX += (forwardX * normF + rightX * normS) * indoorSpeed;
          p.interiorZ += (forwardZ * normF + rightZ * normS) * indoorSpeed;
          p.walkBob += dt * (keys.sprint ? 16 : 11);
          p.stepTimer += dt * (keys.sprint ? 1.6 : 1.0);
          if (p.stepTimer >= 0.42) {
            p.stepTimer = 0;
            sound.playFootstep();
          }
          p.speed = keys.sprint ? 2.0 : 1.0;
        } else {
          p.speed = 0;
        }

        p.interiorX = Math.max(
          INTERIOR_CENTER_X - layout.roomHalfW,
          Math.min(INTERIOR_CENTER_X + layout.roomHalfW, p.interiorX)
        );
        p.interiorZ = Math.max(
          INTERIOR_CENTER_Z - layout.roomHalfD,
          Math.min(INTERIOR_CENTER_Z + layout.roomHalfD, p.interiorZ)
        );

        // Character Jump Physics Inside Safehouse (Spacebar / Jump Button)
        if (keys.jump && p.isGrounded) {
          p.jumpVy = 7.2;
          p.isGrounded = false;
          sound.playFootstep();
        }
        if (!p.isGrounded || p.jumpY > 0) {
          p.jumpY += p.jumpVy * dt;
          p.jumpVy -= 22.0 * dt;
          if (p.jumpY <= 0) {
            p.jumpY = 0;
            p.jumpVy = 0;
            p.isGrounded = true;
            sound.playFootstep();
          }
        }

        const eyeHeight = 1.75 + Math.sin(p.walkBob) * 0.03 + p.jumpY;
        camera.position.set(p.interiorX, eyeHeight, p.interiorZ);
        camera.rotation.set(p.footPitch, p.footYaw, 0, 'YXZ');

        const distExit = Math.hypot(p.interiorX - layout.exitDoorPos.x, p.interiorZ - layout.exitDoorPos.z);
        const distGrow = Math.hypot(p.interiorX - layout.growStationPos.x, p.interiorZ - layout.growStationPos.z);
        const distLab = Math.hypot(p.interiorX - layout.labStationPos.x, p.interiorZ - layout.labStationPos.z);
        const distPack = Math.hypot(p.interiorX - layout.packStationPos.x, p.interiorZ - layout.packStationPos.z);
        const distPartner = Math.hypot(p.interiorX - layout.partnerDeskPos.x, p.interiorZ - layout.partnerDeskPos.z);
        const distStore = Math.hypot(p.interiorX - layout.storeStationPos.x, p.interiorZ - layout.storeStationPos.z);
        const distBed = Math.hypot(p.interiorX - layout.bedPos.x, p.interiorZ - layout.bedPos.z);

        let proximityZone: 'none' | 'exit' | 'grow' | 'lab' | 'pack' | 'partner' | 'store' | 'bed' = 'none';
        if (distExit < 3.4) proximityZone = 'exit';
        else if (distStore < 4.2) proximityZone = 'store';
        else if (distBed < 4.0) proximityZone = 'bed';
        else if (distGrow < 5.2) proximityZone = 'grow';
        else if (distLab < 4.2) proximityZone = 'lab';
        else if (distPack < 4.2) proximityZone = 'pack';
        else if (distPartner < 4.2) proximityZone = 'partner';

        // If player actively walks when near a station, switch to that station; otherwise keep selected station open!
        const isWalkingNow = moveForward !== 0 || moveStrafe !== 0;
        let nextZone = activeInteriorZoneRef.current;
        if (isWalkingNow && proximityZone !== 'none') {
          nextZone = proximityZone;
          manualInteriorZoneRef.current = proximityZone;
        } else if (nextZone === 'none') {
          nextZone = manualInteriorZoneRef.current || (proximityZone !== 'none' ? proximityZone : 'store');
        }

        if (activeInteriorZoneRef.current !== nextZone) {
          activeInteriorZoneRef.current = nextZone;
          setActiveInteriorZone(nextZone);
        }

        if (safehousePromptRef.current) safehousePromptRef.current.style.display = 'none';
        if (shopPromptRef.current) shopPromptRef.current.style.display = 'none';
        if (sprayPromptRef.current) sprayPromptRef.current.style.display = 'none';
        if (pedPromptRef.current) pedPromptRef.current.style.display = 'none';
        if (carPromptRef.current) carPromptRef.current.style.display = 'none';
        if (deliverButtonRef.current) deliverButtonRef.current.style.display = 'none';
        if (gpsPromptRef.current) gpsPromptRef.current.style.display = 'none';
        if (pursuitBannerRef.current) pursuitBannerRef.current.style.display = 'none';
        if (detectionBoxRef.current) detectionBoxRef.current.style.display = 'none';

        if (speedDomRef.current) speedDomRef.current.textContent = 'INDOORS';
        if (stealthDomRef.current) {
          stealthDomRef.current.textContent = 'SAFEHOUSE (NO POLICE)';
          stealthDomRef.current.className = 'text-cyan-400 font-bold';
        }

        if (frameCount % 2 === 0 && minimapCanvasRef.current) {
          const mCtx = minimapCanvasRef.current.getContext('2d');
          if (mCtx) {
            const mw = minimapCanvasRef.current.width;
            const mh = minimapCanvasRef.current.height;
            mCtx.fillStyle = '#020617';
            mCtx.fillRect(0, 0, mw, mh);

            const padX = 22;
            const padY = 16;
            const rw = mw - padX * 2;
            const rh = mh - padY * 2;
            mCtx.strokeStyle = '#38bdf8';
            mCtx.lineWidth = 2;
            mCtx.strokeRect(padX, padY, rw, rh);

            const toRadarX = (wx: number) =>
              padX + ((wx - (INTERIOR_CENTER_X - layout.roomHalfW)) / (layout.roomHalfW * 2)) * rw;
            const toRadarY = (wz: number) =>
              padY + ((wz - (INTERIOR_CENTER_Z - layout.roomHalfD)) / (layout.roomHalfD * 2)) * rh;

            mCtx.fillStyle = '#10b981';
            mCtx.fillRect(toRadarX(layout.growStationPos.x) - 5, toRadarY(layout.growStationPos.z) - 5, 10, 10);
            mCtx.fillStyle = '#06b6d4';
            mCtx.fillRect(toRadarX(layout.labStationPos.x) - 5, toRadarY(layout.labStationPos.z) - 5, 10, 10);
            mCtx.fillStyle = '#f59e0b';
            mCtx.fillRect(toRadarX(layout.packStationPos.x) - 5, toRadarY(layout.packStationPos.z) - 5, 10, 10);
            mCtx.fillStyle = '#a855f7';
            mCtx.fillRect(toRadarX(layout.partnerDeskPos.x) - 5, toRadarY(layout.partnerDeskPos.z) - 5, 10, 10);
            mCtx.fillStyle = '#ec4899';
            mCtx.fillRect(toRadarX(layout.storeStationPos.x) - 5, toRadarY(layout.storeStationPos.z) - 5, 10, 10);
            mCtx.fillStyle = '#f43f5e';
            mCtx.fillRect(toRadarX(layout.bedPos.x) - 5, toRadarY(layout.bedPos.z) - 5, 10, 10);
            mCtx.fillStyle = '#38bdf8';
            mCtx.fillRect(toRadarX(layout.exitDoorPos.x) - 6, toRadarY(layout.exitDoorPos.z) - 3, 12, 6);

            if (activePartner?.hired && pSim.inSafehouse) {
              mCtx.fillStyle = '#34d399';
              mCtx.beginPath();
              mCtx.arc(toRadarX(pSim.interiorX), toRadarY(pSim.interiorZ), 4, 0, Math.PI * 2);
              mCtx.fill();
            }

            mCtx.fillStyle = '#ffffff';
            mCtx.beginPath();
            mCtx.arc(toRadarX(p.interiorX), toRadarY(p.interiorZ), 4, 0, Math.PI * 2);
            mCtx.fill();
          }
        }

        renderer.render(cityScene.scene, camera);
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // ====================================================================
      // BRANCH B: PLAYER IS OUTSIDE IN THE 3D OPEN CITY
      // ====================================================================

      if (godMode) {
        p.invulnTimer = 999;
      } else if (p.invulnTimer > 0) {
        p.invulnTimer -= dt;
      }

      // ====================================================================
      // 1. REALISTIC DRIVING PHYSICS (Ackermann Steering, Drift & Suspension)
      // ====================================================================
      let currentTurnDir = 0;
      if (isOnFoot) {
        if (keys.turnLeft) p.footYaw += dt * 2.5;
        if (keys.turnRight) p.footYaw -= dt * 2.5;

        let moveForward = 0;
        let moveStrafe = 0;
        if (keys.up) moveForward += 1;
        if (keys.down) moveForward -= 1;
        if (keys.left) moveStrafe -= 1;
        if (keys.right) moveStrafe += 1;

        if (moveForward !== 0 || moveStrafe !== 0) {
          const len = Math.hypot(moveForward, moveStrafe);
          const normF = moveForward / len;
          const normS = moveStrafe / len;

          const forwardX = -Math.sin(p.footYaw);
          const forwardZ = -Math.cos(p.footYaw);
          const rightX = Math.cos(p.footYaw);
          const rightZ = -Math.sin(p.footYaw);

          const moveVecX = (forwardX * normF + rightX * normS) * walkSpeed;
          const moveVecZ = (forwardZ * normF + rightZ * normS) * walkSpeed;

          p.speed = walkSpeed;
          p.walkBob += dt * (keys.sprint ? 16 : 11);
          p.stepTimer += dt * (keys.sprint ? 1.6 : 1.0);
          if (p.stepTimer >= 0.42) {
            p.stepTimer = 0;
            sound.playFootstep();
          }
          p.angle = Math.atan2(moveVecZ, moveVecX);

          if (!checkBuildingCollision(p.x + moveVecX, p.y)) p.x += moveVecX;
          if (!checkBuildingCollision(p.x, p.y + moveVecZ)) p.y += moveVecZ;
        } else {
          p.speed = 0;
        }

        // Character Jump Physics On Foot Outside (Spacebar / Jump Button)
        if (keys.jump && p.isGrounded) {
          p.jumpVy = 7.8;
          p.isGrounded = false;
          sound.playFootstep();
        }
        if (!p.isGrounded || p.jumpY > 0) {
          p.jumpY += p.jumpVy * dt;
          p.jumpVy -= 22.0 * dt;
          if (p.jumpY <= 0) {
            p.jumpY = 0;
            p.jumpVy = 0;
            p.isGrounded = true;
            sound.playFootstep();
          }
        }

        sound.updateEngineHum(0, false);
      } else {
        p.jumpY = 0;
        p.jumpVy = 0;
        p.isGrounded = true;
        // Steering wheel angle interpolation (Ackermann geometry)
        const maxSteer = 0.52;
        if (keys.left) {
          p.steerAngle = Math.max(-maxSteer, p.steerAngle - 0.048);
          currentTurnDir = -1;
        } else if (keys.right) {
          p.steerAngle = Math.min(maxSteer, p.steerAngle + 0.048);
          currentTurnDir = 1;
        } else {
          p.steerAngle *= 0.82;
          if (Math.abs(p.steerAngle) < 0.005) p.steerAngle = 0;
        }
        p.turnDir = currentTurnDir;

        // Forward & Lateral unit vectors
        const fx = Math.cos(p.angle);
        const fy = Math.sin(p.angle);
        const rx = -Math.sin(p.angle);
        const ry = Math.cos(p.angle);

        // Decompose velocity vector into forward speed & sideways drift slip
        let forwardSpeed = p.vx * fx + p.vy * fy;
        let lateralSpeed = p.vx * rx + p.vy * ry;

        const maxFwd = v.maxSpeed * carSpeedMult;
        const maxRev = -maxFwd * 0.42;
        const accelStep = v.accel * carAccelMult;

        p.isBraking = false;
        let targetPitch = 0;

        if (keys.up) {
          if (forwardSpeed < 0) {
            // Braking from reverse
            forwardSpeed += accelStep * 2.2;
            p.isBraking = true;
          } else {
            forwardSpeed = Math.min(maxFwd, forwardSpeed + accelStep);
            targetPitch = -0.038; // Rear squats under acceleration
          }
        } else if (keys.down) {
          p.isBraking = true;
          if (forwardSpeed > 0.08) {
            // Strong hydraulic disc braking!
            forwardSpeed = Math.max(0, forwardSpeed - accelStep * 2.4);
            targetPitch = 0.052; // Nose dives under braking
            if (forwardSpeed > 1.6) sound.playTireScreech();
          } else {
            // Reverse gear
            forwardSpeed = Math.max(maxRev, forwardSpeed - accelStep * 0.85);
            targetPitch = 0.02;
          }
        } else {
          // Natural engine braking & aerodynamic drag
          forwardSpeed *= 0.968;
          if (Math.abs(forwardSpeed) < 0.02) forwardSpeed = 0;
        }

        // Ackermann Turning: Car only rotates proportionally to rolling speed!
        if (Math.abs(forwardSpeed) > 0.03) {
          const speedFactor = Math.min(1.0, Math.abs(forwardSpeed) / 1.15);
          const dirSign = forwardSpeed >= 0 ? 1 : -1;
          const angularVel = p.steerAngle * (v.turnSpeed * 2.1) * speedFactor * dirSign;
          p.angle += angularVel;

          // Inject realistic centrifugal lateral slip during high-speed cornering
          lateralSpeed += angularVel * forwardSpeed * 0.45;
        }

        // Lateral tire grip / drift friction
        const isHighSpeedTurn = Math.abs(forwardSpeed) > 1.9 && Math.abs(p.steerAngle) > 0.32;
        lateralSpeed *= isHighSpeedTurn ? 0.87 : 0.74;
        if (Math.abs(lateralSpeed) < 0.01) lateralSpeed = 0;

        if (isHighSpeedTurn && Math.abs(lateralSpeed) > 0.25) {
          sound.playTireScreech();
        }

        // Reconstruct world velocity vector (vx, vy) from new heading
        const nfx = Math.cos(p.angle);
        const nfy = Math.sin(p.angle);
        const nrx = -Math.sin(p.angle);
        const nry = Math.cos(p.angle);

        p.vx = nfx * forwardSpeed + nrx * lateralSpeed;
        p.vy = nfy * forwardSpeed + nry * lateralSpeed;
        p.speed = forwardSpeed;

        // Smooth suspension body roll & pitch
        const targetRoll = -p.steerAngle * (forwardSpeed / maxFwd) * 0.14;
        p.bodyRoll += (targetRoll - p.bodyRoll) * 0.18;
        p.bodyPitch += (targetPitch - p.bodyPitch) * 0.18;

        sound.updateEngineHum(p.speed, true);

        p.yawOffset *= 0.96;
        p.pitch *= 0.96;

        // Apply velocity with sliding collision resolution
        const currentColliding = checkBuildingCollision(p.x, p.y);
        if (currentColliding) {
          const b = currentColliding;
          const dL = p.x - (b.x - 16);
          const dR = (b.x + b.w + 16) - p.x;
          const dT = p.y - (b.y - 16);
          const dB = (b.y + b.h + 16) - p.y;
          const minD = Math.min(dL, dR, dT, dB);
          if (minD === dL) p.x = b.x - 18;
          else if (minD === dR) p.x = b.x + b.w + 18;
          else if (minD === dT) p.y = b.y - 18;
          else p.y = b.y + b.h + 18;
          p.vx = 0;
          p.vy = 0;
          p.speed = 0;
        } else {
          if (!checkBuildingCollision(p.x + p.vx, p.y)) {
            p.x += p.vx;
          } else {
            p.vx *= -0.35;
            p.speed *= 0.45;
            sound.playCrash();
          }

          if (!checkBuildingCollision(p.x, p.y + p.vy)) {
            p.y += p.vy;
          } else {
            p.vy *= -0.35;
            p.speed *= 0.45;
            sound.playCrash();
          }
        }
      }

      p.x = Math.max(25, Math.min(WORLD_WIDTH - 25, p.x));
      p.y = Math.max(25, Math.min(WORLD_HEIGHT - 25, p.y));

      // 2. Check Proximity to Owned Safehouse Entrance Door
      let foundSafehouse: Property | null = null;
      for (const prop of currentState.properties) {
        if (prop.owned && Math.hypot(p.x - prop.spawnCoords.x, p.y - prop.spawnCoords.y) < 55) {
          foundSafehouse = prop;
          break;
        }
      }
      nearSafehouseRef.current = foundSafehouse;
      if (safehousePromptRef.current && safehouseTextRef.current) {
        if (foundSafehouse) {
          safehousePromptRef.current.style.display = 'flex';
          safehouseTextRef.current.textContent = `🏠 ${foundSafehouse.name.toUpperCase()} — PRESS [H] OR CLICK TO ENTER 3D SAFEHOUSE`;
        } else {
          safehousePromptRef.current.style.display = 'none';
        }
      }

      // 2B. Check Proximity to Town 24/7 Convenience Shop & Shopkeeper Gus
      const distToShop = Math.hypot(
        p.x - CONVENIENCE_SHOP_COORDS.x,
        p.y - CONVENIENCE_SHOP_COORDS.y
      );
      const isNearShop = distToShop < 70;
      nearConvenienceShopRef.current = isNearShop;
      if (shopPromptRef.current && shopTextRef.current) {
        if (isNearShop) {
          shopPromptRef.current.style.display = 'flex';
          shopTextRef.current.textContent = `🏪 HYLAND 24/7 CONVENIENCE MART — PRESS [B] OR CLICK TO BUY FROM SHOPKEEPER GUS`;
        } else {
          shopPromptRef.current.style.display = 'none';
        }
      }

      // 3. Ambient Civilian Traffic AI
      const civCars = civilianCarsRef.current;
      civCars.forEach(civ => {
        const distToPlayer = Math.hypot(p.x - civ.x, p.y - civ.y);
        const dxToP = p.x - civ.x;
        const dyToP = p.y - civ.y;
        const dotForward = dxToP * Math.cos(civ.angle) + dyToP * Math.sin(civ.angle);

        if (distToPlayer < 42 && dotForward > 0) {
          if (frameCount % 90 === 0) sound.playPing();
        } else {
          civ.x += civ.vx;
          civ.y += civ.vy;
        }

        if (civ.x > WORLD_WIDTH - 60) {
          civ.x = WORLD_WIDTH - 60;
          civ.vx = -Math.abs(civ.vx);
          civ.angle = Math.PI;
        } else if (civ.x < 60) {
          civ.x = 60;
          civ.vx = Math.abs(civ.vx);
          civ.angle = 0;
        }
        if (civ.y > WORLD_HEIGHT - 60) {
          civ.y = WORLD_HEIGHT - 60;
          civ.vy = -Math.abs(civ.vy);
          civ.angle = -Math.PI / 2;
        } else if (civ.y < 60) {
          civ.y = 60;
          civ.vy = Math.abs(civ.vy);
          civ.angle = Math.PI / 2;
        }
      });
      cityScene.updateCivilianTraffic(civCars, currentTime, p.x, p.y);

      // 4. Shadow Alley Check & Pay 'n' Spray Proximity
      let inShadow = false;
      SHADOW_ALLEYS.forEach(a => {
        if (p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h) {
          inShadow = true;
        }
      });
      p.inShadow = inShadow;
      const speedMph = Math.round(Math.abs(p.speed) * 20);

      let foundSpray: PayNSpray | null = null;
      if (!isOnFoot) {
        for (const sp of PAY_N_SPRAYS) {
          if (Math.hypot(p.x - sp.x, p.y - sp.y) < 55) {
            foundSpray = sp;
            break;
          }
        }
      }
      nearSprayRef.current = foundSpray;
      if (sprayPromptRef.current && sprayTextRef.current) {
        if (foundSpray && !isOnFoot) {
          sprayPromptRef.current.style.display = 'flex';
          sprayTextRef.current.textContent = `🎨 ${foundSpray.name.toUpperCase()} ($${foundSpray.cost}) — PRESS [R] OR CLICK TO RESPRAY & WIPE PURSUIT`;
        } else {
          sprayPromptRef.current.style.display = 'none';
        }
      }

      // 5. Proximity to Parked Car
      let nearCar = false;
      if (isOnFoot && currentState.parkedVehicle) {
        const carDist = Math.hypot(p.x - currentState.parkedVehicle.x, p.y - currentState.parkedVehicle.y);
        nearCar = carDist < 45;
      }

      // 6. Update NPC Pedestrians
      npcManagerRef.current.update({
        x: p.x,
        y: p.y,
        speed: p.speed,
        isOnFoot,
        isChasing: pursuit.isChasing
      });
      cityScene.updatePedestrians(npcManagerRef.current.getPedestrians(), currentTime, p.x, p.y);

      let nearPed: { id: number; name: string } | null = null;
      if (isOnFoot) {
        const peds = npcManagerRef.current.getPedestrians();
        const found = peds.find(ped => Math.hypot(p.x - ped.x, p.y - ped.y) < 32);
        if (found) nearPed = { id: found.id, name: found.name };
      }
      nearPedRef.current = nearPed;

      if (pedPromptRef.current && pedTextRef.current) {
        if (nearPed && isOnFoot) {
          pedPromptRef.current.style.display = 'flex';
          pedTextRef.current.textContent = `PRESS G OR CLICK TO SELL TO ${nearPed.name.toUpperCase()} (+$45 CASH)`;
        } else {
          pedPromptRef.current.style.display = 'none';
        }
      }

      // ====================================================================
      // 7. PROPER POLICE AI ALGORITHM:
      //    - DRUG-ONLY DETECTION: Police can ONLY detect you if carrying drugs!
      //    - NO POLICE IN SAFEHOUSE AREA: 140m Safe Zone around owned Safehouses
      //    - RESPAWN FROM SAFEHOUSE ON ARREST: Wakes up inside Safehouse
      //    - Unobstructed Line-of-Sight (LOS) Raycast + Road-Graph Pathfinding
      // ====================================================================
      const cops = copsRef.current;
      let spottedInThisFrame = false;

      const carriedDrugs = getCarriedDrugsCount(
        currentState.inv,
        Boolean(currentState.activeOrder)
      );

      // Check if player is inside any owned Safehouse Safe Zone (140 units radius)
      let inSafehouseSafeZone = false;
      for (const prop of currentState.properties) {
        if (!prop.owned) continue;
        if (Math.hypot(p.x - prop.spawnCoords.x, p.y - prop.spawnCoords.y) < 140) {
          inSafehouseSafeZone = true;
          break;
        }
      }

      // If player enters the Safehouse Safe Zone or carries 0 drugs, police cannot chase!
      if (inSafehouseSafeZone || carriedDrugs <= 0) {
        if (pursuit.isChasing) {
          pursuit.isChasing = false;
          pursuit.chaseTimeRemaining = 0;
          pursuit.detectionTime = 0;
          cops.forEach(c => { c.alert = false; });
          showToast(
            inSafehouseSafeZone
              ? "🏠 Entered Safehouse Safe Zone — No Police allowed here!"
              : "🛡️ Carrying 0 Drugs — Police have no evidence and called off pursuit!",
            "success"
          );
        }
      }

      cops.forEach(cop => {
        if (policeDisabled) {
          cop.speed = 0;
          cop.alert = false;
          return;
        }

        // Enforce No-Police Zone around all owned Safehouses (repel police cruisers!)
        for (const prop of currentState.properties) {
          if (!prop.owned) continue;
          const distToSafe = Math.hypot(cop.x - prop.spawnCoords.x, cop.y - prop.spawnCoords.y);
          if (distToSafe < 145) {
            const pushAngle = Math.atan2(cop.y - prop.spawnCoords.y, cop.x - prop.spawnCoords.x);
            cop.x = prop.spawnCoords.x + Math.cos(pushAngle) * 150;
            cop.y = prop.spawnCoords.y + Math.sin(pushAngle) * 150;
            cop.angle = pushAngle;
            cop.alert = false;
            cop.targetIdx = (cop.targetIdx + 1) % cop.patrolPath.length;
          }
        }

        const pDist = Math.hypot(p.x - cop.x, p.y - cop.y);
        const pAngle = Math.atan2(p.y - cop.y, p.x - cop.x);
        let angleDiff = Math.abs(pAngle - cop.angle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        // Police ONLY detect player if carrying drugs (carriedDrugs > 0) AND outside Safehouse Safe Zone
        const canSeePlayer =
          carriedDrugs > 0 &&
          !inSafehouseSafeZone &&
          !p.inShadow &&
          pDist < cop.visionDist &&
          angleDiff < cop.visionAngle &&
          hasLineOfSight(cop.x, cop.y, p.x, p.y, 2);

        if (canSeePlayer) {
          cop.alert = true;
          spottedInThisFrame = true;
          pursuit.lastKnownX = p.x;
          pursuit.lastKnownY = p.y;
        }

        if (pursuit.isChasing && carriedDrugs > 0 && !inSafehouseSafeZone) {
          cop.alert = true;
          cop.speed = copChaseSpeed;

          // Target player's current position if visible, otherwise last known position
          const targetX = !p.inShadow ? p.x : pursuit.lastKnownX;
          const targetY = !p.inShadow ? p.y : pursuit.lastKnownY;

          // Road-Intersection Graph Pathfinding around city blocks
          const waypoint = getNextRoadGraphWaypoint(cop.x, cop.y, targetX, targetY);
          const desiredAngle = Math.atan2(waypoint.y - cop.y, waypoint.x - cop.x);

          // Smooth steering toward waypoint
          let deltaAngle = desiredAngle - cop.angle;
          while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
          while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
          cop.angle += Math.max(-0.085, Math.min(0.085, deltaAngle * 0.25));

          const stepX = Math.cos(cop.angle) * cop.speed;
          const stepY = Math.sin(cop.angle) * cop.speed;

          // Building collision avoidance for police cruisers
          if (!checkBuildingCollision(cop.x + stepX, cop.y, 4.0)) {
            cop.x += stepX;
          } else {
            cop.angle += 0.35;
          }
          if (!checkBuildingCollision(cop.x, cop.y + stepY, 4.0)) {
            cop.y += stepY;
          } else {
            cop.angle -= 0.35;
          }

          // Physical interception check -> Respawn inside Safehouse!
          if (pDist < 26 && p.invulnTimer <= 0 && !godMode && !p.inShadow && !inSafehouseSafeZone && carriedDrugs > 0) {
            p.invulnTimer = 4.0;
            pursuit.isChasing = false;
            pursuit.chaseTimeRemaining = 0;
            pursuit.detectionTime = 0;
            pursuit.hideTime = 0;

            cops.forEach(c => {
              c.alert = false;
              c.speed = copPatrolSpeed;
              const angleAway = Math.atan2(c.y - p.y, c.x - p.x);
              c.x += Math.cos(angleAway) * 90;
              c.y += Math.sin(angleAway) * 90;
            });

            // Position player inside the Safehouse by the bed & respawn in Safehouse
            p.x = activeProp.spawnCoords.x;
            p.y = activeProp.spawnCoords.y;
            p.interiorX = layout.bedPos.x + 1.8;
            p.interiorZ = layout.bedPos.z;
            p.footYaw = 0;
            p.footPitch = 0;
            p.speed = 0;
            p.vx = 0;
            p.vy = 0;
            sound.updateEngineHum(0, false);

            triggerBustedArrest();
          }
        } else if (canSeePlayer) {
          // Police caught sight of player: pause & lock eyes during the 2-second pre-chase delay
          cop.alert = true;
          cop.speed = 0;
          cop.angle = pAngle;
        } else {
          // Normal Road-Grid Patrol
          cop.speed = copPatrolSpeed;
          cop.alert = false;
          const target = cop.patrolPath[cop.targetIdx];
          const cdx = target.x - cop.x;
          const cdy = target.y - cop.y;
          const dist = Math.hypot(cdx, cdy);

          if (dist < 18) {
            cop.targetIdx = (cop.targetIdx + 1) % cop.patrolPath.length;
          } else {
            cop.angle = Math.atan2(cdy, cdx);
            cop.x += Math.cos(cop.angle) * cop.speed;
            cop.y += Math.sin(cop.angle) * cop.speed;
          }
        }
      });

      // Requirement #6: Police start the chase 2 seconds after catching sight of you
      if (policeDisabled || inSafehouseSafeZone || carriedDrugs <= 0) {
        pursuit.isChasing = false;
        pursuit.detectionTime = 0;
        pursuit.chaseTimeRemaining = 0;
        pursuit.hideTime = 0;
      } else if (spottedInThisFrame && !inShadow) {
        if (!pursuit.isChasing) {
          const prevDet = pursuit.detectionTime;
          pursuit.detectionTime += dt;
          if (prevDet === 0) {
            sound.playPing();
            showToast(
              `🚓 POLICE CAUGHT YOU WITH DRUGS (${carriedDrugs} items)! Chase starts in 2.0s!`,
              "info"
            );
          }
          if (pursuit.detectionTime >= 2.0) {
            pursuit.isChasing = true;
            pursuit.chaseTimeRemaining = 30.0;
            sound.playSiren();
            showToast(
              `🚨 2s UP — POLICE CHASE STARTED! Reach Safehouse or Break LOS for 30s!`,
              "danger"
            );
          }
        } else {
          // Refresh 30s pursuit timer while police still have direct eyes on you
          pursuit.chaseTimeRemaining = 30.0;
        }
      } else if (pursuit.isChasing) {
        // Player broke Line-of-Sight! Count down the 30-second escape timer (faster in Shadow Alleys)
        const decayRate = inShadow ? dt * 2.5 : dt;
        pursuit.chaseTimeRemaining = Math.max(0, pursuit.chaseTimeRemaining - decayRate);
        if (pursuit.chaseTimeRemaining <= 0) {
          pursuit.isChasing = false;
          pursuit.detectionTime = 0;
          cops.forEach(c => { c.alert = false; });
          showToast("✅ ESCAPED! You evaded the police for 30 seconds — cops lost your trail and forgot you!", "success");
        }
      } else if (pursuit.detectionTime > 0) {
        // Broke line of sight before 2 seconds elapsed
        pursuit.detectionTime = Math.max(0, pursuit.detectionTime - dt * 1.5);
      }

      cityScene.updatePoliceCruisers(cops, pursuit.isChasing, currentTime);
      cityScene.updateDropBeacon(currentState.activeOrder ? currentState.activeOrder.dropCoords : null, currentTime);
      cityScene.updateParkedCar(currentState.parkedVehicle, v.color || '#10b981');

      // 8. 3D GPS Directional Arrow & Hand-off Range Check
      let canDeliverNow = false;
      let gpsTarget: { x: number; y: number } | null = null;
      let isPursuitTarget = false;

      if (pursuit.isChasing && !currentState.activeOrder) {
        // Point to active Safehouse when chased so player can easily escape!
        gpsTarget = { x: activeProp.spawnCoords.x, y: activeProp.spawnCoords.y };
        isPursuitTarget = true;
      } else if (currentState.activeOrder) {
        const dropX = currentState.activeOrder.dropCoords.x;
        const dropY = currentState.activeOrder.dropCoords.y;
        gpsTarget = { x: dropX, y: dropY };
        const dDist = Math.hypot(p.x - dropX, p.y - dropY);

        if (dDist < 100) {
          canDeliverNow = true;
          if (keys.action) {
            completeDelivery();
          }
        }

        if (gpsPromptRef.current && gpsTextRef.current) {
          gpsPromptRef.current.style.display = 'flex';
          const meters = Math.round(dDist);
          const dAngle = Math.atan2(dropY - p.y, dropX - p.x);
          let compass = 'NORTH';
          if (dAngle >= -Math.PI / 4 && dAngle < Math.PI / 4) compass = 'EAST';
          else if (dAngle >= Math.PI / 4 && dAngle < (3 * Math.PI) / 4) compass = 'SOUTH';
          else if (dAngle >= -(3 * Math.PI) / 4 && dAngle < -Math.PI / 4) compass = 'NORTH';
          else compass = 'WEST';

          gpsTextRef.current.textContent = `📍 DROP TARGET: ${currentState.activeOrder.name.toUpperCase()} (${currentState.activeOrder.district}) • ${meters}M [${compass}]`;
        }
      } else {
        if (gpsPromptRef.current) gpsPromptRef.current.style.display = 'none';
      }

      cityScene.updateGpsArrow(p.x, p.y, gpsTarget, isPursuitTarget, currentTime);

      // 9. 3D Camera & Vehicle / Cockpit Positioning
      if (prevOnFootRef.current !== isOnFoot) {
        prevOnFootRef.current = isOnFoot;
        if (!isOnFoot) {
          const camAngle = p.angle + p.yawOffset;
          camFollowPosRef.current.set(
            p.x - Math.cos(camAngle) * 13.0,
            4.5,
            p.y - Math.sin(camAngle) * 13.0
          );
        }
      }

      if (isOnFoot) {
        cockpit.group.visible = false;
        cityScene.updatePlayerCar(0, 0, 0, '', false);

        const eyeHeight = 1.7 + Math.sin(p.walkBob) * 0.04 + p.jumpY;
        camera.position.set(p.x, eyeHeight, p.y);
        camera.rotation.set(p.footPitch, p.footYaw, 0, 'YXZ');
      } else if (drivingCamMode === 'cockpit') {
        cityScene.updatePlayerCar(0, 0, 0, '', false);
        cockpit.group.visible = true;
        cockpit.updateColor(v.color || '#10b981');

        const camX = p.x;
        const camY = 1.95;
        const camZ = p.y;
        camera.position.set(camX, camY, camZ);

        const lookAngle = p.angle - p.yawOffset;
        const lookDist = 20;
        camera.lookAt(
          camX + Math.cos(lookAngle) * lookDist,
          camY + Math.sin(p.pitch) * 8,
          camZ + Math.sin(lookAngle) * lookDist
        );

        cockpit.group.position.copy(camera.position);
        cockpit.group.rotation.copy(camera.rotation);
        const isBlink = (pursuit.isChasing || spottedInThisFrame) && Math.floor(currentTime / 200) % 2 === 0;
        cockpit.update(p.speed, p.turnDir, isBlink);
      } else {
        cockpit.group.visible = false;
        cityScene.updatePlayerCar(
          p.x,
          p.y,
          p.angle,
          v.color || '#10b981',
          true,
          p.steerAngle,
          p.speed,
          p.isBraking,
          p.bodyRoll,
          p.bodyPitch
        );

        const followDist = 13.0 + Math.min(2.5, Math.abs(p.speed) * 0.8);
        const followHeight = 4.5;
        const camAngle = p.angle + p.yawOffset;
        const targetCamX = p.x - Math.cos(camAngle) * followDist;
        const targetCamZ = p.y - Math.sin(camAngle) * followDist;
        const targetCamY = Math.max(2.4, followHeight + p.pitch * 3.5);

        const distToTarget = camFollowPosRef.current.distanceTo(
          new THREE.Vector3(targetCamX, targetCamY, targetCamZ)
        );

        if (distToTarget > 35) {
          camFollowPosRef.current.set(targetCamX, targetCamY, targetCamZ);
        } else {
          const followSpeed = Math.min(1.0, dt * 8.5);
          camFollowPosRef.current.x += (targetCamX - camFollowPosRef.current.x) * followSpeed;
          camFollowPosRef.current.y += (targetCamY - camFollowPosRef.current.y) * followSpeed;
          camFollowPosRef.current.z += (targetCamZ - camFollowPosRef.current.z) * followSpeed;
        }

        camera.position.copy(camFollowPosRef.current);

        const lookTargetX = p.x + Math.cos(p.angle) * 7.5;
        const lookTargetY = 1.8;
        const lookTargetZ = p.y + Math.sin(p.angle) * 7.5;
        camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
      }

      renderer.render(cityScene.scene, camera);

      // 10. Update UI DOM Telemetry
      if (speedDomRef.current) speedDomRef.current.textContent = `${speedMph} MPH`;
      if (stealthDomRef.current) {
        if (inSafehouseSafeZone) {
          stealthDomRef.current.textContent = 'SAFEHOUSE ZONE (NO POLICE)';
          stealthDomRef.current.className = 'text-cyan-400 font-bold';
        } else if (carriedDrugs <= 0) {
          stealthDomRef.current.textContent = 'CLEAN (0 DRUGS — COPS IGNORE)';
          stealthDomRef.current.className = 'text-emerald-400 font-bold';
        } else if (inShadow) {
          stealthDomRef.current.textContent = 'SHADOW (STEALTH)';
          stealthDomRef.current.className = 'text-cyan-400 font-bold';
        } else if (spottedInThisFrame) {
          stealthDomRef.current.textContent = `IN COP SIGHT (${carriedDrugs} DRUGS)!`;
          stealthDomRef.current.className = 'text-red-400 font-bold animate-pulse';
        } else {
          stealthDomRef.current.textContent = `CARRYING ${carriedDrugs} DRUGS`;
          stealthDomRef.current.className = 'text-amber-400 font-bold';
        }
      }
      if (strikesDomRef.current) {
        strikesDomRef.current.textContent = `${currentState.policeChase?.bustedStrikes || 0}/5`;
      }

      if (detectionBoxRef.current && detectionTextRef.current && detectionBarRef.current) {
        if (!pursuit.isChasing && pursuit.detectionTime > 0) {
          detectionBoxRef.current.style.display = 'flex';
          const remSec = Math.max(0, 2.0 - pursuit.detectionTime);
          detectionTextRef.current.textContent = `🚓 POLICE CAUGHT YOU! CHASE STARTS IN ${remSec.toFixed(1)}s`;
          detectionBarRef.current.style.width = `${Math.min(100, (pursuit.detectionTime / 2.0) * 100)}%`;
        } else {
          detectionBoxRef.current.style.display = 'none';
        }
      }

      if (pursuitBannerRef.current && pursuitTextRef.current) {
        if (pursuit.isChasing) {
          pursuitBannerRef.current.style.display = 'flex';
          pursuitTextRef.current.textContent = spottedInThisFrame
            ? `🚨 COP HAS EYES ON YOU! BREAK LINE-OF-SIGHT! (30s)`
            : `🚨 ESCAPING POLICE: ${Math.ceil(pursuit.chaseTimeRemaining)}s UNTIL COPS FORGET!`;
        } else {
          pursuitBannerRef.current.style.display = 'none';
        }
      }

      if (deliverButtonRef.current) {
        deliverButtonRef.current.style.display = canDeliverNow ? 'block' : 'none';
      }
      if (carPromptRef.current) {
        carPromptRef.current.style.display = nearCar ? 'flex' : 'none';
      }

      // 11. Draw 2D Minimap Radar & Full Map (Showing SAFEHOUSE, PARTNER, POLICE WHEN CHASING, MY CAR & SHOP!)
      if (frameCount % 2 === 0) {
        const renderCityRadar = (canvas: HTMLCanvasElement, isLarge: boolean) => {
          const mCtx = canvas.getContext('2d');
          if (!mCtx) return;
          const mw = canvas.width;
          const mh = canvas.height;
          const scaleX = mw / WORLD_WIDTH;
          const scaleY = mh / WORLD_HEIGHT;
          const fontSm = isLarge ? 'bold 11px monospace' : 'bold 7px monospace';
          const fontMd = isLarge ? 'bold 12px monospace' : 'bold 8px monospace';

          mCtx.fillStyle = '#020617';
          mCtx.fillRect(0, 0, mw, mh);

          // Draw road grid lines on large map for clarity
          if (isLarge) {
            mCtx.strokeStyle = '#0f172a';
            mCtx.lineWidth = 10;
            ROAD_XS.forEach(rx => {
              mCtx.beginPath();
              mCtx.moveTo(rx * scaleX, 0);
              mCtx.lineTo(rx * scaleX, mh);
              mCtx.stroke();
            });
            ROAD_YS.forEach(ry => {
              mCtx.beginPath();
              mCtx.moveTo(0, ry * scaleY);
              mCtx.lineTo(mw, ry * scaleY);
              mCtx.stroke();
            });
          }

          mCtx.fillStyle = '#1e293b';
          WORLD_BUILDINGS.forEach(b => {
            mCtx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);
          });

          mCtx.fillStyle = '#06b6d4';
          SHADOW_ALLEYS.forEach(a => {
            mCtx.fillRect(a.x * scaleX, a.y * scaleY, a.w * scaleX, a.h * scaleY);
          });

          // Pay 'n' Spray garages
          mCtx.fillStyle = '#10b981';
          PAY_N_SPRAYS.forEach(sp => {
            mCtx.fillRect(sp.x * scaleX - 3, sp.y * scaleY - 3, 6, 6);
          });

          // Town 24/7 Convenience Shop Marker
          const shopX = CONVENIENCE_SHOP_COORDS.x * scaleX;
          const shopY = CONVENIENCE_SHOP_COORDS.y * scaleY;
          mCtx.fillStyle = '#f59e0b';
          mCtx.fillRect(shopX - 4, shopY - 4, 8, 8);
          mCtx.strokeStyle = '#fef08a';
          mCtx.lineWidth = 1;
          mCtx.strokeRect(shopX - 4, shopY - 4, 8, 8);
          mCtx.fillStyle = '#fde047';
          mCtx.font = fontSm;
          mCtx.fillText('SHOP', Math.max(2, shopX - 10), Math.max(8, shopY - 6));

          // 1. OWNED SAFEHOUSES ON MAP ("SAFEHOUSE")
          currentState.properties.forEach(pr => {
            if (!pr.owned) return;
            const sx = pr.spawnCoords.x * scaleX;
            const sy = pr.spawnCoords.y * scaleY;
            const isMain = pr.id === currentState.activePropertyId;

            if (isMain) {
              const pulse = (isLarge ? 9 : 5) + (Math.sin(currentTime * 0.007) + 1) * 2.5;
              mCtx.strokeStyle = '#38bdf8';
              mCtx.lineWidth = 1.5;
              mCtx.beginPath();
              mCtx.arc(sx, sy, pulse, 0, Math.PI * 2);
              mCtx.stroke();
            }

            const boxR = isLarge ? 6 : 4;
            mCtx.fillStyle = '#06b6d4';
            mCtx.fillRect(sx - boxR, sy - boxR, boxR * 2, boxR * 2);
            mCtx.strokeStyle = '#ffffff';
            mCtx.lineWidth = 1.2;
            mCtx.strokeRect(sx - boxR, sy - boxR, boxR * 2, boxR * 2);

            if (isMain || isLarge) {
              mCtx.fillStyle = '#67e8f9';
              mCtx.font = fontMd;
              mCtx.fillText('SAFEHOUSE', Math.max(2, Math.min(mw - 54, sx - 20)), Math.max(10, sy - (boxR + 3)));
            }
          });

          // Active Drop Target
          if (currentState.activeOrder) {
            const dx = currentState.activeOrder.dropCoords.x * scaleX;
            const dy = currentState.activeOrder.dropCoords.y * scaleY;

            mCtx.save();
            mCtx.strokeStyle = '#fbbf24';
            mCtx.lineWidth = 1.5;
            mCtx.setLineDash([4, 3]);
            mCtx.lineDashOffset = -(frameCount * 0.4) % 14;
            mCtx.beginPath();
            mCtx.moveTo(p.x * scaleX, p.y * scaleY);
            mCtx.lineTo(dx, dy);
            mCtx.stroke();
            mCtx.restore();

            const pulseRadius = 4 + (Math.sin(currentTime * 0.008) + 1) * 3.5;
            mCtx.strokeStyle = '#fde047';
            mCtx.lineWidth = 1.5;
            mCtx.beginPath();
            mCtx.arc(dx, dy, pulseRadius, 0, Math.PI * 2);
            mCtx.stroke();

            mCtx.fillStyle = '#f59e0b';
            mCtx.beginPath();
            mCtx.arc(dx, dy, 3.5, 0, Math.PI * 2);
            mCtx.fill();
          }

          // 2. POLICE ON MAP ONLY WHEN CHASING ("POLICE WHEN CHASING")
          if (pursuit.isChasing || pursuit.detectionTime > 0) {
            const isRedFlash = Math.floor(currentTime / 160) % 2 === 0;
            cops.forEach(c => {
              const cx = c.x * scaleX;
              const cy = c.y * scaleY;
              mCtx.strokeStyle = isRedFlash ? '#ef4444' : '#3b82f6';
              mCtx.lineWidth = 1.5;
              mCtx.beginPath();
              mCtx.arc(cx, cy, isLarge ? 8 : 5.5, 0, Math.PI * 2);
              mCtx.stroke();

              mCtx.fillStyle = isRedFlash ? '#ef4444' : '#60a5fa';
              mCtx.beginPath();
              mCtx.arc(cx, cy, isLarge ? 4.5 : 3.2, 0, Math.PI * 2);
              mCtx.fill();

              mCtx.fillStyle = '#fca5a5';
              mCtx.font = fontSm;
              mCtx.fillText('COP', Math.max(2, cx - 8), Math.max(8, cy - 6));
            });
          }

          // 3. MY PARTNER ON MAP ("PARTNER" — Shown whether on street OR inside Safehouse)
          if (activePartner) {
            const partWorldX = !pSim.inSafehouse ? pSim.x : activeProp.spawnCoords.x + 55;
            const partWorldY = !pSim.inSafehouse ? pSim.y : activeProp.spawnCoords.y + 30;
            const px = partWorldX * scaleX;
            const py = partWorldY * scaleY;

            mCtx.fillStyle = pSim.isDealing ? '#fbbf24' : '#a855f7';
            mCtx.beginPath();
            mCtx.arc(px, py, isLarge ? 5.5 : 4, 0, Math.PI * 2);
            mCtx.fill();
            mCtx.strokeStyle = '#ffffff';
            mCtx.lineWidth = 1;
            mCtx.stroke();

            mCtx.fillStyle = '#e9d5ff';
            mCtx.font = fontSm;
            mCtx.fillText('PARTNER', Math.max(2, Math.min(mw - 42, px - 14)), Math.max(9, py + (isLarge ? 13 : 9)));
          }

          // 4. MY CAR ON MAP ("MY CAR" — Always shown whether parked or currently driven)
          const carWorldX = isOnFoot && currentState.parkedVehicle ? currentState.parkedVehicle.x : p.x;
          const carWorldY = isOnFoot && currentState.parkedVehicle ? currentState.parkedVehicle.y : p.y;
          const carX = carWorldX * scaleX;
          const carY = carWorldY * scaleY;

          mCtx.fillStyle = v.color || '#10b981';
          const cw = isLarge ? 10 : 7;
          const ch = isLarge ? 6 : 4.5;
          mCtx.fillRect(carX - cw / 2, carY - ch / 2, cw, ch);
          mCtx.strokeStyle = '#fef08a';
          mCtx.lineWidth = 1.2;
          mCtx.strokeRect(carX - cw / 2, carY - ch / 2, cw, ch);

          mCtx.fillStyle = '#fde047';
          mCtx.font = fontSm;
          mCtx.fillText('MY CAR', Math.max(2, Math.min(mw - 38, carX - 14)), Math.max(8, carY - (isLarge ? 7 : 5)));

          // 5. PLAYER MARKER (When on foot, show distinct Player dot in addition to My Car)
          if (isOnFoot) {
            const plX = p.x * scaleX;
            const plY = p.y * scaleY;
            mCtx.fillStyle = '#10b981';
            mCtx.beginPath();
            mCtx.arc(plX, plY, isLarge ? 5 : 3.8, 0, Math.PI * 2);
            mCtx.fill();
            mCtx.strokeStyle = '#ffffff';
            mCtx.lineWidth = 1;
            mCtx.stroke();
            if (isLarge) {
              mCtx.fillStyle = '#6ee7b7';
              mCtx.font = fontSm;
              mCtx.fillText('YOU', Math.max(2, plX - 8), Math.max(8, plY + 12));
            }
          }
        };

        if (minimapCanvasRef.current) {
          renderCityRadar(minimapCanvasRef.current, false);
        }
        if (fullMapCanvasRef.current) {
          renderCityRadar(fullMapCanvasRef.current, true);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      sound.updateEngineHum(0, false);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [completeDelivery, keysRef, triggerBustedArrest, recordPartnerManualSale, showToast]);

  const currentVeh = state.vehicles.find(v => v.id === state.currentVehicleId) || state.vehicles[0];
  const activeProp = state.properties.find(p => p.id === state.activePropertyId) ||
                     state.properties.slice().reverse().find(p => p.owned) ||
                     state.properties[0];
  const carriedPacks = getTotalPackagedCount(state.inv);
  const carriedDrugsTotal = getCarriedDrugsCount(state.inv, Boolean(state.activeOrder));
  const vaultDrugsTotal = getVaultDrugsCount(state.safehouseVault);
  const storeLevel = state.safehouseStoreLevel || 1;
  const storeDiscountPct = storeLevel === 1 ? 0 : storeLevel === 2 ? 15 : storeLevel === 3 ? 25 : 35;
  const nextStoreUpgradeCost = storeLevel === 1 ? 500 : storeLevel === 2 ? 1500 : 3500;
  const maxCarry = state.playerOnFoot ? state.maxPocketCapacity : currentVeh.trunkCapacity;
  const playerLevel = getPlayerLevel(state.rep);
  const maxStationsForLevel = getMaxCultivationStations(playerLevel, activeProp.maxPots);
  const readyPot = state.pots.find(pt => pt.ready || pt.progress >= 100);
  const emptyPot = state.pots.find(pt => pt.stage === 'empty');
  const activePartner = state.streetDealers.find(d => d.hired) || state.streetDealers[0];

  const effectiveLightLabel = state.insideSafehouse
    ? `🏠 INSIDE: ${activeProp.name.toUpperCase()}`
    : state.devSettings?.timeOfDay === 'auto'
    ? (state.hour >= 6 && state.hour < 18 ? '☀️ AUTO (DAY)' : (state.hour >= 18 && state.hour < 21 ? '🌅 AUTO (SUNSET)' : '🌙 AUTO (NIGHT)'))
    : `⚙️ ${state.devSettings?.timeOfDay?.toUpperCase()}`;

  return (
    <div 
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 w-screen h-screen p-0 m-0 overflow-hidden'
          : 'glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col gap-3'
      }
    >
      {/* Top Bar: Hidden in Fullscreen so ONLY the 3D Game is shown! */}
      {!isFullscreen && (
        <div className="flex flex-col gap-2.5 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-hud text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                {state.insideSafehouse ? (
                  <Home className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Navigation className="w-5 h-5 text-emerald-400" />
                )}
                <span>
                  {state.insideSafehouse
                    ? `${activeProp.name.toUpperCase()} — 3D WALKABLE INTERIOR`
                    : 'HYLAND POINT — 3D CITY & SAFEHOUSE VIEW'}
                </span>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-700 text-amber-300 px-2 py-0.5 rounded-md">
                  {effectiveLightLabel}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleToggleSafehouseInterior()}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-hud font-bold border transition flex items-center gap-1.5 shadow-lg ${
                  state.insideSafehouse
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-glow-amber'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                }`}
                title="Enter or Exit your Walkable 3D Safehouse Interior (Hotkey: H)"
              >
                {state.insideSafehouse ? <DoorOpen className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                <span>{state.insideSafehouse ? 'EXIT DOOR TO STREET (H)' : `ENTER SAFEHOUSE DOOR (H)`}</span>
              </button>

              <button
                onClick={() => {
                  if (document.pointerLockElement) document.exitPointerLock?.();
                  setConvenienceShopOpen(prev => !prev);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 text-xs font-hud font-bold transition flex items-center gap-1.5 shadow-lg"
                title="Open Town 24/7 Convenience Mart with Shopkeeper Gus (Hotkey: B) — Sells Soil, Fertilizer, Packaging, Cutting Agents & Lab Supplies"
              >
                <Store className="w-4 h-4" />
                <span>🏪 TOWN SHOP (B)</span>
              </button>

              <button
                onClick={() => {
                  if (document.pointerLockElement) document.exitPointerLock?.();
                  setFullMapOpen(prev => !prev);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 text-xs font-hud font-bold transition flex items-center gap-1.5"
                title="Open Full City Map showing Safehouse, Partner, Police (when chasing), My Car & Convenience Shop"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>🗺️ MAP</span>
              </button>

              {(state.playerOnFoot || state.insideSafehouse) && (
                <button
                  onClick={handleManualJump}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 border border-emerald-400 text-xs font-hud font-bold transition flex items-center gap-1 shadow-md"
                  title="Jump (Press SPACEBAR when on foot or inside Safehouse)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>JUMP (SPACE)</span>
                </button>
              )}

              <div
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-hud font-bold flex items-center gap-1.5 ${
                  carriedDrugsTotal === 0
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                }`}
                title="Police can ONLY detect you when carrying drugs! Store drugs in your Safehouse Vault to walk clean."
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {carriedDrugsTotal === 0
                    ? `CLEAN (0 DRUGS • VAULT: ${vaultDrugsTotal})`
                    : `CARRYING ${carriedDrugsTotal} DRUGS (VAULT: ${vaultDrugsTotal})`}
                </span>
              </div>

              <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-hud font-bold flex items-center gap-1.5 ${
                carriedPacks >= maxCarry
                  ? 'bg-red-950/60 border-red-500/60 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`} title="On-Foot Pocket Capacity (15) vs Vehicle Trunk Capacity">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>{state.playerOnFoot || state.insideSafehouse ? 'POCKET' : 'TRUNK'}: {carriedPacks}/{maxCarry}</span>
              </div>

              {!state.playerOnFoot && !state.insideSafehouse && (
                <button
                  onClick={toggleDrivingCamera}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/50 text-xs font-hud font-bold transition flex items-center gap-1.5"
                  title="Toggle 3rd-Person Chase Cam vs 1st-Person Cockpit View (Key: C)"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>CAM: {state.devSettings?.drivingCameraMode === 'cockpit' ? 'COCKPIT (C)' : 'CHASE (C)'}</span>
                </button>
              )}

              <button
                onClick={handleToggleRadio}
                onContextMenu={(e) => { e.preventDefault(); handleNextRadioTrack(); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-hud font-bold transition flex items-center gap-1.5 ${
                  radioState.playing
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-glow-amber'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Press M to Toggle Radio • Press N (or Right-Click) for Next Track"
              >
                <Radio className={`w-3.5 h-3.5 ${radioState.playing ? 'text-purple-400 animate-pulse' : ''}`} />
                <span>{radioState.playing ? `📻 ${radioState.trackName}` : 'RADIO (M)'}</span>
              </button>

              {!state.insideSafehouse && (
                <button
                  onClick={handleToggleFoot}
                  className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold border transition flex items-center gap-1.5 ${
                    state.playerOnFoot
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {state.playerOnFoot ? <Car className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  <span>{state.playerOnFoot ? 'ENTER CAR (E/F)' : 'EXIT CAR (E/F)'}</span>
                </button>
              )}

              <button
                onClick={toggleAudio}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-hud font-bold transition flex items-center gap-1 ${
                  state.audioMuted
                    ? 'bg-red-950/80 border-red-500/70 text-red-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-slate-700'
                }`}
                title={state.audioMuted ? "Silent Mode ON (Click to Unmute Audio)" : "Click to Silence All Audio (Silent Mode)"}
              >
                {state.audioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{state.audioMuted ? 'SILENT' : 'SOUND'}</span>
              </button>

              <button
                onClick={toggleNotifications}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-hud font-bold transition flex items-center gap-1 ${
                  state.notificationsMuted
                    ? 'bg-amber-950/80 border-amber-500/70 text-amber-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
                }`}
                title={state.notificationsMuted ? "Notifications OFF (Click to Turn On)" : "Click to Turn Off Popup Notifications"}
              >
                {state.notificationsMuted ? <BellOff className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{state.notificationsMuted ? 'NOTIF OFF' : 'NOTIF ON'}</span>
              </button>

              <button
                onClick={handleResetPosition}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-hud transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>RESPAWN</span>
              </button>

              <button
                onClick={toggleDevPanel}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/50 text-xs font-hud font-bold transition flex items-center gap-1"
                title="Open Developer Settings & Cheats"
              >
                <Wrench className="w-3.5 h-3.5 text-purple-400" />
                <span>DEV</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-hud font-bold transition flex items-center gap-1"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>FULLSCREEN</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-cyan-400 mr-1 flex items-center gap-1 font-bold">
                <Home className="w-3.5 h-3.5 text-cyan-400" /> SAFEHOUSES:
              </span>
              {state.properties.filter(pr => pr.owned).map(pr => (
                <button
                  key={pr.id}
                  onClick={() => {
                    selectProperty(pr.id);
                    if (!state.insideSafehouse) {
                      handleToggleSafehouseInterior(pr);
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-hud border transition flex items-center gap-1 ${
                    activeProp.id === pr.id
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 font-bold shadow-glow-cyan'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Click to switch to & enter this Safehouse's 3D Interior"
                >
                  <span>🏠 {pr.name} ({pr.maxPots} Pots)</span>
                </button>
              ))}

              <span className="text-slate-700 mx-1">|</span>

              <span className="text-[11px] font-mono text-emerald-400 mr-1 flex items-center gap-1 font-bold">
                <Car className="w-3.5 h-3.5 text-emerald-400" /> GARAGE:
              </span>
              {state.vehicles.filter(v => v.owned).map(v => (
                <button
                  key={v.id}
                  disabled={state.playerOnFoot || state.insideSafehouse}
                  onClick={() => selectVehicle(v.id)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-hud border transition flex items-center gap-1 ${
                    state.currentVehicleId === v.id
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold shadow-glow-green'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  } ${state.playerOnFoot || state.insideSafehouse ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                  <span>{v.name}</span>
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              LEVEL: <strong className="text-amber-400 font-hud">LVL {playerLevel}</strong> • STORE: <strong className="text-pink-400 font-hud">LVL {storeLevel}</strong> • STATIONS: <strong className="text-emerald-400 font-hud">{state.pots.length}/{activeProp.maxPots}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3D WebGL Viewport Container (Fills 100% of screen with no control panels in Fullscreen!) */}
      <div 
        tabIndex={0}
        className={`relative w-full ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-0'
            : 'aspect-[16/9] max-h-[580px] rounded-2xl border-2 border-slate-800 shadow-2xl'
        } bg-slate-950 overflow-hidden focus:outline-none focus:border-cyan-500/50 cursor-grab active:cursor-grabbing`}
      >
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-full block" />

        {/* Subtle Exit Fullscreen Button when in Fullscreen */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 z-40 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-hud font-bold flex items-center gap-1.5 backdrop-blur"
            title="Exit Fullscreen (ESC)"
          >
            <Minimize className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXIT FULLSCREEN</span>
          </button>
        )}

        {/* Center Crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <Crosshair className="w-6 h-6 text-cyan-400" />
        </div>

        {/* Direct DOM Telemetry HUD */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono pointer-events-none flex flex-wrap items-center gap-3 sm:gap-4 shadow-lg">
          <div className="flex items-center gap-1.5 border-r border-slate-700/80 pr-3">
            <span className="text-slate-400">FPS: </span>
            <span ref={fpsDomRef} className="text-emerald-400 font-extrabold font-hud">-- FPS</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">FRAME RATE: </span>
            <span ref={frameRateDomRef} className="text-cyan-300 font-bold">-- fps • -- ms</span>
          </div>
          <div>
            <span className="text-slate-400">STATUS: </span>
            <span ref={stealthDomRef} className="text-emerald-400 font-bold">CLEAR</span>
          </div>
          <div>
            <span className="text-slate-400">SPEED: </span>
            <span ref={speedDomRef} className="text-amber-400 font-bold font-hud">0 MPH</span>
          </div>
          <div>
            <span className="text-slate-400">PARTNER: </span>
            <span ref={partnerStatusRef} className="text-cyan-400 font-bold">IN SAFEHOUSE</span>
          </div>
          <div>
            <span className="text-slate-400">STRIKES: </span>
            <span ref={strikesDomRef} className="text-slate-200 font-bold">0/5</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAudio();
            }}
            className={`pointer-events-auto cursor-pointer px-2 py-0.5 rounded text-[10px] font-hud font-bold border transition ${
              state.audioMuted
                ? 'bg-red-950/90 border-red-500 text-red-300'
                : 'bg-slate-800/90 border-slate-600 text-emerald-300 hover:text-white'
            }`}
            title="Toggle Silent Mode (Mute/Unmute All Audio)"
          >
            {state.audioMuted ? '🔇 SILENT' : '🔊 SOUND'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleNotifications();
            }}
            className={`pointer-events-auto cursor-pointer px-2 py-0.5 rounded text-[10px] font-hud font-bold border transition ${
              state.notificationsMuted
                ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                : 'bg-slate-800/90 border-slate-600 text-cyan-300 hover:text-white'
            }`}
            title="Toggle Popup Notifications On/Off"
          >
            {state.notificationsMuted ? '🔕 NOTIF OFF' : '🔔 NOTIF ON'}
          </button>
          {!state.insideSafehouse && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (document.pointerLockElement !== mountRef.current) {
                  mountRef.current?.requestPointerLock?.();
                } else {
                  document.exitPointerLock?.();
                }
              }}
              className={`pointer-events-auto cursor-pointer px-2 py-0.5 rounded text-[10px] font-hud font-bold border transition ${
                isPointerLocked
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/90 border-slate-600 text-slate-300 hover:text-white hover:border-slate-400'
              }`}
              title="Click to lock mouse cursor for direct FPS look (ESC to release)"
            >
              {isPointerLocked ? '🔒 LOCKED (ESC)' : '🖱️ LOCK MOUSE'}
            </div>
          )}
        </div>

        {/* 2D GPS / Interior Floorplan Radar Overlay (Click to Expand Full City Map) */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (document.pointerLockElement) document.exitPointerLock?.();
            setFullMapOpen(prev => !prev);
          }}
          className="pointer-events-auto cursor-pointer absolute top-3 right-3 bg-slate-900/92 hover:bg-slate-900 backdrop-blur p-1.5 rounded-xl border border-slate-700 hover:border-cyan-400 shadow-lg z-20 transition"
          title="Click to open Full City Map (Shows Safehouse, Partner, Police when chasing, My Car & Convenience Shop)"
        >
          <div className="text-[10px] text-slate-400 font-mono mb-1 flex items-center justify-between px-1 gap-2">
            <span className="font-bold text-slate-200">{state.insideSafehouse ? 'INTERIOR MAP' : '🗺️ CITY MAP (CLICK)'}</span>
            <span className="text-cyan-400">🏠 SAFEHOUSE</span>
          </div>
          <canvas ref={minimapCanvasRef} width={196} height={128} className="rounded-lg border border-slate-800" />
          <div className="mt-1 px-1 flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono text-slate-300">
            <span className="text-cyan-300">■ SAFEHOUSE</span>
            <span className="text-purple-300">● PARTNER</span>
            <span className="text-yellow-300">■ MY CAR</span>
            <span className="text-red-400">● COP(CHASE)</span>
            <span className="text-amber-300">■ SHOP</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SAFEHOUSE INTERIOR 3D INTERACTIVE STATION OVERLAYS           */}
        {/* ============================================================ */}
        {state.insideSafehouse && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto cursor-default absolute top-14 left-3 z-30 bg-slate-950/95 border border-cyan-500/60 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 space-y-1.5 max-w-sm shadow-2xl"
          >
            <div className="text-cyan-300 font-hud font-bold flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                {activeProp.name} (No Police Zone)
              </span>
              <span className="text-[10px] bg-pink-950/80 border border-pink-500/50 text-pink-300 px-1.5 py-0.5 rounded">
                Store Lvl {storeLevel}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Walk (W/A/S/D) or click any Safehouse station below to use its options directly:
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {([
                { id: 'store', label: '🛍️ Store & Vault' },
                { id: 'grow', label: '🌱 Grow Pots' },
                { id: 'lab', label: '🧪 Lab Rig' },
                { id: 'pack', label: '📦 Packaging' },
                { id: 'partner', label: '🤝 Partner' },
                { id: 'bed', label: '🛏️ Bed' },
                { id: 'exit', label: '🚪 Exit Door' }
              ] as const).map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectSafehouseStation(st.id)}
                  className={`px-2 py-1 rounded text-[10px] font-hud font-bold border transition cursor-pointer ${
                    activeInteriorZone === st.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/80">
              {carriedDrugsTotal > 0 ? (
                <button
                  type="button"
                  onClick={depositAllDrugsToVault}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-hud font-bold text-[10px] cursor-pointer"
                >
                  🔒 Stash {carriedDrugsTotal} Drugs in Vault (Go Clean)
                </button>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold">
                  🛡️ Clean (0 Drugs Carried — Police Cannot Detect You)
                </span>
              )}
              {vaultDrugsTotal > 0 && (
                <button
                  type="button"
                  onClick={withdrawAllDrugsFromVault}
                  className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-hud font-bold text-[10px] cursor-pointer"
                >
                  📦 Withdraw Vault ({vaultDrugsTotal})
                </button>
              )}
            </div>
          </div>
        )}

        {state.insideSafehouse && activeInteriorZone !== 'none' && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto cursor-default absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 border-2 border-cyan-400 rounded-2xl p-4 shadow-2xl z-30 flex flex-wrap items-center gap-3 min-w-[340px] max-w-[92vw] justify-between"
          >
            {activeInteriorZone === 'exit' && (
              <>
                <div className="flex items-center gap-2.5">
                  <DoorOpen className="w-6 h-6 text-cyan-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-white">SAFEHOUSE ENTRY / EXIT DOOR</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Step outside onto {activeProp.district} street (No-Police Safe Zone outside door)
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSafehouseInterior()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs transition"
                >
                  EXIT DOOR TO STREET (H / E)
                </button>
              </>
            )}

            {activeInteriorZone === 'store' && (
              <>
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-6 h-6 text-pink-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-pink-300">
                      3D SAFEHOUSE STORE & DRUG VAULT (LVL {storeLevel}/4 • {storeDiscountPct}% OFF)
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Carried Drugs: {carriedDrugsTotal} • Vault Safe: {vaultDrugsTotal} • Cash: ${state.cash.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {carriedDrugsTotal > 0 && (
                    <button
                      onClick={depositAllDrugsToVault}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-hud font-bold text-xs"
                    >
                      🔒 Stash Drugs ({carriedDrugsTotal})
                    </button>
                  )}
                  {vaultDrugsTotal > 0 && (
                    <button
                      onClick={withdrawAllDrugsFromVault}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-hud font-bold text-xs"
                    >
                      📦 Take Vault ({vaultDrugsTotal})
                    </button>
                  )}
                  <button
                    onClick={() => buyDarknetItem('seeds_og')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-hud font-bold text-xs"
                  >
                    +2 OG Seeds (${Math.max(5, Math.round(60 * (1 - storeDiscountPct / 100)))})
                  </button>
                  <button
                    onClick={() => buyDarknetItem('baggies')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-hud font-bold text-xs"
                  >
                    +30 Baggies (${Math.max(5, Math.round(20 * (1 - storeDiscountPct / 100)))})
                  </button>
                  <button
                    onClick={() => buyDarknetItem('fertilizer')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 font-hud font-bold text-xs"
                  >
                    +5 Fert (${Math.max(5, Math.round(45 * (1 - storeDiscountPct / 100)))})
                  </button>
                  {storeLevel < 4 && (
                    <button
                      onClick={upgradeSafehouseStore}
                      className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-hud font-bold text-xs shadow-lg"
                    >
                      ⬆️ Upgrade Store Lvl {storeLevel + 1} (${nextStoreUpgradeCost})
                    </button>
                  )}
                </div>
              </>
            )}

            {activeInteriorZone === 'bed' && (
              <>
                <div className="flex items-center gap-2.5">
                  <BedDouble className="w-6 h-6 text-rose-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-rose-300">
                      SAFEHOUSE BED & REST QUARTERS (DAY {state.day})
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Sleep until 08:00 AM • Fully matures all planted crops & cools down street heat (-25%)
                    </div>
                  </div>
                </div>
                <button
                  onClick={sleepInSafehouseBed}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-hud font-bold text-xs transition shadow-lg"
                >
                  🛏️ SLEEP & REST UNTIL MORNING
                </button>
              </>
            )}

            {activeInteriorZone === 'grow' && (
              <>
                <div className="flex items-center gap-2.5">
                  <Sprout className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-emerald-300">
                      3D CULTIVATION STATION ({state.pots.length}/{activeProp.maxPots} POTS)
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Level {playerLevel} Cap: {maxStationsForLevel} Stations • Seeds: {state.inv.seeds_og} OG
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {emptyPot && (
                    <button
                      onClick={() => plantSeed(emptyPot.id, 'seeds_og')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-hud font-bold text-xs"
                    >
                      Plant Seed (#{emptyPot.id})
                    </button>
                  )}
                  {readyPot && (
                    <button
                      onClick={() => harvestPot(readyPot.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-hud font-bold text-xs animate-pulse"
                    >
                      Harvest Pot #{readyPot.id}
                    </button>
                  )}
                  <button
                    onClick={() => { quickWaterAll(); quickFertilizeAll(); }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-hud font-bold text-xs"
                  >
                    Water & Feed All
                  </button>
                  <button
                    onClick={buyCultivationStation}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-hud font-bold text-xs"
                  >
                    +1 Station ($250)
                  </button>
                </div>
              </>
            )}

            {activeInteriorZone === 'lab' && (
              <>
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-6 h-6 text-cyan-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-cyan-300">3D CHEMISTRY & CUTTING BENCH</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Batch Purity: {state.batchPurity}% • {state.lab.isCooking ? `Cooking (${Math.round(state.lab.progress)}%)` : 'Ready'}
                    </div>
                  </div>
                </div>
                <button
                  disabled={state.lab.isCooking}
                  onClick={startLabSynthesis}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-hud font-bold text-xs transition"
                >
                  {state.lab.isCooking ? 'Cooking Batch...' : 'Start Lab Synthesis'}
                </button>
              </>
            )}

            {activeInteriorZone === 'pack' && (
              <>
                <div className="flex items-center gap-2.5">
                  <Package className="w-6 h-6 text-amber-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-amber-300">3D PACKAGING & STASH BENCH</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Raw OG Bud: {state.inv.raw_bud_og}g • Baggies: {state.inv.baggies} • Dime Bags: {state.inv.pack_og_dime}
                    </div>
                  </div>
                </div>
                <button
                  onClick={bulkPackDimes}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-hud font-bold text-xs transition"
                >
                  Mass Pack Dime Bags
                </button>
              </>
            )}

            {activeInteriorZone === 'partner' && (
              <>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-purple-300">
                      SHARED SAFEHOUSE PARTNER ({activePartner.name})
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Give drugs & he walks out the Safehouse door to sell to people manually! • Stock: {activePartner.stock}/{activePartner.maxStock} • Cash: ${activePartner.cashCollected}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!activePartner.hired ? (
                    <button
                      onClick={() => hireDealer(activePartner.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-hud font-bold text-xs"
                    >
                      Rent Partner (${activePartner.hireCost})
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => supplyDealer(activePartner.id, 'pack_og_dime', 5)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs"
                      >
                        Give +5 Dime Bags (Go Sell!)
                      </button>
                      <button
                        onClick={() => collectDealerCash(activePartner.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-hud font-bold text-xs"
                      >
                        Collect ${activePartner.cashCollected}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Direct DOM Detection Gauge */}
        <div 
          ref={detectionBoxRef}
          style={{ display: 'none' }}
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500 text-amber-300 font-hud text-xs px-3 py-1.5 rounded-xl shadow-lg items-center gap-2 animate-pulse"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span ref={detectionTextRef}>POLICE SPOTTING</span>
          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div ref={detectionBarRef} className="bg-amber-400 h-full transition-all" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Direct DOM Pursuit Banner */}
        <div 
          ref={pursuitBannerRef}
          style={{ display: 'none' }}
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600/95 text-white font-hud font-bold px-4 py-2 rounded-xl shadow-2xl border border-red-300 animate-bounce text-xs sm:text-sm items-center gap-2.5"
        >
          <Siren className="w-5 h-5 animate-spin" />
          <div>
            <div ref={pursuitTextRef}>🚨 POLICE PURSUIT: 30s REMAINING!</div>
            <div className="text-[10px] font-mono font-normal opacity-90">
              Break Line-of-Sight for 30s, enter SAFEHOUSE (H), or use PAY 'N' SPRAY!
            </div>
          </div>
        </div>

        {/* GPS Waypoint Nav Prompt */}
        <div 
          ref={gpsPromptRef}
          style={{ display: 'none' }}
          className="absolute top-14 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500/80 text-amber-300 px-4 py-1.5 rounded-xl text-xs font-mono font-bold shadow-lg items-center gap-2 pointer-events-none z-20"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span ref={gpsTextRef}>📍 DROP TARGET: ALISON • 250M [NORTH]</span>
        </div>

        {/* Safehouse Door Entrance Prompt */}
        <div 
          ref={safehousePromptRef}
          style={{ display: 'none' }}
          onClick={() => handleToggleSafehouseInterior(nearSafehouseRef.current || undefined)}
          className="absolute bottom-44 left-1/2 -translate-x-1/2 bg-cyan-950/95 border-2 border-cyan-400 hover:border-cyan-300 text-cyan-200 px-5 py-2.5 rounded-2xl text-xs font-hud font-bold shadow-2xl items-center gap-2.5 animate-pulse cursor-pointer transition hover:scale-105 active:scale-95 z-30"
          title="Press H or click to enter your walkable 3D Safehouse Interior"
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span ref={safehouseTextRef}>🏠 ENTER SAFEHOUSE 3D INTERIOR (PRESS H)</span>
        </div>

        {/* Town 24/7 Convenience Shop & Shopkeeper Gus Entrance Prompt */}
        <div
          ref={shopPromptRef}
          style={{ display: 'none' }}
          onClick={handleOpenConvenienceShop}
          className="absolute bottom-44 left-1/2 -translate-x-1/2 bg-amber-950/95 border-2 border-amber-400 hover:border-amber-300 text-amber-200 px-5 py-2.5 rounded-2xl text-xs font-hud font-bold shadow-2xl items-center gap-2.5 animate-pulse cursor-pointer transition hover:scale-105 active:scale-95 z-30"
          title="Press B or click to talk to Shopkeeper Gus and buy Soil, Fertilizer, Packaging, Cutting Agents & Lab Supplies"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span ref={shopTextRef}>🏪 HYLAND 24/7 CONVENIENCE MART — PRESS [B] TO TALK TO SHOPKEEPER GUS</span>
        </div>

        {/* ============================================================ */}
        {/* TOWN 24/7 CONVENIENCE MART & SHOPKEEPER GUS MODAL OVERLAY    */}
        {/* Sells Everything Except Drugs: Soil, Fertilizer, Packaging   */}
        {/* ============================================================ */}
        {convenienceShopOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto cursor-default absolute inset-0 z-40 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          >
            <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl max-w-3xl w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3 max-h-[92%]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-900/70 border border-emerald-400 flex items-center justify-center text-2xl shadow-md">
                    👨‍🍳
                  </div>
                  <div>
                    <div className="font-hud text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                      <span>🏪 HYLAND 24/7 CONVENIENCE MART — SHOPKEEPER GUS</span>
                      <span className="text-[10px] font-mono bg-emerald-950 border border-emerald-500/60 text-emerald-300 px-2 py-0.5 rounded">
                        100% LEGAL SUPPLIES (NO DRUGS)
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      &ldquo;Welcome in! I stock Organic Soil &amp; Hydro Buckets, NPK Fertilizer, Zipper Baggies, Glass Vials, Cutting Agents &amp; Lab Solvents!&rdquo;
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg text-emerald-300 font-bold">
                    💵 Cash: ${state.cash.toLocaleString()} • 🏦 Bank: ${state.bank.toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const p = playerRef.current;
                      p.x = CONVENIENCE_SHOP_COORDS.x + 14;
                      p.y = CONVENIENCE_SHOP_COORDS.y;
                      p.speed = 0;
                      p.vx = 0;
                      p.vy = 0;
                      if (state.insideSafehouse) setInsideSafehouse(false);
                      showToast("📍 Fast-traveled to Hyland 24/7 Convenience Mart in town!", "info");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-hud font-bold text-xs cursor-pointer"
                    title="Teleport directly outside the 3D Convenience Shop counter in town"
                  >
                    📍 Visit 3D Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvenienceShopOpen(false)}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-hud font-bold text-xs cursor-pointer"
                  >
                    ✕ Close (B)
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { id: 'all', label: '🛒 All Supplies' },
                    { id: 'soil', label: '🪴 Soil & Grow Pots' },
                    { id: 'packaging', label: '🛍️ Packaging & Baggies' },
                    { id: 'nutrients', label: '🧪 Fertilizer & Feed' },
                    { id: 'cutting', label: '🧂 Cutting Agents' },
                    { id: 'lab', label: '⚗️ Lab Solvents' }
                  ] as const).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setShopCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-hud font-bold border transition cursor-pointer ${
                        shopCategory === cat.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Pots: <strong className="text-emerald-400">{state.pots.length}/{activeProp.maxPots}</strong> • Baggies: <strong className="text-cyan-400">{state.inv.baggies}</strong> • Fert: <strong className="text-purple-400">{state.inv.fertilizer}</strong>
                </div>
              </div>

              {/* Shopkeeper Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
                {CONVENIENCE_SHOP_ITEMS.filter(
                  item => shopCategory === 'all' || item.category === shopCategory
                ).map(item => (
                  <div
                    key={item.id}
                    className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-xs font-hud font-bold text-white">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 leading-snug">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => buyConvenienceShopItem(item.id)}
                      className="shrink-0 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-hud font-bold text-xs cursor-pointer transition active:scale-95 shadow"
                    >
                      Buy ${item.cost}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* EXPANDED FULL CITY MAP OVERLAY                               */}
        {/* Shows Safehouse, Partner, Police When Chasing, My Car & Shop */}
        {/* ============================================================ */}
        {fullMapOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto cursor-default absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border-2 border-cyan-400 rounded-2xl p-4 max-w-2xl w-full shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="font-hud text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>HYLAND POINT — LIVE TACTICAL GPS MAP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFullMapOpen(false)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-hud font-bold text-xs cursor-pointer"
                >
                  ✕ Close Map
                </button>
              </div>
              <canvas
                ref={fullMapCanvasRef}
                width={620}
                height={380}
                className="w-full rounded-xl border border-slate-700 bg-slate-950"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-cyan-300 font-bold">🏠 Cyan Box: My Safehouse</span>
                <span className="text-purple-300 font-bold">🟣 Purple Dot: My Partner</span>
                <span className="text-yellow-300 font-bold">🚗 Gold/Green Box: My Car</span>
                <span className="text-red-400 font-bold">🚓 Flashing Red/Blue: Police (When Chasing)</span>
                <span className="text-amber-300 font-bold">🏪 Amber Box: 24/7 Convenience Shop</span>
              </div>
            </div>
          </div>
        )}

        {/* Pay 'n' Spray Garage Prompt */}
        <div 
          ref={sprayPromptRef}
          style={{ display: 'none' }}
          onClick={handleTriggerPayNSpray}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-emerald-950/95 border-2 border-emerald-400 hover:border-emerald-300 text-emerald-200 px-5 py-2.5 rounded-2xl text-xs font-hud font-bold shadow-2xl items-center gap-2.5 animate-pulse cursor-pointer transition hover:scale-105 active:scale-95 z-30"
          title="Press R or click to respray car ($150) and clear police pursuit"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span ref={sprayTextRef}>🎨 PAY 'N' SPRAY ($150) — PRESS [R] TO RESPRAY & WIPE HEAT</span>
        </div>

        {/* Near Parked Car Prompt */}
        <div 
          ref={carPromptRef}
          style={{ display: 'none' }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500 text-emerald-300 px-4 py-1.5 rounded-xl text-xs font-hud font-bold shadow-lg items-center gap-2 animate-pulse z-20"
        >
          <Car className="w-4 h-4 text-emerald-400" />
          <span>PRESS E OR F TO ENTER VEHICLE</span>
        </div>

        {/* Street Deal Prompt for Nearby Pedestrian */}
        <div 
          ref={pedPromptRef}
          style={{ display: 'none' }}
          onClick={() => {
            if (nearPedRef.current) {
              sellDrugToPedestrian(nearPedRef.current.id, nearPedRef.current.name);
            }
          }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-purple-950/95 border-2 border-purple-400 hover:border-purple-300 text-purple-200 px-5 py-2.5 rounded-2xl text-xs font-hud font-bold shadow-2xl items-center gap-2.5 animate-pulse cursor-pointer transition hover:scale-105 active:scale-95 z-30"
          title="Click or press G to sell product to pedestrian"
        >
          <span className="text-base">🤝</span>
          <span ref={pedTextRef}>PRESS G OR CLICK TO SELL DRUGS</span>
        </div>

        {/* Floating Deliver Action Button */}
        <div ref={deliverButtonRef} style={{ display: 'none' }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={completeDelivery}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold font-hud text-sm shadow-2xl shadow-glow-green transition active:scale-95 animate-pulse flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>HAND-OFF PACKAGE (PRESS SPACE)</span>
          </button>
        </div>
      </div>

      {/* Bottom Controller Guide & Touch D-Pad: Hidden in Fullscreen! */}
      {!isFullscreen && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 space-y-1">
            <div className="font-hud text-slate-200 font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>3D CITY & SAFEHOUSE INTERIOR CONTROLS</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-300">W / S / A / D</span> Drive / Drift / Walk
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-emerald-300 font-bold">SPACE</span> Jump (On Foot) / Deliver
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-300 font-bold">B</span> Town Convenience Shop
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-yellow-300 font-bold">SHIFT</span> Sprint
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-cyan-300 font-bold">H</span> Enter / Exit 3D Safehouse
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-cyan-300 font-bold">C</span> Cockpit / Chase Cam
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-cyan-300 font-bold">E / F</span> Enter / Exit Car
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-emerald-300 font-bold">R</span> Pay 'n' Spray ($150)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleSafehouseInterior()}
              className="px-2.5 py-2 rounded-lg bg-cyan-950 text-xs font-hud font-bold text-cyan-300 border border-cyan-700"
            >
              {state.insideSafehouse ? 'Exit House' : 'Enter House'}
            </button>

            <div className="grid grid-cols-3 gap-1 w-28 sm:w-32">
              <div></div>
              <button
                onMouseDown={() => setVirtualKey('up', true)}
                onMouseUp={() => setVirtualKey('up', false)}
                onMouseLeave={() => setVirtualKey('up', false)}
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey('up', true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey('up', false); }}
                className="d-btn p-2 rounded bg-slate-800 text-slate-200 text-center font-bold border border-slate-700 select-none"
              >
                ▲
              </button>
              <div></div>
              <button
                onMouseDown={() => setVirtualKey('left', true)}
                onMouseUp={() => setVirtualKey('left', false)}
                onMouseLeave={() => setVirtualKey('left', false)}
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey('left', true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey('left', false); }}
                className="d-btn p-2 rounded bg-slate-800 text-slate-200 text-center font-bold border border-slate-700 select-none"
              >
                ◀
              </button>
              <button
                onClick={completeDelivery}
                className="d-btn p-2 rounded bg-emerald-600 text-slate-950 text-center font-bold border border-emerald-500 text-xs select-none"
              >
                DROP
              </button>
              <button
                onMouseDown={() => setVirtualKey('right', true)}
                onMouseUp={() => setVirtualKey('right', false)}
                onMouseLeave={() => setVirtualKey('right', false)}
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey('right', true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey('right', false); }}
                className="d-btn p-2 rounded bg-slate-800 text-slate-200 text-center font-bold border border-slate-700 select-none"
              >
                ▶
              </button>
              <div></div>
              <button
                onMouseDown={() => setVirtualKey('down', true)}
                onMouseUp={() => setVirtualKey('down', false)}
                onMouseLeave={() => setVirtualKey('down', false)}
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey('down', true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey('down', false); }}
                className="d-btn p-2 rounded bg-slate-800 text-slate-200 text-center font-bold border border-slate-700 select-none"
              >
                ▼
              </button>
              <div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
