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

### Phase 3: Fabrication ❌ NOT STARTED
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

---

### Phase 4: Binning ❌ NOT STARTED
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

### Phase 5: Packaging ❌ NOT STARTED
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

### Phase 6: PassMark Benchmark Scoring ❌ NOT STARTED

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

### Phase 7: Component Designer ❌ NOT STARTED

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

### Phase 8: Architecture Enhancements ❌ NOT STARTED

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

### Phase 11: Business Models & Contracts ❌ NOT STARTED
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

### Phase 12: System Integration & OEM ❌ NOT STARTED
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

### Phase 13: Integration & Polish ❌ NOT STARTED

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
Architecture → Wafer → Fab → Binning → Packaging → Market (future)
```

**Rationale**: Follows semiconductor manufacturing flow:
1. **Architecture**: Design the die
2. **Wafer**: Plan how dies fit on wafers
3. **Fab**: Manufacture wafers (defects are rolled here)
4. **Binning**: Test and categorize dies
5. **Packaging**: Create final products
6. **Market**: Sell and distribute (future)

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

**Total Phases**: 11
**Completed**: 1 (Architecture)
**In Progress**: 1 (Wafer Planning - 50%)
**Not Started**: 9

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

**Last Updated**: 2025-10-25
**Version**: v21 (Split from PLANNING_OLD.md)
**Next Focus**: Complete Wafer Planning phase (Milestone 1)
