import * as THREE from 'three';

// Ultra-optimized 60 FPS First-Person Vehicle Cockpit
export class CockpitModel {
  public group: THREE.Group;
  public steeringWheel: THREE.Group;
  public hoodMesh: THREE.Mesh;
  public speedoNeedle: THREE.Mesh;
  public blinkerLeft: THREE.Mesh;
  public blinkerRight: THREE.Mesh;

  constructor(carColor: string = '#10b981') {
    this.group = new THREE.Group();

    // 1. Dashboard Base (Lightweight Lambert Material)
    const dashGeo = new THREE.BoxGeometry(1.8, 0.45, 0.85);
    const dashMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(0, -0.35, -0.65);
    this.group.add(dash);

    // 2. Instrument Cluster Gauge Housing
    const clusterGeo = new THREE.BoxGeometry(0.65, 0.28, 0.2);
    const clusterMat = new THREE.MeshLambertMaterial({ color: 0x030712 });
    const cluster = new THREE.Mesh(clusterGeo, clusterMat);
    cluster.position.set(-0.35, -0.15, -0.62);
    cluster.rotation.x = -0.25;
    this.group.add(cluster);

    // Speedometer Dial (glowing green HUD dial)
    const dialGeo = new THREE.CircleGeometry(0.1, 16);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(-0.35, -0.14, -0.51);
    dial.rotation.x = -0.25;
    this.group.add(dial);

    // Speedo Needle
    const needleGeo = new THREE.BoxGeometry(0.012, 0.08, 0.01);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    this.speedoNeedle = new THREE.Mesh(needleGeo, needleMat);
    this.speedoNeedle.position.set(-0.35, -0.14, -0.50);
    this.group.add(this.speedoNeedle);

    // Center Console
    const consoleGeo = new THREE.BoxGeometry(0.4, 0.5, 0.6);
    const consoleMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const centerConsole = new THREE.Mesh(consoleGeo, consoleMat);
    centerConsole.position.set(0.15, -0.45, -0.65);
    this.group.add(centerConsole);

    // Digital Radio Display screen
    const screenGeo = new THREE.PlaneGeometry(0.24, 0.1);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0.15, -0.28, -0.34);
    screen.rotation.x = -0.2;
    this.group.add(screen);

    // 3. 3D Steering Wheel
    this.steeringWheel = new THREE.Group();
    this.steeringWheel.position.set(-0.35, -0.18, -0.42);
    this.steeringWheel.rotation.x = -0.35;

    const torusGeo = new THREE.TorusGeometry(0.22, 0.025, 8, 20);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const wheelRing = new THREE.Mesh(torusGeo, wheelMat);
    this.steeringWheel.add(wheelRing);

    const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12);
    const hubMat = new THREE.MeshLambertMaterial({ color: 0x374151 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    this.steeringWheel.add(hub);

    const spokeGeo = new THREE.BoxGeometry(0.38, 0.025, 0.02);
    const spoke = new THREE.Mesh(spokeGeo, wheelMat);
    this.steeringWheel.add(spoke);

    this.group.add(this.steeringWheel);

    // 4. Windshield Pillars & Frame
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const pillarLeftGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.4, 6);
    const pillarLeft = new THREE.Mesh(pillarLeftGeo, pillarMat);
    pillarLeft.position.set(-0.95, 0.25, -0.45);
    pillarLeft.rotation.z = -0.3;
    pillarLeft.rotation.x = 0.45;
    this.group.add(pillarLeft);

    const pillarRight = new THREE.Mesh(pillarLeftGeo, pillarMat);
    pillarRight.position.set(0.95, 0.25, -0.45);
    pillarRight.rotation.z = 0.3;
    pillarRight.rotation.x = 0.45;
    this.group.add(pillarRight);

    // Roof Header Bar
    const roofBarGeo = new THREE.BoxGeometry(1.8, 0.08, 0.15);
    const roofBar = new THREE.Mesh(roofBarGeo, pillarMat);
    roofBar.position.set(0, 0.72, -0.15);
    this.group.add(roofBar);

    // 5. Exterior Vehicle Hood (Visible in front through windshield)
    const hoodGeo = new THREE.BoxGeometry(1.85, 0.2, 1.8);
    const hoodMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(carColor) });
    this.hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
    this.hoodMesh.position.set(0, -0.45, -1.85);
    this.hoodMesh.rotation.x = 0.06;
    this.group.add(this.hoodMesh);

    // Rearview Mirror
    const mirrorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.04);
    const mirrorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.position.set(0, 0.58, -0.32);
    this.group.add(mirror);

    // Hazard Blinkers (Fast BasicMaterial meshes instead of GPU PointLights!)
    const blinkerGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const blinkerMatL = new THREE.MeshBasicMaterial({ color: 0x78350f });
    this.blinkerLeft = new THREE.Mesh(blinkerGeo, blinkerMatL);
    this.blinkerLeft.position.set(-0.7, -0.3, -1.8);
    this.group.add(this.blinkerLeft);

    const blinkerMatR = new THREE.MeshBasicMaterial({ color: 0x78350f });
    this.blinkerRight = new THREE.Mesh(blinkerGeo, blinkerMatR);
    this.blinkerRight.position.set(0.7, -0.3, -1.8);
    this.group.add(this.blinkerRight);
  }

  public updateColor(newColor: string) {
    if (this.hoodMesh && this.hoodMesh.material instanceof THREE.MeshLambertMaterial) {
      this.hoodMesh.material.color.set(newColor);
    }
  }

  public update(speed: number, turnDir: number, isBlinking: boolean) {
    // Steer steering wheel smoothly
    const targetWheelRot = -turnDir * 1.2;
    this.steeringWheel.rotation.z += (targetWheelRot - this.steeringWheel.rotation.z) * 0.25;

    // Needle deflection proportional to speed
    const angle = -1.2 + Math.min(2.4, (Math.abs(speed) / 6.0) * 2.4);
    this.speedoNeedle.rotation.z = -angle;

    // Fast material toggle for hazard blinkers (0 dynamic lights!)
    const activeColor = isBlinking ? 0xf59e0b : 0x78350f;
    (this.blinkerLeft.material as THREE.MeshBasicMaterial).color.setHex(activeColor);
    (this.blinkerRight.material as THREE.MeshBasicMaterial).color.setHex(activeColor);
  }
}
