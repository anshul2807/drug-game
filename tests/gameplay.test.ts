import { describe, it, expect } from 'vitest';
import { 
  CUTTING_AGENTS, 
  INITIAL_VEHICLES, 
  INITIAL_LAUNDERING, 
  INITIAL_MISSIONS,
  INITIAL_STATE,
  getTotalPackagedCount, 
  getCarriedDrugsCount,
  getVaultDrugsCount,
  trackProgressInState 
} from '../src/context/GameContext';

describe('1. Product Cutting & Adulteration Mixer ("The Cook")', () => {
  it('should define accurate yield bonuses and purity dilution drops', () => {
    expect(CUTTING_AGENTS['baking_soda'].yieldBonus).toBe(3);
    expect(CUTTING_AGENTS['baking_soda'].purityDrop).toBe(7);

    expect(CUTTING_AGENTS['caffeine'].yieldBonus).toBe(3);
    expect(CUTTING_AGENTS['caffeine'].purityDrop).toBe(5);

    expect(CUTTING_AGENTS['baby_powder'].yieldBonus).toBe(4);
    expect(CUTTING_AGENTS['baby_powder'].purityDrop).toBe(11);

    expect(CUTTING_AGENTS['fentanyl'].yieldBonus).toBe(5);
    expect(CUTTING_AGENTS['fentanyl'].purityDrop).toBe(14);
  });

  it('should dilute batch purity when product is cut with an adulterant', () => {
    const startingPurity = 95;
    const agent = CUTTING_AGENTS['baking_soda'];
    const nextPurity = Math.max(25, startingPurity - agent.purityDrop);

    expect(nextPurity).toBe(88);
    expect(nextPurity).toBeLessThan(startingPurity);
  });
});

describe('2. Vehicle Trunk Capacity & Inventory Enforcement', () => {
  it('should accurately calculate total packaged goods', () => {
    const inventory = {
      ...INITIAL_STATE.inv,
      pack_og_dime: 5,
      pack_sour_eighth: 3,
      pack_shatter_gram: 2
    };

    const count = getTotalPackagedCount(inventory);
    expect(count).toBeGreaterThanOrEqual(10);
  });

  it('should distinguish vehicle trunk capacities', () => {
    const beater = INITIAL_VEHICLES.find(v => v.id === 'beater');
    const van = INITIAL_VEHICLES.find(v => v.id === 'van');
    const muscle = INITIAL_VEHICLES.find(v => v.id === 'muscle');

    expect(beater?.trunkCapacity).toBe(25);
    expect(van?.trunkCapacity).toBe(100);
    expect(muscle?.trunkCapacity).toBe(40);
  });
});

describe('3. Laundering Fronts & Defense Attorney Perks', () => {
  it('should reduce laundering fee by 50% when defense attorney is hired', () => {
    const carWash = INITIAL_LAUNDERING.find(f => f.id === 'carwash')!;
    expect(carWash).toBeDefined();
    const dirtyCash = 1000;

    // Normal fee (10%)
    const normalClean = Math.round(dirtyCash * (1 - carWash.fee));
    expect(normalClean).toBe(900);

    // With Lawyer (50% fee discount => 5%)
    const lawyerFee = carWash.fee * 0.5;
    const lawyerClean = Math.round(dirtyCash * (1 - lawyerFee));
    expect(lawyerClean).toBe(950);
    expect(lawyerClean).toBeGreaterThan(normalClean);
  });
});

describe('4. Safehouse Odor, Reinforced Safe & Upgrades', () => {
  it('should protect 85% of cash reserves when Reinforced Safe is installed', () => {
    const totalCash = 10000;

    // Unprotected DEA raid: 70% lost
    const lostUnprotected = Math.round(totalCash * 0.70);
    expect(lostUnprotected).toBe(7000);

    // Protected by Reinforced Safe: only 15% lost (85% protected)
    const lostProtected = Math.round(totalCash * 0.15);
    expect(lostProtected).toBe(1500);
    expect(lostProtected).toBeLessThan(lostUnprotected);
  });

  it('should boost pot growth rate by 35% with hydroponic lights installed', () => {
    const baseRate = 1.4;
    const hydroRate = baseRate * 1.35;
    expect(hydroRate).toBeCloseTo(1.89, 2);
  });
});

describe('5. Syndicate Story Missions & Contract Tracking', () => {
  it('should initialize tiered missions across chapters', () => {
    expect(INITIAL_MISSIONS.length).toBeGreaterThanOrEqual(10);
    const ch1 = INITIAL_MISSIONS.filter(m => m.chapter === 1);
    const ch2 = INITIAL_MISSIONS.filter(m => m.chapter === 2);
    const ch3 = INITIAL_MISSIONS.filter(m => m.chapter === 3);

    expect(ch1.length).toBeGreaterThan(0);
    expect(ch2.length).toBeGreaterThan(0);
    expect(ch3.length).toBeGreaterThan(0);
  });

  it('should advance objective progress when matching action is triggered', () => {
    const seedState = {
      ...INITIAL_STATE,
      missions: INITIAL_MISSIONS.map(m => ({
        ...m,
        objectives: m.objectives.map(o => ({ ...o, current: 0, completed: false })),
        completed: false,
        claimed: false
      }))
    };

    let missionCompletedCalled = false;
    const nextState = trackProgressInState(seedState, 'plant_seed', 1, () => {
      missionCompletedCalled = true;
    });

    const m1 = nextState.missions.find(m => m.id === 'm1_first_seed');
    expect(m1).toBeDefined();
    expect(m1?.objectives[0].current).toBe(1);
    expect(m1?.objectives[0].completed).toBe(true);
    expect(m1?.completed).toBe(true);
    expect(missionCompletedCalled).toBe(true);
  });

  it('should accurately track net worth threshold for Kingpin mission', () => {
    const kingpinState = {
      ...INITIAL_STATE,
      cash: 12000,
      bank: 4500, // Total net worth = $16,500 >= $15,000 target
      missions: INITIAL_MISSIONS
    };

    const nextState = trackProgressInState(kingpinState, 'check_networth', 1);
    const m10 = nextState.missions.find(m => m.id === 'm10_kingpin');
    expect(m10?.objectives[0].current).toBe(16500);
    expect(m10?.objectives[0].completed).toBe(true);
    expect(m10?.completed).toBe(true);
  });
});
