# Silicon Tycoon - Project Planning Document

## Project Overview

**Silicon Tycoon** is a semiconductor design and manufacturing simulation game built with modern web technologies. The game allows players to design custom silicon dies (CPU, GPU, memory, etc.) by placing and arranging components on a canvas, then simulates realistic performance, power consumption, and manufacturing characteristics based on real-world semiconductor physics.

## Technology Stack

- **Frontend**: HTML5, CSS3 (Art Deco themed UI)
- **Rendering**: PixiJS 7.3.2 (WebGL-based canvas for die designer)
- **Architecture**: ES6 Modules
- **Storage**: Browser localStorage with auto-recovery
- **Fonts**: Google Fonts (Poiret One, Montserrat)

## Current Implementation Status

### ✅ Completed Features

#### 1. Die Library System
- **File**: `js/dieLibrary.js`
- Create, edit, clone, and delete die designs
- Die types: CPU, GPU, Memory, I/O Die, NPU, Custom
- Persistent storage with corruption recovery
- Default example dies (8-core CPU, GPU)

#### 2. Die Designer Canvas
- **File**: `js/dieDesigner.js` (500+ lines)
- PixiJS-based visual editor with grid system (5mm major, 1mm minor)
- Component placement, drag-and-drop, resizing with corner handles
- Tools: Select, Pan, Draw, Copy, Delete
- Zoom (0.5x - 5.0x) and pan controls with live zoom percentage display
- Snap-to-grid for precise placement (20 pixels per mm scale)
- Automatic component renumbering when components are deleted
- Real-time visual feedback with component highlighting

#### 3. Component System
- **File**: `js/dieLibrary.js` (COMPONENT_TYPES)
- CPU components: CPU Core, L2/L3 Cache, Integrated GPU
- GPU components: SM/CU, Texture Units, Display Engine
- Common: Memory Controller, Interconnect, Power Management, I/O Controller
- Memory: Memory Array, Control Logic
- Component density multipliers (cache 1.5x, I/O 0.6x, etc.)

#### 4. Process Node Technology
- **File**: `js/constants.js`
- Supported nodes: 10μm (1971) to 3nm (2022) - **22 total nodes**
- Historical progression: 10μm, 6μm, 3μm, 1.5μm, 1μm, 800nm, 600nm, 350nm, 250nm, 180nm, 130nm, 90nm, 65nm, 45nm, 32nm, 22nm, 16nm, 14nm, 10nm, 7nm, 5nm, 3nm
- Real-world transistor densities from industry research (0.001 MTr/mm² to 175 MTr/mm²)
- Voltage scaling: 5.0V (10μm) to 0.70V (3nm)
- Max clock scaling by node (up to 5.5 GHz at 3nm)
- Leakage power characteristics
- Defect density for yield calculations

#### 5. Performance Calculation System
- **File**: `js/architecture.js` - `calculatePerformance()`
- Realistic transistor counting using area × density × multiplier
- Clock frequency based on process node
- IPC calculation with layout efficiency factors
- Performance score based on cores, clocks, IPC
- Single-threaded performance metrics

#### 6. Power & Thermal Modeling
- Dynamic power: P = (Tr/1000) × 15W × (V/0.75)² × f
- Static leakage: Tr × leakage_per_MTr (realistic values)
- Thermal throttling at 0.50 W/mm² (consumer CPU limit)
- Power density calculation and warnings

#### 7. Layout Efficiency System
- **Interconnect penalty**: Based on average component distance
- **Clustering bonus**: Rewards grouping similar components (CPU cores, GPU SMs)
- **Die size optimization**: 150mm² sweet spot (too small or large = penalties)
- **Utilization factor**: Penalizes wasted die area

#### 8. Memory Bandwidth System
- **Area-based controller scaling**:
  - Expected areas by node (14nm: 1.3mm², 7nm: 0.9mm²)
  - Penalties for undersized: 0.5x area = 0.75x bandwidth
  - Bonuses for oversized: √(area_ratio - 1.0) × 0.25
- Bandwidth demand: 15 GB/s per CPU core, 50 GB/s per GPU SM
- Bottleneck detection and warnings

#### 9. Two-Axis Chip Classification
- **File**: `js/constants.js` - CHIP_CLASSIFICATION_CRITERIA
- **CLASS** (Performance Tier):
  - Low-Power: 1-2 cores, <15W
  - Budget: 2-4 cores, 15-65W
  - Mid-Range: 4-8 cores, 65-125W
  - High-End: 8-16 cores, 125-200W
  - Halo: 16+ cores, >200W

- **GRADE** (Market Segment):
  - Consumer: 3-8 cores/controller, 0.5-2.5 mm² L3/core
  - Workstation: Has both iGPU + discrete GPU
  - Enterprise/Server: 1.5-4 cores/controller, 3-8 mm² L3/core (huge cache)
  - Military/Aerospace: 22nm+ node, high power mgmt ratio, conservative clocks

#### 10. Manufacturing Simulation
- **Yield calculation**: Murphy's Law (Y = e^(-D × A))
- Defect density varies by process node
- Cost multiplier based on yield
- Larger dies = lower yields = higher costs

#### 11. User Interface
- **File**: `architecture.html`, `css/architecture.css`, `css/style.css`
- Art Deco aesthetic with geometric patterns
- Navigation: Architecture → Wafer → Binning → Packaging → Fab (planned)
- Die library grid view with search and filtering
- Modal dialogs for die creation/editing
- Three-panel designer layout:
  - Left: Component palette + process node selector
  - Center: PixiJS canvas with toolbar
  - Right: Properties panel (die info, performance, classification, etc.)

#### 12. Properties Panel Sections
1. **DIE INFO**: SKU, type, dimensions, area, component count, utilization
2. **PERFORMANCE**: Process node, transistors, clocks, IPC, performance score
3. **CLASSIFICATION**: Class, Grade, classification metrics
4. **POWER & THERMAL**: TDP breakdown, power density, voltage, throttle warnings
5. **EFFICIENCY FACTORS**: Layout, interconnect, clustering, bandwidth, die size, utilization
6. **MANUFACTURING**: Yield estimation, cost multiplier
7. **REQUIREMENTS**: Die type requirements validation (CPU needs cores, L2, memory controller, power mgmt)

### ✅ Advanced CPU Architecture Systems (Planned)

#### 13. Accurate IPC Calculation System

**Philosophy**: IPC (Instructions Per Cycle) is primarily determined by microarchitecture design, not process node. The process node affects clock speed and power efficiency, but architectural choices drive IPC.

**IPC Factors**:
- **Execution Width**: Number of instructions issued per cycle (1-way, 2-way, 4-way, 6-way, 8-way)
- **Out-of-Order Execution Depth**: Reorder buffer size (32, 64, 128, 256+ entries)
- **Branch Prediction Quality**: Branch prediction accuracy percentage (85%, 95%, 98%, 99%+)
- **Cache Hierarchy**: L1/L2/L3 sizes and latencies affect memory-bound workload IPC
- **Execution Units**: Number and type (ALU, FPU, SIMD, load/store units)
- **Pipeline Depth**: Shallow (10-12 stages) vs Deep (20-31 stages) affects branch misprediction penalty

**Calculation Formula**:
```
Base IPC = Execution_Width × (1 - Pipeline_Penalty) × Cache_Efficiency
Pipeline_Penalty = (1 - Branch_Accuracy) × (Pipeline_Depth / 10)
Cache_Efficiency = (L1_Hit_Rate × 1.0) + (L2_Hit_Rate × 0.7) + (L3_Hit_Rate × 0.4)
Final IPC = Base_IPC × ISA_Multiplier × Layout_Efficiency
```

**Real-World Reference Values**:
- Intel Pentium 4 (NetBurst): 1.0-2.0 IPC (deep pipeline, poor branch prediction)
- Intel Core 2 (Conroe): 2.5-3.0 IPC (wider execution, better prediction)
- Intel Sandy Bridge: 3.0-3.5 IPC (improved OoO, larger ROB)
- AMD Zen 3: 4.0-4.7 IPC (6-wide decode, 256-entry ROB)
- Apple M1 (Firestorm): 7.0-8.0 IPC (8-wide, massive 630-entry ROB)

**Component Influence**:
- CPU Core component size affects execution width and ROB size
- L1/L2/L3 Cache sizes directly impact cache efficiency
- Larger cores = potential for higher IPC but more power/heat

#### 14. Instruction Set Architecture (ISA) System

**Unlocking Mechanism**: Progressive unlock through R&D investment or licensing agreements

**Available ISAs**:

| ISA | Year | Licensing | Thermal Multiplier | IPC Multiplier | Market Access |
|-----|------|-----------|-------------------|----------------|---------------|
| **x86** | 1978 | Intel license required ($$$) | 1.3x heat | 1.0x | Desktop, Server |
| **x86-64** | 2003 | AMD/Intel license ($$$) | 1.25x heat | 1.05x | Desktop, Server, Workstation |
| **ARM v7** | 2004 | ARM license ($$) | 0.7x heat | 0.9x | Mobile, Embedded, IoT |
| **ARM v8 (64-bit)** | 2011 | ARM license ($$) | 0.75x heat | 1.0x | Mobile, Server, Desktop |
| **RISC-V (32-bit)** | 2015 | Open source (Free) | 0.8x heat | 0.95x | Embedded, IoT, Research |
| **RISC-V (64-bit)** | 2015 | Open source (Free) | 0.85x heat | 1.0x | All markets |
| **MIPS** | 1985 | MIPS license ($) | 0.9x heat | 0.9x | Embedded, Networking |
| **PowerPC** | 1992 | IBM license ($$) | 1.1x heat | 0.95x | Server, Embedded |
| **SPARC** | 1987 | Oracle license ($$) | 1.2x heat | 0.9x | Server, Enterprise |

**ISA Characteristics**:

1. **x86/x86-64** (CISC):
   - Complex instructions = fewer instructions per program
   - Higher decode complexity = more transistors, more heat
   - Variable instruction length complicates pipeline
   - Dominant in desktop/server markets (compatibility lock-in)
   - High licensing costs but guaranteed market access
   - x86-64 adds 64-bit extensions, more registers

2. **ARM** (RISC):
   - Simple, fixed-length instructions
   - Excellent power efficiency (mobile/battery devices)
   - Lower decode complexity = cooler operation
   - Requires ARM architecture license
   - v8 adds 64-bit, cryptography extensions
   - Dominates mobile, growing in server/desktop

3. **RISC-V** (RISC):
   - Open source, no licensing fees
   - Modular ISA (base + extensions)
   - Clean slate design, modern features
   - Growing ecosystem but smaller market
   - Ideal for custom/embedded applications
   - Can compete in all markets but needs software ecosystem

4. **Legacy ISAs** (MIPS, PowerPC, SPARC):
   - Historical significance, niche markets
   - Lower costs than x86, higher than RISC-V
   - Specific use cases (networking, enterprise, embedded)

**Unlock Progression**:
- **Start**: RISC-V 32-bit (free, available immediately)
- **Early Game**: Research RISC-V 64-bit OR license ARM v7
- **Mid Game**: License x86 OR ARM v8 OR develop custom ISA extensions
- **Late Game**: x86-64 license OR full custom ISA with compiler toolchain

**Market Impact**:
- Mobile devices REQUIRE ARM or efficient RISC-V
- Desktop/laptop markets EXPECT x86 compatibility
- Server market accepts ARM, x86-64, PowerPC, RISC-V
- Embedded/IoT accepts any ISA (cost-driven)

#### 15. Bit-Width System

**Historical Unlock Timeline** (Can be researched early):
- **8-bit** (1975): Intel 8080, Zilog Z80, MOS 6502
- **16-bit** (1978): Intel 8086, Motorola 68000
- **32-bit** (1985): Intel 80386, ARM v1, MIPS R2000
- **64-bit** (2003): AMD Athlon 64, Intel Itanium (2001, VLIW)
- **128-bit** (Future/Specialized): Vector extensions only (AVX-512, SVE)

**Bit-Width Characteristics**:

| Bit-Width | Max RAM | Max Storage | Transistor Multiplier | Market Segments | Typical Use |
|-----------|---------|-------------|----------------------|-----------------|-------------|
| **8-bit** | 64 KB | 64 KB | 0.3x | Embedded, IoT, Retro | Microcontrollers, sensors, simple devices |
| **16-bit** | 1 MB | 16 MB | 0.5x | Industrial, Legacy | Early PCs, control systems, some embedded |
| **32-bit** | 4 GB | 2 TB | 1.0x | Mobile, Consumer | Smartphones, budget PCs, IoT hubs |
| **64-bit** | 16 EB | 8 ZB | 1.4x | Desktop, Server | Modern PCs, servers, workstations |
| **128-bit** | Theoretical | Theoretical | 2.0x | HPC, Scientific | Supercomputers, vector processing |

**Hardware Limitations**:
- **8-bit**:
  - Addressable space: 2^8 = 256 bytes direct, 2^16 = 64KB with banking
  - Register size limits math operations
  - Single-byte data paths
  - Suitable for: Thermostats, simple sensors, retro gaming

- **16-bit**:
  - Addressable space: 2^16 = 64KB direct, 2^20 = 1MB with segmentation
  - Can address up to 16MB with extended schemes
  - Two-byte data paths
  - Suitable for: Industrial controllers, DOS-era software

- **32-bit**:
  - Addressable space: 2^32 = 4GB RAM (actual limit ~3.5GB due to memory-mapped I/O)
  - Can address 2TB storage with LBA extensions
  - Four-byte data paths
  - Suitable for: Modern mobile, budget computing, embedded systems

- **64-bit**:
  - Addressable space: 2^64 = 16 exabytes (theoretical)
  - Current hardware limits: 256TB (Windows), 128TB (Linux)
  - Eight-byte data paths, native 64-bit arithmetic
  - Required for: >4GB RAM, large databases, modern gaming, servers

- **128-bit**:
  - Not a full architecture (no 128-bit addressing needed)
  - Exists as SIMD/vector extensions (AVX-512, SVE2)
  - Processes 128-bit chunks per instruction
  - Future potential for specialized HPC applications

**Performance Scaling**:
- Wider architectures process more data per cycle
- 64-bit integer math on 32-bit CPU takes multiple instructions
- Addressing modes: 64-bit pointers are larger, use more cache space
- SIMD benefits: 128-bit vectors process 4× 32-bit values simultaneously

**Area/Transistor Requirements**:
- **Registers**: 8-bit = 8 gates/register, 64-bit = 64 gates/register
- **ALUs**: Width scales linearly (64-bit ALU ~2x area of 32-bit)
- **Data paths**: Bus width affects interconnect area
- **Address logic**: 64-bit addressing needs larger TLBs, page tables

**Component Size Impact**:
- 8-bit CPU Core: 0.5mm² @ 180nm
- 16-bit CPU Core: 0.8mm² @ 180nm
- 32-bit CPU Core: 1.5mm² @ 180nm
- 64-bit CPU Core: 2.1mm² @ 180nm
- 128-bit SIMD Unit: +0.5mm² per core

**Unlock System**:
- **Default Unlock**: Bits unlock by year (8-bit: always, 16-bit: 1978, 32-bit: 1985, 64-bit: 2003, 128-bit: 2015)
- **Research Unlock**: Player can invest R&D to unlock early
  - Research 16-bit in 1975 (3 years early): $500K, 6 months
  - Research 32-bit in 1980 (5 years early): $2M, 12 months
  - Research 64-bit in 1995 (8 years early): $10M, 24 months
  - Research 128-bit in 2010 (5 years early): $50M, 18 months

**ISA-Bit-Width Combinations**:
- x86: 16-bit, 32-bit (IA-32), 64-bit (x86-64/AMD64)
- ARM: 32-bit (v7 and earlier), 64-bit (v8+), both (v8 can run 32-bit)
- RISC-V: Modular (RV32, RV64, RV128 planned)
- MIPS: 32-bit (MIPS I-V), 64-bit (MIPS III+)

**Market Requirements**:
- Modern desktop OS: Requires 64-bit (Windows 11, macOS 10.15+)
- Mobile OS: 64-bit preferred (iOS 11+, Android modern)
- Embedded: 8-bit and 32-bit dominate (cost-sensitive)
- Server: 64-bit mandatory (large memory needs)

### 🎯 Complete Game Loop (Planned)

#### 1. **Architecture Phase** (✅ Implemented)
- Create die design from library
- Select process node
- Place and arrange components on canvas
- Optimize layout for efficiency bonuses
- Review performance, power, thermal, classification
- Check required components validation

#### 2. **Wafer Planning Phase** (🔄 50% Implemented)
- ✅ Wafer visualization with circular layout and notch
- ✅ Die placement algorithm with edge exclusion (3mm)
- ✅ Poisson-based defect distribution modeling
- ✅ Yield categorization (Perfect/Diminished/Damaged/Unusable)
- ✅ Interactive tooltips with die information
- ✅ Zoom (0.5x - 10.0x) and pan controls
- ✅ Touch support (pinch zoom, single-finger pan)
- ✅ Physics engine for transistor density and yield calculations
- ⏳ Batch plan creation and storage (not connected to die library)
- ⏳ Maturity system integration (constants exist, not used)
- ⏳ Dies per wafer calculation from reticle layout
- ⏳ Estimate batch economics (cost, time)

#### 3. **Fabrication Phase** (🔄 Planned)
- Assign batch plans to fabrication lines
- Configure wafer quantity for batch run
- Monitor wafer progress through process stages
- Track equipment utilization and throughput
- View time estimates per stage per wafer
- Manage multiple wafers in pipeline

#### 4. **Binning Phase** (🔄 Planned)
- Process completed batches from fab
- Test each die for defects
- Group dies by working component counts
- Create SKUs based on functional units
- Salvage damaged dies into lower-tier SKUs
- Handle component-specific defects (cores, cache, controllers)

#### 5. **Packaging Phase** (🔄 Planned)
- Select binned SKUs for packaging
- Configure product hierarchy (Type → Family → Line → Generation → Model → Variant)
- Design package configuration (pads, substrate, die, heat spreader)
- Enable chiplet designs with interconnects
- Assign socket compatibility
- Run packaging lines with multiple stages
- Create final market-ready products

#### 6. **Market Phase** (⏳ Future)
- Price products based on performance tier
- Manage inventory and supply chain
- Research competitor products
- Adjust production based on demand

#### 7. **Memory & Storage Chip Design** (⏳ Future Phase)
- Design memory and storage dies using same die designer canvas
- Memory-specific components and performance metrics
- Different memory technologies (SRAM, DRAM, NAND Flash)
- Capacity, bandwidth, latency, endurance calculations

#### 8. **Board-Level Design** (⏳ Future Phase)
- Design motherboards and graphics cards (extends Packaging)
- Component selection and placement
- PCB layout with layer count and trace routing
- Power delivery and feature configuration

#### 9. **Business Model & Contracts** (⏳ Future Phase)
- Choose business model (fabless, fab-only, or integrated)
- Negotiate manufacturing and design contracts
- Manage relationships with partners
- Progressive unlock toward full-stack integration

#### 10. **System Integration & OEM** (⏳ Future Phase)
- Build complete systems (PCs, servers, data centers)
- Component compatibility and selection
- Brand management and product lines
- Supply chain, quality control, customer support
- Option to outsource while retaining brand ownership

### 📊 Key Simulation Parameters

| Category | Parameters | Realism Source |
|----------|------------|----------------|
| **Transistor Density** | 0.25 MTr/mm² (180nm) to 175 MTr/mm² (3nm) | Real chips: Intel Skylake, AMD Ryzen, Apple M-series |
| **Power Modeling** | 15W per billion transistors at 1GHz | Empirical data from real processors |
| **Leakage** | 0.015 W/MTr (14nm) to 0.035 W/MTr (3nm) | Realistic ~40W leakage for 2.6B transistors |
| **Voltage** | 3.3V (180nm) to 0.70V (3nm) | Industry standard operating voltages |
| **Thermal Limits** | 0.50 W/mm² consumer, 1.20 W/mm² server | Based on real cooling solutions |
| **Yield** | Murphy's Law with realistic defect densities | Semiconductor manufacturing statistics |

### 🧩 Component Architecture

#### Architecture Phase Modules

```
DieLibrary (Singleton)
├── dies[]
│   ├── id, sku, type, description
│   ├── reticleSize { width, height }
│   ├── dimensions { width, height }
│   ├── processNode (3-10000 nm)
│   ├── components[]
│   │   ├── id, type, name
│   │   ├── dimensions { width, height }
│   │   ├── position { x, y }
│   │   └── color
│   ├── createdDate
│   └── lastModified
└── Methods: create, update, delete, clone, addComponent, etc.

DieDesigner (Canvas Controller)
├── PixiJS Application
├── Grid rendering (5mm major, 1mm minor)
├── Component sprites with drag-and-drop
├── Resize handles (corners: NE, NW, SE, SW)
├── Interaction handlers (mouse + touch)
├── Tool system (select, pan, draw, copy, delete)
└── Zoom/pan with visual feedback

ArchitectureApp (Main Controller)
├── Library management (CRUD operations)
├── Designer coordination (canvas events)
├── Performance calculations (1,070 lines of formulas)
├── UI updates (real-time properties panel)
└── Event handling (component palette, process node selection)
```

#### Wafer Phase Modules (New)

```
WaferPlanner (Core Logic)
├── Die placement algorithm
├── Yield calculation (Murphy's Law)
├── Defect distribution (Poisson)
├── Maturity-based yield adjustment
└── Yield categorization

WaferRenderer (Visualization)
├── PixiJS Application
├── Circular wafer with notch
├── Die grid with color coding
├── Interactive tooltips (click to open/close)
├── Hover highlighting
└── Zoom/pan controls (0.5x - 10.0x)

PhysicsEngine (Calculations)
├── Transistor density (Dennard scaling)
├── Defect density by process node
├── Poisson sampling for defects
└── Maturity multipliers

SiliconTycoonApp (Wafer Controller)
├── UI binding (dropdowns, sliders, buttons)
├── Calculation coordination
├── Renderer updates
└── User input validation
```

### 📁 Project Structure

```
Silicon Tycoon/
├── index.html                 # Wafer planner screen (375 lines) ✅ Implemented
├── architecture.html          # Die designer screen (213 lines) ✅ Complete
├── README.md                  # User documentation
├── PLANNING.md               # This document (development roadmap)
├── css/
│   ├── style.css             # Global Art Deco theme (150+ lines)
│   └── architecture.css       # Designer-specific styles
└── js/
    ├── constants.js          # Process nodes, densities, power, criteria (375 lines)
    ├── dieLibrary.js         # Die data management + storage (369 lines)
    ├── dieDesigner.js        # PixiJS canvas controller (500+ lines)
    ├── architecture.js       # Main app logic + performance engine (1,350 lines)
    ├── waferPlanner.js       # Wafer yield calculations (245 lines) ✅ Implemented
    ├── renderer.js           # Wafer visualization (550 lines) ✅ Implemented
    ├── physics.js            # Physics engine (205 lines) ✅ Implemented
    └── main.js               # Wafer app entry point (299 lines) ✅ Implemented

Total: ~4,300 lines of JavaScript
```

### 🔬 Realistic Simulation Details

#### Transistor Density Research
Based on analysis of 40+ real chips:
- **14nm range**: 14.3-25.0 MTr/mm² (used mid-range 19.7)
- **7nm range**: 52.0-67.0 MTr/mm² (used 60.1)
- **3nm range**: 160-190 MTr/mm² (used 175.0)

#### Component Density Multipliers
- **SRAM (L2/L3 cache)**: 1.3-1.6x (very dense bitcells)
- **Logic (CPU/GPU cores)**: 0.9-1.2x (standard cell libraries)
- **I/O controllers**: 0.6x (wide buses, pad rings)
- **Interconnect**: 0.5x (mostly wiring)
- **Power management**: 0.4x (analog circuits, larger transistors)

#### Power Calculation Evolution
**Previous (broken)**: 41M watts from capacitance formula
**Current (realistic)**: 47W dynamic + 40W leakage = 87W total for typical die

### 🎨 Additional Implemented Features

#### Quality-of-Life Features
1. **Automatic Component Renumbering** (dieDesigner.js:441-464)
   - When a component is deleted, remaining components are automatically renumbered
   - Example: Delete "CPU Core 1" from [0,1,2] → automatically becomes [0,1]
   - Maintains sequential numbering without gaps

2. **Live Zoom Percentage Display** (architecture.js:532-535)
   - Real-time zoom level displayed in toolbar
   - Updates continuously during zoom operations
   - Helps users track exact magnification level

3. **Component Copy/Paste System** (dieDesigner.js:117-122)
   - Copy selected component for duplication
   - Stores component data for paste operation
   - Quick replication of complex layouts

4. **Global Error Recovery** (architecture.html:195-208)
   - Global error handler catches uncaught exceptions
   - Prevents complete application crashes
   - Logs detailed error information for debugging

5. **Storage Corruption Recovery** (dieLibrary.js:292-325)
   - Detects localStorage corruption automatically
   - Falls back to default example dies
   - Prevents data loss from browser issues

6. **Thermal Throttling System** (architecture.js:910-935, 1046-1053)
   - Automatic clock speed reduction when power density exceeds limits
   - Recalculates power consumption with reduced clocks
   - Realistic thermal management simulation

7. **Touch Device Support**
   - Full pinch-to-zoom on mobile devices
   - Single-finger pan navigation
   - Touch-optimized tooltips and controls

#### Default Content
- **Example Dies**: Two pre-configured dies created on first launch
  - 8-core CPU design (12×10mm @ 7nm)
  - GPU design (18×15mm @ 7nm)
- Provides immediate playability without setup

---

## Design Philosophy

1. **Simulation-level realism**: Based on real semiconductor physics and industry data
2. **Educational value**: Players learn about chip design tradeoffs
3. **Strategic depth**: Multiple optimization paths (performance, power, cost)
4. **Visual feedback**: Clear UI showing all metrics and tradeoffs
5. **Incremental complexity**: Start simple, add advanced features

---

## Planned Features - Detailed Design

### 🔧 Navigation Structure

**Updated Tab Order**:
```
Architecture → Wafer → Fab → Binning → Packaging → Market (future)
```

Rationale: Fab comes before binning/packaging since you need to fabricate before you can test and package.

---

### 📐 Wafer Planning Screen

#### Purpose
Plan how dies will be arranged on wafers for fabrication. Create batch plans that can be assigned to fab lines. Shows **theoretical/expected yield projections** for planning purposes - no actual defect simulation occurs here.

#### UI Components

**Main View**:
- Wafer visualization (circular, showing reticle placements)
- Die arrangement grid within reticles
- "New Batch Plan" button (primary action)
- List of existing batch plans (library view)

**Batch Plan Creator Dialog**:
```
┌─────────────────────────────────────┐
│ New Batch Plan                      │
├─────────────────────────────────────┤
│ Select Die Design: [dropdown]      │
│ Wafer Size: ○ 200mm ○ 300mm        │
│ Reticle Size: [auto from die]      │
│                                     │
│ ┌─────────────────────────────┐   │
│ │   [Wafer Visualization]     │   │
│ │   ○ showing reticle shots   │   │
│ │     and die placements      │   │
│ └─────────────────────────────┘   │
│                                     │
│ Dies Per Wafer: 347                │
│ Reticle Shots: 52                  │
│                                     │
│ EXPECTED YIELD (by Maturity):      │
│ ┌─────────────────────────────┐   │
│ │ New Process:    45.2%       │   │
│ │ Early:          62.8%       │   │
│ │ Mature:         78.5%       │   │
│ │ Optimized:      85.3%       │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Cancel]            [Create Plan]  │
└─────────────────────────────────────┘
```

#### Data Model
```javascript
{
  id: "batch_plan_001",
  name: "Ryzen 9000X Batch",
  dieId: "die_12345",
  waferSize: 300,  // mm
  diesPerWafer: 347,
  reticleShots: 52,
  yieldByMaturity: {
    new: 0.452,      // fab just started this node
    early: 0.628,    // < 6 months
    mature: 0.785,   // 6-18 months
    optimized: 0.853 // > 18 months
  },
  createdDate: "...",
  lastModified: "..."
}
```

#### Maturity System
**Process Node Maturity** tracks how long a fab has been using a specific node:
- **New Process** (0-3 months): Lower yields, learning curve
- **Early** (3-6 months): Improving yields, optimization in progress
- **Mature** (6-18 months): Stable yields, well-understood
- **Optimized** (18+ months): Peak yields, fully refined

Yields calculated from base die yield (Murphy's Law) × maturity multiplier:
```javascript
const maturityMultipliers = {
  new: 0.75,      // 75% of base yield
  early: 1.00,    // 100% of base yield
  mature: 1.15,   // 115% of base yield
  optimized: 1.25 // 125% of base yield
};
```

---

### 🏭 Fabrication Screen

#### Purpose
Manage fabrication lines, assign batch plans, track wafer production through process stages. **This is where actual defect simulation occurs** - each wafer is "rolled" individually with randomized defects based on the defect distribution system (area-based probability, blank space absorption, etc.).

#### Fabrication Line Architecture

**Process Stages** (for modern CMOS):
1. **Oxidation**: Grow silicon dioxide layers
2. **Photolithography**: Pattern transfer using reticle
3. **Etching**: Remove unwanted material
4. **Deposition**: Add metal/dielectric layers
5. **Ion Implantation**: Doping for transistors
6. **CMP** (Chemical Mechanical Polishing): Planarization
7. **Metrology**: Measurement and inspection

Each stage requires specific equipment. Lines are defined by their equipment configuration.

#### Equipment Slot System

**Line Configuration**:
```
Fab Line 1 (7nm Capable)
├── Oxidation
│   ├── [Slot 1] Oxidation Furnace A (capacity: 25 wafers)
│   └── [Slot 2] Oxidation Furnace B (capacity: 25 wafers) [🔒 Upgradable]
├── Photolithography
│   ├── [Slot 1] EUV Scanner (capacity: 1 wafer, cycle: 45s)
│   └── [Slot 2] Empty [🔒 Upgradable]
├── Etching
│   └── [Slot 1] Plasma Etcher (capacity: 1 wafer, cycle: 90s)
├── Deposition
│   └── [Slot 1] CVD Chamber (capacity: 1 wafer, cycle: 120s)
├── Ion Implantation
│   └── [Slot 1] Ion Implanter (capacity: 1 wafer, cycle: 60s)
├── CMP
│   └── [Slot 1] CMP Tool (capacity: 1 wafer, cycle: 180s)
└── Metrology
    └── [Slot 1] Inspection System (capacity: 1 wafer, cycle: 30s)
```

**Equipment Rules**:
- Each stage can have multiple slots
- All machines in same stage must be identical (same model)
- Wafers process through stages sequentially
- Multiple wafers can be in line if equipment slots available
- Process node capability determined by equipment (especially litho)

#### Batch Assignment UI

```
┌────────────────────────────────────────────┐
│ Assign Batch to Line                      │
├────────────────────────────────────────────┤
│ Batch Plan: [Ryzen 9000X Batch ▼]        │
│ Target Line: [Fab Line 1 (7nm) ▼]        │
│                                            │
│ Wafer Quantity: [___100___] wafers        │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ TIME ESTIMATES                     │   │
│ │                                    │   │
│ │ Per Wafer Cycle Time: 8.5 min     │   │
│ │ Total Batch Time: ~14.2 hours     │   │
│ │                                    │   │
│ │ By Stage (per wafer):              │   │
│ │  Oxidation:        120s (2 slots)  │   │
│ │  Photolithography:  45s (1 slot)   │   │
│ │  Etching:           90s (1 slot)   │   │
│ │  Deposition:       120s (1 slot)   │   │
│ │  Ion Implant:       60s (1 slot)   │   │
│ │  CMP:              180s (1 slot)   │   │
│ │  Metrology:         30s (1 slot)   │   │
│ └────────────────────────────────────┘   │
│                                            │
│ Estimated Cost: $485,000                  │
│ Expected Good Dies: 27,251 (78.5% yield)  │
│                                            │
│ [Cancel]              [Start Production]  │
└────────────────────────────────────────────┘
```

#### Wafer Pipeline Visualization

```
Stage          │ Equipment Status
───────────────┼──────────────────────────────
Oxidation      │ [W95][W96] [W97][W98] [----]
Photolithography│ [W94] [----]
Etching        │ [W93]
Deposition     │ [W92]
Ion Implant    │ [W91]
CMP            │ [W90]
Metrology      │ [W89]
               │
Completed: 88 wafers | In Progress: 9 wafers | Queued: 3 wafers
Progress: ████████████████░░░░ 88%
```

#### Data Model
```javascript
// Fabrication Line
{
  id: "fab_line_001",
  name: "Fab Line 1",
  processNode: 7,
  stages: [
    {
      name: "Oxidation",
      slots: [
        { machine: "oxidation_furnace_a", capacity: 25, cycleTime: 120 },
        { machine: "oxidation_furnace_b", capacity: 25, cycleTime: 120 }
      ]
    },
    // ... more stages
  ],
  currentBatch: "batch_run_456",
  maturity: "mature",  // for this process node
  maturityStartDate: "2024-04-15"
}

// Batch Run (active production)
{
  id: "batch_run_456",
  batchPlanId: "batch_plan_001",
  lineId: "fab_line_001",
  waferCount: 100,
  status: "in_progress",
  startTime: "2025-10-24T08:00:00Z",
  estimatedEndTime: "2025-10-24T22:12:00Z",
  wafersCompleted: 88,
  wafersInProgress: 9,
  wafersQueued: 3,
  wafers: [
    {
      waferId: "W001",
      currentStage: "metrology",
      completed: true,
      defectMap: [
        // Per-die defect results from simulation
        { dieIndex: 0, defectCount: 0, hitComponents: [] },  // Perfect die
        { dieIndex: 1, defectCount: 1, hitComponents: ['blank_space'] },  // Binnable
        { dieIndex: 2, defectCount: 2, hitComponents: ['cpu_core_3', 'l3_cache'] },  // Failed
        // ... 347 dies per wafer
      ]
    },
    // ... per wafer tracking with individual defect rolls
  ]
}
```

---

### 📊 Binning Screen

#### Purpose
Test completed wafers from fab, identify defects, group dies into SKUs based on functional components.

#### Binning Process Flow

**Stages**:
1. **Die Testing**: Electrical testing of all dies on wafer (tests which components work)
2. **Sorting**: Physical separation and categorization by working components
3. **Locking**: Manually configure bin limits per SKU group
   - Disable defective cores, cache slices, or other redundant components
   - Set clock speed limits (defects can reduce max stable frequency)
   - Set voltage/power limits
   - Configure which components to enable/disable for product segmentation
4. **SKU Assignment**: Assign locked configurations to product SKUs (e.g., Ryzen 9 vs Ryzen 7 vs Ryzen 5)

#### Component-Specific Defect System

**Defect Probability** = (Component Area / Die Area) × Defect Sensitivity

```javascript
// Example: 120mm² die with 8 CPU cores
const die = {
  area: 120,
  components: [
    { type: 'cpu_core', count: 8, areaEach: 8, totalArea: 64 },
    { type: 'l3_cache', count: 1, areaEach: 24, totalArea: 24 },
    { type: 'mem_ctrl', count: 2, areaEach: 2.6, totalArea: 5.2 },
    // ...
  ]
};

// If die has 3 defects, calculate which components are hit:
for (const defect of defects) {
  const hitProbabilities = components.map(c => ({
    component: c,
    probability: c.totalArea / die.area
  }));
  // Weighted random selection
  // CPU cores: 64/120 = 53.3% chance
  // L3 cache: 24/120 = 20% chance
  // Mem ctrl: 5.2/120 = 4.3% chance
}
```

**Defect Sensitivity** varies by component:
- **CPU/GPU cores**: 1.0x (standard)
- **Cache**: 0.7x (redundant arrays, error correction)
- **Memory controllers**: 1.2x (complex digital logic)
- **I/O**: 1.5x (sensitive analog circuits)
- **Power management**: 1.3x (precision analog)

#### Binning UI

```
┌──────────────────────────────────────────────────┐
│ Binning - Batch Run #456 (Ryzen 9000X)         │
├──────────────────────────────────────────────────┤
│ Wafers Completed: 100                           │
│ Total Dies: 34,700                              │
│ Tested Dies: 27,251 (78.5% good)                │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ DETECTED DIE VARIANTS                    │   │
│ │                                          │   │
│ │ ✓ 8C/16MB/2MC  → 15,234 dies (55.9%)    │ → [Create SKU: Ryzen 9 9800X]
│ │ ⚠ 7C/16MB/2MC  →  4,821 dies (17.7%)    │ → [Create SKU: Ryzen 7 9700X]
│ │ ⚠ 6C/14MB/2MC  →  3,456 dies (12.7%)    │ → [Create SKU: Ryzen 5 9600X]
│ │ ⚠ 6C/12MB/1MC  →  2,103 dies (7.7%)     │ → [Create SKU: Ryzen 5 9500]
│ │ ⚠ 4C/8MB/1MC   →  1,637 dies (6.0%)     │ → [Create SKU: Ryzen 3 9300]
│ │                                          │   │
│ │ Legend: C=Cores, MB=L3 Cache, MC=Memory Controllers
│ └──────────────────────────────────────────┘   │
│                                                  │
│ [View Defect Map]  [Export to Packaging]       │
└──────────────────────────────────────────────────┘
```

**Binning Line Configuration** (similar to Fab):
```
Binning Line 1
├── Wafer Test
│   └── [Slot 1] Automated Test Equipment (ATE) - 1 wafer, 45min
├── Die Sort
│   └── [Slot 1] Die Sorter - 1 wafer, 15min
├── Component Mapping
│   └── [Slot 1] Failure Analysis System - 1 wafer, 30min
└── Inking/Marking
    └── [Slot 1] Laser Marker - 1 wafer, 5min
```

#### Data Model
```javascript
// Binned SKU Group
{
  id: "sku_group_001",
  batchRunId: "batch_run_456",
  componentSignature: {
    cpu_core: 8,        // working cores
    cpu_core_total: 8,  // original design
    l3_cache: 16,       // MB working
    l3_cache_total: 16,
    mem_ctrl: 2,
    mem_ctrl_total: 2,
    // ... other components
  },
  dieCount: 15234,
  qualityGrade: "A",  // A = perfect, B = minor defects, C = salvage
  avgClockCapability: 4.8,  // GHz - defects can reduce max clocks
  avgLeakage: 42,     // W - some variation

  // SKU assignment (done in binning)
  skuName: null,  // assigned by user
  targetProduct: null  // linked during packaging
}
```

---

### 📦 Packaging Screen

#### Purpose
Design product packages, configure socket/substrate/chiplet designs, assign marketing names, run packaging lines.

#### Product Hierarchy System

**7-Tier Naming Structure**:
```
Type → Family → Line → Generation → Model → Variant → Signifier

Examples:
CPU → Core → Core i → 14 → i9-14900 → K → S
CPU → Ryzen → Ryzen 9 → 9000 → 9950 → X → 3D
GPU → Radeon → RX → 7000 → 7900 → XTX → null
```

**Type**: CPU, GPU, FPGA, RAM, NPU, APU, SoC
**Family**: Brand line (Core, Ryzen, Radeon, GeForce, etc.)
**Line**: Sub-family (Core i, Ryzen 9, RX, RTX, etc.)
**Generation**: Number or year (14, 9000, 7000, 4000)
**Model**: Specific model number (i9-14900, 7900, 4090)
**Variant**: Performance tier (X, XT, K, F, etc.)
**Signifier**: Special features (3D, Ti, HX, HS, U, etc.)

#### Package Configuration

**Configuration Slots**:
1. **Pads/Contacts**: Pin count, layout (LGA, PGA, BGA)
2. **Substrate**: PCB with traces, power planes, chiplet interconnect
3. **Die(s)**: Single die or multi-die chiplet design
4. **Heat Spreader**: IHS material and design

**Chiplet System**:
- Unlocked after reaching certain tech level
- Requires interconnect component on dies (UCIe, Infinity Fabric, EMIB, etc.)
- Can combine different dies (CPU + GPU, CPU + I/O die, etc.)
- Substrate contains chiplet-to-chiplet interconnect traces

#### Packaging UI - Product Creator

```
┌──────────────────────────────────────────────────┐
│ Create New Product                              │
├──────────────────────────────────────────────────┤
│ PRODUCT NAMING                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Type:       [CPU ▼]                      │   │
│ │ Family:     [Ryzen____________]          │   │
│ │ Line:       [Ryzen 9__________]          │   │
│ │ Generation: [9000_____________]          │   │
│ │ Model:      [9800_____________]          │   │
│ │ Variant:    [X________________]          │   │
│ │ Signifier:  [_________________]          │   │
│ │                                          │   │
│ │ Full Name: AMD Ryzen 9 9800X            │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ PACKAGE CONFIGURATION                           │
│ ┌──────────────────────────────────────────┐   │
│ │ Socket: [AM5 ▼]  (Unlocked: ✓)          │   │
│ │ Package: ○ Single Die  ● Chiplet        │   │
│ │                                          │   │
│ │ ┌─ Chiplet Configuration ─────────┐    │   │
│ │ │                                  │    │   │
│ │ │  [CCD 1: 8C Zen 5 ▼]           │    │   │
│ │ │  [CCD 2: Empty     ▼]           │    │   │
│ │ │  [I/O Die: AM5 IOD ▼]           │    │   │
│ │ │  Interconnect: Infinity Fabric  │    │   │
│ │ │                                  │    │   │
│ │ └──────────────────────────────────┘    │   │
│ │                                          │   │
│ │ Substrate: [Organic (AM5) ▼]            │   │
│ │ Pads: 1718 pins (LGA)                   │   │
│ │ Heat Spreader: [Nickel-Plated Copper ▼] │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ SOURCE DIE SKU                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Binned SKU: [8C/16MB/2MC (15,234) ▼]    │   │
│ │ Reserved: [___5000___] dies              │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ [Cancel]                    [Create Product]   │
└──────────────────────────────────────────────────┘
```

#### Packaging Line Configuration

```
Packaging Line 1
├── Die Attach
│   └── [Slot 1] Die Bonder - 1 die, 15s
├── Wire Bonding (if not flip-chip)
│   └── [Slot 1] Wire Bonder - 1 die, 45s
├── Substrate Attach
│   └── [Slot 1] Substrate Mounter - 1 package, 30s
├── Underfill/Encapsulation
│   └── [Slot 1] Dispenser - 1 package, 60s
├── IHS Attach
│   └── [Slot 1] TIM Application + IHS Press - 1 package, 20s
├── Cure/Bake
│   └── [Slot 1] Thermal Oven - 25 packages, 2hr
└── Final Test
    └── [Slot 1] Package Tester - 1 package, 5min
```

#### Data Model
```javascript
// Product Definition
{
  id: "product_001",
  naming: {
    type: "CPU",
    family: "Ryzen",
    line: "Ryzen 9",
    generation: "9000",
    model: "9800",
    variant: "X",
    signifier: null,
    fullName: "AMD Ryzen 9 9800X"
  },

  package: {
    socket: "AM5",
    type: "chiplet",  // or "monolithic"
    dies: [
      { type: "CCD", skuGroupId: "sku_group_001", count: 1 },
      { type: "IOD", dieId: "am5_iod_v1", count: 1 }
    ],
    interconnect: "infinity_fabric",
    substrate: "organic_am5",
    pinCount: 1718,
    pinType: "LGA",
    heatSpreader: "nickel_copper"
  },

  sourceSkuGroup: "sku_group_001",
  diesReserved: 5000,
  unitsProduced: 0,

  performance: {
    // Inherited from die + modified by binning
    coreCount: 8,
    threadCount: 16,
    baseClockGHz: 4.2,
    boostClockGHz: 5.4,
    tdp: 120,
    l3CacheMB: 16
  }
}

// Packaging Run
{
  id: "pkg_run_001",
  productId: "product_001",
  lineId: "pkg_line_001",
  quantityTarget: 5000,
  quantityCompleted: 3847,
  status: "in_progress",
  startTime: "...",
  estimatedEndTime: "..."
}
```

---

### 💾 Memory & Storage Chip Design (Future Phase 7)

#### Purpose
Design specialized memory and storage chips using the same die designer canvas with memory-specific components. Enables vertical integration into memory production and opens new market segments.

#### Memory Technologies

**1. SRAM (Static RAM)**
- **Use Cases**: L1/L2/L3 cache chips, high-speed buffers
- **Characteristics**: Fast, expensive, volatile, no refresh needed
- **Cell Size**: 6T (6 transistors), 8T, 10T designs
- **Density**: Lower than DRAM (6-10x area per bit)
- **Performance**: 0.5-2ns access time, high bandwidth
- **Components**: SRAM cells, bit lines, word lines, sense amplifiers, control logic

**2. DRAM (Dynamic RAM)**
- **Use Cases**: System memory (DDR modules), graphics memory (GDDR)
- **Characteristics**: Moderate speed, volatile, requires refresh
- **Cell Size**: 1T1C (1 transistor + 1 capacitor)
- **Density**: 6-10x denser than SRAM
- **Types**: SDR, DDR, DDR2, DDR3, DDR4, DDR5, GDDR5/6/6X, HBM/HBM2/HBM3
- **Performance**: 10-100ns latency, high sustained bandwidth
- **Components**: Memory array, row/column decoders, sense amplifiers, refresh logic, memory controller, I/O buffers

**3. NAND Flash (Non-Volatile Storage)**
- **Use Cases**: SSDs, USB drives, memory cards, embedded storage
- **Characteristics**: Non-volatile, moderate speed, wear leveling required
- **Cell Types**:
  - SLC (Single-Level Cell): 1 bit/cell, fastest, most durable, expensive
  - MLC (Multi-Level Cell): 2 bits/cell, balanced
  - TLC (Triple-Level Cell): 3 bits/cell, high capacity, slower
  - QLC (Quad-Level Cell): 4 bits/cell, highest density, slowest, shortest life
- **Architecture**: 2D NAND, 3D NAND (V-NAND, BiCS, layers stacked vertically)
- **Performance**: 25-100µs read, 200µs-1ms write, 1-10ms erase
- **Endurance**: SLC (100K cycles), MLC (10K), TLC (3K), QLC (1K)
- **Components**: Memory array, charge pumps, page buffers, ECC engine, wear leveling controller

**4. Advanced/Specialized Memory**
- **HBM (High Bandwidth Memory)**: Stacked DRAM with through-silicon vias (TSV), 1024-bit bus
- **MRAM (Magnetoresistive RAM)**: Non-volatile, fast, emerging technology
- **ReRAM (Resistive RAM)**: Non-volatile, low power, future potential
- **Phase-Change Memory**: Non-volatile, byte-addressable, emerging
- **NOR Flash**: Fast read, slow write, used for firmware/code storage

#### Memory Die Components (Die Designer)

**SRAM Components**:
- **SRAM Cell Array**: Configurable density, 6T/8T/10T cells
- **Bit Line Drivers**: Control read/write operations
- **Word Line Drivers**: Row selection logic
- **Sense Amplifiers**: Detect cell state
- **Control Logic**: Address decoding, timing control
- **I/O Buffers**: Interface to external bus

**DRAM Components**:
- **DRAM Cell Array**: 1T1C cells in rows/columns
- **Row Decoder**: Select memory row
- **Column Decoder**: Select specific bits
- **Sense Amplifiers**: Read cell charge state
- **Refresh Logic**: Periodic capacitor recharge
- **Memory Controller**: Command scheduling, timing
- **I/O PHY**: High-speed signaling (DDR interface)

**NAND Flash Components**:
- **NAND Array**: Flash cells organized in blocks/pages
- **Charge Pump**: Generate high voltages for program/erase
- **Page Buffer**: Temporary storage for page operations
- **ECC Engine**: Error correction (BCH, LDPC codes)
- **Controller**: Flash Translation Layer (FTL), wear leveling, garbage collection
- **Interface Controller**: SATA, NVMe, eMMC, UFS

#### Memory-Specific Metrics

**Capacity Calculation**:
```
SRAM: Capacity = (Cell_Array_Area / Cell_Size) × Bits_Per_Cell
DRAM: Capacity = (Rows × Columns × Banks) × Bits_Per_Cell
NAND: Capacity = (Blocks × Pages_Per_Block × Page_Size) × Bits_Per_Cell
```

**Bandwidth Calculation**:
```
Bandwidth = (Bus_Width / 8) × Clock_Speed × Transfers_Per_Clock
DDR4: (64-bit / 8) × 3200MHz × 2 = 51.2 GB/s per channel
HBM2: (1024-bit / 8) × 1800MHz × 2 = 460 GB/s per stack
```

**Latency**:
- SRAM: 0.5-2ns (L1/L2 cache)
- DRAM CAS Latency: CL cycles / Clock frequency (DDR4-3200 CL16 = 10ns)
- NAND Read: 25-75µs (page read time)

**Endurance**:
- SRAM: Unlimited (no wear-out)
- DRAM: Unlimited writes (but data retention ~64ms, needs refresh)
- NAND: Limited P/E cycles (SLC: 100K, MLC: 10K, TLC: 3K, QLC: 1K)

**Power Consumption**:
- SRAM: ~0.5-2W per GB (active), ~0.01W per GB (idle)
- DRAM: ~3-5W per 8GB module (DDR4)
- NAND: ~2-5W per 1TB SSD (active), ~0.03W (idle)

#### Memory Die Design Process

1. **Select Memory Type**: SRAM, DRAM, NAND Flash
2. **Choose Technology**: Process node, cell type (6T/8T, SLC/MLC/TLC/QLC)
3. **Configure Capacity**: Array size, banks, channels
4. **Add Components**: Place memory array, controllers, I/O on canvas
5. **Set Interface**: DDR4/5, GDDR6, HBM, NVMe, SATA
6. **Optimize Layout**: Minimize wire length, balance areas
7. **Review Metrics**: Capacity, bandwidth, latency, power, endurance

#### Memory-Specific Classifications

**SRAM Tiers**:
- Cache: 256KB - 128MB (on-die or discrete cache chips)
- Embedded: Small arrays for SoCs
- High-Speed: Network buffers, specialized applications

**DRAM Tiers**:
- DDR4/5: Mainstream desktop/server (4GB - 128GB modules)
- LPDDR: Low-power mobile (2GB - 16GB)
- GDDR: Graphics memory (8GB - 24GB on GPUs)
- HBM: High-performance computing (8GB - 24GB stacks)

**NAND Tiers**:
- Consumer SSD: TLC/QLC, 256GB - 4TB
- Enterprise SSD: MLC/TLC, high endurance
- Embedded: eMMC, UFS in phones/tablets
- Industrial: SLC, extreme reliability

#### Data Model

```javascript
// Memory Die Design
{
  id: "mem_die_001",
  type: "DRAM",
  technology: "DDR5",
  processNode: 10,  // nm

  memoryConfig: {
    cellType: "1T1C",
    rows: 65536,
    columns: 16384,
    banks: 8,
    channels: 2,
    bitsPerCell: 1,
    capacity: "16GB",  // calculated

    // Interface
    interface: "DDR5",
    busWidth: 64,  // bits
    clockSpeed: 4800,  // MHz
    transfers: 2,  // DDR
    bandwidth: 76.8,  // GB/s per channel

    // Timing
    casLatency: 40,  // CL cycles
    accessTime: 8.33,  // ns

    // Power
    voltage: 1.1,  // V
    powerActive: 4.5,  // W per 16GB
    powerIdle: 0.8  // W
  },

  components: [
    { type: "dram_array", area: 95 },  // mm²
    { type: "sense_amp", area: 8 },
    { type: "row_decoder", area: 3 },
    { type: "col_decoder", area: 3 },
    { type: "refresh_logic", area: 2 },
    { type: "io_phy", area: 12 },
    { type: "controller", area: 7 }
  ],

  totalArea: 130,  // mm²

  performance: {
    capacity: "16GB",
    bandwidth: 76.8,  // GB/s
    latency: 8.33,  // ns
    power: 4.5,  // W active
    endurance: "unlimited"  // DRAM doesn't wear out
  }
}
```

---

### 🖥️ Board-Level Design (Packaging Extension - Future Phase 8)

#### Purpose
Design motherboards and graphics cards at the packaging phase. This extends the packaging system to include full PCB design with component selection, power delivery, and feature configuration.

#### Motherboard Design System

**Component Selection**:

1. **CPU Socket**:
   - Intel: LGA 1151, 1200, 1700, 2066 (HEDT), 3647/4677 (server)
   - AMD: AM4, AM5, TR4/sTRX4 (Threadripper), SP3/SP5 (EPYC server)
   - Historical: Socket 7, Socket A, Socket 478, LGA 775
   - Affects: Compatible CPUs, pinout, mounting mechanism

2. **Chipset Selection**:
   - Consumer: B-series (budget), H-series (mainstream), Z-series (enthusiast, OC)
   - Server: C-series (workstation), X-series (HEDT), server chipsets
   - Determines: PCIe lanes, USB ports, SATA ports, overclocking support, memory channels

3. **Memory Configuration**:
   - Slot count: 2, 4, 8 slots (consumer), up to 24 slots (server)
   - Memory type: DDR4, DDR5, LPDDR (soldered), ECC support
   - Capacity: Max per slot (8GB, 16GB, 32GB, 64GB), total max capacity
   - Channels: Dual-channel, quad-channel, octa-channel (server)

4. **Expansion Slots**:
   - PCIe Gen 3/4/5, x1/x4/x8/x16 configurations
   - Total lane allocation (CPU lanes + chipset lanes)
   - M.2 slots for NVMe SSDs (Key M, Gen3/4/5)
   - Legacy: PCI, AGP (historical boards)

5. **Storage Interfaces**:
   - SATA: 3.0 (6 Gbps), port count (2-12 ports)
   - M.2: NVMe (PCIe), count and generation
   - U.2/U.3: Enterprise NVMe
   - Legacy: IDE/PATA (historical)

6. **I/O Configuration**:
   - **USB**: 2.0, 3.0, 3.1 Gen2, 3.2, 4.0 (port counts)
   - **Networking**: Gigabit Ethernet, 2.5G/10G, Wi-Fi 6/6E/7
   - **Audio**: Realtek ALC codec (budget), Creative/ESS (premium)
   - **Video**: HDMI, DisplayPort (if iGPU support)
   - **Legacy**: PS/2, Serial, Parallel ports

7. **Power Delivery (VRM)**:
   - **Phases**: 4-phase (budget), 8-12 phase (mainstream), 16-20+ phase (enthusiast/server)
   - **Power Stages**: Analog (cheap), digital (efficient, monitored)
   - **Capacitors**: Solid vs electrolytic, affects longevity and ripple
   - **Heatsinks**: Passive cooling on VRM, affects sustained boost clocks
   - **Connectors**: 24-pin ATX, 4+4-pin CPU, 8-pin CPU (HEDT), 8+8-pin (extreme OC)

**PCB Layout Design**:

1. **Layer Count**:
   - 4-layer: Budget boards, simple layouts
   - 6-layer: Mainstream, better signal integrity
   - 8-layer: Enthusiast, reduced crosstalk
   - 10-12 layer: High-end/server, complex routing, power planes

2. **Trace Routing**:
   - Memory traces: Length matching critical for DDR (±25ps skew)
   - PCIe lanes: Differential pairs, impedance controlled
   - Power distribution: Wide traces, multiple planes
   - Signal integrity: Minimize vias, avoid crossover

3. **Form Factors**:
   - Mini-ITX: 170×170mm (compact, limited expansion)
   - Micro-ATX: 244×244mm (budget/mainstream)
   - ATX: 305×244mm (standard desktop)
   - E-ATX: 305×330mm (enthusiast, extra slots)
   - SSI EEB: 305×330mm (dual-socket server)
   - Proprietary: OEM-specific (Dell, HP compact designs)

**Feature Configuration UI**:
```
┌──────────────────────────────────────────────────┐
│ Design Motherboard                              │
├──────────────────────────────────────────────────┤
│ PLATFORM                                         │
│ Socket: [AM5 ▼]      Chipset: [X670E ▼]        │
│ Form Factor: [ATX ▼]  Layers: [8-layer ▼]      │
│                                                  │
│ MEMORY                                           │
│ Type: [DDR5 ▼]       Slots: [4 ▼]               │
│ Max Speed: 6400 MHz  Max Capacity: 128GB        │
│                                                  │
│ EXPANSION                                        │
│ PCIe 5.0 x16: [2] slots                         │
│ PCIe 4.0 x4:  [1] slots                         │
│ PCIe 3.0 x1:  [2] slots                         │
│ M.2 PCIe 5.0: [2] slots                         │
│ M.2 PCIe 4.0: [2] slots                         │
│                                                  │
│ STORAGE                                          │
│ SATA 3.0: [6] ports                             │
│                                                  │
│ I/O PANEL                                        │
│ USB 3.2 Gen2: [4]    USB 3.2 Gen1: [4]          │
│ USB 2.0: [4]         USB-C: [2]                 │
│ Network: [2.5G Intel I226-V ▼]                  │
│ Wi-Fi: [Wi-Fi 6E ▼]                             │
│ Audio: [Realtek ALC4080 ▼]                      │
│ Video: ☑ HDMI 2.1   ☑ DisplayPort 1.4          │
│                                                  │
│ POWER DELIVERY                                   │
│ VRM Phases: [16+2 (CPU+SoC) ▼]                 │
│ Power Stages: [90A Digital ▼]                   │
│ Capacitors: [Solid Japanese ▼]                  │
│ VRM Cooling: [Heatsink + Heatpipe ▼]           │
│                                                  │
│ Estimated Cost: $145 BOM                        │
│ Target Market: Enthusiast Desktop               │
│                                                  │
│ [Cancel]                    [Create Board]      │
└──────────────────────────────────────────────────┘
```

#### Graphics Card Design System

**GPU Die Selection**:
- Use previously designed GPU dies from die library
- Or license existing GPU designs (historical: Nvidia, AMD)

**VRAM Configuration**:
- **Type**: GDDR5, GDDR6, GDDR6X, HBM2, HBM3
- **Capacity**: 4GB, 6GB, 8GB, 12GB, 16GB, 24GB, 48GB
- **Bus Width**: 128-bit, 192-bit, 256-bit, 384-bit, 512-bit (HBM: 1024-bit+)
- **Speed**: GDDR6: 14-21 Gbps, HBM2: 2-3.6 Gbps (but much wider bus)
- **Bandwidth**: GDDR6 384-bit @ 18Gbps = 864 GB/s, HBM2 4096-bit @ 2.4Gbps = 1.2 TB/s

**Power Delivery**:
- **Connectors**: Single 6-pin (75W), 8-pin (150W), dual 8-pin (300W), 12VHPWR/12V-2×6 (450-600W)
- **VRM Phases**: 6-8 phase (budget), 10-14 phase (mid-range), 16-24 phase (high-end)
- **Power Limit**: Affects boost clocks and sustained performance

**Cooling Solution**:
- **Air Cooling**:
  - Single-fan: Budget, low power GPUs (<150W)
  - Dual-fan: Mainstream (150-250W)
  - Triple-fan: High-end (250-450W)
  - Heatsink size: Affects cooling capacity and noise
- **Liquid Cooling**:
  - AIO (All-In-One): Pre-attached radiator
  - Hybrid: Air+liquid combined
  - Custom loop compatible: Water block instead of air cooler

**PCB Design**:
- **Layers**: 6-layer (budget), 8-10 layer (mainstream), 12-14 layer (high-end)
- **Length**: 170mm (compact), 267mm (standard), 305mm+ (high-end/server)
- **Slot Width**: Single-slot, 2-slot, 2.5-slot, 3-slot, 4-slot (extreme cooling)

**Output Configuration**:
- **Digital**: HDMI 2.0/2.1, DisplayPort 1.4/2.0/2.1
- **Count**: 3-5 outputs typical
- **Legacy**: DVI, VGA (historical cards)
- **Max resolution**: 4K, 8K support
- **Max monitors**: Depends on GPU capabilities

**Graphics Card Creator UI**:
```
┌──────────────────────────────────────────────────┐
│ Design Graphics Card                            │
├──────────────────────────────────────────────────┤
│ GPU DIE                                          │
│ Design: [Custom RTX-class GPU ▼]               │
│ Die Size: 295mm²     Process: 5nm              │
│ Shaders: 7680        TDP: 285W                  │
│                                                  │
│ MEMORY                                           │
│ Type: [GDDR6X ▼]     Speed: [21 Gbps ▼]        │
│ Capacity: [12GB ▼]   Bus: [192-bit ▼]          │
│ Bandwidth: 504 GB/s                             │
│                                                  │
│ POWER                                            │
│ Connectors: [1x 12VHPWR (16-pin) ▼]            │
│ TBP: 285W            VRM: [14-phase ▼]          │
│                                                  │
│ COOLING                                          │
│ Type: [Triple-Fan Air ▼]                        │
│ Heatsink: [Vapor Chamber + Heatpipes ▼]        │
│ Fans: [3x 90mm Axial ▼]                        │
│                                                  │
│ PHYSICAL                                         │
│ Form: [2.5-slot ▼]   Length: [285mm ▼]         │
│ PCB: [10-layer ▼]                               │
│                                                  │
│ OUTPUTS                                          │
│ DisplayPort 2.1: [3]                            │
│ HDMI 2.1a: [1]                                  │
│                                                  │
│ Estimated BOM: $320                             │
│ Target MSRP: $799                               │
│ Target Market: Enthusiast Gaming (1440p/4K)     │
│                                                  │
│ [Cancel]                      [Create Card]     │
└──────────────────────────────────────────────────┘
```

---

### 🏢 Business Model & Market Strategy (Future Phase 9)

#### Purpose
Transform from single-focus company into multi-faceted semiconductor powerhouse through progressive business model evolution. Choose between design excellence, manufacturing capability, or vertical integration.

#### Progressive Business Model Evolution

**Stage 1 - Startup (Game Begin)**:
- **Choose Initial Path**:
  - **Fabless Designer**: Start with design team, no fabrication capability
    - Capital requirement: Low ($5M-$20M)
    - Revenue: Chip sales through contract manufacturing
    - Risk: Dependent on fab partners

  - **Fab Services**: Start with small fabrication facility, no design team
    - Capital requirement: High ($500M-$2B for first fab)
    - Revenue: Wafer manufacturing fees from design companies
    - Risk: Need consistent customer pipeline

- Cannot afford both initially

**Stage 2 - Growth (Early-Mid Game)**:
- **Fabless Path**: Expand design capabilities
  - Hire more architects, unlock new ISAs
  - Build die library, enter new markets
  - Negotiate better fab contracts (volume discounts)
  - Begin considering fab acquisition/partnership

- **Fab Path**: Expand manufacturing capabilities
  - Upgrade equipment, unlock new process nodes
  - Increase capacity, add production lines
  - Attract bigger design customers
  - Consider acquiring design capability

**Stage 3 - Diversification (Mid Game)**:
- **Fabless → Adding Fab**: Build or acquire small fab
  - Options: Build new fab ($2-5B, 3-5 years), acquire existing fab ($1-3B), joint venture
  - Benefits: Guaranteed capacity, better margins, supply chain control
  - Challenges: Huge capital investment, operational complexity

- **Fab → Adding Design**: Hire design team or acquire design house
  - Options: Build internal team ($50-200M, 2-3 years), acquire design company
  - Benefits: Own-brand chips, higher margins, market diversification
  - Challenges: Cultural shift, IP development, market competition

**Stage 4 - Vertical Integration (Late Game)**:
- **Full-Stack Company**: Design + Fab + Packaging + Products
  - Examples: Intel, Samsung
  - Advantages: Full control, maximum margins, vertical optimization
  - Challenges: Massive capital requirements, operational complexity

**Stage 5 - Market Expansion (End Game)**:
- **System Integration**: Build complete products
- **Brand Establishment**: Consumer-facing brands
- **Ecosystem Development**: Software, platforms, services
- Options to divest non-core assets (spin-off fab like AMD→GlobalFoundries)

#### Fabless Designer Business Model

**Core Activities**:
- Design CPU, GPU, memory, custom chips
- License ISAs (x86, ARM)
- Contract fabrication to foundries (TSMC, Samsung, GlobalFoundries, Intel Foundry)
- Manage testing, packaging, distribution

**Revenue Streams**:
- Chip sales to OEMs, distributors, direct customers
- IP licensing (sell designs to other companies)
- Royalties from licensed ISA implementations

**Cost Structure**:
- R&D (design teams, EDA tools): 20-30% revenue
- Wafer costs from fabs: 30-50% revenue
- Marketing and sales: 10-15% revenue
- License fees (ISA, EDA, IP): 5-10% revenue

**Advantages**:
- Lower capital requirements (no fab investment)
- Focus on core competency (chip design)
- Flexibility to switch fabs, use best process nodes
- Faster market entry

**Disadvantages**:
- Dependent on fab capacity allocation
- Lower margins (fab takes cut)
- Supply chain risks (fab delays, shortages)
- Less control over manufacturing quality
- Vulnerable to fab partner becoming competitor

**Contract Negotiation System**:
```javascript
// Fabrication Contract
{
  id: "contract_001",
  fabPartner: "TSMC",
  type: "wafer_manufacturing",

  terms: {
    duration: 36,  // months
    processNode: 7,  // nm
    minimumWafers: 5000,  // per quarter
    maximumWafers: 20000,  // capacity allocation
    pricePerWafer: 12000,  // USD (7nm pricing)

    yieldGuarantee: 0.75,  // minimum 75% yield
    priorityLevel: "standard",  // standard, high, critical
    leadTime: 90,  // days from order to delivery

    penalties: {
      missedDeadline: 5000,  // per wafer per week
      belowYield: "refund",  // refund or credit
      capacityCut: "renegotiate"  // if fab reduces allocation
    }
  },

  licensingFees: {
    processNodeAccess: 5000000,  // one-time fee per node
    ipLicense: 2000000,  // if using fab's IP (SerDes, PHY)
    exclusivity: null  // pay extra for capacity guarantee
  },

  status: "active",
  wafersOrdered: 15000,
  wafersDelivered: 12500,
  nextRenewal: "2026-Q2"
}
```

**Real-World Examples**:
- **AMD**: Fabless since GlobalFoundries spin-off (2009)
- **Nvidia**: Always fabless, uses TSMC
- **Qualcomm**: Fabless mobile chip leader
- **Apple Silicon**: Fabless, designs A/M-series, uses TSMC
- **MediaTek**: Fabless, mobile/consumer chips

#### Fab Services Business Model

**Core Activities**:
- Operate fabrication facilities (fabs)
- Process wafers for design companies
- Maintain equipment, upgrade process nodes
- Manage yields, quality control, capacity allocation

**Revenue Streams**:
- Wafer manufacturing fees (per-wafer pricing)
- Process development fees (new node R&D contracts)
- IP licensing (PHY, SerDes, specialized blocks)
- Mask set fees (reticle production)

**Cost Structure**:
- Capital expenditure (fab construction, equipment): 40-50% revenue
- Operations (labor, materials, utilities, maintenance): 30-40% revenue
- R&D (new process nodes): 15-20% revenue
- Depreciation: Fabs depreciate over 5-7 years

**Advantages**:
- Steady revenue from multiple customers
- Diversified customer base reduces risk
- Process technology leadership (attract premium customers)
- High barriers to entry (protects from competition)

**Disadvantages**:
- Massive capital requirements ($10-20B per leading-edge fab)
- Constant R&D needed (Moore's Law treadmill)
- Capacity utilization critical (idle fab loses money)
- Customer concentration risk (Apple = 25% of TSMC revenue)
- Geopolitical risks (fab locations matter)

**Contract Types**:

1. **Standard Wafer Contract**:
   - Pay-per-wafer pricing
   - No capacity guarantee
   - Flexible volumes
   - Used by small/medium customers

2. **Volume Commitment Contract**:
   - Minimum quarterly wafer commitment
   - Lower per-wafer pricing (10-20% discount)
   - Priority capacity allocation
   - Multi-year agreement

3. **Strategic Partnership**:
   - Joint process development
   - Guaranteed capacity allocation
   - Exclusive access to new nodes (6-12 month window)
   - Highest priority, lowest pricing
   - Example: Apple + TSMC

4. **Technology Development Contract**:
   - Customer funds specific process R&D
   - Gets early access or exclusive use
   - Fab gains new capability for future customers

**Capacity Allocation System**:
```javascript
// Fab Capacity Management
{
  fabId: "fab_001",
  location: "Taiwan, Hsinchu",
  processNode: 5,  // nm

  capacity: {
    totalWafersPerMonth: 50000,
    utilization: 0.92,  // 92% utilized

    allocation: [
      { customer: "Apple", wafers: 12500, priority: "strategic" },  // 25%
      { customer: "AMD", wafers: 10000, priority: "high" },  // 20%
      { customer: "Nvidia", wafers: 10000, priority: "high" },  // 20%
      { customer: "Qualcomm", wafers: 7500, priority: "high" },  // 15%
      { customer: "MediaTek", wafers: 4000, priority: "standard" },  // 8%
      { customer: "Spot_Market", wafers: 2000, priority: "low" },  // 4% buffer
    ],

    reserved: 4000  // 8% reserved for yield loss, maintenance
  },

  pricing: {
    strategic: 15000,  // per wafer
    high: 16000,
    standard: 17500,
    spot: 20000  // premium for uncommitted capacity
  },

  queuedOrders: 15000,  // backlog
  leadTime: 120  // days
}
```

**Real-World Examples**:
- **TSMC**: Pure-play foundry leader, 60% market share
- **Samsung Foundry**: Second-largest, also makes own chips
- **GlobalFoundries**: Spun from AMD, stopped at 12nm
- **Intel Foundry Services**: New division, traditionally internal-only
- **SMIC**: Chinese foundry, geopolitical constraints

#### Vertically Integrated Model

**Core Activities**:
- Everything: Design, fab, package, test, sell, support

**Real-World Examples**:
- **Intel**: Designs x86 CPUs + operates fabs (now adding foundry services)
- **Samsung**: Designs Exynos + operates fabs + foundry services + sells phones
- **Texas Instruments**: Analog/embedded chips, captive fabs

**Advantages**:
- Maximum control over entire value chain
- Highest potential margins (no middlemen)
- Can optimize design for manufacturing
- Supply chain independence

**Disadvantages**:
- Requires massive capital ($50B+ for full stack)
- Operational complexity across very different businesses
- Risk if design OR fab falls behind (Intel's recent struggles)
- Less flexibility (stuck with own fab even if competitors have better process)

#### Business Model Transition Mechanics

**Fabless → Integrated**:
```
Year 0: Successful fabless company, $5B revenue
Year 1: Announce fab construction, raise $10B
Year 2-4: Fab construction (3-5 years)
Year 5: Fab operational, begin internal production
Year 5-7: Transition contracts from TSMC to internal fab
Year 8+: Fully integrated, possibly offer foundry services
```

**Fab → Integrated**:
```
Year 0: Fab services company, processing for others
Year 1: Acquire design company OR hire design team
Year 2-3: Develop first in-house chip designs
Year 4: Launch own-brand chips
Year 5+: Dual model (own chips + foundry services like Samsung)
```

---

### 🏭 System Integration & OEM (Future Phase 10)

#### Purpose
Become a system builder, creating complete products for end customers. Integrate components into PCs, servers, workstations, or data center systems. Build brand value and own the customer relationship.

#### System Builder Modes

**1. White-Box Integrator** (Entry Level):
- Build generic systems with commodity branding
- Focus on value, customization, B2B
- Examples: CyberPowerPC, iBUYPOWER, Puget Systems
- Low margins (5-10%), high volume

**2. Boutique System Builder** (Specialty):
- High-end custom builds, premium components
- Niche markets: gaming, workstations, silent PCs
- Examples: Falcon Northwest, Origin PC, Maingear
- Higher margins (15-25%), lower volume, enthusiast focus

**3. Brand OEM** (Large Scale):
- Own brand, mass production, retail/enterprise sales
- Examples: Dell, HP, Lenovo, System76
- Medium margins (10-20%), massive volume
- Marketing and brand management critical

**4. Hyperscaler** (Enterprise):
- Design own server/datacenter hardware
- Vertical integration for efficiency
- Examples: Google TPU servers, AWS Graviton servers, Meta OCP
- Best margins (25-40%), captive use
- Requires chip design capability

#### Component Selection & Compatibility System

**Build Configuration Workflow**:

1. **Select Form Factor**:
   - Desktop: Mini-ITX, Micro-ATX, ATX, E-ATX
   - Laptop: Ultrabook, gaming laptop, mobile workstation
   - Server: 1U/2U/4U rack-mount, tower, blade
   - All-in-One: iMac-style integrated display

2. **Choose CPU**:
   - From own chip designs OR purchase from Intel/AMD/ARM vendors
   - Determines socket, power requirements, cooling needs
   - Affects: Motherboard choice, RAM type, PCIe generation

3. **Select Motherboard**:
   - Must match CPU socket
   - Determines: RAM slots, expansion options, I/O
   - Use own motherboard designs OR purchase from Asus/Gigabyte/ASRock/MSI

4. **Configure Memory**:
   - Type/speed must match motherboard (DDR4/DDR5)
   - Capacity based on market segment and budget
   - Use own memory OR purchase from Samsung/SK Hynix/Micron
   - Consumer: 8-32GB, Workstation: 32-128GB, Server: 128GB-2TB

5. **Select Storage**:
   - Boot drive: NVMe SSD (fast, expensive)
   - Data storage: SATA SSD or HDD (cheaper, bulk)
   - Use own storage OR Outsource
   - Consumer: 512GB-2TB, Workstation: 1-4TB, Server: 4-100TB

6. **Choose GPU (if discrete)**:
   - Use own GPU designs OR purchase Nvidia/AMD cards
   - Affects: Power supply requirements, case size, cooling
   - Consumer: None (iGPU), Entry ($200), Mid ($400), High ($800), Enthusiast ($1500+)

7. **Select Power Supply**:
   - Wattage: Calculate from components (CPU+GPU+20% headroom)
   - Efficiency: 80+ Bronze/Silver/Gold/Platinum/Titanium
   - Modularity: Non-modular (cheap), Semi-modular, Fully modular
   - Consumer: 450-750W, Gaming: 750-1000W, Workstation: 1000-1600W

8. **Configure Cooling**:
   - CPU cooling: Stock cooler, tower air, AIO liquid (120/240/280/360mm)
   - Case fans: Airflow vs static pressure, RGB options
   - Affects: Noise levels, sustained performance, aesthetics

9. **Select Case**:
   - Must fit motherboard form factor
   - GPU length clearance, cooler height clearance
   - Aesthetics: Mesh airflow, glass panel, RGB, minimalist
   - Budget: $50-100, Mid: $100-200, Premium: $200-400

10. **Add Peripherals** (optional for complete systems):
    - Monitor, keyboard, mouse, speakers
    - Operating system license
    - Warranty and support package

**Compatibility Checking System**:
```javascript
// Compatibility Rules
function validateBuild(components) {
  const issues = [];

  // Socket compatibility
  if (components.cpu.socket !== components.motherboard.socket) {
    issues.push("CPU socket mismatch");
  }

  // RAM compatibility
  if (components.motherboard.ramType !== components.ram.type) {
    issues.push("RAM type incompatible (DDR4 vs DDR5)");
  }
  if (components.ram.speed > components.motherboard.maxRamSpeed) {
    issues.push(`RAM will run at ${components.motherboard.maxRamSpeed}MHz, not ${components.ram.speed}MHz`);
  }

  // Power requirements
  const totalPower = components.cpu.tdp +
                     (components.gpu?.tdp || 0) +
                     (components.ram.count * 5) +
                     (components.storage.count * 5) + 30;  // +30W overhead
  if (totalPower > components.psu.wattage * 0.8) {  // 80% max recommended
    issues.push(`PSU underpowered: ${totalPower}W needed, ${components.psu.wattage * 0.8}W safe limit`);
  }

  // Physical fitment
  if (components.gpu.length > components.case.gpuClearance) {
    issues.push("GPU too long for case");
  }
  if (components.cooler.height > components.case.coolerClearance) {
    issues.push("CPU cooler too tall for case");
  }
  if (!components.case.supportedFormFactors.includes(components.motherboard.formFactor)) {
    issues.push("Motherboard won't fit in case");
  }

  // Cooling adequacy
  const heatOutput = components.cpu.tdp + (components.gpu?.tdp || 0);
  if (heatOutput > 300 && components.case.airflow === "restricted") {
    issues.push("High-power components need better airflow case");
  }

  return {
    compatible: issues.length === 0,
    issues: issues,
    warnings: generateWarnings(components)
  };
}
```

#### Product Line Management

**Market Segmentation**:

1. **Budget Desktop** ($400-$700):
   - Entry CPU (4-6 cores), integrated graphics
   - 8-16GB DDR4, 256-512GB SSD
   - Basic motherboard, stock cooling
   - Target: Office work, web browsing, students

2. **Mainstream Desktop** ($700-$1200):
   - Mid-range CPU (6-8 cores), optional discrete GPU
   - 16GB DDR4/DDR5, 512GB-1TB NVMe
   - Good motherboard, tower cooler
   - Target: General use, light gaming, productivity

3. **Gaming Desktop** ($1200-$2500):
   - High-performance CPU (8-12 cores), strong GPU
   - 16-32GB DDR5, 1-2TB NVMe
   - Enthusiast motherboard, AIO cooling, RGB
   - Target: 1080p/1440p/4K gaming, streaming

4. **Enthusiast/HEDT** ($2500-$5000+):
   - HEDT CPU (16-32 cores), top-tier GPU(s)
   - 64-128GB DDR5, 2-4TB NVMe RAID
   - Premium motherboard, custom cooling
   - Target: Content creation, 3D rendering, extreme gaming

5. **Workstation** ($2000-$10000+):
   - Workstation CPU (Xeon, Threadripper, EPYC)
   - ECC RAM 64-256GB, professional GPU (Quadro, Radeon Pro)
   - Workstation motherboard, reliable components
   - Target: CAD, simulation, video editing, scientific computing

6. **Server** ($3000-$50000+):
   - Server CPUs (1-4 sockets), optional GPUs
   - ECC RAM 128GB-2TB, redundant storage (RAID)
   - Server motherboard, redundant PSUs, IPMI management
   - Target: Enterprise, data centers, cloud providers

**Brand & Pricing Strategy**:
```javascript
// Product Line Definition
{
  brand: "TechCraft Systems",

  productLines: [
    {
      name: "EssentialPC",
      segment: "budget",
      priceRange: [400, 700],
      margin: 8,  // %
      volume: "high",
      warranty: "1 year",
      support: "email only"
    },
    {
      name: "PowerStation",
      segment: "gaming",
      priceRange: [1200, 2500],
      margin: 15,  // %
      volume: "medium",
      warranty: "2 years",
      support: "phone + email"
    },
    {
      name: "ProWorkstation",
      segment: "professional",
      priceRange: [2000, 10000],
      margin: 20,  // %
      volume: "low",
      warranty: "3 years + on-site",
      support: "dedicated account manager"
    }
  ],

  brandReputation: 85,  // out of 100
  marketShare: 2.3,  // % of global PC market

  customization: {
    allowConfigChanges: true,
    partUpgrades: true,
    buildTimeImpact: "2-5 days",
    customizationFee: 50  // USD
  }
}
```

#### Supply Chain Management

**Component Sourcing**:
```javascript
// Component Inventory
{
  component: "DDR5-5600 16GB DIMM",
  supplier: "SK Hynix",

  inventory: {
    onHand: 5000,  // units
    onOrder: 10000,  // ordered but not delivered
    reserved: 3000,  // allocated to confirmed builds
    available: 2000  // on-hand minus reserved
  },

  pricing: {
    unit Cost: 45,  // wholesale
    volumeBreaks: [
      { quantity: 1000, price: 45 },
      { quantity: 5000, price: 42 },
      { quantity: 10000, price: 40 }
    ]
  },

  leadTime: {
    standard: 30,  // days
    expedited: 7,  // days, +20% cost
    rush: 3  // days, +50% cost
  },

  qualityMetrics: {
    defectRate: 0.002,  // 0.2% DOA
    rmaRate: 0.015,  // 1.5% fail within warranty
    supplierRating: 92  // out of 100
  }
}
```

**Outsourcing Options**:

Player can outsource while retaining brand ownership:

1. **Assembly Outsourcing**:
   - Contract manufacturer assembles systems
   - Player designs configs, sources some components
   - Benefits: Lower labor costs, faster scaling
   - Cost: 5-10% margin reduction

2. **Component Procurement Outsourcing**:
   - Third-party handles supplier relationships
   - Benefits: Better pricing (volume aggregation), less complexity
   - Cost: 2-5% fee on component costs

3. **Logistics Outsourcing**:
   - 3PL (third-party logistics) handles warehousing, shipping
   - Benefits: Global reach, expertise, flexible capacity
   - Cost: $5-20 per unit + warehousing fees

4. **Support Outsourcing**:
   - Call center handles tier-1 support
   - Benefits: 24/7 coverage, multilingual, scalable
   - Cost: $15-40 per ticket OR $10K-50K/month retainer

5. **Full ODM** (Original Design Manufacturer):
   - ODM designs AND builds entire system
   - Player just does branding and marketing
   - Benefits: Minimal investment, fast to market
   - Cost: Lowest margins (3-7%), least control

**Quality Control & RMA Management**:
```javascript
// Quality Tracking
{
  productSKU: "PowerStation-RTX4070-001",
  unitsProduced: 5000,

  qualityMetrics: {
    doa: 15,  // dead on arrival (0.3% - good)
    withinWarranty: 75,  // failed within warranty (1.5% - acceptable)
    customerSatisfaction: 4.3,  // out of 5

    topIssues: [
      { component: "RAM", count: 25, issue: "failed stick" },
      { component: "SSD", count: 20, issue: "died within 6 months" },
      { component: "GPU", count: 15, issue: "coil whine" },
      { component: "PSU", count: 10, issue: "fan noise" }
    ]
  },

  rmaProcess: {
    policyLength: 24,  // months
    policyType: "depot",  // depot, advanced replacement, on-site
    avgTurnaround: 7,  // days
    cost PerRMA: 85,  // avg cost to process

    componentReliability: {
      ownChips: 0.005,  // 0.5% failure rate
      thirdParty: 0.015  // 1.5% failure rate
    }
  },

  brandImpact: {
    positiveReviews: 4200,
    negativeReviews: 380,
    netPromoterScore: 65  // good = >50
  }
}
```

---

## Implementation Roadmap

### Phase 1: Architecture ✅ COMPLETE
- [x] Die designer canvas with grid system
- [x] Component palette with 11 component types
- [x] Drag-and-drop component placement
- [x] Component resize with corner handles
- [x] Tool system (select, pan, draw, copy, delete)
- [x] Die library CRUD operations
- [x] Process node selection (22 nodes)
- [x] Performance calculation engine (1,350 lines)
- [x] Power & thermal modeling with throttling
- [x] Chip classification (CLASS + GRADE)
- [x] Layout efficiency system (7 factors)
- [x] Properties panel with real-time updates
- [x] localStorage persistence with corruption recovery

### Phase 2: Wafer Planning 🔄 50% COMPLETE (Current Phase)

**Completed:**
- [x] Wafer planner UI skeleton (index.html)
- [x] Wafer visualization with PixiJS (renderer.js)
- [x] Die placement algorithm with edge exclusion
- [x] Physics engine for transistor density
- [x] Poisson defect distribution
- [x] Yield calculation (Murphy's Law)
- [x] Yield categorization system
- [x] Interactive tooltips with die info
- [x] Zoom/pan controls with touch support
- [x] Process node dropdown (22 nodes)
- [x] Wafer size selection (8 sizes)
- [x] Reticle size selection (11 sizes)
- [x] Process maturity slider

**Remaining:**
- [ ] Batch plan data model and storage
- [ ] Integration with die library (connect phases)
- [ ] Maturity system implementation
- [ ] Dies per wafer from reticle layout
- [ ] Cost calculation per batch
- [ ] Time estimation per batch
- [ ] Batch plan library view
- [ ] Create/edit/delete batch plans

### Phase 3: Fabrication (Not Started)
- [ ] Design fab line equipment slot system
- [ ] Create process stage definitions (7 stages)
- [ ] Build batch assignment UI
- [ ] Implement wafer pipeline simulation
- [ ] Add time estimation per stage
- [ ] Track maturity progression over time
- [ ] Visualize line utilization
- [ ] Equipment upgrade system

### Phase 4: Binning (Not Started)
- [ ] Implement component-specific defect system
- [ ] Build binning line stages (4 stages)
- [ ] Create SKU grouping algorithm
- [ ] Design binning UI for variant detection
- [ ] Add defect map visualization
- [ ] Calculate performance degradation from defects
- [ ] Quality grade assignment (A/B/C)

### Phase 5: Packaging (Not Started)
- [ ] Build product naming hierarchy system (7-tier)
- [ ] Create package configuration UI
- [ ] Implement chiplet system
- [ ] Add socket/substrate database
- [ ] Build packaging line simulation (7 stages)
- [ ] Design product library
- [ ] IHS and substrate selection

### Phase 6: Architecture Enhancements (Not Started)
- [ ] Implement IPC calculation system
  - [ ] Add execution width, OoO depth, branch prediction configuration
  - [ ] Pipeline depth and execution unit selectors
  - [ ] Cache efficiency formula integration
- [ ] Implement ISA system
  - [ ] ISA selector in die designer (x86, ARM, RISC-V, MIPS, PowerPC, SPARC)
  - [ ] Research/licensing unlock system
  - [ ] Thermal multiplier and IPC multiplier effects
  - [ ] Market access gates based on ISA
- [ ] Implement bit-width system
  - [ ] Bit-width selector (8/16/32/64/128-bit)
  - [ ] Historical unlock timeline (1975-2015)
  - [ ] Early research unlock system
  - [ ] Hardware limitations (max RAM/storage)
  - [ ] Transistor/area scaling by width
  - [ ] Market segmentation by width

### Phase 7: Memory & Storage Chips (Not Started)
- [ ] Add memory-specific components to die designer
  - [ ] SRAM components (cell array, bit/word lines, sense amps)
  - [ ] DRAM components (1T1C array, refresh logic, I/O PHY)
  - [ ] NAND Flash components (array, charge pump, ECC, FTL controller)
- [ ] Implement memory metrics calculation
  - [ ] Capacity calculation (rows × columns × banks × bits)
  - [ ] Bandwidth calculation (bus width × clock × transfers)
  - [ ] Latency calculation (CAS latency, access time)
  - [ ] Endurance tracking (P/E cycles for NAND)
- [ ] Add memory type selection
  - [ ] SRAM (cache chips, embedded)
  - [ ] DRAM (DDR4/5, LPDDR, GDDR, HBM)
  - [ ] NAND Flash (SLC/MLC/TLC/QLC, 2D/3D)
  - [ ] Advanced memory (MRAM, ReRAM, PCM)
- [ ] Memory-specific classifications and tiers
- [ ] Interface configuration (DDR5, GDDR6, HBM3, NVMe, SATA)

### Phase 8: Board-Level Design (Not Started)
- [ ] Motherboard design system (extends Packaging phase)
  - [ ] CPU socket selection (Intel LGA, AMD AM/TR/SP)
  - [ ] Chipset selection (B/H/Z/X-series)
  - [ ] Memory slot configuration (count, type, channels)
  - [ ] Expansion slot allocation (PCIe lanes, M.2 slots)
  - [ ] I/O configuration (USB, networking, audio, video)
  - [ ] VRM design (phase count, power stages, capacitors)
  - [ ] PCB layer count (4/6/8/10/12-layer)
  - [ ] Form factor selection (ITX/mATX/ATX/EATX/EEB)
- [ ] Graphics card design system
  - [ ] GPU die selection from library
  - [ ] VRAM configuration (type, capacity, bus width, speed)
  - [ ] Power delivery (connectors, VRM phases)
  - [ ] Cooling solution (air/liquid, fan count, heatsink)
  - [ ] PCB design (layers, length, slot width)
  - [ ] Output configuration (DP/HDMI count, resolution support)
- [ ] Compatibility validation system
- [ ] BOM cost calculation
- [ ] Target market determination

### Phase 9: Business Models & Contracts (Not Started)
- [ ] Progressive business model system
  - [ ] Startup choice: Fabless designer OR Fab services
  - [ ] Growth stage: Expand within specialty
  - [ ] Diversification: Add complementary capability
  - [ ] Vertical integration: Full-stack option
  - [ ] Market expansion: System integration
- [ ] Fabless designer mode
  - [ ] Contract fabrication system
  - [ ] Fab partner selection and negotiation
  - [ ] Wafer pricing, yield guarantees, lead times
  - [ ] Capacity allocation and priority levels
  - [ ] IP licensing fees
- [ ] Fab services mode
  - [ ] Accept design customer contracts
  - [ ] Capacity management and allocation
  - [ ] Pricing tiers (strategic/high/standard/spot)
  - [ ] Process development partnerships
  - [ ] Utilization and queue management
- [ ] Vertical integration mechanics
  - [ ] Fab construction (3-5 years, $2-5B)
  - [ ] Design team acquisition ($50-200M)
  - [ ] Transition timelines and costs
- [ ] Contract negotiation UI
- [ ] Financial modeling (revenue, costs, margins)

### Phase 10: System Integration & OEM (Not Started)
- [ ] System builder modes
  - [ ] White-box integrator (5-10% margins)
  - [ ] Boutique builder (15-25% margins)
  - [ ] Brand OEM (10-20% margins)
  - [ ] Hyperscaler (25-40% margins)
- [ ] Component selection system
  - [ ] Form factor selection (desktop/laptop/server/AIO)
  - [ ] CPU, motherboard, RAM, storage, GPU selection
  - [ ] PSU, cooling, case configuration
  - [ ] Peripheral and OS options
- [ ] Compatibility validation
  - [ ] Socket matching (CPU/motherboard)
  - [ ] RAM type/speed compatibility
  - [ ] Power requirement calculation
  - [ ] Physical fitment checks (GPU length, cooler height)
  - [ ] Thermal adequacy validation
- [ ] Product line management
  - [ ] Market segmentation (budget/mainstream/gaming/enthusiast/workstation/server)
  - [ ] Brand naming and positioning
  - [ ] Pricing strategy and margins
  - [ ] Warranty and support tiers
- [ ] Supply chain management
  - [ ] Component inventory tracking
  - [ ] Supplier relationships and volume discounts
  - [ ] Lead time management
  - [ ] Quality metrics (defect rate, RMA rate)
- [ ] Outsourcing options
  - [ ] Assembly outsourcing (contract manufacturers)
  - [ ] Component procurement outsourcing
  - [ ] Logistics (3PL warehousing/shipping)
  - [ ] Support outsourcing (call centers)
  - [ ] Full ODM option
- [ ] Quality control and RMA system
  - [ ] DOA tracking
  - [ ] Warranty failure tracking
  - [ ] Customer satisfaction scoring
  - [ ] Brand reputation impact

### Phase 11: Integration & Polish (Not Started)
- [ ] Connect all phases data flow
- [ ] Add economics system (costs, pricing, profit, cash flow)
- [ ] Implement time progression system (yearly timeline 1970-2030)
- [ ] Add save/load game state (export/import JSON)
- [ ] Tutorial and help system
- [ ] Performance optimization
- [ ] Unit tests for physics and economics calculations
- [ ] Market simulation (demand curves, competition, market share)
- [ ] Historical events (tech bubbles, shortages, breakthroughs)
- [ ] Achievements and milestones
- [ ] Sandbox mode (unlimited money, unlock all)

---

**Last Updated**: 2025-10-25
**Version**: v20 (Planning document expansion)

**Documentation Status**: ✅ Synchronized with codebase + Future planning complete
- Verified all 8 JavaScript modules (4,300+ lines)
- Updated process node count (14 → 22 nodes)
- Documented wafer planning implementation (50% complete)
- Added quality-of-life features section
- **NEW**: Advanced CPU architecture systems (IPC, ISA, Bit-Width) - 200+ lines
- **NEW**: Memory & Storage chip design specifications - 190+ lines
- **NEW**: Board-level design (motherboards, GPUs) - 200+ lines
- **NEW**: Business model & market strategy (fabless/fab/integrated) - 280+ lines
- **NEW**: System integration & OEM specifications - 250+ lines
- **NEW**: Expanded implementation roadmap to 11 phases

**Total Planning Document**: ~2,300 lines (was ~970 lines)
**New Content Added**: ~1,330 lines of detailed specifications
