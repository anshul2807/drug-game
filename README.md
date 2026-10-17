# Schedule I: Hyland Point Syndicate (React + Vite + Three.js 3D FPV)

A retro-styled underworld empire simulator and open-world delivery game built with **React 18**, **Three.js**, **Vite 6**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Quick Start

Run the following commands in the project folder:

```bash
cd "/Users/anshul/Desktop/Current Project/Schedule1"
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To create an optimized production build:

```bash
npm run build
```

---

## ☀️ 3D City Run (Daylight / Light Mode)

The 3D City Run now runs in **Daylight / Light Mode**:
* **Clear Blue Sky**: Bright sky dome (`#87CEEB`) with soft atmospheric haze (`#cfe9ff`) for extended visibility across all districts.
* **Warm Direct Sunlight**: Bright natural sun lighting (`1.25` intensity) illuminating roads, building facades, and vehicle hoods.
* **Pavements & Sidewalks**: Light concrete curbs and sidewalks (`#e2e8f0` / `#cbd5e1`) along clean asphalt avenues (`#334155`).
* **High-Contrast Road Markings**: Bright yellow dashed centerlines and solid white edge boundary lines for effortless navigation.
* **Architectural District Palette**:
  - *Downtown Core*: Sleek glass-blue and steel silver towers (`#60a5fa`, `#38bdf8`, `#bfdbfe`).
  - *Neon District*: Modern pastel and neon violet/magenta architecture (`#c084fc`, `#f472b6`, `#67e8f9`).
  - *The Docks*: Cargo container primary colors and industrial brick (`#ef4444`, `#3b82f6`, `#f59e0b`).
  - *Sunset Hills*: Mediterranean sunlit limestone and terra cotta villas (`#fef08a`, `#fde047`, `#fed7aa`).
  - *Desert Outskirts*: Warm desert sand, tan clay, and weathered stone (`#fcd34d`, `#d97706`).
* **Recognizable Shadow Alleys**: Shaded corridors with contrasting cool shadow tones and cyan neon entrance portals so stealth hiding spots stand out in daylight.
* **Solid 60 FPS Performance**: Optimized shaders with zero dynamic light overload, running smoothly on desktop and laptop GPUs.

---

## 🎮 3D First-Person View (FPV) Controls

| Action | Controls |
| :--- | :--- |
| **Accelerate / Walk Forward** | `W` or `↑` (Arrow Up) |
| **Brake & Reverse / Walk Backward** | `S` or `↓` (Arrow Down) |
| **Steer Left / Move Left** | `A` or `←` (Arrow Left) |
| **Steer Right / Move Right** | `D` or `→` (Arrow Right) |
| **Look Around (Mouse Look)** | **Click and Drag Mouse** across the 3D viewport |
| **Exit / Enter Vehicle (On Foot Mode)** | `E` or `F` (or on-screen **Exit Car / Enter Car** button) |
| **Hand-Off Delivery Drop** | `Spacebar` (when inside golden beacon of light) |
| **Fullscreen 3D Mode** | Click the **Maximize / Fullscreen** icon in the 3D toolbar |
| **Open Main Menu** | Click **MENU** in the top HUD bar |
| **Save Game Slots** | Click **SAVE** in the top HUD bar |

---

## 🏎️ 3D First-Person Driving Cockpit & On-Foot Perspective

1. **First-Person Vehicle Cockpit**:
   - Camera positioned inside the driver's seat looking out through the front windshield.
   - Interactive 3D dashboard featuring a steering wheel that tilts and rotates with your turns, an animated analog speedometer needle, dashboard hazard lights, and visible vehicle hood in front.
   - Vehicle color changes dynamically to match your active vehicle (Chariot Beater, Vandura Van, Dominator Muscle Car, or Armored SUV).

2. **First-Person On-Foot Mode (`E` / `F`)**:
   - Press `E` or `F` to step out of the vehicle and walk on foot at human eye level (`1.7m`).
   - Dynamic walking head-bob motion for natural immersion.
   - The car remains parked on the asphalt with hazard blinkers active until you return within `45px` and press `E` or `F` to re-enter.
   - Navigate tight pedestrian sidewalks, slip through shadow alleyways, and hand off packages on foot.

3. **3D Delivery Beacon**:
   - Pulsing golden holographic cylinder of light with floating star markers.

4. **Corner Radar Minimap**:
   - A live 2D GPS radar overlay showing your position, heading arrow, drop waypoint, and patrolling police units.

---

## 🚔 3D Police Pursuit, Searchlights & Arrest Mechanics

1. **2-Second Detection Gauge**:
   - Police cruisers sweep the streets with visible 3D spotlight cones.
   - If a spotlight hits you while outside of a shadow alley, an eye gauge counts up from `0.0s` to `2.0s`.
   - Breaking line-of-sight or stepping into a shadow alley resets the gauge.

2. **30-Second Active Pursuit**:
   - Once detected for 2.0s, high-alert pursuit initiates: sirens wail, rooftop red/blue emergency lightbars strobe, and cruisers chase at high speed.
   - An on-screen 30-second pursuit timer begins counting down.

3. **Losing Cops in the Shadows**:
   - Ducking into any of the 13 shaded alleyways activates `SHADOW (STEALTH)`.
   - Staying hidden for 3 continuous seconds causes the police to lose track and cancel pursuit.

4. **5-Strike Arrest System & Bankruptcy Reset**:
   - Cruiser collision adds **1 Arrest Strike** (`1/5` to `5/5`).
   - Reaching **5 strikes** triggers a police bust:
     - Deducts a **$100 bail penalty**.
     - **Bankruptcy Rule**: If your total funds (Cash + Bank) are under $100, your empire collapses and the game automatically **restarts fresh from Day 1**.
     - If you can afford bail, strikes reset to `0/5` and you respawn at your safehouse road.

---

## 💾 Multi-Slot Save & Main Menu System

* **Main Menu**: Accessible on startup or via the **MENU** button, with **Continue Game**, **Start New Game**, and **Load Game** (slot browser with slot name, timestamp, in-game Day, Cash balance, and Reputation).
* **Save Dialog**: When saving, choose between **Create New Slot** (with custom or auto name) or **Overwrite Existing Slot**.
* **Dismissable Notifications**: Every toast card has an instant **`X` close button**.
