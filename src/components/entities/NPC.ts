import { Pedestrian } from '../../types/game';

const ROAD_XS = [80, 480, 880, 1280, 1680, 2080, 2480];
const ROAD_YS = [80, 380, 680, 980, 1280, 1580];
const SIDEWALK_OFFSET = 24;

export interface PedState extends Pedestrian {
  state?: 'PATROL_SIDEWALK' | 'IDLE_PAUSE' | 'DODGING_VEHICLE' | 'FLEEING_PANIC';
  targetNodeX?: number;
  targetNodeY?: number;
  sidewalkSideX?: number;
  sidewalkSideY?: number;
  pauseTimer?: number;
}

const NPC_NAMES = [
  'Dave', 'Sarah', 'Frank', 'Rachel', 'Mike', 'Alex', 'Tom', 'Lisa', 'Dan', 'Carl',
  'Arthur', 'Chloe', 'Leo', 'Jax', 'Elena', 'Victor', 'Mia', 'Ben', 'Marcus', 'Nina',
  'Trey', 'Vinnie', 'Rico', 'Sasha', 'Diego', 'Tara', 'Hector', 'Zoe', 'Malik', 'Jade',
  'Dante', 'Kira', 'Omar', 'Ruby', 'Shane', 'Lola', 'Caleb', 'Tessa', 'Roman', 'Maya',
  'Gabe', 'Ivy', 'Knox', 'Cleo', 'Zane', 'Nora', 'Enzo', 'Vera', 'Cruz', 'Luna'
];

const NPC_AVATARS = ['🚶‍♂️', '🚶‍♀️', '👨‍💼', '👩‍💼', '👷‍♂️', '🧑‍🏭', '🕵️‍♂️', '💃', '🕺', '🏃‍♂️'];
const NPC_COLORS = ['#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c', '#4ade80', '#94a3b8', '#ec4899', '#a855f7', '#eab308'];
const IDLE_THOUGHTS = [
  'Checking messages...',
  'Waiting for a ride...',
  'Looking at shop window...',
  'Enjoying the breeze...',
  'Checking street map...',
  'Taking a quick breather...'
];

// Generate 50 Realistic Street NPCs with slow, natural human walking speeds (0.22 - 0.30)
export const INITIAL_PEDESTRIANS: Pedestrian[] = Array.from({ length: 50 }, (_, i) => {
  const rxIdx = i % ROAD_XS.length;
  const ryIdx = Math.floor(i / ROAD_XS.length) % ROAD_YS.length;
  const sideOffset = (i % 2 === 0 ? 1 : -1) * SIDEWALK_OFFSET;
  const alongOffset = ((i * 73) % 240) - 120;

  const baseX = Math.max(70, Math.min(2520, ROAD_XS[rxIdx] + alongOffset));
  const baseY = Math.max(56, Math.min(1620, ROAD_YS[ryIdx] + sideOffset));
  const dir = i % 2 === 0 ? 1 : -1;
  // Slow, realistic human stroll speed (roughly 1/3rd of previous fast speed)
  const spd = 0.22 + (i % 5) * 0.018;

  return {
    id: i + 1,
    x: baseX,
    y: baseY,
    vx: dir * spd,
    vy: 0,
    angle: dir > 0 ? 0 : Math.PI,
    speed: spd,
    avatar: NPC_AVATARS[i % NPC_AVATARS.length],
    color: NPC_COLORS[i % NPC_COLORS.length],
    name: NPC_NAMES[i % NPC_NAMES.length],
    walkTimer: 120 + (i * 17) % 140
  };
});

export class NPCManager {
  private peds: PedState[];
  private worldWidth: number;
  private worldHeight: number;

  constructor(worldWidth = 2600, worldHeight = 1700) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.peds = INITIAL_PEDESTRIANS.map((p, idx) => {
      const nearestRx = ROAD_XS.reduce((prev, curr) => Math.abs(curr - p.x) < Math.abs(prev - p.x) ? curr : prev, ROAD_XS[0]);
      const nearestRy = ROAD_YS.reduce((prev, curr) => Math.abs(curr - p.y) < Math.abs(prev - p.y) ? curr : prev, ROAD_YS[0]);
      const sideY = idx % 2 === 0 ? SIDEWALK_OFFSET : -SIDEWALK_OFFSET;
      const sideX = idx % 2 === 0 ? SIDEWALK_OFFSET : -SIDEWALK_OFFSET;
      return {
        ...p,
        state: 'PATROL_SIDEWALK',
        sidewalkSideX: sideX,
        sidewalkSideY: sideY,
        targetNodeX: nearestRx + sideX,
        targetNodeY: nearestRy + sideY,
        pauseTimer: 0
      };
    });
  }

  public getPedestrians(): Pedestrian[] {
    return this.peds;
  }

  private pickNextSidewalkWaypoint(ped: PedState) {
    let ix = 0;
    let minDx = Infinity;
    ROAD_XS.forEach((rx, i) => {
      const d = Math.abs(ped.x - rx);
      if (d < minDx) { minDx = d; ix = i; }
    });

    let iy = 0;
    let minDy = Infinity;
    ROAD_YS.forEach((ry, i) => {
      const d = Math.abs(ped.y - ry);
      if (d < minDy) { minDy = d; iy = i; }
    });

    const neighbors: { nx: number; ny: number }[] = [];
    if (ix > 0) neighbors.push({ nx: ix - 1, ny: iy });
    if (ix < ROAD_XS.length - 1) neighbors.push({ nx: ix + 1, ny: iy });
    if (iy > 0) neighbors.push({ nx: ix, ny: iy - 1 });
    if (iy < ROAD_YS.length - 1) neighbors.push({ nx: ix, ny: iy + 1 });

    const chosen = neighbors[Math.floor(Math.random() * neighbors.length)] || { nx: ix, ny: iy };
    const sideX = ped.sidewalkSideX || SIDEWALK_OFFSET;
    const sideY = ped.sidewalkSideY || SIDEWALK_OFFSET;

    ped.targetNodeX = ROAD_XS[chosen.nx] + sideX;
    ped.targetNodeY = ROAD_YS[chosen.ny] + sideY;
  }

  public update(playerPos: { x: number; y: number; speed: number; isOnFoot: boolean; isChasing?: boolean }) {
    this.peds.forEach((ped, idx) => {
      const dxToPlayer = playerPos.x - ped.x;
      const dyToPlayer = playerPos.y - ped.y;
      const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer);

      if (!playerPos.isOnFoot && distToPlayer < 40 && Math.abs(playerPos.speed) > 1.1) {
        ped.state = 'DODGING_VEHICLE';
        ped.walkTimer = 40;
        ped.talkText = "Watch where you're driving!";
        ped.talkTimer = 55;
      } else if (playerPos.isChasing && distToPlayer < 260) {
        ped.state = 'FLEEING_PANIC';
        ped.fleeing = true;
        if (!ped.talkTimer || ped.talkTimer <= 0) {
          ped.talkText = "Police sirens! Get back!";
          ped.talkTimer = 45;
        }
      } else if (ped.state === 'DODGING_VEHICLE' || ped.state === 'FLEEING_PANIC') {
        if (ped.walkTimer <= 0) {
          ped.state = 'PATROL_SIDEWALK';
          ped.fleeing = false;
          this.pickNextSidewalkWaypoint(ped);
        }
      }

      if (ped.state === 'DODGING_VEHICLE') {
        ped.walkTimer -= 1;
        const awayAngle = Math.atan2(ped.y - playerPos.y, ped.x - playerPos.x);
        ped.vx = Math.cos(awayAngle) * (ped.speed * 1.65);
        ped.vy = Math.sin(awayAngle) * (ped.speed * 1.65);
        ped.angle = awayAngle;
      } else if (ped.state === 'FLEEING_PANIC') {
        ped.walkTimer -= 1;
        const fleeAngle = Math.atan2(ped.y - playerPos.y, ped.x - playerPos.x);
        ped.vx = Math.cos(fleeAngle) * (ped.speed * 1.5);
        ped.vy = Math.sin(fleeAngle) * (ped.speed * 1.5);
        ped.angle = fleeAngle;
        if (distToPlayer > 300) {
          ped.state = 'PATROL_SIDEWALK';
          ped.fleeing = false;
          this.pickNextSidewalkWaypoint(ped);
        }
      } else if (ped.state === 'IDLE_PAUSE') {
        // Realistic human idle pause: standing on sidewalk looking around or checking phone
        ped.vx = 0;
        ped.vy = 0;
        ped.pauseTimer = (ped.pauseTimer || 0) - 1;
        if ((ped.pauseTimer || 0) <= 0) {
          ped.state = 'PATROL_SIDEWALK';
          ped.walkTimer = 180 + Math.floor(Math.random() * 180);
        }
      } else {
        // Natural sidewalk stroll with occasional realistic pauses
        ped.walkTimer -= 1;
        if (ped.walkTimer <= 0 && Math.random() < 0.35) {
          ped.state = 'IDLE_PAUSE';
          ped.pauseTimer = 90 + Math.floor(Math.random() * 110);
          ped.talkText = IDLE_THOUGHTS[idx % IDLE_THOUGHTS.length];
          ped.talkTimer = 70;
          ped.vx = 0;
          ped.vy = 0;
          return;
        }

        const tx = ped.targetNodeX ?? ped.x + 100;
        const ty = ped.targetNodeY ?? ped.y;
        const ndx = tx - ped.x;
        const ndy = ty - ped.y;
        const distToNode = Math.hypot(ndx, ndy);

        if (distToNode < 8) {
          this.pickNextSidewalkWaypoint(ped);
          if (Math.random() < 0.25) {
            ped.state = 'IDLE_PAUSE';
            ped.pauseTimer = 75 + Math.floor(Math.random() * 90);
            ped.vx = 0;
            ped.vy = 0;
            return;
          }
        } else {
          const desiredAngle = Math.atan2(ndy, ndx);
          // Smooth human turning interpolation instead of instant snapping
          let delta = desiredAngle - ped.angle;
          while (delta > Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          ped.angle += delta * 0.14;

          ped.vx = Math.cos(ped.angle) * ped.speed;
          ped.vy = Math.sin(ped.angle) * ped.speed;
        }
      }

      ped.x += ped.vx;
      ped.y += ped.vy;

      if (ped.x < 55) { ped.x = 55; this.pickNextSidewalkWaypoint(ped); }
      if (ped.x > this.worldWidth - 55) { ped.x = this.worldWidth - 55; this.pickNextSidewalkWaypoint(ped); }
      if (ped.y < 55) { ped.y = 55; this.pickNextSidewalkWaypoint(ped); }
      if (ped.y > this.worldHeight - 55) { ped.y = this.worldHeight - 55; this.pickNextSidewalkWaypoint(ped); }

      if (ped.talkTimer && ped.talkTimer > 0) {
        ped.talkTimer -= 1;
      }
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.peds.forEach(ped => {
      ctx.font = '16px sans-serif';
      ctx.fillText(ped.avatar, ped.x - 8, ped.y + 6);

      if (ped.talkText && ped.talkTimer && ped.talkTimer > 0) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(ped.talkText, ped.x - 18, ped.y - 12);
      }
    });
  }
}
