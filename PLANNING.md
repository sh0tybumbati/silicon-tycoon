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
- **File**: `js/dieDesigner.js`
- PixiJS-based visual editor with grid system
- Component placement, drag-and-drop, resizing
- Tools: Select, Pan, Draw, Copy, Delete
- Zoom and pan controls
- Snap-to-grid for precise placement

#### 3. Component System
- **File**: `js/dieLibrary.js` (COMPONENT_TYPES)
- CPU components: CPU Core, L2/L3 Cache, Integrated GPU
- GPU components: SM/CU, Texture Units, Display Engine
- Common: Memory Controller, Interconnect, Power Management, I/O Controller
- Memory: Memory Array, Control Logic
- Component density multipliers (cache 1.5x, I/O 0.6x, etc.)

#### 4. Process Node Technology
- **File**: `js/constants.js`
- Supported nodes: 180nm to 3nm (14 total nodes including 12nm)
- Real-world transistor densities from industry research
- Voltage scaling: 3.3V (180nm) to 0.70V (3nm)
- Max clock scaling by node
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

### 🎯 Complete Game Loop (Planned)

#### 1. **Architecture Phase** (✅ Implemented)
- Create die design from library
- Select process node
- Place and arrange components on canvas
- Optimize layout for efficiency bonuses
- Review performance, power, thermal, classification
- Check required components validation

#### 2. **Wafer Planning Phase** (🔄 Planned)
- Create new batch plans from die library
- Select reticle size and die arrangement
- View expected yields based on fab maturity
- Calculate dies per wafer (DPW)
- Estimate batch economics (cost, time, yield)

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
├── Grid rendering
├── Component sprites
├── Interaction handlers
└── Tool system (select, pan, draw, copy, delete)

ArchitectureApp (Main Controller)
├── Library management
├── Designer coordination
├── Performance calculations
├── UI updates
└── Event handling
```

### 📁 Project Structure

```
Silicon Tycoon/
├── index.html                 # Main wafer screen (future)
├── architecture.html          # Die designer screen (current)
├── css/
│   ├── style.css             # Global Art Deco theme
│   └── architecture.css       # Designer-specific styles
├── js/
│   ├── constants.js          # Process nodes, densities, power, criteria
│   ├── dieLibrary.js         # Die data management + storage
│   ├── dieDesigner.js        # PixiJS canvas controller
│   └── architecture.js       # Main app logic + performance engine
└── PLANNING.md               # This document
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
Plan how dies will be arranged on wafers for fabrication. Create batch plans that can be assigned to fab lines.

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
Manage fabrication lines, assign batch plans, track wafer production through process stages.

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
  waferStatuses: [
    { waferId: "W001", currentStage: "metrology", defects: 12 },
    // ... per wafer tracking
  ]
}
```

---

### 📊 Binning Screen

#### Purpose
Test completed wafers from fab, identify defects, group dies into SKUs based on functional components.

#### Binning Process Flow

**Stages**:
1. **Wafer Test**: Electrical testing of all dies on wafer
2. **Die Sort**: Physical separation of good/bad dies
3. **Component Mapping**: Identify which components failed per die
4. **SKU Assignment**: Group dies with identical working components

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

## Implementation Roadmap

### Phase 1: Wafer Planning (Next)
- [ ] Update navigation order (Fab before Binning/Packaging)
- [ ] Create wafer planner UI and visualization
- [ ] Implement batch plan data model
- [ ] Add maturity system for process nodes
- [ ] Calculate dies per wafer from reticle layout
- [ ] Show yield estimates by maturity level

### Phase 2: Fabrication
- [ ] Design fab line equipment slot system
- [ ] Create process stage definitions
- [ ] Build batch assignment UI
- [ ] Implement wafer pipeline simulation
- [ ] Add time estimation per stage
- [ ] Track maturity progression over time
- [ ] Visualize line utilization

### Phase 3: Binning
- [ ] Implement component-specific defect system
- [ ] Build binning line stages
- [ ] Create SKU grouping algorithm
- [ ] Design binning UI for variant detection
- [ ] Add defect map visualization
- [ ] Calculate performance degradation from defects

### Phase 4: Packaging
- [ ] Build product naming hierarchy system
- [ ] Create package configuration UI
- [ ] Implement chiplet system
- [ ] Add socket/substrate database
- [ ] Build packaging line simulation
- [ ] Design product library

### Phase 5: Integration & Polish
- [ ] Connect all phases data flow
- [ ] Add economics (costs, pricing)
- [ ] Implement time progression system
- [ ] Add save/load game state
- [ ] Tutorial and help system
- [ ] Performance optimization

---

**Last Updated**: 2025-10-24
**Version**: v19 (cache version in architecture.html)
