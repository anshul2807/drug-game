import * as THREE from 'three';
import { Building, ShadowAlley, PoliceUnit, Pedestrian, CivilianCar, PayNSpray, Property, Pot } from '../../types/game';
import {
  getWetAsphaltPBR,
  createPlasterWallPBR,
  getMylarFoilPBR,
  buildFractionalDistillationRig,
  buildHydroponicGrowBucket,
  buildReinforcedSteelSafeVault,
  buildDigitalScaleAndBaggiesProp,
  buildBoxy80sVehicleMesh,
  buildStreetHustlerCharacter
} from './PBRTextures';

export const INTERIOR_CENTER_X = 5000;
export const INTERIOR_CENTER_Z = 5000;
export const CONVENIENCE_SHOP_COORDS = { x: 455, y: 230 };

export interface InteriorStationsLayout {
  roomHalfW: number;
  roomHalfD: number;
  spawnPos: { x: number; z: number };
  exitDoorPos: { x: number; z: number };
  growStationPos: { x: number; z: number };
  labStationPos: { x: number; z: number };
  packStationPos: { x: number; z: number };
  partnerDeskPos: { x: number; z: number };
  storeStationPos: { x: number; z: number };
  bedPos: { x: number; z: number };
}

export interface City3DSceneOptions {
  worldWidth: number;
  worldHeight: number;
  buildings: Building[];
  shadowAlleys: ShadowAlley[];
  payNSprays?: PayNSpray[];
  properties?: Property[];
}

export class City3DScene {
  public scene: THREE.Scene;
  public roadGroup: THREE.Group;
  public buildingGroup: THREE.Group;
  public streetlightGroup: THREE.Group;
  public copGroup: THREE.Group;
  public civilianGroup: THREE.Group;
  public pedGroup: THREE.Group;
  public payNSprayGroup: THREE.Group;
  public convenienceShopGroup: THREE.Group;
  public safehouseDoorGroup: THREE.Group;
  public interiorGroup: THREE.Group;
  public partnerCityGroup: THREE.Group;
  public partnerInteriorGroup: THREE.Group;
  public dropBeacon: THREE.Group;
  public gpsArrowGroup: THREE.Group;
  public parkedCarMesh: THREE.Group;
  public playerCarMesh!: THREE.Group;
  private playerCarBodyGroup!: THREE.Group;
  private playerCarPaintMeshes: THREE.Mesh[] = [];
  private playerWheelSteerGroups: THREE.Group[] = [];
  private playerWheelSpinMeshes: THREE.Group[] = [];
  private playerBrakeLightMat!: THREE.MeshStandardMaterial;
  private wheelSpinAngle: number = 0;
  private safehouseDiamonds: THREE.Mesh[] = [];
  private shopBeaconMesh?: THREE.Mesh;
  private shopkeeperRightArm?: THREE.Object3D;
  private shopkeeperGroup?: THREE.Group;
  private gpsArrowMat!: THREE.MeshBasicMaterial;
  private sodiumLightCones: THREE.Mesh[] = [];
  private sodiumPointLights: THREE.PointLight[] = [];

  private ambLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;

  private copMeshes: {
    mesh: THREE.Group;
    redBar: THREE.Mesh;
    blueBar: THREE.Mesh;
    coneMesh: THREE.Mesh;
    spinGroups: THREE.Group[];
  }[] = [];

  private civilianMeshes: {
    mesh: THREE.Group;
    spinGroups: THREE.Group[];
  }[] = [];

  private pedMeshes: {
    mesh: THREE.Group;
    leftLeg: THREE.Object3D;
    rightLeg: THREE.Object3D;
    leftArm: THREE.Object3D;
    rightArm: THREE.Object3D;
    pedData: Pedestrian;
  }[] = [];

  private interiorPotPlants: {
    plantGroup: THREE.Group;
    budMeshes: THREE.Mesh[];
  }[] = [];
  private currentInteriorPropId: string = '';
  private currentInteriorPotCount: number = -1;
  private currentInteriorStoreLevel: number = -1;
  private currentInteriorLayout: InteriorStationsLayout = {
    roomHalfW: 12,
    roomHalfD: 9,
    spawnPos: { x: INTERIOR_CENTER_X, z: INTERIOR_CENTER_Z + 6.5 },
    exitDoorPos: { x: INTERIOR_CENTER_X, z: INTERIOR_CENTER_Z + 8.5 },
    growStationPos: { x: INTERIOR_CENTER_X - 7, z: INTERIOR_CENTER_Z - 4 },
    labStationPos: { x: INTERIOR_CENTER_X + 7, z: INTERIOR_CENTER_Z - 4 },
    packStationPos: { x: INTERIOR_CENTER_X + 7, z: INTERIOR_CENTER_Z + 3 },
    partnerDeskPos: { x: INTERIOR_CENTER_X - 7, z: INTERIOR_CENTER_Z + 3 },
    storeStationPos: { x: INTERIOR_CENTER_X - 7, z: INTERIOR_CENTER_Z - 0.5 },
    bedPos: { x: INTERIOR_CENTER_X - 8.5, z: INTERIOR_CENTER_Z + 5.8 }
  };

  constructor(options: City3DSceneOptions) {
    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xcfe9ff, 0.0014);

    this.ambLight = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(this.ambLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.75);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffdf0, 1.35);
    this.sunLight.position.set(450, 900, 350);
    this.sunLight.castShadow = false;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0xb0e0e6, 0.38);
    this.fillLight.position.set(-400, 600, -300);
    this.scene.add(this.fillLight);

    this.roadGroup = new THREE.Group();
    this.buildingGroup = new THREE.Group();
    this.streetlightGroup = new THREE.Group();
    this.copGroup = new THREE.Group();
    this.civilianGroup = new THREE.Group();
    this.pedGroup = new THREE.Group();
    this.payNSprayGroup = new THREE.Group();
    this.convenienceShopGroup = new THREE.Group();
    this.safehouseDoorGroup = new THREE.Group();
    this.interiorGroup = new THREE.Group();
    this.partnerCityGroup = new THREE.Group();
    this.partnerInteriorGroup = new THREE.Group();
    this.dropBeacon = new THREE.Group();
    this.gpsArrowGroup = new THREE.Group();
    this.parkedCarMesh = new THREE.Group();

    this.scene.add(this.roadGroup);
    this.scene.add(this.buildingGroup);
    this.scene.add(this.streetlightGroup);
    this.scene.add(this.copGroup);
    this.scene.add(this.civilianGroup);
    this.scene.add(this.pedGroup);
    this.scene.add(this.payNSprayGroup);
    this.scene.add(this.convenienceShopGroup);
    this.scene.add(this.safehouseDoorGroup);
    this.scene.add(this.interiorGroup);
    this.scene.add(this.partnerCityGroup);
    this.scene.add(this.partnerInteriorGroup);
    this.scene.add(this.dropBeacon);
    this.scene.add(this.gpsArrowGroup);
    this.scene.add(this.parkedCarMesh);

    this.buildGround(options.worldWidth, options.worldHeight);
    this.buildBuildings(options.buildings);
    this.buildShadowAlleys(options.shadowAlleys);
    this.buildStreetlights();
    this.buildPayNSprays(options.payNSprays || []);
    this.buildConvenienceShop();
    this.buildSafehouseDoors(options.properties || []);
    this.buildDropBeacon();
    this.buildGpsArrow();
    this.buildParkedCar();
    this.buildPlayerCar();
    this.buildPartnerMeshes();
    this.buildSafehouseInterior('motel', 4, 1);
  }

  // ============================================================================
  // 2A. WET CRACKED ASPHALT WITH PUDDLES & TILING NORMAL / ROUGHNESS MAPS
  // ============================================================================
  private buildGround(w: number, h: number) {
    const asphaltPBR = getWetAsphaltPBR(36, 24);

    const groundGeo = new THREE.PlaneGeometry(w, h);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.78,
      metalness: 0.08,
      normalMap: asphaltPBR.normalMap,
      normalScale: new THREE.Vector2(0.45, 0.45)
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(w / 2, 0, h / 2);
    ground.receiveShadow = true;
    this.roadGroup.add(ground);

    const roadYs = [80, 380, 680, 980, 1280, 1580];
    const roadXs = [80, 480, 880, 1280, 1680, 2080, 2480];

    // Wet Asphalt PBR Material (roughness 0.35, metalness 0.1, tiling normalMap + puddle roughnessMap)
    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltPBR.map,
      normalMap: asphaltPBR.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: asphaltPBR.roughnessMap,
      roughness: 0.35,
      metalness: 0.1
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.75,
      metalness: 0.05,
      normalMap: asphaltPBR.normalMap,
      normalScale: new THREE.Vector2(0.35, 0.35)
    });

    const yellowStripeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
      roughness: 0.4
    });
    const whiteLineMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4
    });

    roadYs.forEach(ry => {
      const swGeo = new THREE.PlaneGeometry(w, 56);
      const sw = new THREE.Mesh(swGeo, sidewalkMat);
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(w / 2, 0.015, ry);
      sw.receiveShadow = true;
      this.roadGroup.add(sw);

      const roadGeo = new THREE.PlaneGeometry(w, 44);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(w / 2, 0.03, ry);
      road.receiveShadow = true;
      this.roadGroup.add(road);

      const stripeGeo = new THREE.PlaneGeometry(w, 1.2);
      const stripe = new THREE.Mesh(stripeGeo, yellowStripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(w / 2, 0.04, ry);
      this.roadGroup.add(stripe);

      const edgeTopGeo = new THREE.PlaneGeometry(w, 0.8);
      const edgeTop = new THREE.Mesh(edgeTopGeo, whiteLineMat);
      edgeTop.rotation.x = -Math.PI / 2;
      edgeTop.position.set(w / 2, 0.035, ry - 20);
      this.roadGroup.add(edgeTop);

      const edgeBot = new THREE.Mesh(edgeTopGeo, whiteLineMat);
      edgeBot.rotation.x = -Math.PI / 2;
      edgeBot.position.set(w / 2, 0.035, ry + 20);
      this.roadGroup.add(edgeBot);
    });

    roadXs.forEach(rx => {
      const swGeo = new THREE.PlaneGeometry(56, h);
      const sw = new THREE.Mesh(swGeo, sidewalkMat);
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(rx, 0.015, h / 2);
      sw.receiveShadow = true;
      this.roadGroup.add(sw);

      const roadGeo = new THREE.PlaneGeometry(44, h);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(rx, 0.03, h / 2);
      road.receiveShadow = true;
      this.roadGroup.add(road);

      const stripeGeo = new THREE.PlaneGeometry(1.2, h);
      const stripe = new THREE.Mesh(stripeGeo, yellowStripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(rx, 0.04, h / 2);
      this.roadGroup.add(stripe);

      const edgeSideGeo = new THREE.PlaneGeometry(0.8, h);
      const edgeL = new THREE.Mesh(edgeSideGeo, whiteLineMat);
      edgeL.rotation.x = -Math.PI / 2;
      edgeL.position.set(rx - 20, 0.035, h / 2);
      this.roadGroup.add(edgeL);

      const edgeR = new THREE.Mesh(edgeSideGeo, whiteLineMat);
      edgeR.rotation.x = -Math.PI / 2;
      edgeR.position.set(rx + 20, 0.035, h / 2);
      this.roadGroup.add(edgeR);
    });
  }

  private buildBuildings(buildings: Building[]) {
    buildings.forEach(b => {
      let height = 24;
      let buildingColor = 0xcbdaed;
      let accentColor = 0x0284c7;
      let metalness = 0.15;
      let roughness = 0.65;

      if (b.district === 'Downtown Core') {
        height = 65 + Math.random() * 35;
        const downtownPalette = [0x475569, 0x334155, 0x64748b, 0x1e293b, 0x38bdf8];
        buildingColor = downtownPalette[Math.floor(Math.random() * downtownPalette.length)];
        accentColor = 0x0284c7;
        metalness = 0.55;
        roughness = 0.28;
      } else if (b.district === 'Neon District') {
        height = 38 + Math.random() * 22;
        const neonPalette = [0x2e1065, 0x3b0764, 0x4c1d95, 0x1e1b4b, 0x701a75];
        buildingColor = neonPalette[Math.floor(Math.random() * neonPalette.length)];
        accentColor = 0xd946ef;
        metalness = 0.35;
        roughness = 0.42;
      } else if (b.district === 'The Docks') {
        height = 18 + Math.random() * 10;
        const docksPalette = [0x7c2d12, 0x1e293b, 0x78350f, 0x334155, 0x475569];
        buildingColor = docksPalette[Math.floor(Math.random() * docksPalette.length)];
        accentColor = 0x0369a1;
        metalness = 0.45;
        roughness = 0.58;
      } else if (b.district === 'Sunset Hills') {
        height = 16 + Math.random() * 6;
        const hillsPalette = [0xe2e8f0, 0xfef3c7, 0xd1fae5, 0xf8fafc, 0xfed7aa];
        buildingColor = hillsPalette[Math.floor(Math.random() * hillsPalette.length)];
        accentColor = 0x15803d;
        roughness = 0.55;
      } else if (b.district === 'Desert Outskirts') {
        height = 14 + Math.random() * 6;
        const desertPalette = [0x78350f, 0x92400e, 0x713f12, 0x57534e, 0x44403c];
        buildingColor = desertPalette[Math.floor(Math.random() * desertPalette.length)];
        accentColor = 0xd97706;
        roughness = 0.78;
      } else {
        const motelPalette = [0x64748b, 0x475569, 0x52525b, 0x334155, 0x78716c];
        buildingColor = motelPalette[Math.floor(Math.random() * motelPalette.length)];
        accentColor = 0x0d9488;
        roughness = 0.72;
      }

      const geo = new THREE.BoxGeometry(b.w, height, b.h);
      const mat = new THREE.MeshStandardMaterial({
        color: buildingColor,
        roughness,
        metalness
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x + b.w / 2, height / 2, b.y + b.h / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.buildingGroup.add(mesh);

      const rimGeo = new THREE.BoxGeometry(b.w + 1.2, 1.4, b.h + 1.2);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.6
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(b.x + b.w / 2, height, b.y + b.h / 2);
      this.buildingGroup.add(rim);

      const bandGeo = new THREE.BoxGeometry(b.w + 0.5, 2.2, b.h + 0.5);
      const bandMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.35,
        roughness: 0.3
      });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(b.x + b.w / 2, height * 0.55, b.y + b.h / 2);
      this.buildingGroup.add(band);
    });
  }

  private buildShadowAlleys(alleys: ShadowAlley[]) {
    alleys.forEach(a => {
      const geo = new THREE.BoxGeometry(a.w, 15, a.h);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.8,
        metalness: 0.2,
        transparent: true,
        opacity: 0.92
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(a.x + a.w / 2, 7.5, a.y + a.h / 2);
      this.buildingGroup.add(mesh);

      const neonGeo = new THREE.BoxGeometry(a.w, 1.2, 1);
      const neonMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const signN = new THREE.Mesh(neonGeo, neonMat);
      signN.position.set(a.x + a.w / 2, 10, a.y);
      this.buildingGroup.add(signN);

      const signS = new THREE.Mesh(neonGeo, neonMat);
      signS.position.set(a.x + a.w / 2, 10, a.y + a.h);
      this.buildingGroup.add(signS);
    });
  }

  // ============================================================================
  // 1E. 3D PARTNER CHARACTER (UPGRADED STREET HUSTLER WITH HOODIE, CARGO PANTS & DUFFEL)
  // ============================================================================
  private buildSinglePartnerCharacter(): THREE.Group {
    const hustler = buildStreetHustlerCharacter({
      hoodieColor: 0x10b981,
      pantsColor: 0x0f172a,
      skinColor: 0xd6a273,
      isPartner: true
    });
    return hustler.group;
  }

  private buildPartnerMeshes() {
    while (this.partnerCityGroup.children.length > 0) {
      this.partnerCityGroup.remove(this.partnerCityGroup.children[0]);
    }
    while (this.partnerInteriorGroup.children.length > 0) {
      this.partnerInteriorGroup.remove(this.partnerInteriorGroup.children[0]);
    }

    const cityPartner = this.buildSinglePartnerCharacter();
    cityPartner.scale.set(1.35, 1.35, 1.35);
    this.partnerCityGroup.add(cityPartner);
    this.partnerCityGroup.visible = false;

    const interiorPartner = this.buildSinglePartnerCharacter();
    this.partnerInteriorGroup.add(interiorPartner);
    this.partnerInteriorGroup.visible = false;
  }

  public updatePartner3D(
    partnerSim: {
      hired: boolean;
      inSafehouse: boolean;
      x: number;
      y: number;
      interiorX: number;
      interiorZ: number;
      angle: number;
      isMoving: boolean;
      isDealing: boolean;
      stock: number;
    },
    playerInsideSafehouse: boolean,
    time: number
  ) {
    if (!partnerSim.hired) {
      this.partnerCityGroup.visible = false;
      this.partnerInteriorGroup.visible = false;
      return;
    }

    if (partnerSim.inSafehouse) {
      this.partnerCityGroup.visible = false;
      this.partnerInteriorGroup.visible = playerInsideSafehouse;
      this.partnerInteriorGroup.position.set(partnerSim.interiorX, 0, partnerSim.interiorZ);
      this.partnerInteriorGroup.rotation.y = partnerSim.angle;

      const char = this.partnerInteriorGroup.children[0];
      if (char) {
        const leftLeg = char.getObjectByName('leftLeg');
        const rightLeg = char.getObjectByName('rightLeg');
        if (leftLeg && rightLeg) {
          const swing = partnerSim.isMoving ? Math.sin(time * 0.012) * 0.45 : 0;
          leftLeg.rotation.x = swing;
          rightLeg.rotation.x = -swing;
        }
      }
    } else {
      this.partnerInteriorGroup.visible = false;
      this.partnerCityGroup.visible = !playerInsideSafehouse;
      this.partnerCityGroup.position.set(partnerSim.x, 0, partnerSim.y);
      this.partnerCityGroup.rotation.y = -partnerSim.angle + Math.PI / 2;

      const char = this.partnerCityGroup.children[0];
      if (char) {
        const leftLeg = char.getObjectByName('leftLeg');
        const rightLeg = char.getObjectByName('rightLeg');
        const halo = char.getObjectByName('partnerHalo') as THREE.Mesh | undefined;
        if (leftLeg && rightLeg) {
          const swing = partnerSim.isMoving ? Math.sin(time * 0.015) * 0.55 : 0;
          leftLeg.rotation.x = swing;
          rightLeg.rotation.x = -swing;
        }
        if (halo && halo.material instanceof THREE.MeshBasicMaterial) {
          halo.material.color.setHex(partnerSim.isDealing ? 0xfbbf24 : 0x34d399);
          halo.position.y = 2.75 + Math.sin(time * 0.008) * 0.15;
        }
      }
    }
  }

  // ============================================================================
  // HIGHLY VISIBLE 3D CHARACTER SAFEHOUSE COMPOUND, ENTRY DOOR & SKY BEACON
  // ============================================================================
  public buildSafehouseDoors(properties: Property[]) {
    while (this.safehouseDoorGroup.children.length > 0) {
      this.safehouseDoorGroup.remove(this.safehouseDoorGroup.children[0]);
    }
    this.safehouseDiamonds = [];

    properties.forEach(prop => {
      if (!prop.owned) return;
      const compoundGroup = new THREE.Group();

      // 1. Glowing Courtyard Driveway Pad & No-Police Safe Zone Perimeter Ring
      const outerRingGeo = new THREE.RingGeometry(9, 13, 32);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.rotation.x = -Math.PI / 2;
      outerRing.position.y = 0.08;
      compoundGroup.add(outerRing);

      const innerPadGeo = new THREE.CircleGeometry(8.5, 24);
      const innerPadMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.35
      });
      const innerPad = new THREE.Mesh(innerPadGeo, innerPadMat);
      innerPad.rotation.x = -Math.PI / 2;
      innerPad.position.y = 0.07;
      compoundGroup.add(innerPad);

      // 2. Tall Sky-Reaching Cyan/Emerald Safehouse Beacon Beam (Visible across the whole city!)
      const beamGeo = new THREE.CylinderGeometry(3.2, 3.2, 220, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 110, 0);
      compoundGroup.add(beam);

      // 3. Distinct 3D Safehouse Porch, Pitched Roof & Detailed Hinged Entry/Exit Door
      const houseBodyGeo = new THREE.BoxGeometry(16, 10, 10);
      const houseBodyMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const houseBody = new THREE.Mesh(houseBodyGeo, houseBodyMat);
      houseBody.position.set(0, 5, 22);
      compoundGroup.add(houseBody);

      // Pitched Roof
      const roofGeo = new THREE.ConeGeometry(13, 6, 4);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0x0d9488 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, 13, 22);
      compoundGroup.add(roof);

      // Glowing Neon Signboard on Front of Safehouse
      const signBoardGeo = new THREE.BoxGeometry(14, 2.2, 0.8);
      const signBoardMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
      signBoard.position.set(0, 8.8, 16.8);
      compoundGroup.add(signBoard);

      // Detailed Entry/Exit Door Frame, Wooden Door Leaf & Gold Door Handle
      const doorFrameGeo = new THREE.BoxGeometry(4.8, 6.2, 1.2);
      const doorFrameMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
      doorFrame.position.set(0, 3.1, 16.8);
      compoundGroup.add(doorFrame);

      const portalGlowGeo = new THREE.BoxGeometry(4.1, 5.6, 1.25);
      const portalGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const portalGlow = new THREE.Mesh(portalGlowGeo, portalGlowMat);
      portalGlow.position.set(0, 2.9, 16.8);
      compoundGroup.add(portalGlow);

      const woodDoorGeo = new THREE.BoxGeometry(3.4, 5.1, 1.32);
      const woodDoorMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const woodDoor = new THREE.Mesh(woodDoorGeo, woodDoorMat);
      woodDoor.position.set(0, 2.65, 16.8);
      compoundGroup.add(woodDoor);

      const handleGeo = new THREE.SphereGeometry(0.28, 10, 10);
      const handleMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const doorHandle = new THREE.Mesh(handleGeo, handleMat);
      doorHandle.position.set(1.15, 2.6, 16.05);
      compoundGroup.add(doorHandle);

      // 4. Giant Rotating 3D Emerald Diamond Marker Above Safehouse
      const diamondGeo = new THREE.OctahedronGeometry(4.2, 0);
      const diamondMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.set(0, 24, 16);
      compoundGroup.add(diamond);
      this.safehouseDiamonds.push(diamond);

      compoundGroup.position.set(prop.spawnCoords.x, 0, prop.spawnCoords.y);
      this.safehouseDoorGroup.add(compoundGroup);
    });
  }

  // ============================================================================
  // 3D TOWN CONVENIENCE SHOP & SHOPKEEPER NPC ("24/7 CONVENIENCE MART — GUS")
  // Sells Everything Except Drugs: Soil, Fertilizer, Packaging, Cutting & Lab Gear
  // ============================================================================
  private buildConvenienceShop() {
    while (this.convenienceShopGroup.children.length > 0) {
      this.convenienceShopGroup.remove(this.convenienceShopGroup.children[0]);
    }

    const shopRoot = new THREE.Group();

    // 1. Glowing Amber/Emerald Customer Welcome Pad on Sidewalk
    const padRing = new THREE.Mesh(
      new THREE.RingGeometry(6.5, 9.2, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      })
    );
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.set(6, 0.09, 0);
    shopRoot.add(padRing);

    const padDisc = new THREE.Mesh(
      new THREE.CircleGeometry(6.4, 24),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.35
      })
    );
    padDisc.rotation.x = -Math.PI / 2;
    padDisc.position.set(6, 0.08, 0);
    shopRoot.add(padDisc);

    // 2. Sky-Reaching Amber Convenience Mart Beacon Beam
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 180, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide
      })
    );
    beam.position.set(0, 90, 0);
    shopRoot.add(beam);

    // 3. 3D Convenience Store Kiosk / Storefront Pavilion (Facing East Road x=480)
    const kioskBase = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 7.2, 14.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 })
    );
    kioskBase.position.set(-3.2, 3.6, 0);
    kioskBase.castShadow = true;
    kioskBase.receiveShadow = true;
    shopRoot.add(kioskBase);

    // Striped Green & Amber Convenience Store Awning Roof
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 1.1, 15.2),
      new THREE.MeshStandardMaterial({
        color: 0x059669,
        emissive: 0x064e3b,
        emissiveIntensity: 0.4,
        roughness: 0.4
      })
    );
    awning.position.set(-2.0, 7.5, 0);
    shopRoot.add(awning);

    const awningTrim = new THREE.Mesh(
      new THREE.BoxGeometry(10.7, 0.4, 15.4),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    awningTrim.position.set(-2.0, 7.0, 0);
    shopRoot.add(awningTrim);

    // Rooftop Neon Signboard ("24/7 CONVENIENCE MART")
    const neonBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 2.4, 13.5),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    neonBoard.position.set(2.4, 9.2, 0);
    shopRoot.add(neonBoard);

    // Rotating Golden Diamond Beacon Above Convenience Mart
    const shopDiamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(3.2, 0),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    shopDiamond.position.set(1.5, 18.0, 0);
    shopRoot.add(shopDiamond);
    this.shopBeaconMesh = shopDiamond;

    // 4. Front Service Counter, Cash Register, Digital Scale & Stocked Supply Shelves
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.15, 9.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.5 })
    );
    counter.position.set(1.8, 0.58, 0);
    counter.castShadow = true;
    shopRoot.add(counter);

    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.14, 9.8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.25, metalness: 0.4 })
    );
    counterTop.position.set(1.8, 1.2, 0);
    shopRoot.add(counterTop);

    // Cash Register on Counter
    const cashReg = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.25 })
    );
    cashReg.position.set(1.8, 1.55, -2.6);
    shopRoot.add(cashReg);

    // Packaging Scale & Baggie Box Prop on Counter
    const scaleProp = buildDigitalScaleAndBaggiesProp();
    scaleProp.position.set(1.8, 1.27, 2.2);
    scaleProp.rotation.y = Math.PI / 2;
    shopRoot.add(scaleProp);

    // Stacked Organic Potting Soil Sacks & NPK Fertilizer Jugs Beside Counter
    const soilColors = [0x78350f, 0x10b981, 0x0284c7, 0xf59e0b];
    for (let s = 0; s < 4; s++) {
      const sack = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.55, 1.5),
        new THREE.MeshStandardMaterial({ color: soilColors[s % soilColors.length], roughness: 0.7 })
      );
      sack.position.set(2.2, 0.3 + s * 0.55, -5.6);
      shopRoot.add(sack);
    }

    // Sample Hydro Grow Bucket on Display
    const { bucketGroup } = buildHydroponicGrowBucket();
    bucketGroup.position.set(2.2, 0.05, 5.6);
    shopRoot.add(bucketGroup);

    // Warm Storefront Light
    const shopLight = new THREE.PointLight(0xffedd5, 1.5, 28, 1.6);
    shopLight.position.set(3.5, 5.8, 0);
    shopRoot.add(shopLight);

    // 5. 3D SHOPKEEPER NPC ("Gus — Convenience Mart Shopkeeper") Standing Behind Counter
    const clerk = buildStreetHustlerCharacter({
      hoodieColor: 0x059669, // Emerald Mart Clerk Uniform/Apron
      pantsColor: 0x1e293b,
      skinColor: 0xe0ac69
    });
    clerk.group.scale.set(1.38, 1.38, 1.38);
    clerk.group.position.set(-0.2, 0, 0);
    // Face East (+X toward street & customers)
    clerk.group.rotation.y = Math.PI / 2;
    shopRoot.add(clerk.group);
    this.shopkeeperGroup = clerk.group;
    this.shopkeeperRightArm = clerk.rightArm;

    shopRoot.position.set(CONVENIENCE_SHOP_COORDS.x, 0, CONVENIENCE_SHOP_COORDS.y);
    this.convenienceShopGroup.add(shopRoot);
  }

  public updateSafehouseBeacons(time: number) {
    this.safehouseDiamonds.forEach((d, idx) => {
      d.rotation.y = time * 0.0025 + idx;
      d.position.y = 24 + Math.sin(time * 0.004 + idx) * 1.5;
    });
    if (this.shopBeaconMesh) {
      this.shopBeaconMesh.rotation.y = time * 0.003;
      this.shopBeaconMesh.position.y = 18.0 + Math.sin(time * 0.005) * 1.2;
    }
    if (this.shopkeeperRightArm) {
      // Friendly shopkeeper wave animation
      this.shopkeeperRightArm.rotation.x = -0.65 + Math.sin(time * 0.006) * 0.35;
    }
    if (this.shopkeeperGroup) {
      this.shopkeeperGroup.position.y = Math.abs(Math.sin(time * 0.003)) * 0.05;
    }
  }

  // ============================================================================
  // WALKABLE 3D SAFEHOUSE INTERIOR BUILDER (WITH PBR PLASTER WALLS, MYLAR FOIL,
  // FRACTIONAL DISTILLATION RIG, HYDROPONIC GROW BUCKETS, STEEL VAULT & SCALE)
  // ============================================================================
  public buildSafehouseInterior(
    propertyId: string,
    potCount: number,
    storeLevel: number = 1
  ): InteriorStationsLayout {
    if (
      this.currentInteriorPropId === propertyId &&
      this.currentInteriorPotCount === potCount &&
      this.currentInteriorStoreLevel === storeLevel
    ) {
      return this.currentInteriorLayout;
    }
    this.currentInteriorPropId = propertyId;
    this.currentInteriorPotCount = potCount;
    this.currentInteriorStoreLevel = storeLevel;

    while (this.interiorGroup.children.length > 0) {
      this.interiorGroup.remove(this.interiorGroup.children[0]);
    }
    this.interiorPotPlants = [];

    let roomW = 28;
    let roomD = 22;
    let wallH = 6.8;
    let floorColor = 0x262e3d;
    let wallColor = 0x8c8574; // Faded dingy motel plaster default
    let trimColor = 0x0d9488;
    let ceilingColor = 0x1e293b;

    if (propertyId === 'docks') {
      roomW = 34;
      roomD = 24;
      wallH = 8.5;
      floorColor = 0x1e293b;
      wallColor = 0x7c2d12;
      trimColor = 0x0284c7;
      ceilingColor = 0x0f172a;
    } else if (propertyId === 'rv') {
      roomW = 32;
      roomD = 22;
      wallH = 6.8;
      floorColor = 0x27272a;
      wallColor = 0x78350f;
      trimColor = 0xf59e0b;
      ceilingColor = 0x18181b;
    } else if (propertyId === 'club_safehouse') {
      roomW = 40;
      roomD = 28;
      wallH = 8.2;
      floorColor = 0x0f172a;
      wallColor = 0x2e1065;
      trimColor = 0xec4899;
      ceilingColor = 0x090d16;
    } else if (propertyId === 'villa') {
      roomW = 46;
      roomD = 32;
      wallH = 9.5;
      floorColor = 0x1c1917;
      wallColor = 0x064e3b;
      trimColor = 0xeab308;
      ceilingColor = 0x0c0a09;
    }

    const halfW = roomW / 2;
    const halfD = roomD / 2;
    const cx = INTERIOR_CENTER_X;
    const cz = INTERIOR_CENTER_Z;

    // 0. Cold Fluorescent Motel / Safehouse Interior Lighting (#d4f1f4, intensity 1.4)
    const fluorescentLight = new THREE.PointLight(0xd4f1f4, 1.4, roomW * 1.4, 1.5);
    fluorescentLight.position.set(cx, wallH - 0.6, cz);
    this.interiorGroup.add(fluorescentLight);

    // 1. Floor & Luxury Center Area Rug (PBR)
    const asphaltPBR = getWetAsphaltPBR(8, 6);
    const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.55,
      metalness: 0.12,
      normalMap: asphaltPBR.normalMap,
      normalScale: new THREE.Vector2(0.3, 0.3)
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0.05, cz);
    floor.receiveShadow = true;
    this.interiorGroup.add(floor);

    const rugBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(roomW * 0.44, roomD * 0.42),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6, metalness: 0.3 })
    );
    rugBorder.rotation.x = -Math.PI / 2;
    rugBorder.position.set(cx, 0.07, cz - 0.5);
    this.interiorGroup.add(rugBorder);

    const rugGeo = new THREE.PlaneGeometry(roomW * 0.42, roomD * 0.40);
    const rugMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.85 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(cx, 0.08, cz - 0.5);
    this.interiorGroup.add(rug);

    // 2. Ceiling & Overhead Cold Fluorescent Light Tubes (#d4f1f4)
    const ceilGeo = new THREE.PlaneGeometry(roomW, roomD);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: ceilingColor,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(cx, wallH, cz);
    this.interiorGroup.add(ceiling);

    const panelMat = new THREE.MeshBasicMaterial({ color: 0xd4f1f4 });
    [-roomW * 0.25, 0, roomW * 0.25].forEach(ox => {
      const panelGeo = new THREE.BoxGeometry(3.4, 0.15, 1.5);
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(cx + ox, wallH - 0.1, cz);
      this.interiorGroup.add(panel);
    });

    // 3. Perimeter Walls with Seamless Peeling Plaster / Industrial PBR Textures
    const plasterPBR = createPlasterWallPBR(wallColor, 6, 2);
    const wallMat = new THREE.MeshStandardMaterial({
      map: plasterPBR.map,
      normalMap: plasterPBR.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: plasterPBR.roughnessMap,
      roughness: 0.82,
      metalness: 0.05
    });
    const accentMat = new THREE.MeshBasicMaterial({ color: trimColor });

    const wallN = new THREE.Mesh(new THREE.BoxGeometry(roomW, wallH, 0.6), wallMat);
    wallN.position.set(cx, wallH / 2, cz - halfD);
    wallN.receiveShadow = true;
    this.interiorGroup.add(wallN);

    const wallS = new THREE.Mesh(new THREE.BoxGeometry(roomW, wallH, 0.6), wallMat);
    wallS.position.set(cx, wallH / 2, cz + halfD);
    wallS.receiveShadow = true;
    this.interiorGroup.add(wallS);

    const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallH, roomD), wallMat);
    wallW.position.set(cx - halfW, wallH / 2, cz);
    wallW.receiveShadow = true;
    this.interiorGroup.add(wallW);

    const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallH, roomD), wallMat);
    wallE.position.set(cx + halfW, wallH / 2, cz);
    wallE.receiveShadow = true;
    this.interiorGroup.add(wallE);

    const stripN = new THREE.Mesh(new THREE.BoxGeometry(roomW - 1, 0.22, 0.7), accentMat);
    stripN.position.set(cx, wallH * 0.72, cz - halfD);
    this.interiorGroup.add(stripN);

    // Framed Wall Art on North Wall
    [-4.5, 4.5].forEach((ox, idx) => {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 2.0, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.75, roughness: 0.3 })
      );
      frame.position.set(cx + ox, wallH * 0.52, cz - halfD + 0.35);
      this.interiorGroup.add(frame);

      const canvas = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.6, 0.22),
        new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x06b6d4 : 0xec4899 })
      );
      canvas.position.set(cx + ox, wallH * 0.52, cz - halfD + 0.36);
      this.interiorGroup.add(canvas);
    });

    // ==========================================================================
    // 4. DETAILED 3D SAFEHOUSE ENTRY / EXIT DOOR (SOUTH WALL CENTER)
    // ==========================================================================
    const exitDoorPos = { x: cx, z: cz + halfD - 1.4 };
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 4.6, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.6 })
    );
    doorFrame.position.set(cx, 2.3, cz + halfD - 0.2);
    this.interiorGroup.add(doorFrame);

    const doorNeonTrim = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 4.2, 0.85),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    doorNeonTrim.position.set(cx, 2.15, cz + halfD - 0.2);
    this.interiorGroup.add(doorNeonTrim);

    const doorPanel = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 3.8, 0.92),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 })
    );
    doorPanel.position.set(cx, 1.95, cz + halfD - 0.2);
    this.interiorGroup.add(doorPanel);

    const doorWin = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.1, 0.98),
      new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        transmission: 0.85,
        roughness: 0.08,
        ior: 1.5,
        transparent: true
      })
    );
    doorWin.position.set(cx, 2.95, cz + halfD - 0.2);
    this.interiorGroup.add(doorWin);

    const doorKnob = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 })
    );
    doorKnob.position.set(cx + 0.95, 1.85, cz + halfD - 0.72);
    this.interiorGroup.add(doorKnob);

    const exitSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.55, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    exitSign.position.set(cx, 4.9, cz + halfD - 0.35);
    this.interiorGroup.add(exitSign);

    const welcomeMat = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.9 })
    );
    welcomeMat.rotation.x = -Math.PI / 2;
    welcomeMat.position.set(cx, 0.09, cz + halfD - 1.6);
    this.interiorGroup.add(welcomeMat);

    // ==========================================================================
    // 5. CULTIVATION GROW STATION: REFLECTIVE DIAMOND MYLAR FOIL BACKDROP +
    //    HYDROPONIC GROW BUCKETS WITH IRRIGATION TUBES, TRICHOMES & PISTILS
    // ==========================================================================
    const growStationPos = { x: cx - halfW + 4.5, z: cz - halfD + 4.2 };
    const totalPotsToRender = Math.max(2, Math.min(24, potCount));
    const cols = Math.min(6, Math.ceil(Math.sqrt(totalPotsToRender * 1.5)));
    const rows = Math.ceil(totalPotsToRender / cols);

    // Reflective Diamond-Embossed Silver Mylar Foil Grow-Tent Backdrop (North & West Corner Lining)
    const mylarPBR = getMylarFoilPBR(4, 2);
    const mylarMat = new THREE.MeshStandardMaterial({
      map: mylarPBR.map,
      normalMap: mylarPBR.normalMap,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: mylarPBR.roughnessMap,
      metalness: 0.88,
      roughness: 0.22
    });

    const mylarWidth = Math.max(5.5, cols * 1.95 + 1.4);
    const mylarDepth = Math.max(4.5, rows * 1.95 + 1.4);

    const mylarBackWall = new THREE.Mesh(new THREE.BoxGeometry(mylarWidth, 4.6, 0.12), mylarMat);
    mylarBackWall.position.set(growStationPos.x + (cols - 1) * 0.9, 2.35, cz - halfD + 0.42);
    this.interiorGroup.add(mylarBackWall);

    const mylarSideWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.6, mylarDepth), mylarMat);
    mylarSideWall.position.set(cx - halfW + 0.42, 2.35, growStationPos.z + (rows - 1) * 0.85);
    this.interiorGroup.add(mylarSideWall);

    // Full-Spectrum Horticulture LED Grow Light Bar + Purple/Magenta PointLight Tint
    const uvBarGeo = new THREE.BoxGeometry(cols * 2.0, 0.24, 1.4);
    const uvBarMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xc026d3,
      emissiveIntensity: 0.9,
      metalness: 0.7,
      roughness: 0.25
    });
    const uvBar = new THREE.Mesh(uvBarGeo, uvBarMat);
    uvBar.position.set(growStationPos.x + (cols - 1) * 0.9, 4.15, growStationPos.z);
    this.interiorGroup.add(uvBar);

    const growLight = new THREE.PointLight(0xd946ef, 1.15, 11, 1.8);
    growLight.position.set(growStationPos.x + (cols - 1) * 0.9, 3.85, growStationPos.z);
    this.interiorGroup.add(growLight);

    // Hydroponic Grow Buckets with White Nutrient Irrigation Tubes & Bushy Cannabis Plants
    for (let i = 0; i < totalPotsToRender; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const px = growStationPos.x + c * 1.85;
      const pz = growStationPos.z + r * 1.85;

      const { bucketGroup, plantGroup, budMeshes } = buildHydroponicGrowBucket();
      bucketGroup.position.set(px, 0.05, pz);
      this.interiorGroup.add(bucketGroup);
      this.interiorPotPlants.push({ plantGroup, budMeshes });
    }

    // ==========================================================================
    // 6. CHEMISTRY LAB FRACTIONAL DISTILLATION GLASSWARE RIG (NORTH-EAST CORNER)
    // ==========================================================================
    const labStationPos = { x: cx + halfW - 4.8, z: cz - halfD + 4.2 };
    const distillationRig = buildFractionalDistillationRig();
    distillationRig.position.set(labStationPos.x, 0.05, labStationPos.z);
    this.interiorGroup.add(distillationRig);

    // ==========================================================================
    // 7. PACKAGING BENCH: DIGITAL MICRO-GRAM POCKET SCALE ("0.00g") & BAGGIES
    // ==========================================================================
    const packStationPos = { x: cx + halfW - 4.8, z: cz + halfD - 5.2 };
    const packTable = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.05, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65, metalness: 0.1 })
    );
    packTable.position.set(packStationPos.x, 0.52, packStationPos.z);
    packTable.castShadow = true;
    packTable.receiveShadow = true;
    this.interiorGroup.add(packTable);

    const scaleAndBaggies = buildDigitalScaleAndBaggiesProp();
    scaleAndBaggies.position.set(packStationPos.x, 1.05, packStationPos.z);
    this.interiorGroup.add(scaleAndBaggies);

    // ==========================================================================
    // 8. UPGRADABLE 3D SAFEHOUSE STORE & REINFORCED STEEL SAFE VAULT (WEST WALL)
    // ==========================================================================
    const storeStationPos = { x: cx - halfW + 4.2, z: cz - 0.2 };

    const storeCounter = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.1, 4.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.5 })
    );
    storeCounter.position.set(storeStationPos.x - 0.8, 0.55, storeStationPos.z);
    storeCounter.castShadow = true;
    this.interiorGroup.add(storeCounter);

    // Tempered Glass Display Countertop
    const counterGlass = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.14, 4.9),
      new THREE.MeshPhysicalMaterial({
        color: storeLevel >= 3 ? 0xfbbf24 : 0x38bdf8,
        transmission: 0.82,
        roughness: 0.06,
        ior: 1.5,
        transparent: true
      })
    );
    counterGlass.position.set(storeStationPos.x - 0.8, 1.15, storeStationPos.z);
    this.interiorGroup.add(counterGlass);

    // Cash Register Terminal
    const registerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.55, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.3 })
    );
    registerBody.position.set(storeStationPos.x - 0.6, 1.48, storeStationPos.z - 1.3);
    this.interiorGroup.add(registerBody);

    const registerScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.42, 0.65),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    registerScreen.position.set(storeStationPos.x - 0.2, 1.62, storeStationPos.z - 1.3);
    this.interiorGroup.add(registerScreen);

    // Multi-Tier Supply Shelving Behind Store Counter (Scales with Store Level 1..4)
    const shelfCount = Math.min(4, Math.max(1, storeLevel));
    for (let s = 0; s < shelfCount; s++) {
      const shelfY = 1.2 + s * 1.05;
      const shelfPlank = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.14, 4.6),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.3 })
      );
      shelfPlank.position.set(cx - halfW + 0.8, shelfY, storeStationPos.z);
      this.interiorGroup.add(shelfPlank);

      for (let b = -1.6; b <= 1.6; b += 0.8) {
        const itemBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.48, 0.52, 0.48),
          new THREE.MeshStandardMaterial({
            color: s === 0 ? 0x10b981 : s === 1 ? 0x38bdf8 : s === 2 ? 0xa855f7 : 0xfbbf24,
            roughness: 0.4,
            metalness: 0.2
          })
        );
        itemBox.position.set(cx - halfW + 0.85, shelfY + 0.34, storeStationPos.z + b);
        this.interiorGroup.add(itemBox);
      }
    }

    // 1C. Heavy-Duty Industrial Reinforced Steel Safe Vault (Combination Dial, Keypad & Hinges)
    const reinforcedSafe = buildReinforcedSteelSafeVault();
    reinforcedSafe.position.set(storeStationPos.x - 1.1, 0.05, storeStationPos.z + 3.4);
    this.interiorGroup.add(reinforcedSafe);

    // ==========================================================================
    // 9. PARTNER COMMISSION DESK (EAST WALL CENTER)
    // ==========================================================================
    const partnerDeskPos = { x: cx + halfW - 4.5, z: cz - 0.2 };
    const partnerDesk = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.05, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.55, metalness: 0.2 })
    );
    partnerDesk.position.set(partnerDeskPos.x, 0.52, partnerDeskPos.z);
    partnerDesk.castShadow = true;
    this.interiorGroup.add(partnerDesk);

    const partnerChair = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.4, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.65 })
    );
    partnerChair.position.set(partnerDeskPos.x + 1.4, 0.7, partnerDeskPos.z);
    this.interiorGroup.add(partnerChair);

    // ==========================================================================
    // 10. DETAILED 3D SAFEHOUSE BED, PILLOWS, BLANKET & NIGHTSTAND (SOUTH-WEST)
    // ==========================================================================
    const bedPos = { x: cx - halfW + 4.4, z: cz + halfD - 4.4 };

    const bedRug = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    bedRug.rotation.x = -Math.PI / 2;
    bedRug.position.set(bedPos.x, 0.08, bedPos.z);
    this.interiorGroup.add(bedRug);

    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.55, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
    );
    bedFrame.position.set(bedPos.x, 0.3, bedPos.z);
    bedFrame.castShadow = true;
    this.interiorGroup.add(bedFrame);

    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 2.2, 3.3),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.75 })
    );
    headboard.position.set(bedPos.x - 2.05, 1.15, bedPos.z);
    this.interiorGroup.add(headboard);

    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 0.42, 2.95),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 })
    );
    mattress.position.set(bedPos.x + 0.05, 0.72, bedPos.z);
    this.interiorGroup.add(mattress);

    const duvet = new THREE.Mesh(
      new THREE.BoxGeometry(2.85, 0.46, 3.02),
      new THREE.MeshStandardMaterial({
        color: propertyId === 'club_safehouse' ? 0xdb2777 : propertyId === 'villa' ? 0x10b981 : 0x0284c7,
        roughness: 0.8
      })
    );
    duvet.position.set(bedPos.x + 0.65, 0.74, bedPos.z);
    this.interiorGroup.add(duvet);

    [-0.75, 0.75].forEach(pzOffset => {
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.26, 1.15),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
      );
      pillow.position.set(bedPos.x - 1.25, 1.02, bedPos.z + pzOffset);
      this.interiorGroup.add(pillow);
    });

    const nightstand = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.95, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 })
    );
    nightstand.position.set(bedPos.x - 1.6, 0.48, bedPos.z - 2.3);
    this.interiorGroup.add(nightstand);

    const lampStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.22, 0.55, 10),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
    );
    lampStand.position.set(bedPos.x - 1.6, 1.2, bedPos.z - 2.3);
    this.interiorGroup.add(lampStand);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 0.55, 12),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    lampShade.position.set(bedPos.x - 1.6, 1.55, bedPos.z - 2.3);
    this.interiorGroup.add(lampShade);

    const bedLampLight = new THREE.PointLight(0xffaa33, 0.85, 9, 2.0);
    bedLampLight.position.set(bedPos.x - 1.6, 1.75, bedPos.z - 2.3);
    this.interiorGroup.add(bedLampLight);

    // ==========================================================================
    // 11. CENTER LOUNGE SOFA, COFFEE TABLE, LAPTOP, CASH STACKS & FLATSCREEN TV
    // ==========================================================================
    const sofaBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.65, 1.65),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78 })
    );
    sofaBase.position.set(cx, 0.35, cz + 1.2);
    this.interiorGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 1.35, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.78 })
    );
    sofaBack.position.set(cx, 0.72, cz + 1.85);
    this.interiorGroup.add(sofaBack);

    const coffeeTable = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.55, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.25, metalness: 0.4 })
    );
    coffeeTable.position.set(cx, 0.28, cz - 0.8);
    this.interiorGroup.add(coffeeTable);

    const laptopBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.06, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
    );
    laptopBase.position.set(cx - 0.6, 0.6, cz - 0.8);
    this.interiorGroup.add(laptopBase);

    const laptopScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.48, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    laptopScreen.position.set(cx - 0.6, 0.84, cz - 1.05);
    this.interiorGroup.add(laptopScreen);

    [0.35, 0.85].forEach(ox => {
      const cashBundle = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.18, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.65 })
      );
      cashBundle.position.set(cx + ox, 0.64, cz - 0.75);
      this.interiorGroup.add(cashBundle);
    });

    const tvStand = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.75, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.3 })
    );
    tvStand.position.set(cx, 0.38, cz - 3.2);
    this.interiorGroup.add(tvStand);

    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.85, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    tvScreen.position.set(cx, 1.72, cz - 3.2);
    this.interiorGroup.add(tvScreen);

    if (propertyId === 'docks' || propertyId === 'club_safehouse' || propertyId === 'villa') {
      const pillarColor = propertyId === 'villa' ? 0xeab308 : (propertyId === 'club_safehouse' ? 0xec4899 : 0x475569);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: pillarColor,
        metalness: 0.65,
        roughness: 0.32
      });
      [
        [cx - halfW * 0.45, cz - halfD * 0.45],
        [cx + halfW * 0.45, cz - halfD * 0.45],
        [cx - halfW * 0.45, cz + halfD * 0.45],
        [cx + halfW * 0.45, cz + halfD * 0.45]
      ].forEach(([px, pz]) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, wallH, 16), pillarMat);
        col.position.set(px, wallH / 2, pz);
        this.interiorGroup.add(col);
      });
    }

    this.currentInteriorLayout = {
      roomHalfW: halfW - 1.2,
      roomHalfD: halfD - 1.2,
      spawnPos: { x: cx, z: cz + halfD - 3.2 },
      exitDoorPos,
      growStationPos,
      labStationPos,
      packStationPos,
      partnerDeskPos,
      storeStationPos,
      bedPos
    };

    return this.currentInteriorLayout;
  }

  public updateInteriorPots(pots: Pot[], time: number) {
    this.interiorPotPlants.forEach((potEntry, idx) => {
      const pot = pots[idx];
      if (!pot || pot.stage === 'empty') {
        potEntry.plantGroup.visible = false;
        return;
      }
      potEntry.plantGroup.visible = true;
      const scale = Math.max(0.28, (pot.progress || 10) / 100);
      potEntry.plantGroup.scale.set(scale, scale, scale);
      potEntry.plantGroup.rotation.y = Math.sin(time * 0.002 + idx) * 0.14;

      potEntry.budMeshes.forEach(bud => {
        if (bud.material instanceof THREE.MeshStandardMaterial) {
          if (pot.ready) {
            bud.material.color.setHex(0x6ee7b7); // Frosty trichome-coated ready buds
            bud.material.roughness = 0.22;
            bud.material.metalness = 0.35;
          } else if (pot.stage === 'flowering') {
            bud.material.color.setHex(0x34d399);
            bud.material.roughness = 0.3;
          } else {
            bud.material.color.setHex(0x15803d);
            bud.material.roughness = 0.55;
          }
        }
      });
    });
  }

  private buildPayNSprays(garages: PayNSpray[]) {
    garages.forEach(g => {
      const bayGroup = new THREE.Group();

      const padGeo = new THREE.RingGeometry(8, 12, 24);
      const padMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = 0.08;
      bayGroup.add(pad);

      const pillarGeo = new THREE.BoxGeometry(2.2, 11, 2.2);
      const pillarMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const pL = new THREE.Mesh(pillarGeo, pillarMat);
      pL.position.set(-9, 5.5, 0);
      bayGroup.add(pL);

      const pR = new THREE.Mesh(pillarGeo, pillarMat);
      pR.position.set(9, 5.5, 0);
      bayGroup.add(pR);

      const archGeo = new THREE.BoxGeometry(21, 2.2, 3.2);
      const archMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(0, 11.5, 0);
      bayGroup.add(arch);

      bayGroup.position.set(g.x, 0, g.y);
      this.payNSprayGroup.add(bayGroup);
    });
  }

  // ============================================================================
  // 3. WARM SODIUM-VAPOR STREETLIGHTS (#ff9933, decay 2.0, with subtle light cones)
  // ============================================================================
  private buildStreetlights() {
    const intersectionsX = [80, 480, 880, 1280, 1680, 2080, 2480];
    const intersectionsY = [80, 380, 680, 980, 1280, 1580];

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.28
    });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const poolMat = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const postGeo = new THREE.CylinderGeometry(0.24, 0.36, 9.5, 6);
    const armGeo = new THREE.BoxGeometry(2.4, 0.18, 0.22);
    const bulbGeo = new THREE.SphereGeometry(0.55, 8, 8);
    const coneGeo = new THREE.ConeGeometry(7.5, 9.1, 10, 1, true);
    const poolGeo = new THREE.CircleGeometry(10.5, 16);

    this.sodiumLightCones = [];
    this.sodiumPointLights = [];

    intersectionsX.forEach(rx => {
      intersectionsY.forEach(ry => {
        const px = rx + 24;
        const pz = ry + 24;

        const post = new THREE.Mesh(postGeo, poleMat);
        post.position.set(px, 4.75, pz);
        this.streetlightGroup.add(post);

        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(px - 1.0, 9.4, pz);
        this.streetlightGroup.add(arm);

        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(px - 1.9, 9.15, pz);
        this.streetlightGroup.add(bulb);

        // Volumetric Sodium-Vapor Light Cone + Ground Light Pool (Zero shader PointLight overhead!)
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(px - 1.9, 4.55, pz);
        this.streetlightGroup.add(cone);
        this.sodiumLightCones.push(cone);

        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(px - 1.9, 0.06, pz);
        this.streetlightGroup.add(pool);
        this.sodiumLightCones.push(pool);
      });
    });
  }

  private buildDropBeacon() {
    const cylinderGeo = new THREE.CylinderGeometry(5, 5, 300, 16, 1, true);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.position.y = 150;
    this.dropBeacon.add(cylinder);

    const ringGeo = new THREE.TorusGeometry(8, 0.8, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 5;
    this.dropBeacon.add(ring);

    this.dropBeacon.visible = false;
  }

  private buildGpsArrow() {
    this.gpsArrowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const shaftGeo = new THREE.BoxGeometry(1.6, 0.28, 0.55);
    const shaft = new THREE.Mesh(shaftGeo, this.gpsArrowMat);
    shaft.position.set(-0.4, 0, 0);
    this.gpsArrowGroup.add(shaft);

    const headGeo = new THREE.ConeGeometry(0.8, 1.4, 8);
    const head = new THREE.Mesh(headGeo, this.gpsArrowMat);
    head.rotation.z = -Math.PI / 2;
    head.position.set(0.9, 0, 0);
    this.gpsArrowGroup.add(head);

    this.gpsArrowGroup.visible = false;
  }

  public updateGpsArrow(
    playerX: number,
    playerY: number,
    targetCoords: { x: number; y: number } | null,
    isPursuitTarget: boolean,
    time: number
  ) {
    if (!targetCoords) {
      this.gpsArrowGroup.visible = false;
      return;
    }

    const dx = targetCoords.x - playerX;
    const dy = targetCoords.y - playerY;
    const dist = Math.hypot(dx, dy);

    if (dist < 18) {
      this.gpsArrowGroup.visible = false;
      return;
    }

    this.gpsArrowGroup.visible = true;
    const bob = Math.sin(time * 0.006) * 0.25;
    this.gpsArrowGroup.position.set(playerX, 3.6 + bob, playerY);

    const targetAngle = Math.atan2(dy, dx);
    this.gpsArrowGroup.rotation.y = -targetAngle;

    this.gpsArrowMat.color.setHex(isPursuitTarget ? 0x10b981 : 0xfbbf24);
  }

  // ============================================================================
  // 3. SMOOTH DAY / SUNSET / NIGHT ATMOSPHERIC LIGHTING & FOG TRANSITIONS
  // ============================================================================
  public updateTimeOfDaySmooth(
    hour: number,
    modeSetting: 'auto' | 'day' | 'sunset' | 'night',
    isInside: boolean,
    dt: number
  ) {
    // Define keyframe palettes for Day, Sunset, and Night
    const dayTheme = {
      bg: new THREE.Color(0x6495ed),
      fogColor: new THREE.Color(0x94b8d8),
      fogDensity: 0.0013,
      ambColor: new THREE.Color(0xdbeafe),
      ambInt: 0.52,
      hemiSky: new THREE.Color(0xffffff),
      hemiGround: new THREE.Color(0x1e293b),
      hemiInt: 0.78,
      sunColor: new THREE.Color(0xfffbeb),
      sunInt: 1.45,
      fillColor: new THREE.Color(0x93c5fd),
      fillInt: 0.38,
      sodiumInt: 0.15,
      coneOpacity: 0.0
    };

    const sunsetTheme = {
      bg: new THREE.Color(0x3b1d38),
      fogColor: new THREE.Color(0x4a2038),
      fogDensity: 0.0017,
      ambColor: new THREE.Color(0xfdba74),
      ambInt: 0.38,
      hemiSky: new THREE.Color(0xf97316),
      hemiGround: new THREE.Color(0x0f172a),
      hemiInt: 0.65,
      sunColor: new THREE.Color(0xff7733),
      sunInt: 1.35,
      fillColor: new THREE.Color(0xc026d3),
      fillInt: 0.42,
      sodiumInt: 1.15,
      coneOpacity: 0.11
    };

    const nightTheme = {
      bg: new THREE.Color(0x060913),
      fogColor: new THREE.Color(0x0a0e1a),
      fogDensity: 0.0021,
      ambColor: new THREE.Color(0x0a0e1a),
      ambInt: 0.25,
      hemiSky: new THREE.Color(0x38bdf8),
      hemiGround: new THREE.Color(0x020617),
      hemiInt: 0.45,
      sunColor: new THREE.Color(0x60a5fa),
      sunInt: 0.55,
      fillColor: new THREE.Color(0xff9933),
      fillInt: 0.35,
      sodiumInt: 1.65,
      coneOpacity: 0.16
    };

    const blendThemes = (a: typeof dayTheme, b: typeof dayTheme, t: number) => {
      const clamped = Math.max(0, Math.min(1, t));
      return {
        bg: a.bg.clone().lerp(b.bg, clamped),
        fogColor: a.fogColor.clone().lerp(b.fogColor, clamped),
        fogDensity: a.fogDensity + (b.fogDensity - a.fogDensity) * clamped,
        ambColor: a.ambColor.clone().lerp(b.ambColor, clamped),
        ambInt: a.ambInt + (b.ambInt - a.ambInt) * clamped,
        hemiSky: a.hemiSky.clone().lerp(b.hemiSky, clamped),
        hemiGround: a.hemiGround.clone().lerp(b.hemiGround, clamped),
        hemiInt: a.hemiInt + (b.hemiInt - a.hemiInt) * clamped,
        sunColor: a.sunColor.clone().lerp(b.sunColor, clamped),
        sunInt: a.sunInt + (b.sunInt - a.sunInt) * clamped,
        fillColor: a.fillColor.clone().lerp(b.fillColor, clamped),
        fillInt: a.fillInt + (b.fillInt - a.fillInt) * clamped,
        sodiumInt: a.sodiumInt + (b.sodiumInt - a.sodiumInt) * clamped,
        coneOpacity: a.coneOpacity + (b.coneOpacity - a.coneOpacity) * clamped
      };
    };

    let target = dayTheme;
    if (isInside || modeSetting === 'day') {
      target = dayTheme;
    } else if (modeSetting === 'sunset') {
      target = sunsetTheme;
    } else if (modeSetting === 'night') {
      target = nightTheme;
    } else {
      // Smooth continuous 24-hour cycle interpolation
      const h = ((hour % 24) + 24) % 24;
      if (h >= 5 && h < 8) {
        // Dawn: Night -> Sunset -> Day
        const t = (h - 5) / 3;
        target = t < 0.5
          ? blendThemes(nightTheme, sunsetTheme, t * 2)
          : blendThemes(sunsetTheme, dayTheme, (t - 0.5) * 2);
      } else if (h >= 8 && h < 17) {
        target = dayTheme;
      } else if (h >= 17 && h < 19.5) {
        // Golden Hour: Day -> Sunset
        target = blendThemes(dayTheme, sunsetTheme, (h - 17) / 2.5);
      } else if (h >= 19.5 && h < 22) {
        // Dusk: Sunset -> Night
        target = blendThemes(sunsetTheme, nightTheme, (h - 19.5) / 2.5);
      } else {
        target = nightTheme;
      }
    }

    // Smoothly damp current scene colors & intensities toward target every frame
    const lerpFactor = Math.min(1.0, dt * 1.8);

    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.lerp(target.bg, lerpFactor);
    } else {
      this.scene.background = target.bg.clone();
    }

    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.lerp(target.fogColor, lerpFactor);
      this.scene.fog.density += (target.fogDensity - this.scene.fog.density) * lerpFactor;
    }

    this.ambLight.color.lerp(target.ambColor, lerpFactor);
    this.ambLight.intensity += (target.ambInt - this.ambLight.intensity) * lerpFactor;

    this.hemiLight.color.lerp(target.hemiSky, lerpFactor);
    this.hemiLight.groundColor.lerp(target.hemiGround, lerpFactor);
    this.hemiLight.intensity += (target.hemiInt - this.hemiLight.intensity) * lerpFactor;

    this.sunLight.color.lerp(target.sunColor, lerpFactor);
    this.sunLight.intensity += (target.sunInt - this.sunLight.intensity) * lerpFactor;

    this.fillLight.color.lerp(target.fillColor, lerpFactor);
    this.fillLight.intensity += (target.fillInt - this.fillLight.intensity) * lerpFactor;

    this.sodiumLightCones.forEach(c => {
      c.visible = target.coneOpacity > 0.01;
      if (c.material instanceof THREE.MeshBasicMaterial) {
        c.material.opacity += (target.coneOpacity - c.material.opacity) * lerpFactor;
      }
    });

    this.sodiumPointLights.forEach(l => {
      l.intensity += (target.sodiumInt - l.intensity) * lerpFactor;
    });
  }

  public setTimeOfDay(mode: 'day' | 'sunset' | 'night') {
    this.updateTimeOfDaySmooth(12, mode, false, 0.5);
  }

  private buildParkedCar() {
    while (this.parkedCarMesh.children.length > 0) {
      this.parkedCarMesh.remove(this.parkedCarMesh.children[0]);
    }
    const sedan = buildBoxy80sVehicleMesh({ colorHex: 0x0d9488, isVan: false });
    this.parkedCarMesh.add(sedan.root);
    this.parkedCarMesh.visible = false;
  }

  // ============================================================================
  // 1D. GRITTY 1987 BOXY AMERICAN SEDAN PLAYER CAR (PBR Paint, Brake-Dusted
  //     Steel Rims, Tinted Scratched Windows, Visible Interior & Rubber Bumpers)
  // ============================================================================
  private buildPlayerCar() {
    const built = buildBoxy80sVehicleMesh({
      colorHex: 0x0d9488,
      isVan: false
    });

    this.playerCarMesh = built.root;
    this.playerCarBodyGroup = built.bodyGroup;
    this.playerCarPaintMeshes = built.paintMeshes;
    this.playerWheelSteerGroups = built.steerGroups;
    this.playerWheelSpinMeshes = built.spinGroups;
    this.playerBrakeLightMat = built.brakeLightMat;

    this.scene.add(this.playerCarMesh);
  }

  public updatePlayerCar(
    x: number,
    y: number,
    angle: number,
    carColor: string,
    isVisible: boolean,
    steerAngle = 0,
    speed = 0,
    isBraking = false,
    bodyRoll = 0,
    bodyPitch = 0
  ) {
    if (!isVisible) {
      this.playerCarMesh.visible = false;
      return;
    }

    this.playerCarMesh.visible = true;
    this.playerCarMesh.position.set(x, 0, y);
    this.playerCarMesh.rotation.y = -angle;

    // Suspension pitch & cornering roll
    this.playerCarBodyGroup.rotation.z = bodyPitch;
    this.playerCarBodyGroup.rotation.x = bodyRoll;

    // Steer front wheels visually
    this.playerWheelSteerGroups.forEach(pivot => {
      pivot.rotation.y = -steerAngle * 0.85;
    });

    // Spin all 4 wheels proportional to forward/reverse speed
    this.wheelSpinAngle -= speed * 0.45;
    this.playerWheelSpinMeshes.forEach(spinGrp => {
      spinGrp.rotation.z = this.wheelSpinAngle;
    });

    // Dynamic Brake Light glow
    if (this.playerBrakeLightMat) {
      this.playerBrakeLightMat.color.setHex(isBraking ? 0xff2222 : 0x991b1b);
      this.playerBrakeLightMat.emissive.setHex(isBraking ? 0xff0000 : 0x7f1d1d);
      this.playerBrakeLightMat.emissiveIntensity = isBraking ? 1.8 : 0.55;
    }

    const validColor = (carColor && carColor.startsWith('#')) ? carColor : '#0d9488';
    this.playerCarPaintMeshes.forEach(mesh => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.set(validColor);
      }
    });
  }

  // ============================================================================
  // 1D. CIVILIAN TRAFFIC: MIX OF SEDANS, SPORT COUPES, PICKUP TRUCKS & VANS
  // ============================================================================
  public initCivilianTraffic(cars: CivilianCar[]) {
    const styles: ('sedan' | 'coupe' | 'pickup' | 'van')[] = ['sedan', 'coupe', 'pickup', 'van'];
    this.civilianMeshes = cars.map((c, idx) => {
      const bodyStyle = styles[idx % styles.length];
      const built = buildBoxy80sVehicleMesh({
        colorHex: bodyStyle === 'van' ? '#1e3a8a' : c.color,
        bodyStyle
      });
      this.civilianGroup.add(built.root);
      return {
        mesh: built.root,
        spinGroups: built.spinGroups
      };
    });
  }

  public updateCivilianTraffic(cars: CivilianCar[], time = 0, playerX?: number, playerY?: number) {
    this.civilianMeshes.forEach((civObj, idx) => {
      const c = cars[idx];
      if (!c) return;

      if (playerX !== undefined && playerY !== undefined) {
        const dx = c.x - playerX;
        const dy = c.y - playerY;
        const distSq = dx * dx + dy * dy;
        if (distSq > 750 * 750) {
          civObj.mesh.visible = false;
          return;
        }
        civObj.mesh.visible = true;
      }

      civObj.mesh.position.set(c.x, 0, c.y);
      civObj.mesh.rotation.y = -c.angle;

      const spinAngle = -(time * 0.012 * (c.speed || 1.5));
      civObj.spinGroups.forEach(sg => {
        sg.rotation.z = spinAngle;
      });
    });
  }

  // ============================================================================
  // 1D. POLICE CRUISERS: 1989 INTERCEPTOR WITH DECALS, BULLBAR, SPOTLIGHTS & LIGHTBAR
  // ============================================================================
  public initPoliceCruisers(cops: PoliceUnit[]) {
    this.copMeshes = cops.map(() => {
      const built = buildBoxy80sVehicleMesh({
        colorHex: 0x0f172a,
        isPolice: true
      });
      this.copGroup.add(built.root);

      return {
        mesh: built.root,
        redBar: built.redBar!,
        blueBar: built.blueBar!,
        coneMesh: built.coneMesh!,
        spinGroups: built.spinGroups
      };
    });
  }

  public updatePoliceCruisers(cops: PoliceUnit[], isChasing: boolean, time: number) {
    this.copMeshes.forEach((copObj, idx) => {
      const copData = cops[idx];
      if (!copData) return;

      copObj.mesh.position.set(copData.x, 0, copData.y);
      copObj.mesh.rotation.y = -copData.angle;

      // Spin all 4 police interceptor wheels proportional to speed
      const spinAngle = -(time * 0.012 * (copData.speed || 0.9));
      copObj.spinGroups.forEach(sg => {
        sg.rotation.z = spinAngle;
      });

      const isRed = Math.floor(time / 160) % 2 === 0;
      if (isChasing || copData.alert) {
        copObj.redBar.visible = isRed;
        copObj.blueBar.visible = !isRed;
        (copObj.coneMesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        (copObj.coneMesh.material as THREE.MeshBasicMaterial).opacity = 0.35;
      } else {
        copObj.redBar.visible = true;
        copObj.blueBar.visible = true;
        (copObj.coneMesh.material as THREE.MeshBasicMaterial).color.setHex(0xfef08a);
        (copObj.coneMesh.material as THREE.MeshBasicMaterial).opacity = 0.18;
      }
    });
  }

  // ============================================================================
  // 1E. STREET HUSTLER NPCs (OVERSIZED FADED HOODIES, CARGO PANTS & WORN SNEAKERS)
  // ============================================================================
  public initPedestrians(peds: Pedestrian[]) {
    const hoodiePalette = [0x18181b, 0x1e293b, 0x334155, 0x064e3b, 0x3b0764, 0x451a03, 0x1e3a8a, 0x3f3f46];
    const pantsPalette = [0x0f172a, 0x1c1917, 0x1e1b4b, 0x27272a, 0x334155];
    const skinPalette = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xd6a273];

    this.pedMeshes = peds.map((ped, idx) => {
      const built = buildStreetHustlerCharacter({
        hoodieColor: hoodiePalette[idx % hoodiePalette.length],
        pantsColor: pantsPalette[idx % pantsPalette.length],
        skinColor: skinPalette[idx % skinPalette.length],
        isPartner: false,
        variantIdx: idx
      });

      this.pedGroup.add(built.group);

      return {
        mesh: built.group,
        leftLeg: built.leftLeg,
        rightLeg: built.rightLeg,
        leftArm: built.leftArm,
        rightArm: built.rightArm,
        pedData: ped
      };
    });
  }

  public updatePedestrians(peds: Pedestrian[], time: number, playerX?: number, playerY?: number) {
    this.pedMeshes.forEach((pedObj, idx) => {
      const ped = peds[idx];
      if (!ped) return;

      if (playerX !== undefined && playerY !== undefined) {
        const dx = ped.x - playerX;
        const dy = ped.y - playerY;
        const distSq = dx * dx + dy * dy;
        if (distSq > 580 * 580) {
          pedObj.mesh.visible = false;
          return;
        }
        pedObj.mesh.visible = true;

        pedObj.mesh.position.set(ped.x, 0, ped.y);
        pedObj.mesh.rotation.y = -ped.angle + Math.PI / 2;

        // Only compute limb swing trigonometry for nearby pedestrians (< 320m)
        if (distSq < 320 * 320) {
          const isMoving = Math.abs(ped.vx) > 0.01 || Math.abs(ped.vy) > 0.01;
          if (!isMoving) {
            pedObj.leftLeg.rotation.x *= 0.85;
            pedObj.rightLeg.rotation.x *= 0.85;
            pedObj.leftArm.rotation.x = Math.sin(time * 0.002 + idx) * 0.04;
            pedObj.rightArm.rotation.x = -0.25 + Math.sin(time * 0.003 + idx) * 0.05;
          } else {
            const freq = ped.fleeing ? 0.010 : 0.0045;
            const swing = Math.sin(time * freq + idx) * (ped.fleeing ? 0.55 : 0.32);
            pedObj.leftLeg.rotation.x = swing;
            pedObj.rightLeg.rotation.x = -swing;
            pedObj.leftArm.rotation.x = -swing * 0.65;
            pedObj.rightArm.rotation.x = swing * 0.65;
          }
        }
        return;
      }

      pedObj.mesh.position.set(ped.x, 0, ped.y);
      pedObj.mesh.rotation.y = -ped.angle + Math.PI / 2;

      const freq = ped.fleeing ? 0.010 : 0.0045;
      const swing = Math.sin(time * freq + idx) * (ped.fleeing ? 0.55 : 0.32);
      pedObj.leftLeg.rotation.x = swing;
      pedObj.rightLeg.rotation.x = -swing;
      pedObj.leftArm.rotation.x = -swing * 0.65;
      pedObj.rightArm.rotation.x = swing * 0.65;
    });
  }

  public updateDropBeacon(dropCoords: { x: number; y: number } | null, time: number) {
    if (!dropCoords) {
      this.dropBeacon.visible = false;
      return;
    }

    this.dropBeacon.visible = true;
    this.dropBeacon.position.set(dropCoords.x, 0, dropCoords.y);
    this.dropBeacon.rotation.y = time * 0.0015;
  }

  public updateParkedCar(parked: { x: number; y: number; angle: number } | null, _carColor: string) {
    if (!parked) {
      this.parkedCarMesh.visible = false;
      return;
    }

    this.parkedCarMesh.visible = true;
    this.parkedCarMesh.position.set(parked.x, 0, parked.y);
    this.parkedCarMesh.rotation.y = -parked.angle;
  }
}
