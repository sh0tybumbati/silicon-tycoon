# Silicon Tycoon - Implemented Features

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

#### 13. Wafer Planning Phase (50% Complete)
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

#### 14. Theme System
- Art Deco theme (default): Teal and magenta color scheme
- Retro 60s-70s theme: Vintage aesthetic with warm colors
- Theme persistence across sessions via localStorage
- Theme switcher button on all pages

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

#### Wafer Phase Modules

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
├── index.html                 # Landing page with menu
├── architecture.html          # Die designer screen (213 lines) ✅ Complete
├── wafer.html                 # Wafer planner screen (200 lines) ✅ Implemented
├── README.md                  # User documentation
├── FEATURES.md                # This document (implemented features)
├── PLANNING.md                # Development roadmap (future plans)
├── css/
│   ├── style.css              # Global Art Deco theme (750+ lines)
│   ├── theme-retro.css        # Retro 60s-70s theme
│   └── architecture.css       # Designer-specific styles
└── js/
    ├── constants.js           # Process nodes, densities, power, criteria (375 lines)
    ├── dieLibrary.js          # Die data management + storage (369 lines)
    ├── dieDesigner.js         # PixiJS canvas controller (500+ lines)
    ├── architecture.js        # Main app logic + performance engine (1,350 lines)
    ├── waferPlanner.js        # Wafer yield calculations (245 lines) ✅ Implemented
    ├── renderer.js            # Wafer visualization (550 lines) ✅ Implemented
    ├── physics.js             # Physics engine (205 lines) ✅ Implemented
    ├── main.js                # Wafer app entry point (299 lines) ✅ Implemented
    ├── batchPlanner.js        # Batch plan storage and management
    └── themeManager.js        # Theme switching system

Total: ~5,000+ lines of JavaScript
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

### 🎨 Quality-of-Life Features

#### Implemented Enhancements
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

**Last Updated**: 2025-10-25
**Current Version**: v0.2.0 Alpha
