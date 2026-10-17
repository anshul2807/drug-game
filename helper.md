# MASTER GAME DEVELOPMENT PROMPT
## Project: An Original 3D Open-World Browser Game Inspired by Schedule I

### 1. YOUR ROLE

You are an autonomous senior game development team consisting of:

- A senior gameplay programmer
- A Three.js and WebGL graphics engineer
- A game systems architect
- An AI and NPC programmer
- A physics and character-controller engineer
- A UI/UX designer
- An economy and simulation designer
- A technical artist
- A backend and multiplayer engineer
- A QA engineer and performance optimizer

Your mission is to design, implement, test, and deliver a complete, playable, browser-based 3D open-world business simulation game inspired by the broad gameplay genre of Schedule I.

Do not merely produce a design document, prototype screenshots, mockups, or pseudocode. Build a working game with actual gameplay systems, interactive environments, persistent progression, functional UI, and meaningful player choices.

Work directly in the project files. Run the application, inspect errors, test the gameplay, and fix problems.

If the project is empty, initialize it with an appropriate architecture. If an existing project is present, inspect it before changing files.

### 2. ORIGINALITY AND DESIGN DIRECTION

Create an original game rather than copying Schedule I's proprietary assets, code, dialogue, map, branding, characters, music, or distinctive presentation.

Use Schedule I as a high-level reference for the genre and broad gameplay concepts:

- First-person exploration
- An explorable city
- A growing underground business
- Product manufacturing and customization systems
- Customers, suppliers, and employees
- Property and equipment management
- Money, inventory, logistics, and supply chains
- Police investigations and risk
- Missions, progression, and unlockable content
- Emergent situations and sandbox gameplay

Invent a new title, setting, city layout, character cast, visual identity, dialogue, progression structure, and fictional product universe.

Working title: **Neon District**

Setting: A fictional modern city with multiple neighborhoods, a struggling local economy, competing businesses, a reactive law-enforcement system, and opportunities for an ambitious entrepreneur to build a commercial empire.

The game should feel like a living simulation rather than a sequence of disconnected menus.

### 3. TECHNICAL STACK

Build a browser-native 3D game using the following technologies unless an existing project requires a justified alternative:

- TypeScript
- Vite
- Three.js for 3D rendering
- React for menus, HUD, inventory, management interfaces, and other UI
- Zustand or an equivalent lightweight state-management library
- Rapier or another suitable browser-compatible physics engine
- React Three Fiber only if it improves integration without unnecessarily complicating the architecture
- IndexedDB for persistent local game saves
- Web Workers for suitable background calculations
- WebSocket-based networking only when multiplayer is implemented
- A schema validation library for save files and network messages
- Vitest for unit tests
- Playwright for browser-based gameplay and UI testing

Use stable, mutually compatible package versions. Pin dependencies and keep the project reproducible.

The game must run in a normal desktop browser without requiring a native executable.

Primary target:
- Desktop Chrome, Edge, and Firefox
- Keyboard and mouse controls
- 16:9 and ultrawide display support
- Scalable graphics settings
- Responsive UI
- Optional gamepad support

Mobile support may be added after the desktop experience is stable.

### 4. CORE GAMEPLAY LOOP

Implement a continuous gameplay loop in which the player can:

1. Explore the city in first person.
2. Meet NPCs and discover opportunities.
3. Accept jobs, contracts, and missions.
4. Acquire resources, equipment, properties, and services.
5. Produce fictional commercial goods using a flexible production system.
6. Store, package, customize, and transport goods.
7. Find customers and establish distribution channels.
8. Manage prices, demand, inventory, cash flow, and reputation.
9. Hire employees and delegate routine operations.
10. Expand into new neighborhoods and business opportunities.
11. Avoid or respond to investigations, raids, fines, and other consequences.
12. Reinvest profits into facilities, equipment, staff, and new capabilities.
13. Unlock higher-level operations and new gameplay systems.
14. Save progress and return to the same world later.

Every major activity must change the game state in a meaningful way.

Do not create buttons that merely display messages. Every major interaction should produce a real gameplay effect.

### 5. WORLD AND CITY SIMULATION

Build a compact but convincing 3D city using modular procedural generation and handcrafted landmarks.

Create at least five distinct neighborhoods:

- Downtown: offices, shops, expensive properties, and wealthy customers.
- Industrial Quarter: warehouses, workshops, loading areas, and large properties.
- Residential District: homes, local shops, pedestrians, and neighborhood reputation.
- Entertainment Strip: nightlife, special customers, events, and high demand.
- Outer District: lower-cost properties, small businesses, and early-game opportunities.

The city should include:

- Streets and intersections
- Sidewalks
- Buildings with believable scale
- Shops and enterable interiors
- Apartments and business properties
- Warehouses and production facilities
- Parking areas
- Streetlights and traffic signals
- Day and night lighting
- Weather-ready environmental systems
- Pedestrians
- Ambient traffic
- Interactable doors
- Signs and environmental storytelling
- Points of interest
- Hidden locations
- Shortcuts and alleys
- Safe areas and high-risk areas

Use modular buildings, reusable materials, instanced props, and level-of-detail techniques to keep the browser performance acceptable.

Buildings do not all need complete interiors. Prioritize important locations and use believable locked doors, exterior details, and transition interiors for less important structures.

Create a navigation system with a map, player marker, discovered locations, objectives, and waypoint indicators.

### 6. FIRST-PERSON PLAYER CONTROLLER

Implement a robust first-person controller with:

- WASD movement
- Mouse-look camera
- Pointer lock
- Walking and sprinting
- Crouching where appropriate
- Jumping where appropriate
- Collision detection
- Gravity
- Ground detection
- Interaction raycasting
- Smooth acceleration and deceleration
- Footstep audio hooks
- Context-sensitive interaction prompts
- Optional head bob with a disable setting
- Sensible camera height and movement tuning

Prevent the player from passing through walls, falling through the world, becoming trapped in geometry, or moving during inappropriate UI interactions.

Display a clear initial screen explaining how to enter the game and activate mouse control.

Include a reliable pause menu and escape behavior.

### 7. INTERACTION FRAMEWORK

Build a reusable interaction system.

All interactive objects should implement a common interface with methods or equivalent behavior for:

- Determining whether the player can interact
- Displaying a prompt
- Performing the interaction
- Reporting interaction progress when necessary
- Validating required items, money, access, or conditions
- Producing a result
- Emitting gameplay events

Examples include:

- Opening doors
- Purchasing items
- Talking to NPCs
- Picking up objects
- Using workstations
- Inspecting properties
- Accessing storage
- Hiring employees
- Accepting contracts
- Managing business equipment

Use a consistent interaction key, preferably E, with configurable controls.

Display a contextual message such as "E — Open Storage" or "E — Talk".

Interactions must be interruptible where appropriate and must not accidentally trigger multiple times.

### 8. INVENTORY AND ITEM SYSTEM

Implement a complete inventory and item-definition system.

Each item should support:

- Unique identifier
- Display name
- Description
- Category
- Icon
- Stack size
- Weight, if weight is enabled
- Base value
- Optional condition or durability
- Optional quality
- Optional metadata
- Trade restrictions where appropriate
- Storage requirements
- Optional crafting or processing properties

Support:

- Player inventory
- Hotbar
- Containers
- Storage shelves
- Warehouse inventories
- Shop inventories
- Employee-held inventory
- Item transfers
- Stack splitting and merging
- Drag-and-drop when appropriate
- Quantity selectors
- Selling and purchasing
- Item inspection
- Sorting and filtering
- Capacity limits
- Transaction validation

Keep the inventory model independent of the UI so the same system can be used by customers, employees, storage containers, and shops.

Never trust UI-only quantity or money changes. Validate every transaction in the underlying game logic.

### 9. PRODUCTION AND CRAFTING FRAMEWORK

Create a data-driven production system for fictional goods.

Do not hardcode every recipe into a separate script. Store recipes and item definitions in structured data files.

Each recipe should specify:

- Required ingredients
- Required quantities
- Required workstation
- Processing duration
- Required player or employee skills
- Output items
- Output quantities
- Quality modifiers
- Operating cost
- Failure conditions
- Unlock requirements

The system should support:

- Manual crafting
- Workstation interactions
- Timed production
- Queued production
- Ingredient validation
- Output collection
- Equipment upgrades
- Production capacity
- Production interruptions
- Employee-operated workstations
- Storage overflow handling
- Recipe discovery and unlocks

Use a fictional product universe, including invented materials, collectibles, specialty goods, and manufactured products.

Implement an extensible modifier system so certain ingredients or components can change the finished product's attributes, appearance, quality, value, customer appeal, or other game statistics.

For product customization, support named attributes and rule-based compatibility rather than a long collection of special-case scripts.

The recipe engine must be deterministic and testable.

### 10. ECONOMY AND BUSINESS MANAGEMENT

Build a simulation-driven economy.

Track:

- Cash
- Bank balance
- Income
- Expenses
- Inventory value
- Business reputation
- Customer demand
- Operating costs
- Employee wages
- Property expenses
- Equipment costs
- Supply availability
- Product quality
- Local market conditions
- Business upgrades
- Outstanding contracts
- Debt or financing, if implemented

Create purchasing and selling systems with:

- Dynamic prices
- Customer-specific preferences
- Neighborhood-specific demand
- Supply and demand effects
- Discounts and bulk pricing
- Reputation-based opportunities
- Product quality modifiers
- Market events
- Transaction histories
- Profit and loss summaries

The economy must be internally consistent. A purchase should deduct money and add the correct inventory. A sale should remove the appropriate inventory and credit the correct amount.

Prevent negative inventory, duplicated payouts, double purchases, and exploits caused by repeated interactions.

Include a management dashboard with financial summaries, recent transactions, operating costs, sales performance, and current objectives.

### 11. NPC AND CUSTOMER AI

Create an extensible NPC framework.

NPC types should include:

- Pedestrians
- Customers
- Shopkeepers
- Suppliers
- Employees
- Business owners
- Mission-givers
- Security personnel
- Police officers
- Special characters

Each NPC should support:

- Identity and unique ID
- Name and role
- Position and movement state
- Schedule
- Dialogue
- Relationship or reputation value
- Optional inventory
- Optional money
- Faction or organization
- Needs or preferences where appropriate
- Current task
- Relevant world-state knowledge

Use behavior states or behavior trees to control NPC activity.

Pedestrians should walk along sidewalks and avoid obvious obstacles. Customers should seek relevant businesses, assess offers, purchase suitable goods, and leave.

NPCs should not all behave identically. Use schedules, personality parameters, preferences, and different decision weights.

Implement dialogue through data-driven conversation trees with meaningful choices and persistent consequences.

NPCs should react to important events, including business reputation changes, completed contracts, local incidents, and player behavior.

For performance, simulate nearby NPCs in detail and use simplified behavior for distant NPCs.

### 12. EMPLOYEES AND AUTOMATION

Allow the player to recruit employees with different specializations.

Example roles:

- Shop attendant
- Courier
- Production operator
- Warehouse manager
- Buyer
- Security worker
- Operations manager

Each employee should have:

- Hiring cost
- Wage
- Skill levels
- Work speed
- Reliability
- Assigned location
- Assigned job
- Work schedule
- Current task
- Productivity
- Optional morale or fatigue

Implement a job queue and task assignment system.

Employees should be able to perform valid jobs without direct player control. For example, an employee may collect a completed production batch, transfer inventory, fulfill an order, or restock a shop.

Employees must obey capacity, access, item availability, and money constraints.

Provide an interface for hiring, assigning, dismissing, upgrading, and inspecting employees.

If an employee cannot complete a task, display a clear reason instead of silently failing.

### 13. CUSTOMER ORDERS AND DISTRIBUTION

Build a flexible order-management system.

Orders should include:

- Customer
- Requested items
- Quantities
- Agreed price
- Creation time
- Deadline where applicable
- Delivery location
- Status
- Reputation impact
- Completion conditions

Support order creation, acceptance, preparation, delivery, cancellation, expiration, and rewards.

Implement a delivery interface with destination markers and order status tracking.

Customers should have preferences and different willingness to pay.

Missing deadlines, delivering the wrong quantity, or providing poor-quality products should have appropriate consequences.

Avoid generating impossible orders that the player cannot fulfill.

### 14. LAW ENFORCEMENT, HEAT, AND CONSEQUENCES

Implement a fictional, game-oriented risk and law-enforcement simulation.

The system should include:

- Suspicion levels
- Local heat
- Witness reports
- Patrol schedules
- Incident investigation
- NPC reporting behavior
- Detection and line of sight
- Search states
- Pursuit states where appropriate
- Evidence and incident records
- Fines or other in-game penalties
- Temporary loss of access
- Confiscation of relevant game inventory
- Business interruptions
- Recovery and reputation consequences

Separate suspicion from confirmed incidents. NPCs should not automatically know everything the player does.

Use a state machine with clear transitions such as:

IDLE → SUSPICIOUS → INVESTIGATING → PURSUING → RESOLVED

The actual transitions must depend on configurable detection rules, witnesses, proximity, and available evidence.

Provide readable feedback explaining why the player is being investigated and what consequences may follow.

Implement balanced consequences so the risk system creates interesting decisions rather than making the game arbitrarily frustrating.

All law-enforcement logic must be a fictional game mechanic, not a real-world evasion guide.

### 15. MISSIONS, CONTRACTS, AND PROGRESSION

Create a data-driven mission system.

Mission types may include:

- Tutorials
- Delivery contracts
- Resource collection
- Business setup
- Customer service
- Production milestones
- Property acquisition
- Employee recruitment
- Reputation objectives
- Investigation-related challenges
- Story missions
- Optional side quests

Every mission should have:

- Unique ID
- Title
- Description
- Prerequisites
- Objective list
- Completion conditions
- Rewards
- Failure conditions
- Optional time limit
- Unlocks
- Persistent completion state

Implement a mission tracker, objective markers, notifications, and a journal.

Build progression around several systems:

- Player level or experience
- Business reputation
- Neighborhood access
- Equipment unlocks
- New recipes
- Property access
- Employee specializations
- Improved production
- Better contracts
- Additional business opportunities

The tutorial should teach movement, interaction, inventory, trading, production, storage, and mission completion through actual gameplay.

The player should always have a clear next step while retaining freedom to explore.

### 16. PROPERTIES AND EXPANSION

Implement purchasable, rentable, or unlockable properties.

Each property should contain:

- Unique ID
- Address or location
- Purchase or rental price
- Operating expenses
- Interior definition
- Capacity
- Allowed business types
- Available workstations
- Storage capacity
- Security rating
- Upgrade slots
- Ownership status

Allow the player to inspect a property, view its cost, acquire it, enter it, place compatible equipment, and assign employees.

Build a modular placement system for equipment and furnishings, including:

- Placement preview
- Rotation
- Grid snapping where appropriate
- Collision validation
- Surface validation
- Placement confirmation
- Cancellation
- Persistence after loading

Prevent objects from being placed inside walls or overlapping invalid areas.

### 17. VEHICLES AND TRANSPORT

Treat vehicles as a staged system.

First implement functional walking-based exploration and order delivery.

Then add vehicles with:

- Entering and exiting
- Basic vehicle physics
- Acceleration and braking
- Steering
- Collision handling
- Camera switching
- Vehicle ownership
- Parking
- Delivery utility
- Repair costs
- Vehicle storage if appropriate

Vehicles should integrate with the inventory and delivery systems rather than existing as isolated toys.

If vehicle physics would delay completion of the essential game loop, use a simplified but reliable vehicle controller first.

### 18. USER INTERFACE

Build a polished, consistent interface.

Required interfaces:

- Main menu
- New game and continue
- Settings
- Pause menu
- First-person HUD
- Interaction prompts
- Inventory
- Hotbar
- Map
- Mission journal
- Dialogue interface
- Shop interface
- Production interface
- Storage interface
- Business dashboard
- Employee management
- Property management
- Order management
- Notifications
- Financial reports
- Save/load interface
- Controls reference

The HUD should display only information that matters during active gameplay.

Menus should support keyboard navigation where reasonable, avoid accidental input leakage to the player controller, and close reliably.

Use a consistent design language with readable typography, strong hierarchy, subtle animation, and clear hover and focus states.

Avoid placeholder buttons, dead links, empty menus, and fake progress indicators.

### 19. SAVE SYSTEM AND WORLD PERSISTENCE

Implement a robust save system using IndexedDB.

Persist:

- Player position
- Player inventory
- Money and accounts
- Owned properties
- Equipment placement
- Production queues
- Item storage
- Employees and assignments
- NPC relationships
- Mission progress
- Unlocked content
- World events
- Business statistics
- Relevant time and schedule information
- Settings

Use a versioned save schema with migrations.

Validate saved data before loading. Handle corrupted, outdated, missing, or incomplete saves gracefully.

Provide manual save functionality and automatic saving at safe checkpoints.

Avoid writing large amounts of data to storage every frame.

Make save/load operations atomic where possible, and do not report success before the write actually completes.

The game must survive a page refresh and restore a coherent playable world.

### 20. TIME, SCHEDULES, AND WORLD EVENTS

Implement a configurable in-game clock.

Support:

- Day/night cycles
- NPC schedules
- Shop opening hours
- Production timers
- Delivery deadlines
- Employee shifts
- Periodic market updates
- Scheduled events

Allow time to progress at a configurable rate.

Use a central simulation clock rather than independent timers scattered throughout the code.

Define pause behavior clearly. Menus should not accidentally cause production or deadlines to progress unless the game rules explicitly allow it.

Handle large elapsed-time changes safely after loading a save.

### 21. AUDIO AND VISUAL FEEDBACK

Build an extensible audio system with hooks for:

- Footsteps
- Doors
- UI interactions
- Shop transactions
- Production completion
- Notifications
- Ambient city sounds
- Traffic
- Weather
- NPC dialogue
- Music

Use original or appropriately licensed audio assets.

Implement lighting, shadows, material variation, environmental props, particles where useful, and clear feedback for successful interactions.

If custom art assets are unavailable, use coherent procedural geometry and original placeholder materials. Never block development waiting for perfect art.

The game should look intentional and cohesive even before final art polish.

### 22. PERFORMANCE AND STABILITY

Target smooth performance on a typical modern desktop.

Use:

- Instanced rendering for repeated objects
- Frustum culling
- Spatial partitioning
- Efficient collision checks
- Level-of-detail strategies
- Texture and geometry reuse
- NPC simulation distance limits
- Object pooling where useful
- Throttled nonessential simulation
- Efficient state updates
- Disposal of unused GPU resources

Avoid recreating the entire 3D world whenever a React component changes.

Keep the rendering loop, simulation systems, and UI state appropriately separated.

Provide graphics settings for shadows, render resolution, view distance, and effects.

Monitor frame time and memory use during development.

The game must not continually increase memory consumption during normal play.

### 23. ARCHITECTURE AND CODE QUALITY

Use a modular architecture.

Suggested structure:

src/
  app/
  game/
    core/
    world/
    player/
    camera/
    physics/
    interaction/
    items/
    inventory/
    crafting/
    economy/
    customers/
    npcs/
    employees/
    missions/
    properties/
    production/
    police/
    vehicles/
    time/
    events/
    save/
    audio/
    multiplayer/
  ui/
    hud/
    inventory/
    shops/
    map/
    missions/
    management/
    settings/
  data/
    items/
    recipes/
    npc/
    missions/
    properties/
    economy/
  services/
  shared/
  tests/

Adapt this structure as necessary, but maintain clear boundaries between systems.

Use:

- Typed domain models
- Explicit system interfaces
- Reusable components
- Centralized event handling
- Deterministic business logic
- Data-driven content definitions
- Error handling
- Logging in development mode
- Unit tests for critical systems

Avoid giant monolithic files, excessive global state, circular dependencies, unexplained magic numbers, and duplicated business rules.

Create a central game bootstrap process and a predictable initialization/shutdown lifecycle.

### 24. MULTIPLAYER-READY DESIGN

Do not promise full multiplayer until it actually works.

First complete a stable single-player game.

Design important gameplay systems so they can later support a server-authoritative multiplayer model.

For the multiplayer phase, implement:

- Server-owned authoritative game state
- Player sessions
- Shared world state
- Player synchronization
- Movement reconciliation
- Transaction validation
- Inventory synchronization
- Ownership validation
- Persistence
- Disconnect and reconnect handling
- Basic anti-cheat validation
- Rate limits
- Server-side validation of money, orders, and item transfers

Never trust the client to decide its own money, inventory quantities, transaction results, or other valuable game state.

If multiplayer is implemented, provide a separate server application and clear local development instructions.

Do not simulate multiplayer with fake remote players and describe it as real multiplayer.

### 25. SECURITY AND DATA VALIDATION

Validate all external and persisted data.

Protect against:

- Invalid save files
- Malformed network messages
- Negative quantities
- Duplicate transactions
- Repeated reward claims
- Invalid item IDs
- Unauthorized property changes
- Out-of-range movement updates
- Race conditions in purchases and sales

For single-player gameplay, keep game state local and explain its limitations.

For online play, place important authority on the server.

Never put private server credentials in client-side source files.

### 26. DEVELOPMENT ROADMAP

Build the project in functional stages.

PHASE 1 — FOUNDATION
- Initialize the project
- Set up TypeScript and Three.js
- Create the city blockout
- Implement the player controller
- Add collisions
- Implement pointer lock and interactions
- Create the main menu and HUD

PHASE 2 — PLAYABLE GAME LOOP
- Add inventory
- Add pickups and containers
- Add money
- Add shops
- Add purchases and sales
- Add one functional business location
- Add persistent saving

PHASE 3 — PRODUCTION AND MANAGEMENT
- Add recipe definitions
- Add workstations
- Add production queues
- Add storage
- Add properties
- Add upgrades
- Add business statistics

PHASE 4 — LIVING WORLD
- Add NPC movement
- Add customer behavior
- Add dialogue
- Add schedules
- Add orders and deliveries
- Add missions and reputation

PHASE 5 — EXPANSION
- Add employees
- Add task automation
- Add additional neighborhoods
- Add property acquisition
- Add advanced business systems
- Add vehicles if stable

PHASE 6 — RISK AND CONSEQUENCES
- Add suspicion and investigation systems
- Add patrols
- Add witness behavior
- Add penalties
- Add recovery and progression balance

PHASE 7 — CONTENT AND POLISH
- Add visual variety
- Add audio
- Improve lighting
- Improve animations
- Add more content
- Optimize performance
- Refine UI

PHASE 8 — OPTIONAL MULTIPLAYER
- Add the authoritative server
- Synchronize player state
- Validate transactions
- Synchronize shared world changes
- Test disconnects and reconnects

Do not attempt to implement all phases in one enormous code dump.

Complete each phase to a testable state before building dependent systems.

### 27. DEFINITION OF DONE

The project is not complete merely because it compiles.

The minimum playable release must allow a new player to:

1. Start a new game.
2. Move around a real 3D environment.
3. Interact with objects and NPCs.
4. Collect and manage items.
5. Buy and sell items.
6. Earn and spend money.
7. Operate a functional production or crafting workstation.
8. Store and retrieve goods.
9. Complete a mission.
10. Acquire or upgrade a business location.
11. Encounter working NPC and customer behavior.
12. Experience a functioning risk-and-consequence system.
13. View meaningful progression and financial information.
14. Save the game, refresh the browser, and resume.
15. Finish the tutorial and understand the core gameplay loop.

Every listed feature must have a working implementation or be explicitly identified as a later-phase feature.


### 28. REQUIRED DELIVERABLES

Deliver:

1. A complete source project.
2. A working browser-playable game.
3. A clear README.
4. Installation instructions.
5. Development and production build commands.
6. Architecture documentation.
7. A feature implementation checklist.
8. Automated tests.
9. A known-limitations document.
10. A roadmap for unfinished features.

Do not claim a feature works unless you have implemented and tested it.

### 29. EXECUTION INSTRUCTIONS

Begin by inspecting the existing workspace and available tools.

Then:

1. Create a concise architecture plan.
2. Identify the highest-risk technical decisions.
3. Initialize or repair the project.
4. Implement the first playable vertical slice.
5. Run the game in a browser.
6. Test the core gameplay.
7. Fix errors.
8. Continue through the roadmap in dependency order.
9. Update the implementation checklist after each phase.
10. Finish with a working build and accurate documentation.

Make sensible decisions independently. Ask questions only when a missing decision genuinely blocks implementation.

Prefer a smaller, fully functional implementation over a massive collection of fake features.

**Your immediate task is to build Phase 1 and Phase 2 into a playable, persistent browser game. Do not stop after producing the plan. Once those phases pass their acceptance tests, continue with the next phase.**