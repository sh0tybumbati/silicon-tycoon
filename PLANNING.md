# Silicon Tycoon - Project Roadmap

This document provides a high-level project management view of Silicon Tycoon development. For detailed technical documentation of how each feature works, see **FEATURES.md**.

---

## Project Overview

**Silicon Tycoon** is a semiconductor design and manufacturing simulation game built with modern web technologies. Players design custom silicon dies, simulate realistic performance and power characteristics, manage fabrication, and build complete systems.

**Technology Stack**:
- Frontend: HTML5, CSS3 (Art Deco themed UI)
- Rendering: PixiJS 7.3.2 (WebGL canvas for die designer)
- Architecture: ES6 Modules
- Storage: Browser localStorage with auto-recovery

**Game Time System**:
- **Timescale**: Weekly turns (52 per year)
- Each turn = 1 week of game time
- Provides strategic depth without excessive micromanagement
- See FEATURES.md: Game Time System for full details

---

## Current Implementation Status

### Phase 1: Architecture ✅ COMPLETE

**Core Systems**:
- ✅ Die Library System - Create, edit, clone, delete die designs (see FEATURES.md: Component System)
- ✅ Die Designer Canvas - PixiJS visual editor with grid system (see FEATURES.md: Component System)
- ✅ Component System - 11 component types with density multipliers (see FEATURES.md: Component System)
- ✅ Process Node Technology - 22 nodes from 10μm to 3nm (see FEATURES.md: Process Nodes)
- ✅ Performance Calculation - Realistic transistor counting and IPC (see FEATURES.md: Performance Calculation System)
- ✅ Power & Thermal Modeling - Dynamic/static power with throttling (see FEATURES.md: Power & Thermal Modeling)
- ✅ Layout Efficiency System - 7 optimization factors (see FEATURES.md: Layout Efficiency System)
- ✅ Memory Bandwidth System - Area-based controller scaling (see FEATURES.md: Layout Efficiency System)
- ✅ Chip Classification - Two-axis CLASS/GRADE system (see FEATURES.md: Two-Axis Chip Classification)
- ✅ Manufacturing Simulation - Murphy's Law yield calculation (see FEATURES.md: Manufacturing Simulation)
- ✅ User Interface - Art Deco themed with three-panel layout
- ✅ Properties Panel - Real-time metrics with 7 sections
- ✅ Storage - localStorage persistence with corruption recovery

**Quality-of-Life Features**:
- ✅ Automatic component renumbering on deletion
- ✅ Live zoom percentage display
- ✅ Component copy/paste system
- ✅ Global error recovery
- ✅ Touch device support (pinch zoom, pan)
- ✅ Default example dies

**Files**:
- `architecture.html` (213 lines)
- `js/dieLibrary.js` (369 lines)
- `js/dieDesigner.js` (500+ lines)
- `js/architecture.js` (1,350 lines)
- `js/constants.js` (375 lines)
- `css/architecture.css`
- `css/style.css`

---

### Phase 2: Wafer Planning ✅ COMPLETE

**Completed**:
- ✅ Wafer visualization with circular layout and notch (see FEATURES.md: Wafer Planning System)
- ✅ Die placement algorithm with edge exclusion (see FEATURES.md: Wafer Planning System)
- ✅ Physics engine for transistor density (see FEATURES.md: Process Nodes)
- ✅ Poisson defect distribution modeling (see FEATURES.md: Wafer Planning System)
- ✅ Yield calculation using Murphy's Law (see FEATURES.md: Manufacturing Simulation)
- ✅ Yield categorization (Perfect/Diminished/Damaged/Unusable)
- ✅ Interactive tooltips with die information
- ✅ Zoom (0.5x-10.0x) and pan controls
- ✅ Touch support (pinch zoom, single-finger pan)
- ✅ Process node dropdown (22 nodes)
- ✅ Wafer size selection (8 sizes: 50-450mm)
- ✅ Reticle size selection (11 sizes)
- ✅ Process maturity slider
- ✅ Batch plan data model and localStorage persistence
- ✅ Integration with die library (select dies for wafer planning)
- ✅ Yield calculation by maturity level (New/Early/Mature/Optimized)
- ✅ Cost per wafer calculation based on process node
- ✅ Fabrication time estimation per wafer
- ✅ Batch plan library modal with search functionality
- ✅ Save/Load/Delete batch plans UI
- ✅ Cost and time stats display in footer panel

**Files**:
- `wafer.html` (253 lines)
- `js/waferPlanner.js` (245 lines)
- `js/renderer.js` (550 lines)
- `js/physics.js` (205 lines)
- `js/main.js` (607 lines)
- `js/batchPlanner.js` (340 lines)
- `css/style.css` (batch library modal styles)

---

## Development Roadmap

### Phase 3: Contract Manufacturing & Foundry Market ❌ NOT STARTED
**Reference**: FEATURES.md: Contract Manufacturing System

**Goals**:
- ❌ Design foundry database (TSMC, GlobalFoundries, UMC, Samsung, Intel, SMIC, etc.)
- ❌ Create AI-controlled foundries with historical accuracy (node availability by year)
- ❌ Implement contract types (Spot, Short-term, Long-term)
- ❌ Build foundry market UI (browse fabs, compare pricing)
- ❌ Design contract negotiation interface
- ❌ Create contract data model and localStorage persistence
- ❌ Implement pricing formulas (spot rates, discounts, service add-ons)
- ❌ Add contract progress tracking and invoicing
- ❌ Build active contracts dashboard
- ❌ Implement supply & demand dynamics (utilization affects pricing)
- ❌ Add foundry reputation system

**Key Features**:
- Browse AI-controlled foundries by node, price, capacity, reputation
- Book spot orders for prototyping
- Negotiate multi-year contracts with volume discounts
- Track contract progress (wafers completed, yield, cost)
- Service bundles: Fabrication only, +Binning, +Packaging, Full Turnkey

**Files to Create**:
- `js/foundryMarket.js` - AI foundry definitions and market dynamics
- `js/contracts.js` - Contract management and fulfillment
- `market.html` - Foundry marketplace UI

---

### Phase 4: Player-Owned Foundry System ❌ NOT STARTED
**Reference**: FEATURES.md: Player-Owned Foundry System

**Goals**:
- ❌ Create equipment catalog (lithography, etching, deposition, CMP, metrology)
- ❌ Design cleanroom facility purchase/lease system
- ❌ Implement equipment purchase UI (new vs. used tools)
- ❌ Add staffing system (engineers, technicians, operators)
- ❌ Build RFQ (Request for Quote) system from AI design firms
- ❌ Create contract bidding interface
- ❌ Implement foundry reputation tracking
- ❌ Add capacity allocation and scheduling
- ❌ Design production queue management
- ❌ Track operating costs (maintenance, power, consumables, labor)
- ❌ Calculate contract profitability
- ❌ Add equipment reliability and downtime simulation

**Key Features**:
- Buy ASML lithography tools ($120M-$150M each)
- Purchase cleanroom space (10k-500k m²)
- Hire and manage fab workforce
- Accept contracts from AI design firms
- Set competitive pricing
- Build reputation through quality and delivery
- Expand capacity over time (reinvest profits)
- Compete with AI foundries (TSMC, GF, etc.)

**Files to Create**:
- `js/equipment.js` - Equipment catalog and management
- `js/playerFoundry.js` - Player foundry operations
- `foundry.html` - Player foundry management UI

---

### Phase 5: Fabrication Lines ❌ NOT STARTED
**Reference**: FEATURES.md: Fabrication System

**Goals**:
- ❌ Design fab line equipment slot system (7 process stages)
- ❌ Create process stage definitions (Oxidation, Photolithography, Etching, Deposition, Ion Implantation, CMP, Metrology)
- ❌ Build batch assignment UI (assign batch plans to fab lines)
- ❌ Implement wafer pipeline simulation (track wafers through stages)
- ❌ Add time estimation per stage
- ❌ Track maturity progression over time (New → Early → Mature → Optimized)
- ❌ Visualize line utilization and bottlenecks
- ❌ Equipment upgrade system
- ❌ Per-wafer defect simulation (actual defect rolls happen here)

**Key Features**:
- Multiple equipment slots per stage (parallelization)
- Sequential wafer processing through all stages
- Real-time pipeline visualization
- Cycle time and throughput calculations

**Note**: This phase is for player-owned fab lines. Contracted manufacturing uses simplified abstraction.

---

### Phase 6: Binning ❌ NOT STARTED
**Reference**: FEATURES.md: Binning System

**Goals**:
- ❌ Implement component-specific defect system (area-based probability)
- ❌ Build binning line stages (Die Testing, Sorting, Locking, SKU Assignment)
- ❌ Create SKU grouping algorithm (auto-detect die variants)
- ❌ Design binning UI for variant detection
- ❌ Add defect map visualization
- ❌ Calculate performance degradation from defects
- ❌ Quality grade assignment (A/B/C tiers)
- ❌ Clock capability reduction from defects

**Key Features**:
- Automatic die variant detection (e.g., 8C/16MB/2MC → 7C/16MB/2MC → 6C/14MB/2MC)
- Defect sensitivity per component type
- SKU assignment suggestions
- Salvage binning for damaged dies

---

### Phase 7: Packaging ❌ NOT STARTED
**Reference**: FEATURES.md: Packaging System

**Goals**:
- ❌ Build product naming hierarchy system (7-tier: Type/Family/Line/Generation/Model/Variant/Signifier)
- ❌ Create package configuration UI
- ❌ Implement chiplet system (multi-die packages)
- ❌ Add socket/substrate database (Intel LGA, AMD AM5, etc.)
- ❌ Build packaging line simulation (7 stages: Die Attach, Wire Bonding, Substrate Attach, Underfill, IHS Attach, Cure/Bake, Final Test)
- ❌ Design product library
- ❌ IHS and substrate selection (materials, thermal properties)

**Key Features**:
- Monolithic and chiplet package types
- Interconnect system (Infinity Fabric, UCIe, EMIB)
- Socket compatibility tracking
- Product hierarchy (e.g., "AMD Ryzen 9 9800X")

---

### Phase 8: PassMark Benchmark Scoring ❌ NOT STARTED

**Goals**:
- ❌ Research real CPU scores from cpubenchmark.net leaderboards
- ❌ Implement Multi-Thread score calculation
- ❌ Implement Single-Thread score calculation
- ❌ Calibrate scores to match real CPUs (±15% accuracy)
- ❌ Add benchmark scores to properties panel UI
- ❌ Document scoring methodology in FEATURES.md

**Key Features**:
- Multi-thread scoring using clock × IPC × cores with efficiency factors
- Single-thread scoring using clock × IPC with layout penalties
- Reference calibration against real CPUs:
  - High-end: AMD Ryzen 9 7950X (~62,000 multi-thread)
  - Mid-range: Intel i5-12400F (~19,500 multi-thread)
  - Budget: Various 4C/8T chips (~10,000-12,000 range)
- Display alongside existing performance score
- PassMark methodology alignment (8-test average simulation)

**Reference Data Sources**:
- https://www.cpubenchmark.net/high_end_cpus.html (multi-thread leaderboard)
- https://www.cpubenchmark.net/singleThread.html (single-thread leaderboard)

**Implementation Notes**:
- Scores must scale properly across core counts (2C, 4C, 8C, 16C, 32C)
- Scores must reflect process node advantages (3nm > 7nm > 12nm)
- Thermal throttling should reduce scores appropriately
- Amdahl's law diminishing returns for multi-thread

---

### Phase 9: Component Designer ❌ NOT STARTED

**Goals**:
- ❌ Create component designer interface (separate screen)
- ❌ Design custom CPU cores with microarchitecture parameters
- ❌ Design custom GPU SMs/CUs with compute parameters
- ❌ Fixed-size component definitions with stat bonuses/penalties
- ❌ Component library system (save/load custom components)
- ❌ Integration with die designer (select custom vs generic components)

**Key Features**:

#### Custom CPU Core Designer
- **Fixed Size**: Component has predetermined dimensions (not scalable)
- **Microarchitecture Stats**:
  - Execution width (scalar/superscalar)
  - Pipeline depth
  - Branch prediction quality
  - Out-of-order depth
  - Cache line size
- **Bonuses/Penalties**:
  - Performance bonus: +5% to +30% IPC over generic
  - Efficiency bonus: -10% to -30% power consumption
  - Performance penalty: Complex designs = +15% power
  - Area penalty: Wide designs need more space
- **Examples**:
  - "Efficiency Core": Smaller, lower IPC, very low power
  - "Performance Core": Larger, high IPC, high power
  - "Balanced Core": Middle ground

#### Custom GPU SM/CU Designer
- **Fixed Size**: Predetermined dimensions
- **Compute Parameters**:
  - CUDA cores / Stream processors count
  - Texture unit count
  - RT cores / Tensor cores (optional)
  - Clock speed multiplier
  - Memory bandwidth requirement
- **Bonuses/Penalties**:
  - Compute density: More FLOPs per mm²
  - Power efficiency: Lower power per FLOP
  - Complexity penalty: Advanced features = higher power
- **Examples**:
  - "Compute SM": Dense compute, minimal graphics
  - "Graphics SM": Balanced for rendering
  - "RT-Enhanced SM": Ray tracing acceleration

#### Component Library
- Save custom components with names/descriptions
- Clone and modify existing designs
- Import/export component definitions
- Filter by type (CPU cores, GPU units, cache, etc.)
- Performance comparison view (custom vs generic)

#### Integration with Die Designer
- Component palette shows both generic and custom components
- Generic components: Size-based stats (current system)
- Custom components: Fixed size with predetermined stats
- Visual indicator (icon/badge) for custom components
- Tooltip shows bonuses/penalties

**Technical Implementation**:
- Store custom components in localStorage
- JSON schema for component definitions
- Stats override system in performance calculator
- Bonus/penalty multipliers applied to base calculations

**UI Screens**:
- Component library view (similar to die library)
- Component designer canvas (parameter sliders/inputs)
- Real-time stat preview
- "Use in Die Designer" button

---

### Phase 10: Architecture Enhancements ❌ NOT STARTED

#### A. IPC Calculation System
**Reference**: FEATURES.md: Advanced IPC Calculation System

**Goals**:
- ❌ Add execution width configuration (1-way to 8-way superscalar)
- ❌ Out-of-order depth selector (32-630 entry ROB)
- ❌ Branch prediction quality slider (85%-99% accuracy)
- ❌ Pipeline depth configuration (10-31 stages)
- ❌ Cache efficiency formula integration
- ❌ Real-world IPC reference values (Intel, AMD, Apple)

**Key Features**:
- Microarchitecture-driven IPC (not process node)
- Component size affects IPC potential
- Performance vs power tradeoffs

#### B. ISA System
**Reference**: FEATURES.md: Instruction Set Architecture System

**Goals**:
- ❌ ISA selector in die designer (x86, ARM, RISC-V, MIPS, PowerPC, SPARC)
- ❌ Research/licensing unlock system
- ❌ Thermal multiplier effects (CISC hotter, RISC cooler)
- ❌ IPC multiplier effects per ISA
- ❌ Market access gates (mobile needs ARM, desktop prefers x86)
- ❌ Licensing cost system

**Key Features**:
- Progressive unlock (start with RISC-V, license others)
- ISA characteristics affect heat and performance
- Market segmentation by ISA

#### C. Bit-Width System
**Reference**: FEATURES.md: Bit-Width System

**Goals**:
- ❌ Bit-width selector (8/16/32/64/128-bit)
- ❌ Historical unlock timeline (1975-2015)
- ❌ Early research unlock option
- ❌ Hardware limitations (max RAM/storage by width)
- ❌ Transistor/area scaling by width
- ❌ Market segmentation by width

**Key Features**:
- 8-bit: Embedded/IoT
- 32-bit: Mobile/budget
- 64-bit: Modern desktop/server
- 128-bit: HPC/vector processing

---

### Phase 9: Memory & Storage Chips ❌ NOT STARTED
**Reference**: FEATURES.md: Memory & Storage Chip Design

**Goals**:
- ❌ Add memory-specific components (SRAM: cell array, bit/word lines, sense amps; DRAM: 1T1C array, refresh logic, I/O PHY; NAND: array, charge pump, ECC, FTL)
- ❌ Implement memory metrics calculation (Capacity: rows×columns×banks; Bandwidth: bus width×clock×transfers; Latency: CAS latency calculations; Endurance: P/E cycles for NAND)
- ❌ Add memory type selection (SRAM, DDR4/5, LPDDR, GDDR, HBM, NAND Flash SLC/MLC/TLC/QLC, Advanced: MRAM/ReRAM/PCM)
- ❌ Memory-specific classifications (Cache, DRAM tiers, NAND tiers)
- ❌ Interface configuration (DDR5, GDDR6, HBM3, NVMe, SATA)

**Key Features**:
- Separate die designer mode for memory chips
- Different performance metrics (capacity, bandwidth, latency, endurance)
- Cell type selection (6T/8T SRAM, 1T1C DRAM, SLC/MLC/TLC/QLC NAND)
- 3D NAND layer stacking

---

### Phase 10: Board-Level Design ❌ NOT STARTED
**Reference**: FEATURES.md: Board-Level Design

#### A. Motherboard Design
**Goals**:
- ❌ CPU socket selection (Intel LGA, AMD AM/TR/SP sockets)
- ❌ Chipset selection (B/H/Z/X-series, determines features)
- ❌ Memory slot configuration (count, type, channels)
- ❌ Expansion slot allocation (PCIe lanes, M.2 slots)
- ❌ I/O configuration (USB, networking, audio, video)
- ❌ VRM design (phase count, power stages, capacitors)
- ❌ PCB layer count (4/6/8/10/12-layer)
- ❌ Form factor selection (ITX/mATX/ATX/EATX/EEB)

#### B. Graphics Card Design
**Goals**:
- ❌ GPU die selection from library
- ❌ VRAM configuration (type, capacity, bus width, speed)
- ❌ Power delivery (connectors, VRM phases)
- ❌ Cooling solution (air/liquid, fan count, heatsink design)
- ❌ PCB design (layers, length, slot width)
- ❌ Output configuration (DP/HDMI count, resolution support)

**Key Features**:
- Component compatibility validation
- BOM cost calculation
- Target market determination

---

### Phase 11: Die IP Licensing & Marketplace ❌ NOT STARTED
**Reference**: FEATURES.md: Die Design IP Licensing System

**Goals**:
- ❌ Create AI design firm catalog (ARM, Imagination, Synopsys, Cadence, CEVA, Rambus)
- ❌ Build IP marketplace UI (browse, search, filter, compare IP)
- ❌ Implement all license types (Purchase, Per-unit Royalty, Perpetual+Royalty, Exclusive, Time-limited)
- ❌ Add license negotiation interface
- ❌ Create IP license contract data model and localStorage persistence
- ❌ Implement pricing formulas (complexity, exclusivity, market factors)
- ❌ Add royalty payment tracking and invoicing
- ❌ Build player IP monetization system (list your designs for licensing)
- ❌ Implement AI RFQ system (AI companies request to license player IP)
- ❌ Add ARM timeline integration (1990-2020+ core progression and pricing)
- ❌ Create IP catalog by year (historical availability)
- ❌ Implement IP vendor reputation system

**Key Features**:
- Browse AI vendor IP catalogs by category (CPU, GPU, memory controller, interface)
- License IP with flexible terms (upfront vs. royalty, exclusive vs. non-exclusive)
- Track licensing costs and royalty payments per chip manufactured
- List player-designed IP for AI companies to license
- Receive upfront payments and ongoing royalty streams from IP sales
- ARM business model simulation (perpetual royalties on every chip)
- RISC-V emergence (2015+) as free alternative to ARM
- IP comparison tool (side-by-side specifications, pricing, vendor reputation)

**Files to Create**:
- `js/ipMarket.js` - AI vendor catalog, pricing engine, contract management
- `js/ipLicensing.js` - License negotiation, royalty tracking
- `ip-marketplace.html` - IP marketplace browse/search UI
- `ip-license.html` - License details and negotiation UI

---

### Phase 12: Microcontroller & Simpler Silicon Production ❌ NOT STARTED
**Reference**: FEATURES.md: Microcontroller & Simpler Silicon Production

**Goals**:
- ❌ Create MCU template library (8051, Cortex-M0/M3/M4/M7, RISC-V, AVR, PIC, MSP430)
- ❌ Build template selection UI with customization options
- ❌ Implement MCU component system (Flash ROM, SRAM, GPIO, timers, ADC, UART/SPI/I2C)
- ❌ Add template customization in die designer (memory sizes, peripheral counts)
- ❌ Implement older node economics model (180nm-350nm profitability)
- ❌ Create AI customer database (automotive OEMs, industrial, consumer electronics, IoT)
- ❌ Build Sales & Marketing screen (`sales.html`) - NEW dedicated screen
- ❌ Add RFQ system from AI system integrators
- ❌ Implement long-term supply contract negotiation
- ❌ Add marketing activities (trade shows, eval boards, reference designs, documentation)
- ❌ Create volume-based pricing calculator (0.5%-20% margins)
- ❌ Implement dev tool ecosystem tracking (compiler, debugger, IDE licensing)
- ❌ Add certification system (AEC-Q100, ISO 26262, IEC 61508)
- ❌ Build contract fulfillment and quality tracking

**Key Features**:
- Select from MCU templates (quick start) or design from scratch
- Customize memory sizes, peripherals, communication interfaces
- Target older, cost-effective nodes (180nm-350nm)
- AI customers submit RFQs for MCUs matching their requirements
- Negotiate long-term supply contracts (5-10 years, millions of units)
- Marketing investments (trade shows $50K-$200K, eval boards, reference designs)
- High-volume, low-margin business model (billions of units annually)
- Product lifecycles 10-20+ years (vs. 2-3 years for CPUs)
- Diversification: stable MCU revenue balances volatile CPU market

**Files to Create**:
- `js/mcuTemplates.js` - MCU template definitions and customization
- `js/salesMarketing.js` - AI customer database, RFQ system, contracts
- `js/mcuEconomics.js` - Volume pricing, margin calculation
- `sales.html` - Sales & Marketing screen (B2B customer management)
- `mcu-designer.html` - MCU template selection and customization UI

---

### Phase 13: Business Models & Contracts ❌ NOT STARTED
**Reference**: FEATURES.md: Business Models

**Goals**:
- ❌ Progressive business model system (Startup → Growth → Diversification → Integration → Expansion)
- ❌ Fabless designer mode (Design chips, contract fab to foundries)
- ❌ Fab services mode (Operate fabs, process wafers for customers)
- ❌ Vertical integration mechanics (Fabless→Integrated transition, Fab→Integrated transition)
- ❌ Contract negotiation UI (Wafer pricing, yield guarantees, capacity allocation, lead times)
- ❌ Financial modeling (Revenue streams, cost structures, margins)

**Key Features**:
- Choose initial path: Fabless OR Fab services
- Capital requirements differ dramatically
- Transition mechanics (3-5 year timelines, $B investments)
- Multiple contract types (Standard, Volume Commitment, Strategic Partnership)

---

### Phase 14: System Integration & OEM ❌ NOT STARTED
**Reference**: FEATURES.md: System Integration & OEM

**Goals**:
- ❌ System builder modes (White-box: 5-10% margins, Boutique: 15-25%, Brand OEM: 10-20%, Hyperscaler: 25-40%)
- ❌ Component selection system (CPU, mobo, RAM, storage, GPU, PSU, cooling, case)
- ❌ Compatibility validation (Socket matching, RAM type/speed, power calculation, physical fitment, thermal adequacy)
- ❌ Product line management (Budget/Mainstream/Gaming/Enthusiast/Workstation/Server segments)
- ❌ Supply chain management (Inventory tracking, supplier relationships, lead times, quality metrics)
- ❌ Outsourcing options (Assembly, procurement, logistics, support, full ODM)
- ❌ Quality control and RMA system (DOA tracking, warranty failures, customer satisfaction, brand reputation)

**Key Features**:
- Build complete systems (desktops, laptops, servers)
- Component compatibility checker
- Supply chain and inventory management
- Quality metrics and brand reputation
- Outsourcing strategies

---

### Phase 15: Integration & Polish ❌ NOT STARTED

**Goals**:
- ❌ Connect all phases data flow (Architecture→Wafer→Fab→Binning→Packaging→Market)
- ❌ Add economics system (Costs, pricing, profit, cash flow)
- ❌ Implement time progression (Yearly timeline 1970-2030)
- ❌ Add save/load game state (Export/import JSON)
- ❌ Tutorial and help system
- ❌ Performance optimization
- ❌ Unit tests for physics and economics
- ❌ Market simulation (Demand curves, competition, market share)
- ❌ Historical events (Tech bubbles, shortages, breakthroughs)
- ❌ Achievements and milestones
- ❌ Sandbox mode (Unlimited money, unlock all)

**Key Features**:
- End-to-end game flow
- Economic simulation
- Time-based progression
- Persistence and save system

---

## Design Philosophy

1. **Simulation-level realism**: Based on real semiconductor physics and industry data (see FEATURES.md for detailed formulas)
2. **Educational value**: Players learn about chip design tradeoffs
3. **Strategic depth**: Multiple optimization paths (performance, power, cost, yield)
4. **Visual feedback**: Clear UI showing all metrics and tradeoffs
5. **Incremental complexity**: Start simple (Architecture), add layers (Wafer→Fab→Binning→Packaging→Market)

---

## Project Structure

```
silicon-tycoon/
├── index.html                 # Wafer planner (375 lines) ✅
├── architecture.html          # Die designer (213 lines) ✅
├── README.md                  # User documentation
├── PLANNING.md                # This file (project roadmap)
├── FEATURES.md                # Technical reference manual
├── css/
│   ├── style.css             # Global Art Deco theme ✅
│   └── architecture.css       # Designer-specific styles ✅
└── js/
    ├── constants.js          # Process nodes, densities, criteria (375 lines) ✅
    ├── dieLibrary.js         # Die data management (369 lines) ✅
    ├── dieDesigner.js        # PixiJS canvas controller (500+ lines) ✅
    ├── architecture.js       # Performance engine (1,350 lines) ✅
    ├── waferPlanner.js       # Wafer yield calculations (245 lines) ✅
    ├── renderer.js           # Wafer visualization (550 lines) ✅
    ├── physics.js            # Physics engine (205 lines) ✅
    └── main.js               # Wafer app entry (299 lines) ✅

Total: ~4,300 lines of JavaScript
```

---

## Navigation Structure

**Current Tab Order**:
```
Architecture → Wafer → Fab → Binning → Packaging → IP Market → Sales → Market (future)
```

**Rationale**: Follows semiconductor manufacturing and business flow:
1. **Architecture**: Design the die (or license IP from marketplace)
2. **Wafer**: Plan how dies fit on wafers
3. **Fab**: Manufacture wafers (defects are rolled here)
4. **Binning**: Test and categorize dies
5. **Packaging**: Create final products
6. **IP Market**: License IP from vendors, or monetize your own designs
7. **Sales**: B2B sales (MCUs, simpler silicon to system integrators)
8. **Market**: B2C/retail sales (CPUs, GPUs to consumers/businesses - future)

---

## Key Milestones

### Milestone 1: Complete Wafer Planning ✅ 50% COMPLETE
- 🔄 Finish batch plan system
- 🔄 Connect Architecture → Wafer phases
- 🔄 Implement maturity system

**Target**: Complete Phase 2

### Milestone 2: Fabrication Pipeline 🔄 IN PROGRESS
- ❌ Build fab line equipment system
- ❌ Implement wafer processing simulation
- ❌ Add per-wafer defect simulation

**Target**: Complete Phase 3

### Milestone 3: Complete Manufacturing Loop ⏳ FUTURE
- ❌ Implement binning system
- ❌ Implement packaging system
- ❌ Connect Architecture→Wafer→Fab→Binning→Packaging

**Target**: Complete Phases 4-5

### Milestone 4: Architecture Enhancements ⏳ FUTURE
- ❌ Advanced IPC calculation
- ❌ ISA system
- ❌ Bit-width system

**Target**: Complete Phase 6

### Milestone 5: Product Diversification ⏳ FUTURE
- ❌ Memory chip design
- ❌ Board-level design

**Target**: Complete Phases 7-8

### Milestone 6: Business Simulation ⏳ FUTURE
- ❌ Business models
- ❌ System integration & OEM

**Target**: Complete Phases 9-10

### Milestone 7: Full Game Release ⏳ FUTURE
- ❌ Integration & polish
- ❌ Economics, time progression, save/load
- ❌ Market simulation

**Target**: Complete Phase 11

---

## Progress Summary

**Total Phases**: 13
**Completed**: 1 (Architecture)
**In Progress**: 1 (Wafer Planning - 50%)
**Not Started**: 11

**Implementation Progress**: ~15% complete
- Architecture phase: 100%
- Wafer phase: 50%
- Remaining phases: 0%

**Lines of Code**: ~4,300 (JavaScript)
**Documentation**:
- PLANNING.md: High-level roadmap (this file)
- FEATURES.md: Technical reference (~2,800 lines)
- README.md: User documentation

---

**Last Updated**: 2025-10-27
**Version**: v22 (Added IP Licensing and MCU Production phases)
**Next Focus**: Complete Wafer Planning phase (Milestone 1)
