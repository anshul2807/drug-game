import * as THREE from 'three';

export interface PBRMaterialMaps {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

// Helper: Convert a grayscale height canvas into a Tangent-Space Normal Map (#8080ff base)
function heightCanvasToNormalTexture(
  heightCanvas: HTMLCanvasElement,
  strength: number,
  repeatX: number,
  repeatY: number
): THREE.CanvasTexture {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const ctx = heightCanvas.getContext('2d')!;
  const src = ctx.getImageData(0, 0, w, h).data;

  const normCanvas = document.createElement('canvas');
  normCanvas.width = w;
  normCanvas.height = h;
  const nCtx = normCanvas.getContext('2d')!;
  const dstImg = nCtx.createImageData(w, h);
  const dst = dstImg.data;

  const sample = (x: number, y: number) => {
    const wx = (x + w) % w;
    const wy = (y + h) % h;
    return src[(wy * w + wx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      const dX = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dY = (bl + 2 * b + br) - (tl + 2 * t + tr);

      let nx = -dX * strength;
      let ny = -dY * strength;
      let nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;

      const idx = (y * w + x) * 4;
      dst[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      dst[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      dst[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      dst[idx + 3] = 255;
    }
  }

  nCtx.putImageData(dstImg, 0, 0);
  const tex = new THREE.CanvasTexture(normCanvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

// ============================================================================
// 2A. WET ASPHALT WITH PUDDLES & OIL SHEEN (Schedule I Street Look)
// ============================================================================
let cachedAsphaltPBR: PBRMaterialMaps | null = null;
export function getWetAsphaltPBR(repeatX = 36, repeatY = 24): PBRMaterialMaps {
  if (cachedAsphaltPBR) return cachedAsphaltPBR;

  const size = 256;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  // Base dark bitumen
  aCtx.fillStyle = '#181e29';
  aCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#787878'; // ~0.47 base roughness
  rCtx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#808080';
  hCtx.fillRect(0, 0, size, size);

  // Embedded gravel & grit noise
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 4200; i++) {
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    const v = Math.floor(18 + rand() * 34);
    aCtx.fillStyle = `rgb(${v},${v + 4},${v + 10})`;
    aCtx.fillRect(x, y, 2, 2);

    const hv = Math.floor(100 + rand() * 110);
    hCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
    hCtx.fillRect(x, y, 2, 2);
  }

  // Shallow water puddles (dark slick albedo + very low roughness for mirror-like specular sheen)
  const puddles = [
    { x: 64, y: 72, rx: 42, ry: 28 },
    { x: 185, y: 160, rx: 48, ry: 34 },
    { x: 110, y: 210, rx: 32, ry: 22 }
  ];

  puddles.forEach(p => {
    const gradA = aCtx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.rx);
    gradA.addColorStop(0, 'rgba(10, 15, 26, 0.85)');
    gradA.addColorStop(0.65, 'rgba(20, 32, 52, 0.55)');
    gradA.addColorStop(0.85, 'rgba(56, 189, 248, 0.12)'); // subtle oil-sheen rim
    gradA.addColorStop(1, 'rgba(24, 30, 41, 0)');
    aCtx.fillStyle = gradA;
    aCtx.beginPath();
    aCtx.ellipse(p.x, p.y, p.rx, p.ry, 0.3, 0, Math.PI * 2);
    aCtx.fill();

    // Puddle roughness = near 0.08 (dark in roughnessMap = glossy wet water!)
    const gradR = rCtx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.rx);
    gradR.addColorStop(0, 'rgba(18, 18, 18, 0.95)');
    gradR.addColorStop(0.75, 'rgba(35, 35, 35, 0.75)');
    gradR.addColorStop(1, 'rgba(120, 120, 120, 0)');
    rCtx.fillStyle = gradR;
    rCtx.beginPath();
    rCtx.ellipse(p.x, p.y, p.rx, p.ry, 0.3, 0, Math.PI * 2);
    rCtx.fill();

    // Puddle is flat in height map
    hCtx.fillStyle = 'rgba(128, 128, 128, 0.9)';
    hCtx.beginPath();
    hCtx.ellipse(p.x, p.y, p.rx * 0.85, p.ry * 0.85, 0.3, 0, Math.PI * 2);
    hCtx.fill();
  });

  // Cracked bitumen lines
  aCtx.strokeStyle = '#090d14';
  aCtx.lineWidth = 1.5;
  hCtx.strokeStyle = '#202020';
  hCtx.lineWidth = 2.0;

  for (let c = 0; c < 6; c++) {
    let cx = rand() * size;
    let cy = rand() * size;
    aCtx.beginPath();
    hCtx.beginPath();
    aCtx.moveTo(cx, cy);
    hCtx.moveTo(cx, cy);
    for (let s = 0; s < 8; s++) {
      cx += (rand() - 0.5) * 36;
      cy += (rand() - 0.5) * 36;
      aCtx.lineTo(cx, cy);
      hCtx.lineTo(cx, cy);
    }
    aCtx.stroke();
    hCtx.stroke();
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);

  const normalMap = heightCanvasToNormalTexture(heightCanvas, 2.4, repeatX, repeatY);

  cachedAsphaltPBR = { map, normalMap, roughnessMap };
  return cachedAsphaltPBR;
}

// ============================================================================
// 2B. DINGY MOTEL / INDUSTRIAL PEELING PLASTER WALLS
// ============================================================================
export function createPlasterWallPBR(baseHex: number, repeatX = 6, repeatY = 2): PBRMaterialMaps {
  const size = 256;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  const baseColor = new THREE.Color(baseHex);
  const rBase = Math.round(baseColor.r * 255);
  const gBase = Math.round(baseColor.g * 255);
  const bBase = Math.round(baseColor.b * 255);

  aCtx.fillStyle = `rgb(${rBase},${gBase},${bBase})`;
  aCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#c8c8c8';
  rCtx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#808080';
  hCtx.fillRect(0, 0, size, size);

  // Subtle cigarette smoke & water leak stain gradient along top and bottom
  const leakGrad = aCtx.createLinearGradient(0, 0, 0, size);
  leakGrad.addColorStop(0, 'rgba(30, 22, 12, 0.42)');
  leakGrad.addColorStop(0.22, 'rgba(40, 30, 15, 0.08)');
  leakGrad.addColorStop(0.82, 'rgba(20, 20, 20, 0.06)');
  leakGrad.addColorStop(1, 'rgba(15, 12, 8, 0.48)');
  aCtx.fillStyle = leakGrad;
  aCtx.fillRect(0, 0, size, size);

  // Tactile plaster grain & peeling patches
  let seed = 4201;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 2400; i++) {
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    const delta = Math.floor((rand() - 0.5) * 26);
    aCtx.fillStyle = `rgb(${Math.max(0, Math.min(255, rBase + delta))},${Math.max(0, Math.min(255, gBase + delta))},${Math.max(0, Math.min(255, bBase + delta))})`;
    aCtx.fillRect(x, y, 3, 3);

    const hv = Math.floor(110 + rand() * 45);
    hCtx.fillStyle = `rgb(${hv},${hv},${hv})`;
    hCtx.fillRect(x, y, 3, 3);
  }

  // Fine plaster cracks
  aCtx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
  aCtx.lineWidth = 1;
  hCtx.strokeStyle = '#383838';
  hCtx.lineWidth = 1.5;
  for (let c = 0; c < 5; c++) {
    let cx = rand() * size;
    let cy = rand() * size;
    aCtx.beginPath();
    hCtx.beginPath();
    aCtx.moveTo(cx, cy);
    hCtx.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      cx += (rand() - 0.5) * 28;
      cy += rand() * 28;
      aCtx.lineTo(cx, cy);
      hCtx.lineTo(cx, cy);
    }
    aCtx.stroke();
    hCtx.stroke();
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);

  const normalMap = heightCanvasToNormalTexture(heightCanvas, 1.8, repeatX, repeatY);
  return { map, normalMap, roughnessMap };
}

// ============================================================================
// 2C. REFLECTIVE DIAMOND-EMBOSSED SILVER MYLAR FOIL (Grow Room Backdrop)
// ============================================================================
let cachedMylarPBR: PBRMaterialMaps | null = null;
export function getMylarFoilPBR(repeatX = 4, repeatY = 2): PBRMaterialMaps {
  if (cachedMylarPBR) return cachedMylarPBR;

  const size = 128;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  aCtx.fillStyle = '#d8dee9';
  aCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#383838'; // low roughness for high specular metallic reflection
  rCtx.fillRect(0, 0, size, size);

  hCtx.fillStyle = '#909090';
  hCtx.fillRect(0, 0, size, size);

  // Diamond-embossed grid pattern + crinkle highlights
  const step = 16;
  aCtx.strokeStyle = '#94a3b8';
  aCtx.lineWidth = 1.2;
  hCtx.strokeStyle = '#ffffff';
  hCtx.lineWidth = 2;

  for (let i = -size; i < size * 2; i += step) {
    aCtx.beginPath();
    aCtx.moveTo(i, 0);
    aCtx.lineTo(i + size, size);
    aCtx.moveTo(i + size, 0);
    aCtx.lineTo(i, size);
    aCtx.stroke();

    hCtx.beginPath();
    hCtx.moveTo(i, 0);
    hCtx.lineTo(i + size, size);
    hCtx.moveTo(i + size, 0);
    hCtx.lineTo(i, size);
    hCtx.stroke();
  }

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);

  const normalMap = heightCanvasToNormalTexture(heightCanvas, 3.0, repeatX, repeatY);
  cachedMylarPBR = { map, normalMap, roughnessMap };
  return cachedMylarPBR;
}

// ============================================================================
// LCD DIGITAL READOUT TEXTURE GENERATOR ("185.4°C" & "0.00g")
// ============================================================================
export function createDigitalReadoutTexture(
  text: string,
  bgColor = '#042f2e',
  textColor = '#34d399'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 96);

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 88);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 50);

  return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// 1A. CHEMISTRY LAB FRACTIONAL DISTILLATION GLASSWARE RIG
//     (Erlenmeyer Flask, Liebig Condenser, Heating Mantle, "185.4°C" LCD,
//      Clamp Stand, Stainless Steel Rods, Borosilicate Glass + Amber Residue)
// ============================================================================
export function buildFractionalDistillationRig(): THREE.Group {
  const rig = new THREE.Group();

  // PBR Materials
  const borosilicateGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.9,
    opacity: 1.0,
    transparent: true,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.5,
    reflectivity: 0.9
  });

  const amberResidueMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xb45309,
    emissiveIntensity: 0.35,
    roughness: 0.15,
    metalness: 0.05,
    transparent: true,
    opacity: 0.88
  });

  const distillateMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9
  });

  const stainlessSteelMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.22
  });

  const castIronMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.75,
    roughness: 0.42
  });

  const rubberTubeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.05
  });

  // 1. Heavy Lab Workbench Table with Chemical-Resistant Top
  const benchTop = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.16, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32, metalness: 0.25 })
  );
  benchTop.position.set(0, 1.02, 0);
  benchTop.castShadow = true;
  benchTop.receiveShadow = true;
  rig.add(benchTop);

  const benchBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.1, 0.94, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.5 })
  );
  benchBase.position.set(0, 0.47, 0);
  benchBase.castShadow = true;
  benchBase.receiveShadow = true;
  rig.add(benchBase);

  // 2. Heating Mantle Base + Digital Temperature Readout Display ("185.4°C")
  const mantleBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.28, 0.95), castIronMat);
  mantleBase.position.set(-1.15, 1.24, 0);
  mantleBase.castShadow = true;
  rig.add(mantleBase);

  const mantleCradle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.46, 0.16, 20),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 })
  );
  mantleCradle.position.set(-1.15, 1.44, 0);
  rig.add(mantleCradle);

  // Glowing Heating Element Ring inside Cradle
  const heaterGlow = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.035, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0xf97316 })
  );
  heaterGlow.rotation.x = Math.PI / 2;
  heaterGlow.position.set(-1.15, 1.52, 0);
  rig.add(heaterGlow);

  // Digital Temperature Readout Screen on Front of Heating Mantle
  const tempReadoutTex = createDigitalReadoutTexture('185.4°C', '#022c22', '#34d399');
  const tempDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.18),
    new THREE.MeshBasicMaterial({ map: tempReadoutTex })
  );
  tempDisplay.position.set(-1.15, 1.24, 0.48);
  rig.add(tempDisplay);

  // Rotary Control Dials next to LCD
  [-0.36, 0.36].forEach(dx => {
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 12), stainlessSteelMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(-1.15 + dx, 1.24, 0.49);
    rig.add(dial);
  });

  // 3. Conical Erlenmeyer Boiling Flask + Amber Liquid Residue Inside
  const erlenmeyerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.42, 0.62, 24),
    borosilicateGlassMat
  );
  erlenmeyerBody.position.set(-1.15, 1.82, 0);
  rig.add(erlenmeyerBody);

  // Amber chemical liquid & grime residue inside Erlenmeyer flask
  const amberLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.39, 0.28, 20),
    amberResidueMat
  );
  amberLiquid.position.set(-1.15, 1.66, 0);
  rig.add(amberLiquid);

  // Erlenmeyer Cylindrical Glass Neck & Rim Lip
  const erlenmeyerNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.42, 20),
    borosilicateGlassMat
  );
  erlenmeyerNeck.position.set(-1.15, 2.32, 0);
  rig.add(erlenmeyerNeck);

  const flaskLip = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.022, 10, 20),
    borosilicateGlassMat
  );
  flaskLip.rotation.x = Math.PI / 2;
  flaskLip.position.set(-1.15, 2.52, 0);
  rig.add(flaskLip);

  // Fractional Vigreux Column rising from Erlenmeyer Neck
  const vigreuxCol = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.095, 0.65, 16),
    borosilicateGlassMat
  );
  vigreuxCol.position.set(-1.15, 2.82, 0);
  rig.add(vigreuxCol);

  // 4. Angled Liebig Water-Jacketed Condenser Tube bridging to Receiving Flask
  const condenserGroup = new THREE.Group();
  condenserGroup.position.set(-0.35, 2.68, 0);
  condenserGroup.rotation.z = -0.46; // angled downward toward receiving flask

  // Outer cooling jacket
  const outerJacket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 1.55, 18),
    borosilicateGlassMat
  );
  outerJacket.rotation.z = Math.PI / 2;
  condenserGroup.add(outerJacket);

  // Inner vapor condensation tube
  const innerVaporTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 1.85, 14),
    distillateMat
  );
  innerVaporTube.rotation.z = Math.PI / 2;
  condenserGroup.add(innerVaporTube);

  // Coolant water ports on Liebig condenser + rubber hoses
  [-0.5, 0.5].forEach(px => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 10), borosilicateGlassMat);
    nozzle.position.set(px, -0.14, 0);
    condenserGroup.add(nozzle);

    const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.95, 8), rubberTubeMat);
    hose.position.set(px, -0.62, 0.08);
    hose.rotation.x = 0.2;
    condenserGroup.add(hose);
  });

  rig.add(condenserGroup);

  // 5. Receiving Round-Bottom Flask on Right + Distilled Blue-Ice / Emerald Product
  const receivingFlask = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 22, 18),
    borosilicateGlassMat
  );
  receivingFlask.position.set(0.48, 1.52, 0);
  rig.add(receivingFlask);

  const receivingNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.45, 16),
    borosilicateGlassMat
  );
  receivingNeck.position.set(0.48, 1.98, 0);
  rig.add(receivingNeck);

  const distilledLiquid = new THREE.Mesh(
    new THREE.SphereGeometry(0.31, 18, 14, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
    distillateMat
  );
  distilledLiquid.position.set(0.48, 1.50, 0);
  rig.add(distilledLiquid);

  // Cork ring stand under Round-Bottom Receiving Flask (no floating parts!)
  const corkRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.055, 10, 20),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, metalness: 0.05 })
  );
  corkRing.rotation.x = Math.PI / 2;
  corkRing.position.set(0.48, 1.15, 0);
  rig.add(corkRing);

  // 6. Stainless Steel Retort Clamp Stands & Bosshead Clamps Holding All Glassware
  [-1.15, 0.05].forEach((standX, idx) => {
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.65), castIronMat);
    standBase.position.set(standX, 1.13, -0.45);
    rig.add(standBase);

    const verticalRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 2.15, 12),
      stainlessSteelMat
    );
    verticalRod.position.set(standX, 2.2, -0.45);
    rig.add(verticalRod);

    // Bosshead clamp & horizontal arm reaching forward to grip the glassware
    const clampY = idx === 0 ? 2.45 : 2.52;
    const bosshead = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.14), castIronMat);
    bosshead.position.set(standX, clampY, -0.45);
    rig.add(bosshead);

    const clampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.45, 10),
      stainlessSteelMat
    );
    clampArm.rotation.x = Math.PI / 2;
    clampArm.position.set(standX, clampY, -0.22);
    rig.add(clampArm);

    const clawRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.018, 8, 16),
      stainlessSteelMat
    );
    clawRing.rotation.x = Math.PI / 2;
    clawRing.position.set(standX, clampY, 0);
    rig.add(clawRing);
  });

  // Secondary Reagent Bottle with Amber Precursor on Right Side of Lab Bench
  const reagentBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.62, 18),
    amberResidueMat
  );
  reagentBottle.position.set(1.65, 1.41, -0.2);
  rig.add(reagentBottle);

  const bottleCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.14, 12),
    castIronMat
  );
  bottleCap.position.set(1.65, 1.78, -0.2);
  rig.add(bottleCap);

  return rig;
}

// ============================================================================
// 1B. HYDROPONIC GROW BUCKET + MATURE BUSHY CANNABIS PLANT WITH TRICHOMES & PISTILS
// ============================================================================
export function buildHydroponicGrowBucket(): {
  bucketGroup: THREE.Group;
  plantGroup: THREE.Group;
  budMeshes: THREE.Mesh[];
} {
  const bucketGroup = new THREE.Group();

  // Matte black heavy-duty plastic reservoir bucket
  const blackPlasticMat = new THREE.MeshStandardMaterial({
    color: 0x14171f,
    roughness: 0.62,
    metalness: 0.15
  });

  const bucketBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.46, 0.88, 18),
    blackPlasticMat
  );
  bucketBody.position.y = 0.44;
  bucketBody.castShadow = true;
  bucketBody.receiveShadow = true;
  bucketGroup.add(bucketBody);

  // Heavy-duty molded top lid & rim rib
  const bucketRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.045, 10, 20),
    blackPlasticMat
  );
  bucketRim.rotation.x = Math.PI / 2;
  bucketRim.position.y = 0.86;
  bucketGroup.add(bucketRim);

  // Hydroton expanded clay pebbles medium inside net pot
  const clayMat = new THREE.MeshStandardMaterial({
    color: 0x5c2d16,
    roughness: 0.9,
    metalness: 0.02
  });
  const clayBed = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 16), clayMat);
  clayBed.position.y = 0.86;
  bucketGroup.add(clayBed);

  // Visible White Nutrient Irrigation Tube + Dripper Manifold
  const whiteTubeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.1
  });

  const feedPipeVert = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.78, 10), whiteTubeMat);
  feedPipeVert.position.set(0.58, 0.52, 0);
  bucketGroup.add(feedPipeVert);

  const feedPipeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.48, 10), whiteTubeMat);
  feedPipeTop.rotation.z = Math.PI / 2;
  feedPipeTop.position.set(0.35, 0.92, 0);
  bucketGroup.add(feedPipeTop);

  const dripRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 8, 16), whiteTubeMat);
  dripRing.rotation.x = Math.PI / 2;
  dripRing.position.y = 0.91;
  bucketGroup.add(dripRing);

  // Mature Bushy Cannabis Plant Group (Scales & animates with pot growth)
  const plantGroup = new THREE.Group();
  plantGroup.position.y = 0.88;

  // Woody central stalk
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.8 });
  const mainStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, 1.15, 10), stalkMat);
  mainStalk.position.y = 0.55;
  plantGroup.add(mainStalk);

  // Bushy Fan Leaf Clusters (layered serrated canopy)
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.55,
    metalness: 0.08
  });

  const leafAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
  leafAngles.forEach((ang, idx) => {
    const leafBlade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.72, 5), leafMat);
    const tierY = 0.38 + (idx % 2) * 0.28;
    leafBlade.position.set(Math.cos(ang) * 0.34, tierY, Math.sin(ang) * 0.34);
    leafBlade.rotation.z = -Math.cos(ang) * 0.95;
    leafBlade.rotation.x = Math.sin(ang) * 0.95;
    plantGroup.add(leafBlade);
  });

  // Heavy Resinous Frosty Trichome-Coated Flowering Buds (Central Cola + 4 Side Colas)
  const budMeshes: THREE.Mesh[] = [];
  const budMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.32,
    metalness: 0.25
  });

  const colaPositions: [number, number, number, number][] = [
    [0, 1.18, 0, 1.0],        // Main central apical cola
    [0.26, 0.82, 0.22, 0.72], // Side cola 1
    [-0.26, 0.85, 0.22, 0.72],// Side cola 2
    [0.24, 0.80, -0.24, 0.7], // Side cola 3
    [-0.24, 0.84, -0.24, 0.7] // Side cola 4
  ];

  const pistilMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Vibrant orange pistils

  colaPositions.forEach(([bx, by, bz, s]) => {
    const cola = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24 * s, 1), budMat.clone());
    cola.scale.set(1, 1.65, 1);
    cola.position.set(bx, by, bz);
    plantGroup.add(cola);
    budMeshes.push(cola);

    // Orange Pistil Hairs & Frosty Trichome Tips on each bud
    for (let p = 0; p < 4; p++) {
      const pAng = (p * Math.PI) / 2;
      const pistil = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14 * s, 0.03), pistilMat);
      pistil.position.set(
        bx + Math.cos(pAng) * 0.16 * s,
        by + 0.12 * s,
        bz + Math.sin(pAng) * 0.16 * s
      );
      pistil.rotation.z = Math.cos(pAng) * 0.4;
      plantGroup.add(pistil);
    }
  });

  bucketGroup.add(plantGroup);
  return { bucketGroup, plantGroup, budMeshes };
}

// ============================================================================
// 1C. HEAVY-DUTY REINFORCED STEEL SAFE VAULT + DIGITAL POCKET SCALE & BAGGIES
// ============================================================================
export function buildReinforcedSteelSafeVault(): THREE.Group {
  const safeGroup = new THREE.Group();

  const gunmetalSteelMat = new THREE.MeshStandardMaterial({
    color: 0x27303f,
    metalness: 0.85,
    roughness: 0.25
  });

  const darkTrimSteelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.88,
    roughness: 0.32
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15
  });

  // Main reinforced armor body
  const vaultBody = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.65, 1.85), gunmetalSteelMat);
  vaultBody.position.y = 1.325;
  vaultBody.castShadow = true;
  vaultBody.receiveShadow = true;
  safeGroup.add(vaultBody);

  // Thick recessed front steel vault door
  const vaultDoor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.35, 1.55), darkTrimSteelMat);
  vaultDoor.position.set(0.92, 1.325, 0);
  safeGroup.add(vaultDoor);

  // Heavy external cylindrical door hinges on right edge
  [0.65, 2.0].forEach(hy => {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 12), chromeMat);
    hinge.position.set(0.96, hy, 0.78);
    safeGroup.add(hinge);
  });

  // Thick Circular Combination Dial with Chrome Spokes
  const dialRing = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.30, 0.12, 24), chromeMat);
  dialRing.rotation.z = Math.PI / 2;
  dialRing.position.set(1.02, 1.48, -0.18);
  safeGroup.add(dialRing);

  const dialCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 20), darkTrimSteelMat);
  dialCenter.rotation.z = Math.PI / 2;
  dialCenter.position.set(1.04, 1.48, -0.18);
  safeGroup.add(dialCenter);

  // 3 Spoke levers on the vault wheel
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.68, 0.04), chromeMat);
    spoke.rotation.x = (i * Math.PI) / 3;
    spoke.position.set(1.05, 1.48, -0.18);
    safeGroup.add(spoke);
  }

  // Electronic Keypad & Status LEDs next to Combination Dial
  const keypadBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.32), gunmetalSteelMat);
  keypadBody.position.set(1.01, 1.55, 0.36);
  safeGroup.add(keypadBody);

  const ledGreen = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  ledGreen.position.set(1.06, 1.71, 0.30);
  safeGroup.add(ledGreen);

  const ledAmber = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  );
  ledAmber.position.set(1.06, 1.71, 0.42);
  safeGroup.add(ledAmber);

  return safeGroup;
}

export function buildDigitalScaleAndBaggiesProp(): THREE.Group {
  const propGroup = new THREE.Group();

  // 1. Digital Micro-Gram Pocket Scale
  const scaleCasing = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.12, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.3 })
  );
  scaleCasing.position.set(-0.85, 0.06, 0);
  propGroup.add(scaleCasing);

  // Brushed Stainless Steel Weighing Platform
  const weighingPan = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.03, 0.58),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 })
  );
  weighingPan.position.set(-0.98, 0.135, 0);
  propGroup.add(weighingPan);

  // Blue Backlit LCD Display showing "0.00g"
  const lcdTex = createDigitalReadoutTexture('0.00g', '#082f49', '#38bdf8');
  const lcdScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.48),
    new THREE.MeshBasicMaterial({ map: lcdTex })
  );
  lcdScreen.rotation.x = -Math.PI / 2;
  lcdScreen.rotation.z = -Math.PI / 2;
  lcdScreen.position.set(-0.52, 0.125, 0);
  propGroup.add(lcdScreen);

  // Transparent Protective Plastic Lid Folded Back
  const clearLidMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.88,
    opacity: 1.0,
    transparent: true,
    roughness: 0.08,
    ior: 1.48
  });
  const foldedLid = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.025, 0.68), clearLidMat);
  foldedLid.position.set(-0.85, 0.36, -0.52);
  foldedLid.rotation.x = 1.05; // hinged open backward
  propGroup.add(foldedLid);

  // Raw frosty bud nugget being weighed on the stainless steel platform
  const sampleNug = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.11, 1),
    new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35 })
  );
  sampleNug.position.set(-0.98, 0.22, 0);
  propGroup.add(sampleNug);

  // 2. Open Cardboard Dispenser Box of Clear Zipper Dime Baggies
  const cardboardMat = new THREE.MeshStandardMaterial({
    color: 0xa16207,
    roughness: 0.85,
    metalness: 0.02
  });
  const baggieBox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 0.72), cardboardMat);
  baggieBox.position.set(0.45, 0.19, -0.1);
  propGroup.add(baggieBox);

  // Open cardboard flap folded back
  const boxFlap = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.03, 0.45), cardboardMat);
  boxFlap.position.set(0.45, 0.48, -0.52);
  boxFlap.rotation.x = 0.85;
  propGroup.add(boxFlap);

  // Translucent Zipper Dime Baggies fanned out inside box & on bench
  for (let b = 0; b < 4; b++) {
    const baggie = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.42), clearLidMat);
    baggie.position.set(0.25 + b * 0.22, 0.4 + b * 0.01, -0.05 + (b % 2) * 0.18);
    baggie.rotation.y = (b - 1.5) * 0.18;
    propGroup.add(baggie);

    // Red zipper seal line at top of each dime baggie
    const redZip = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.024, 0.025),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    redZip.position.set(0.25 + b * 0.22, 0.405 + b * 0.01, -0.22 + (b % 2) * 0.18);
    redZip.rotation.y = (b - 1.5) * 0.18;
    propGroup.add(redZip);
  }

  return propGroup;
}

// Helper: Police Door Decal Texture ("POLICE • 911 • TO PROTECT & SERVE" + Gold Shield)
let cachedPoliceDoorTex: THREE.CanvasTexture | null = null;
function getPoliceDoorTexture(): THREE.CanvasTexture {
  if (cachedPoliceDoorTex) return cachedPoliceDoorTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 128);

  // Blue stripe across lower door
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(0, 96, 256, 14);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 112, 256, 6);

  // Gold shield emblem on left
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(46, 52, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 3;
  ctx.stroke();

  // "POLICE" bold stencil text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('POLICE', 82, 56);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('HYLAND PD • 911', 84, 80);

  cachedPoliceDoorTex = new THREE.CanvasTexture(canvas);
  return cachedPoliceDoorTex;
}

// ============================================================================
// 1D. DETAILED 3D VEHICLES:
//     - 1989 POLICE INTERCEPTOR CRUISER (Livery Decals, Bullbar, Searchlights,
//       Aero Lightbar with Strobe, Dual Whip Antennas, Chrome Hubcaps)
//     - 1987 BOXY AMERICAN SEDAN (3-Box, Chrome Grille, Tinted Glass, Interior)
//     - 1992 STREET TUNER / MUSCLE COUPE (Hood Scoop, Rear Wing Spoiler, Alloys)
//     - 1994 UTILITY PICKUP TRUCK (Open Cargo Bed, Rollbar + Offroad Lights)
//     - 1995 HEAVY-DUTY CARGO VAN (High Roof, Roof Rack + Cargo Box, Rear Doors)
// ============================================================================
export function buildBoxy80sVehicleMesh(options: {
  colorHex: number | string;
  isVan?: boolean;
  isPolice?: boolean;
  bodyStyle?: 'sedan' | 'van' | 'coupe' | 'pickup';
}): {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  paintMeshes: THREE.Mesh[];
  steerGroups: THREE.Group[];
  spinGroups: THREE.Group[];
  brakeLightMat: THREE.MeshStandardMaterial;
  redBar?: THREE.Mesh;
  blueBar?: THREE.Mesh;
  coneMesh?: THREE.Mesh;
} {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const paintMeshes: THREE.Mesh[] = [];
  const steerGroups: THREE.Group[] = [];
  const spinGroups: THREE.Group[] = [];

  const style: 'sedan' | 'van' | 'coupe' | 'pickup' =
    options.bodyStyle || (options.isVan ? 'van' : 'sedan');

  // Enamel PBR car paint
  const paintMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.colorHex),
    metalness: style === 'van' ? 0.32 : style === 'coupe' ? 0.62 : 0.48,
    roughness: style === 'van' ? 0.52 : style === 'coupe' ? 0.26 : 0.36
  });

  // Worn black rubber bumper & trim PBR
  const rubberBumperMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.78,
    metalness: 0.15
  });

  // Rusted / weathered wheel arch & undercarriage metal
  const weatheredArchMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.72,
    metalness: 0.45
  });

  // Chrome grille, exhaust, handles & trim
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.18
  });

  // Tinted scratched window glass (translucent so interior seats & dash are visible!)
  const tintedGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transmission: 0.58,
    opacity: 0.88,
    transparent: true,
    roughness: 0.14,
    metalness: 0.1,
    ior: 1.5
  });

  // Interior upholstery & dashboard visible through glass
  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.05
  });

  // 1. Lower Boxy Chassis Slab
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(4.68, 0.62, 2.08), paintMat);
  lowerBody.position.y = 0.58;
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  bodyGroup.add(lowerBody);
  paintMeshes.push(lowerBody);

  // Side Rub-Strips, Chrome Door Handles & Flared Wheel Arches
  [-1.05, 1.05].forEach(zSide => {
    const rubStrip = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.08, 0.04), rubberBumperMat);
    rubStrip.position.set(0, 0.54, zSide);
    bodyGroup.add(rubStrip);

    // Chrome door handles (front & rear doors)
    [-0.35, 0.45].forEach(hx => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), chromeMat);
      handle.position.set(hx, 0.78, zSide);
      bodyGroup.add(handle);
    });

    // Flared wheel fender arches
    [-1.42, 1.42].forEach(xWheel => {
      const arch = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.08), weatheredArchMat);
      arch.position.set(xWheel, 0.74, zSide);
      bodyGroup.add(arch);
    });
  });

  // Worn Black Rubber Front & Rear Bumpers + Chrome Impact Strips + License Plates
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 2.16), rubberBumperMat);
  frontBumper.position.set(2.38, 0.42, 0);
  bodyGroup.add(frontBumper);

  const frontChromeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 2.12), chromeMat);
  frontChromeStrip.position.set(2.39, 0.48, 0);
  bodyGroup.add(frontChromeStrip);

  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 2.16), rubberBumperMat);
  rearBumper.position.set(-2.38, 0.42, 0);
  bodyGroup.add(rearBumper);

  const rearChromeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 2.12), chromeMat);
  rearChromeStrip.position.set(-2.39, 0.48, 0);
  bodyGroup.add(rearChromeStrip);

  // Front & Rear License Plates
  const plateMat = new THREE.MeshStandardMaterial({
    color: options.isPolice ? 0xfef08a : 0xf8fafc,
    roughness: 0.4
  });
  const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.38), plateMat);
  frontPlate.position.set(2.54, 0.38, 0);
  bodyGroup.add(frontPlate);

  const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.38), plateMat);
  rearPlate.position.set(-2.54, 0.56, 0);
  bodyGroup.add(rearPlate);

  // Dual Chrome Exhaust Pipes under Rear Bumper
  [-0.58, 0.58].forEach(ez => {
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 10), chromeMat);
    exhaust.rotation.z = Math.PI / 2;
    exhaust.position.set(-2.46, 0.26, ez);
    bodyGroup.add(exhaust);
  });

  // Slatted Front Radiator Grille with Chrome Surround
  const grilleSurround = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.30, 1.16), chromeMat);
  grilleSurround.position.set(2.35, 0.68, 0);
  bodyGroup.add(grilleSurround);

  const grilleCore = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 1.08), rubberBumperMat);
  grilleCore.position.set(2.355, 0.68, 0);
  bodyGroup.add(grilleCore);

  // Quad Rectangular Halogen Headlights + Amber Corner Turn Indicators
  const halogenMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0xfef08a,
    emissiveIntensity: 0.95,
    roughness: 0.1
  });
  const amberSignalMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.75
  });

  [-0.74, 0.74].forEach(hz => {
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.40), chromeMat);
    bezel.position.set(2.34, 0.68, hz);
    bodyGroup.add(bezel);

    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.20, 0.36), halogenMat);
    hl.position.set(2.35, 0.68, hz);
    bodyGroup.add(hl);

    const cornerAmber = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.20, 0.14), amberSignalMat);
    cornerAmber.position.set(2.35, 0.68, hz > 0 ? hz + 0.26 : hz - 0.26);
    bodyGroup.add(cornerAmber);
  });

  // Dynamic Rear Brake Light Cluster + Reverse Lights
  const brakeLightMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.7,
    roughness: 0.2
  });
  const tailLightBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 1.92), brakeLightMat);
  tailLightBar.position.set(-2.35, 0.70, 0);
  bodyGroup.add(tailLightBar);

  [-0.45, 0.45].forEach(rz => {
    const revLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.08, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    revLight.position.set(-2.36, 0.70, rz);
    bodyGroup.add(revLight);
  });

  // Visible Interior Seats, Dashboard & Steering Wheel inside Cabin
  const dashMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 1.65), interiorMat);
  dashMesh.position.set(0.68, 0.95, 0);
  bodyGroup.add(dashMesh);

  [-0.44, 0.44].forEach(sz => {
    const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.58), interiorMat);
    seatBottom.position.set(0.05, 0.85, sz);
    bodyGroup.add(seatBottom);

    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.56), interiorMat);
    seatBack.position.set(-0.18, 1.15, sz);
    seatBack.rotation.z = 0.12;
    bodyGroup.add(seatBack);
  });

  if (style === 'van' && !options.isPolice) {
    // ========================================================================
    // 1995 HEAVY-DUTY UTILITY CARGO VAN (High Roof, Sliding Door Track,
    // Dual Rear Doors with Windows, Steel Roof Rack + Strapped Cargo Box)
    // ========================================================================
    const vanCargoBox = new THREE.Mesh(new THREE.BoxGeometry(3.48, 1.18, 1.98), paintMat);
    vanCargoBox.position.set(-0.50, 1.40, 0);
    vanCargoBox.castShadow = true;
    bodyGroup.add(vanCargoBox);
    paintMeshes.push(vanCargoBox);

    const vanHood = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.26, 1.96), paintMat);
    vanHood.position.set(1.75, 0.82, 0);
    vanHood.rotation.z = -0.08;
    bodyGroup.add(vanHood);
    paintMeshes.push(vanHood);

    const vanWindshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 1.78), tintedGlassMat);
    vanWindshield.position.set(1.24, 1.34, 0);
    vanWindshield.rotation.z = -0.36;
    bodyGroup.add(vanWindshield);

    [-0.995, 0.995].forEach(sz => {
      const cabWin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.05), tintedGlassMat);
      cabWin.position.set(0.55, 1.36, sz);
      bodyGroup.add(cabWin);
    });

    // Dual Rear Cargo Doors with vertical center seam, hinges & rear windows
    const rearSeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.14, 0.05), rubberBumperMat);
    rearSeam.position.set(-2.26, 1.40, 0);
    bodyGroup.add(rearSeam);

    [-0.46, 0.46].forEach(rz => {
      const rearDoorWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.62), tintedGlassMat);
      rearDoorWin.position.set(-2.25, 1.52, rz);
      bodyGroup.add(rearDoorWin);
    });

    // Steel Roof Rack + Strapped Cargo Crate on Top
    [-1.6, -0.6, 0.4].forEach(rx => {
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.88), chromeMat);
      crossbar.position.set(rx, 2.05, 0);
      bodyGroup.add(crossbar);
    });
    [-0.88, 0.88].forEach(rz => {
      const sideRail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.06), chromeMat);
      sideRail.position.set(-0.6, 2.05, rz);
      bodyGroup.add(sideRail);
    });

    const roofCrate = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.34, 1.15),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
    );
    roofCrate.position.set(-0.85, 2.24, 0);
    bodyGroup.add(roofCrate);
  } else if (style === 'pickup' && !options.isPolice) {
    // ========================================================================
    // 1994 UTILITY PICKUP TRUCK (Tall Cab, Open Cargo Bed, Rollbar + Offroad Lights)
    // ========================================================================
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.34, 1.98), paintMat);
    hood.position.set(1.48, 0.86, 0);
    bodyGroup.add(hood);
    paintMeshes.push(hood);

    const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.14, 1.72), paintMat);
    cabRoof.position.set(0.22, 1.64, 0);
    bodyGroup.add(cabRoof);
    paintMeshes.push(cabRoof);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.68, 1.66), tintedGlassMat);
    windshield.position.set(0.92, 1.28, 0);
    windshield.rotation.z = -0.38;
    bodyGroup.add(windshield);

    const cabBackWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 1.74), paintMat);
    cabBackWall.position.set(-0.36, 1.26, 0);
    bodyGroup.add(cabBackWall);
    paintMeshes.push(cabBackWall);

    // Open Cargo Truck Bed Walls & Dark Bedliner Floor
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 1.82), rubberBumperMat);
    bedFloor.position.set(-1.35, 0.84, 0);
    bodyGroup.add(bedFloor);

    [-0.94, 0.94].forEach(bz => {
      const bedSide = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.38, 0.12), paintMat);
      bedSide.position.set(-1.35, 0.96, bz);
      bodyGroup.add(bedSide);
      paintMeshes.push(bedSide);
    });

    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 1.96), paintMat);
    tailgate.position.set(-2.26, 0.96, 0);
    bodyGroup.add(tailgate);
    paintMeshes.push(tailgate);

    // Chrome Rollbar behind Cab with Twin Off-Road Spotlights
    const rollBarTop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.76, 10), chromeMat);
    rollBarTop.rotation.x = Math.PI / 2;
    rollBarTop.position.set(-0.55, 1.72, 0);
    bodyGroup.add(rollBarTop);

    [-0.84, 0.84].forEach(rz => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 10), chromeMat);
      post.position.set(-0.55, 1.34, rz);
      bodyGroup.add(post);
    });

    [-0.35, 0.35].forEach(lz => {
      const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12), halogenMat);
      spot.rotation.z = Math.PI / 2;
      spot.position.set(-0.52, 1.84, lz);
      bodyGroup.add(spot);
    });
  } else {
    // ========================================================================
    // 1987 BOXY AMERICAN SEDAN / 90s SPORT COUPE / 1989 POLICE INTERCEPTOR
    // ========================================================================
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.28, 1.96), paintMat);
    hood.position.set(1.48, 0.82, 0);
    hood.rotation.z = -0.04;
    bodyGroup.add(hood);
    paintMeshes.push(hood);

    if (style === 'coupe' && !options.isPolice) {
      // Hood Power-Dome Air Scoop & Raised Rear Wing Spoiler for Sport Coupe
      const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.62), rubberBumperMat);
      scoop.position.set(1.42, 0.98, 0);
      bodyGroup.add(scoop);

      [-0.72, 0.72].forEach(sz => {
        const wingStrut = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.06), rubberBumperMat);
        wingStrut.position.set(-2.05, 1.10, sz);
        bodyGroup.add(wingStrut);
      });
      const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 1.96), paintMat);
      wingBlade.position.set(-2.10, 1.25, 0);
      wingBlade.rotation.z = 0.12;
      bodyGroup.add(wingBlade);
      paintMeshes.push(wingBlade);
    }

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.30, 1.96), paintMat);
    trunk.position.set(-1.62, 0.84, 0);
    bodyGroup.add(trunk);
    paintMeshes.push(trunk);

    // Roof Panel (White for Police Interceptor, Body Paint for Civilian)
    const roofMat = options.isPolice
      ? new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.25 })
      : paintMat;
    const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.12, 1.68), roofMat);
    roofPanel.position.set(-0.12, 1.56, 0);
    bodyGroup.add(roofPanel);
    if (!options.isPolice) paintMeshes.push(roofPanel);

    // Tinted Windshield, Rear Window & Side Windows
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.68, 1.62), tintedGlassMat);
    windshield.position.set(0.92, 1.24, 0);
    windshield.rotation.z = -0.45;
    bodyGroup.add(windshield);

    const rearWin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.64, 1.60), tintedGlassMat);
    rearWin.position.set(-1.14, 1.24, 0);
    rearWin.rotation.z = 0.42;
    bodyGroup.add(rearWin);

    [-0.83, 0.83].forEach(sz => {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.54, 0.06), tintedGlassMat);
      sideGlass.position.set(-0.12, 1.24, sz);
      bodyGroup.add(sideGlass);

      // A, B, C Roof Pillars
      [-0.95, -0.1, 0.78].forEach((px, pIdx) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.08), rubberBumperMat);
        pillar.position.set(px, 1.24, sz);
        if (pIdx === 0) pillar.rotation.z = 0.38;
        if (pIdx === 2) pillar.rotation.z = -0.38;
        bodyGroup.add(pillar);
      });

      // Side Mirror
      const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.14, 0.26),
        options.isPolice ? chromeMat : rubberBumperMat
      );
      mirror.position.set(0.68, 1.04, sz > 0 ? 1.06 : -1.06);
      bodyGroup.add(mirror);
    });
  }

  // ==========================================================================
  // POLICE INTERCEPTOR EXCLUSIVE DETAILS:
  //   - White Doors with "POLICE 911" Decal & Gold Shield Badge
  //   - Heavy Tubular Steel PIT-Maneuver Push-Bar (Bullbar)
  //   - Dual Chrome A-Pillar Searchlights
  //   - Rooftop Aero Lightbar with Red/Blue Domes & Center Strobe
  //   - Dual Rear Trunk Whip Radio Antennas
  // ==========================================================================
  let redBar: THREE.Mesh | undefined;
  let blueBar: THREE.Mesh | undefined;
  let coneMesh: THREE.Mesh | undefined;

  if (options.isPolice) {
    const policeDoorTex = getPoliceDoorTexture();
    const whiteDoorMat = new THREE.MeshStandardMaterial({
      map: policeDoorTex,
      roughness: 0.32,
      metalness: 0.25
    });
    const whiteDoors = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.65, 2.12), whiteDoorMat);
    whiteDoors.position.set(-0.04, 0.60, 0);
    bodyGroup.add(whiteDoors);

    // Heavy-Duty Steel PIT-Maneuver Push-Bar (Bullbar) on Front Bumper
    [-0.42, 0.42].forEach(bz => {
      const upright = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.08), rubberBumperMat);
      upright.position.set(2.52, 0.58, bz);
      bodyGroup.add(upright);
    });
    [0.44, 0.72].forEach(by => {
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.96, 10), rubberBumperMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(2.56, by, 0);
      bodyGroup.add(crossbar);
    });

    // Dual Chrome A-Pillar Searchlights / Spotlights
    [-0.95, 0.95].forEach(sz => {
      const spotHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.18, 12), chromeMat);
      spotHousing.rotation.z = Math.PI / 2;
      spotHousing.position.set(0.84, 1.18, sz);
      bodyGroup.add(spotHousing);

      const spotLens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), halogenMat);
      spotLens.rotation.y = Math.PI / 2;
      spotLens.position.set(0.94, 1.18, sz);
      bodyGroup.add(spotLens);
    });

    // Rooftop Chrome Lightbar Base Rail + Center White Strobe + Red/Blue Siren Domes
    const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 1.48), chromeMat);
    lightbarBase.position.set(-0.12, 1.66, 0);
    bodyGroup.add(lightbarBase);

    const centerStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.18, 0.24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    centerStrobe.position.set(-0.12, 1.78, 0);
    bodyGroup.add(centerStrobe);

    redBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.40, 0.22, 0.56),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    redBar.position.set(-0.12, 1.79, -0.44);
    bodyGroup.add(redBar);

    blueBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.40, 0.22, 0.56),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    );
    blueBar.position.set(-0.12, 1.79, 0.44);
    bodyGroup.add(blueBar);

    // Dual Rear Trunk Whip Radio Antennas
    [-0.65, 0.65].forEach(az => {
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 1.15, 6), chromeMat);
      antenna.position.set(-1.95, 1.52, az);
      antenna.rotation.z = 0.14;
      bodyGroup.add(antenna);
    });

    const coneGeo = new THREE.ConeGeometry(9, 32, 12, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.z = -Math.PI / 2;
    coneMesh.position.set(16, 0.8, 0);
    root.add(coneMesh);
  }

  root.add(bodyGroup);

  // 2. Realistic Tires with Brake Dust on Steel Rims + Spokes (Visible Rotation!)
  const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 18);
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.08
  });

  const steelRimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.36, 14);
  const steelRimMat = new THREE.MeshStandardMaterial({
    color: options.isPolice ? 0x1e293b : 0x64748b,
    metalness: 0.85,
    roughness: 0.32
  });

  const lugHubGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.38, 10);
  const spokeGeo = new THREE.BoxGeometry(0.48, 0.06, 0.37);

  const wheelCoords: [number, number, number, boolean][] = [
    [1.42, 0.42, 1.04, true],
    [1.42, 0.42, -1.04, true],
    [-1.42, 0.42, 1.04, false],
    [-1.42, 0.42, -1.04, false]
  ];

  wheelCoords.forEach(([wx, wy, wz, isFront]) => {
    const steerPivot = new THREE.Group();
    steerPivot.position.set(wx, wy, wz);

    const spinGroup = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    spinGroup.add(tire);

    const rim = new THREE.Mesh(steelRimGeo, steelRimMat);
    rim.rotation.x = Math.PI / 2;
    spinGroup.add(rim);

    const hub = new THREE.Mesh(lugHubGeo, chromeMat);
    hub.rotation.x = Math.PI / 2;
    spinGroup.add(hub);

    const spoke1 = new THREE.Mesh(spokeGeo, chromeMat);
    spinGroup.add(spoke1);

    const spoke2 = new THREE.Mesh(spokeGeo, chromeMat);
    spoke2.rotation.z = Math.PI / 2;
    spinGroup.add(spoke2);

    steerPivot.add(spinGroup);
    root.add(steerPivot);

    if (isFront) steerGroups.push(steerPivot);
    spinGroups.push(spinGroup);
  });

  return {
    root,
    bodyGroup,
    paintMeshes,
    steerGroups,
    spinGroups,
    brakeLightMat,
    redBar,
    blueBar,
    coneMesh
  };
}

// ============================================================================
// ============================================================================
// 1E. REALISTIC STREET NPC & PARTNER CHARACTER MODEL
//     (Layered Open Jacket / Hoodie over Inner Tee, Neck, Facial Features,
//      Varied Hairstyles / Caps / Beanies, Cargo/Denim Trousers, Sneakers & Bag)
// ============================================================================
const SHARED_CHAR_GEOS = {
  leg: new THREE.BoxGeometry(0.24, 0.78, 0.26),
  pocket: new THREE.BoxGeometry(0.05, 0.22, 0.18),
  shoeUpper: new THREE.BoxGeometry(0.25, 0.13, 0.38),
  shoeSole: new THREE.BoxGeometry(0.27, 0.05, 0.41),
  torso: new THREE.BoxGeometry(0.70, 0.96, 0.40),
  innerShirt: new THREE.BoxGeometry(0.32, 0.88, 0.42),
  lapel: new THREE.BoxGeometry(0.06, 0.86, 0.43),
  belt: new THREE.BoxGeometry(0.72, 0.08, 0.42),
  hoodCollar: new THREE.TorusGeometry(0.22, 0.075, 6, 12),
  sleeve: new THREE.BoxGeometry(0.20, 0.62, 0.22),
  forearm: new THREE.CylinderGeometry(0.075, 0.065, 0.22, 8),
  hand: new THREE.SphereGeometry(0.082, 8, 8),
  neck: new THREE.CylinderGeometry(0.10, 0.11, 0.18, 8),
  head: new THREE.SphereGeometry(0.245, 12, 12),
  ear: new THREE.SphereGeometry(0.045, 6, 6),
  nose: new THREE.BoxGeometry(0.045, 0.08, 0.06),
  eye: new THREE.SphereGeometry(0.026, 6, 6),
  brow: new THREE.BoxGeometry(0.08, 0.022, 0.03),
  shades: new THREE.BoxGeometry(0.38, 0.085, 0.12),
  beanie: new THREE.SphereGeometry(0.258, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
  capBill: new THREE.BoxGeometry(0.30, 0.025, 0.22),
  backpack: new THREE.BoxGeometry(0.44, 0.56, 0.22)
};

export function buildStreetHustlerCharacter(options: {
  hoodieColor: number | string;
  pantsColor?: number | string;
  skinColor?: number | string;
  isPartner?: boolean;
  variantIdx?: number;
}): {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
} {
  const group = new THREE.Group();
  const vIdx = options.variantIdx ?? 0;

  const jacketMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.hoodieColor),
    roughness: 0.82,
    metalness: 0.05
  });

  const innerTeeColors = [0xf8fafc, 0xcbd5e1, 0x1e293b, 0xfef08a, 0x99f6e4];
  const innerTeeMat = new THREE.MeshStandardMaterial({
    color: innerTeeColors[vIdx % innerTeeColors.length],
    roughness: 0.85
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.pantsColor || 0x1e293b),
    roughness: 0.88,
    metalness: 0.03
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.skinColor || 0xd6a273),
    roughness: 0.62,
    metalness: 0.02
  });

  const darkFeatureMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5
  });

  const sneakerSoleMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.65
  });

  // 1. Articulated Legs (Trousers + Side Cargo Pockets + Two-Tone Sneakers)
  const buildLeg = (side: -1 | 1): THREE.Group => {
    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.18, 0.92, 0);

    const pantLeg = new THREE.Mesh(SHARED_CHAR_GEOS.leg, pantsMat);
    pantLeg.position.set(0, -0.38, 0);
    legPivot.add(pantLeg);

    const cargoPocket = new THREE.Mesh(SHARED_CHAR_GEOS.pocket, pantsMat);
    cargoPocket.position.set(side * 0.14, -0.28, 0);
    legPivot.add(cargoPocket);

    const shoeUpper = new THREE.Mesh(SHARED_CHAR_GEOS.shoeUpper, darkFeatureMat);
    shoeUpper.position.set(0, -0.80, 0.04);
    legPivot.add(shoeUpper);

    const shoeSole = new THREE.Mesh(SHARED_CHAR_GEOS.shoeSole, sneakerSoleMat);
    shoeSole.position.set(0, -0.88, 0.04);
    legPivot.add(shoeSole);

    return legPivot;
  };

  const leftLeg = buildLeg(-1);
  leftLeg.name = 'leftLeg';
  group.add(leftLeg);

  const rightLeg = buildLeg(1);
  rightLeg.name = 'rightLeg';
  group.add(rightLeg);

  // 2. Layered Torso (Jacket / Hoodie over Contrasting Inner Shirt + Belt + Collar)
  const torso = new THREE.Mesh(SHARED_CHAR_GEOS.torso, jacketMat);
  torso.position.set(0, 1.40, 0);
  group.add(torso);

  const innerShirt = new THREE.Mesh(SHARED_CHAR_GEOS.innerShirt, innerTeeMat);
  innerShirt.position.set(0, 1.41, 0);
  group.add(innerShirt);

  [-0.17, 0.17].forEach(lx => {
    const lapel = new THREE.Mesh(SHARED_CHAR_GEOS.lapel, jacketMat);
    lapel.position.set(lx, 1.41, 0);
    group.add(lapel);
  });

  const belt = new THREE.Mesh(SHARED_CHAR_GEOS.belt, darkFeatureMat);
  belt.position.set(0, 0.95, 0);
  group.add(belt);

  const hoodCollar = new THREE.Mesh(SHARED_CHAR_GEOS.hoodCollar, jacketMat);
  hoodCollar.rotation.x = Math.PI / 2 - 0.22;
  hoodCollar.position.set(0, 1.88, -0.04);
  group.add(hoodCollar);

  // Optional Street Backpack on every 3rd NPC for realistic pedestrian variety
  if (!options.isPartner && vIdx % 3 === 0) {
    const backpack = new THREE.Mesh(SHARED_CHAR_GEOS.backpack, darkFeatureMat);
    backpack.position.set(0, 1.44, -0.28);
    group.add(backpack);
  }

  // 3. Articulated Arms with Jacket Sleeves, Forearms & Hands
  const buildArm = (side: -1 | 1): THREE.Group => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.45, 1.78, 0);

    const sleeve = new THREE.Mesh(SHARED_CHAR_GEOS.sleeve, jacketMat);
    sleeve.position.set(0, -0.28, 0);
    armPivot.add(sleeve);

    const forearm = new THREE.Mesh(SHARED_CHAR_GEOS.forearm, skinMat);
    forearm.position.set(0, -0.62, 0);
    armPivot.add(forearm);

    const hand = new THREE.Mesh(SHARED_CHAR_GEOS.hand, skinMat);
    hand.position.set(0, -0.75, 0);
    armPivot.add(hand);

    return armPivot;
  };

  const leftArm = buildArm(-1);
  leftArm.name = 'leftArm';
  group.add(leftArm);

  const rightArm = buildArm(1);
  rightArm.name = 'rightArm';
  group.add(rightArm);

  // 4. Realistic Neck, Sculpted Head, Ears, Nose, Eyes/Brows & Headwear Variety
  const neck = new THREE.Mesh(SHARED_CHAR_GEOS.neck, skinMat);
  neck.position.set(0, 1.94, 0);
  group.add(neck);

  const head = new THREE.Mesh(SHARED_CHAR_GEOS.head, skinMat);
  head.position.set(0, 2.15, 0);
  head.scale.set(0.94, 1.06, 0.96);
  group.add(head);

  [-0.23, 0.23].forEach(ex => {
    const ear = new THREE.Mesh(SHARED_CHAR_GEOS.ear, skinMat);
    ear.position.set(ex, 2.14, 0);
    group.add(ear);
  });

  const nose = new THREE.Mesh(SHARED_CHAR_GEOS.nose, skinMat);
  nose.position.set(0, 2.14, 0.24);
  group.add(nose);

  if (options.isPartner || vIdx % 4 === 0) {
    // Sleek street sunglasses on Partner & every 4th NPC
    const shades = new THREE.Mesh(SHARED_CHAR_GEOS.shades, darkFeatureMat);
    shades.position.set(0, 2.18, 0.21);
    group.add(shades);
  } else {
    // Natural eyes & eyebrows
    [-0.085, 0.085].forEach(ex => {
      const eye = new THREE.Mesh(SHARED_CHAR_GEOS.eye, darkFeatureMat);
      eye.position.set(ex, 2.18, 0.22);
      group.add(eye);

      const brow = new THREE.Mesh(SHARED_CHAR_GEOS.brow, darkFeatureMat);
      brow.position.set(ex, 2.23, 0.22);
      group.add(brow);
    });
  }

  // Headwear / Hair Variety: Beanie, Baseball Cap, or Natural Hair Crown
  const hairColors = [0x090d16, 0x27272a, 0x451a03, 0x713f12, 0x1e3a8a, 0x064e3b];
  const crownMat = new THREE.MeshStandardMaterial({
    color: options.isPartner ? 0x064e3b : hairColors[vIdx % hairColors.length],
    roughness: 0.88
  });
  const crown = new THREE.Mesh(SHARED_CHAR_GEOS.beanie, crownMat);
  crown.position.set(0, 2.17, -0.01);
  group.add(crown);

  if (!options.isPartner && vIdx % 3 === 1) {
    // Forward baseball cap visor
    const bill = new THREE.Mesh(SHARED_CHAR_GEOS.capBill, crownMat);
    bill.position.set(0, 2.24, 0.22);
    bill.rotation.x = 0.12;
    group.add(bill);
  }

  if (options.isPartner) {
    const chain = new THREE.Mesh(
      new THREE.TorusGeometry(0.20, 0.024, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 })
    );
    chain.rotation.x = Math.PI / 2 + 0.35;
    chain.position.set(0, 1.82, 0.06);
    group.add(chain);

    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.52, 0.62),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.2 })
    );
    bag.position.set(0.42, 1.32, -0.14);
    bag.name = 'duffelBag';
    group.add(bag);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.05, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 2.68, 0);
    halo.name = 'partnerHalo';
    group.add(halo);
  }

  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm
  };
}
