# Silicon Tycoon - Technical Feature Reference

This document provides comprehensive technical documentation for all features in Silicon Tycoon, both implemented and planned. Each section explains HOW systems work, including formulas, algorithms, parameters, and data structures.

---

## Game Time System

**Time Scale**: Weeks (52 per year)

Silicon Tycoon uses a **weekly turn-based time progression** system. Each turn represents one week of game time, providing a balance between:
- **Strategic depth**: Long-term planning for R&D, manufacturing, and market positioning
- **Reasonable pace**: 52 turns per year allows multi-year campaigns without excessive micromanagement
- **Realistic timescales**: Semiconductor development cycles align naturally with weeks/months/years

**Time-Based Activities**:
- **Fabrication**: Wafers take 3-13 weeks to manufacture (20-90 days)
  - 180nm+: ~3 weeks (20 days)
  - 90nm-65nm: ~6-7 weeks (45 days)
  - 32nm-22nm: ~9 weeks (60 days)
  - 14nm-10nm: ~11 weeks (75 days)
  - 7nm-3nm: ~13 weeks (90 days)
- **Process R&D**: New process node development takes 52-156 weeks (1-3 years)
- **Process Maturity**: Matures over 18-52 weeks (4-12 months)
  - New (0-13 weeks): 75% base yield
  - Early (13-26 weeks): 100% base yield
  - Mature (26-78 weeks): 115% base yield
  - Optimized (78+ weeks): 125% base yield
- **Design Cycles**: New architecture designs take 26-52 weeks (6-12 months)
- **Market Cycles**: Product launches, reviews, and sales occur on weekly intervals
- **Financial Reporting**: Quarterly reports every 13 weeks

**Why Weeks?**
- Daily turns would be too granular for a strategic game (18,250 turns for 50 years!)
- Monthly turns would be too coarse for manufacturing and market dynamics
- Weekly turns provide ~2,600 turns for a 50-year campaign - enough for depth without tedium

---

## Process Nodes

**Supported Nodes**: 10μm (1971) to 3nm (2022) - 22 total nodes

**Historical Progression**:
- 10μm, 6μm, 3μm, 1.5μm, 1μm, 800nm, 600nm, 350nm, 250nm, 180nm
- 130nm, 90nm, 65nm, 45nm, 32nm, 22nm, 16nm, 14nm, 10nm, 7nm, 5nm, 3nm

**Transistor Densities** (based on real-world chips):
- **180nm**: 0.25 MTr/mm²
- **130nm**: 1.0 MTr/mm²
- **90nm**: 2.5 MTr/mm²
- **65nm**: 4.5 MTr/mm²
- **45nm**: 7.5 MTr/mm²
- **32nm**: 12.0 MTr/mm²
- **22nm**: 15.3 MTr/mm²
- **16nm**: 19.7 MTr/mm² (14-25 MTr/mm² range in real chips)
- **14nm**: 19.7 MTr/mm²
- **10nm**: 37.5 MTr/mm²
- **7nm**: 60.1 MTr/mm² (52-67 MTr/mm² range)
- **5nm**: 120.0 MTr/mm²
- **3nm**: 175.0 MTr/mm² (160-190 MTr/mm² range)

**Voltage Scaling**:
- 10μm: 5.0V
- 180nm: 3.3V
- 130nm: 1.5V
- 90nm: 1.2V
- 65nm: 1.1V
- 45nm: 1.0V
- 22nm: 0.90V
- 14nm: 0.85V
- 7nm: 0.75V
- 3nm: 0.70V

**Maximum Clock Frequency**:
Scales with process node advancement:
- 180nm: 2.5 GHz
- 90nm: 3.5 GHz
- 45nm: 4.0 GHz
- 14nm: 4.5 GHz
- 7nm: 5.0 GHz
- 3nm: 5.5 GHz

**Leakage Power Characteristics**:
- 180nm: 0.005 W/MTr
- 90nm: 0.008 W/MTr
- 45nm: 0.012 W/MTr
- 14nm: 0.015 W/MTr
- 7nm: 0.025 W/MTr
- 3nm: 0.035 W/MTr

**Defect Density** (for yield calculations):
Varies by node maturity and process complexity. Used in Murphy's Law yield formula.

---

## Component System

**Component Density Multipliers**:

Component transistor counts are calculated as:
```
Transistors = Component_Area × Node_Density × Density_Multiplier
```

**Multiplier Values**:
- **SRAM Cache (L2/L3)**: 1.3-1.6x (very dense memory bitcells)
- **Logic (CPU/GPU Cores)**: 0.9-1.2x (standard cell libraries)
- **Memory Controllers**: 0.8x (mixed digital/analog)
- **I/O Controllers**: 0.6x (wide buses, pad rings)
- **Interconnect**: 0.5x (mostly wiring, fewer transistors)
- **Power Management**: 0.4x (analog circuits, larger transistors)

**Component Types**:

**CPU Components**:
- CPU Core
- L2 Cache
- L3 Cache
- Integrated GPU

**GPU Components**:
- Streaming Multiprocessor (SM) / Compute Unit (CU)
- Texture Units
- Display Engine

**Common Components**:
- Memory Controller
- Interconnect
- Power Management
- I/O Controller

**Memory Components**:
- Memory Array
- Control Logic

---

## Performance Calculation System

**Transistor Counting**:
```javascript
transistors = component.area × node.density × component.densityMultiplier
totalTransistors = sum(all component transistors)
```

**Clock Frequency**:
Base clock determined by process node, affected by:
- Process node maximum clock capability
- Thermal constraints
- Power density

**IPC (Instructions Per Cycle) Calculation**:

Current implementation uses layout efficiency factors. Planned enhancement includes detailed microarchitecture modeling.

**Base Formula**:
```
layoutEfficiency = interconnectFactor × clusteringFactor × dieSizeFactor × utilizationFactor × bandwidthFactor
IPC = baseIPC × layoutEfficiency
```

**Performance Score**:
```
performance = coreCount × clockGHz × IPC × scalingFactor
singleThreaded = clockGHz × IPC
```

---

## Advanced IPC Calculation System (Planned)

**Philosophy**: IPC is primarily determined by microarchitecture design, not process node. Process node affects clock speed and power efficiency, but architectural choices drive IPC.

**IPC Factors**:

1. **Execution Width**: Instructions issued per cycle
   - 1-way scalar
   - 2-way superscalar
   - 4-way superscalar
   - 6-way superscalar (modern high-performance)
   - 8-way superscalar (Apple M-series)

2. **Out-of-Order Execution Depth**: Reorder buffer (ROB) size
   - 32 entries (basic OoO)
   - 64 entries (mainstream)
   - 128 entries (high-performance)
   - 256+ entries (extreme performance)
   - 630 entries (Apple M1 Firestorm core)

3. **Branch Prediction Quality**: Accuracy percentage
   - 85% (basic predictor)
   - 95% (good predictor)
   - 98% (advanced predictor)
   - 99%+ (state-of-the-art)

4. **Cache Hierarchy**: L1/L2/L3 sizes and latencies
   - Affects memory-bound workload IPC
   - Hit rates determine memory stall frequency

5. **Execution Units**: Count and types
   - ALU (integer arithmetic)
   - FPU (floating-point)
   - SIMD (vector operations)
   - Load/Store units (memory access)

6. **Pipeline Depth**: Stages in instruction pipeline
   - Shallow (10-12 stages): Lower branch misprediction penalty
   - Deep (20-31 stages): Higher clock frequency potential, severe misprediction penalty

**Calculation Formula**:
```
Base_IPC = Execution_Width × (1 - Pipeline_Penalty) × Cache_Efficiency

Pipeline_Penalty = (1 - Branch_Accuracy) × (Pipeline_Depth / 10)

Cache_Efficiency = (L1_Hit_Rate × 1.0) + (L2_Hit_Rate × 0.7) + (L3_Hit_Rate × 0.4)

Final_IPC = Base_IPC × ISA_Multiplier × Layout_Efficiency
```

**Real-World Reference Values**:
- Intel Pentium 4 (NetBurst): 1.0-2.0 IPC (deep 31-stage pipeline, poor branch prediction)
- Intel Core 2 (Conroe): 2.5-3.0 IPC (14-stage pipeline, wider execution)
- Intel Sandy Bridge: 3.0-3.5 IPC (improved OoO, larger ROB)
- AMD Zen 3: 4.0-4.7 IPC (6-wide decode, 256-entry ROB)
- Apple M1 (Firestorm): 7.0-8.0 IPC (8-wide, massive 630-entry ROB)

**Component Influence**:
- Larger CPU core component = potential for higher IPC (more execution units, larger ROB)
- L1/L2/L3 cache sizes directly impact cache efficiency
- Larger cores consume more power and generate more heat

---

## Instruction Set Architecture (ISA) System (Planned)

**Unlocking Mechanism**: Progressive unlock through R&D investment or licensing agreements

**Available ISAs**:

| ISA | Year | Licensing | Thermal Multiplier | IPC Multiplier | Market Access |
|-----|------|-----------|-------------------|----------------|---------------|
| **x86** | 1978 | Intel ($$$) | 1.3x heat | 1.0x | Desktop, Server |
| **x86-64** | 2003 | AMD/Intel ($$$) | 1.25x heat | 1.05x | Desktop, Server, Workstation |
| **ARM v7** | 2004 | ARM ($$) | 0.7x heat | 0.9x | Mobile, Embedded, IoT |
| **ARM v8** | 2011 | ARM ($$) | 0.75x heat | 1.0x | Mobile, Server, Desktop |
| **RISC-V 32** | 2015 | Open (Free) | 0.8x heat | 0.95x | Embedded, IoT, Research |
| **RISC-V 64** | 2015 | Open (Free) | 0.85x heat | 1.0x | All markets |
| **MIPS** | 1985 | MIPS ($) | 0.9x heat | 0.9x | Embedded, Networking |
| **PowerPC** | 1992 | IBM ($$) | 1.1x heat | 0.95x | Server, Embedded |
| **SPARC** | 1987 | Oracle ($$) | 1.2x heat | 0.9x | Server, Enterprise |

**ISA Characteristics**:

**x86/x86-64 (CISC)**:
- Complex instructions reduce instruction count per program
- Higher decode complexity = more transistors, more heat
- Variable instruction length complicates pipeline design
- Dominant in desktop/server (compatibility lock-in)
- High licensing costs but guaranteed market access
- x86-64 adds 64-bit extensions, more registers

**ARM (RISC)**:
- Simple, fixed-length instructions
- Excellent power efficiency (mobile/battery devices)
- Lower decode complexity = cooler operation
- v8 adds 64-bit, cryptography extensions
- Dominates mobile, growing in server/desktop

**RISC-V (RISC)**:
- Open source, no licensing fees
- Modular ISA (base + extensions)
- Clean slate design, modern features
- Growing ecosystem, smaller current market
- Ideal for custom/embedded applications

**Legacy ISAs (MIPS, PowerPC, SPARC)**:
- Historical significance, niche markets
- Lower costs than x86, higher than RISC-V
- Specific use cases (networking, enterprise, embedded)

**Unlock Progression**:
- **Start**: RISC-V 32-bit (free, immediate)
- **Early Game**: Research RISC-V 64-bit OR license ARM v7
- **Mid Game**: License x86 OR ARM v8 OR custom ISA extensions
- **Late Game**: x86-64 license OR full custom ISA with compiler toolchain

**Market Impact**:
- Mobile devices REQUIRE ARM or efficient RISC-V
- Desktop/laptop markets EXPECT x86 compatibility
- Server market accepts ARM, x86-64, PowerPC, RISC-V
- Embedded/IoT accepts any ISA (cost-driven)

---

## Bit-Width System (Planned)

**Historical Unlock Timeline**:
- **8-bit** (1975): Intel 8080, Zilog Z80, MOS 6502
- **16-bit** (1978): Intel 8086, Motorola 68000
- **32-bit** (1985): Intel 80386, ARM v1, MIPS R2000
- **64-bit** (2003): AMD Athlon 64, Intel Itanium (2001)
- **128-bit** (Future): Vector extensions only (AVX-512, SVE)

**Characteristics**:

| Bit-Width | Max RAM | Max Storage | Transistor Multiplier | Market Segments |
|-----------|---------|-------------|----------------------|-----------------|
| **8-bit** | 64 KB | 64 KB | 0.3x | Embedded, IoT, Retro |
| **16-bit** | 1 MB | 16 MB | 0.5x | Industrial, Legacy |
| **32-bit** | 4 GB | 2 TB | 1.0x | Mobile, Consumer |
| **64-bit** | 16 EB | 8 ZB | 1.4x | Desktop, Server |
| **128-bit** | Theoretical | Theoretical | 2.0x | HPC, Scientific |

**Hardware Limitations**:

**8-bit**:
- Addressable space: 2^16 = 64KB with banking
- Single-byte data paths
- Suitable for: Thermostats, sensors, retro gaming

**16-bit**:
- Addressable space: 2^20 = 1MB with segmentation
- Two-byte data paths
- Suitable for: Industrial controllers, DOS-era software

**32-bit**:
- Addressable space: 2^32 = 4GB RAM (~3.5GB usable)
- Can address 2TB storage with extensions
- Four-byte data paths
- Suitable for: Modern mobile, budget computing

**64-bit**:
- Addressable space: 2^64 = 16 exabytes (theoretical)
- Current limits: 256TB (Windows), 128TB (Linux)
- Eight-byte data paths, native 64-bit arithmetic
- Required for: >4GB RAM, large databases, modern gaming

**128-bit**:
- Not a full architecture (no 128-bit addressing needed)
- Exists as SIMD/vector extensions (AVX-512, SVE2)
- Processes 128-bit chunks per instruction
- Future potential for specialized HPC

**Performance Scaling**:
- Wider architectures process more data per cycle
- 64-bit integer math on 32-bit CPU takes multiple instructions
- 64-bit pointers are larger, use more cache space
- SIMD benefits: 128-bit vectors process 4× 32-bit values simultaneously

**Area/Transistor Requirements**:
- **Registers**: Scale linearly (64-bit = 8× area of 8-bit)
- **ALUs**: Width scales linearly (64-bit ALU ~2x area of 32-bit)
- **Data paths**: Bus width affects interconnect area
- **Address logic**: 64-bit addressing needs larger TLBs, page tables

**Component Size Impact** (example at 180nm):
- 8-bit CPU Core: 0.5mm²
- 16-bit CPU Core: 0.8mm²
- 32-bit CPU Core: 1.5mm²
- 64-bit CPU Core: 2.1mm²
- 128-bit SIMD Unit: +0.5mm² per core

**Research Unlock**:
- 16-bit in 1975 (3 years early): $500K, 6 months
- 32-bit in 1980 (5 years early): $2M, 12 months
- 64-bit in 1995 (8 years early): $10M, 24 months
- 128-bit in 2010 (5 years early): $50M, 18 months

**ISA-Bit-Width Combinations**:
- x86: 16-bit, 32-bit (IA-32), 64-bit (x86-64)
- ARM: 32-bit (v7), 64-bit (v8+), both (v8 can run 32-bit)
- RISC-V: Modular (RV32, RV64, RV128)
- MIPS: 32-bit (MIPS I-V), 64-bit (MIPS III+)

**Market Requirements**:
- Modern desktop OS: Requires 64-bit
- Mobile OS: 64-bit preferred
- Embedded: 8-bit and 32-bit dominate
- Server: 64-bit mandatory

---

## Power & Thermal Modeling

**Dynamic Power Calculation**:
```
P_dynamic = (Transistors / 1000) × 15W × (Voltage / 0.75)² × Frequency_GHz
```

Parameters:
- 15W per billion transistors at 0.75V and 1GHz (empirical baseline)
- Voltage scales with process node
- Frequency affects power linearly

**Static Leakage Power**:
```
P_leakage = Transistors_in_millions × Leakage_per_MTr
```

Leakage values by node:
- 180nm: 0.005 W/MTr
- 90nm: 0.008 W/MTr
- 45nm: 0.012 W/MTr
- 14nm: 0.015 W/MTr
- 7nm: 0.025 W/MTr
- 3nm: 0.035 W/MTr

Example: 2600 MTr at 14nm = 2600 × 0.015 = ~39W leakage

**Total Power**:
```
TDP = P_dynamic + P_leakage
```

**Power Density**:
```
Power_Density = TDP / Die_Area  (W/mm²)
```

**Thermal Limits**:
- **Consumer CPU**: 0.50 W/mm² (thermal throttle threshold)
- **Server CPU**: 0.80 W/mm² (better cooling)
- **High-Performance**: 1.20 W/mm² (extreme cooling)

**Thermal Throttling**:
When power density exceeds thermal limit:
1. Calculate throttle percentage
2. Reduce clock frequency proportionally
3. Recalculate dynamic power with reduced clocks
4. Update performance metrics

---

## Layout Efficiency System

**Factors**:

1. **Interconnect Penalty**: Based on average distance between components
   - Longer interconnects = higher latency, power loss
   - Calculate average distance from die center
   - Penalty increases with distance

2. **Clustering Bonus**: Rewards grouping similar components
   - CPU cores near each other
   - GPU SMs grouped together
   - Reduces communication latency
   - Detection: Check proximity of same-type components

3. **Die Size Optimization**: Sweet spot at 150mm²
   - Too small: Limited features, poor scaling
   - Too large: Yield drops, cost increases
   - Optimal: ~150mm² for consumer CPUs

4. **Utilization Factor**: Penalizes wasted die area
   - Component area / Total die area
   - Higher utilization = better efficiency
   - Too high (>95%) = manufacturing difficulty

5. **Bandwidth Factor**: Memory controller adequacy
   - Calculate bandwidth demand from cores/SMs
   - Check memory controller bandwidth capacity
   - Bottleneck detection

6. **Memory Bandwidth Calculation**:
   - **Area-based controller scaling**:
     - Expected areas by node (14nm: 1.3mm², 7nm: 0.9mm²)
     - Penalties for undersized: 0.5× area = 0.75× bandwidth
     - Bonuses for oversized: √(area_ratio - 1.0) × 0.25
   - Bandwidth demand:
     - 15 GB/s per CPU core
     - 50 GB/s per GPU SM/CU
   - Bottleneck warnings when supply < demand

**Overall Layout Efficiency**:
```
efficiency = interconnectFactor × clusteringFactor × dieSizeFactor × utilizationFactor × bandwidthFactor
```

Range: 0.0 (terrible) to 1.0+ (excellent with bonuses)

---

## Two-Axis Chip Classification

**CLASS** (Performance Tier):

Based on core count and power:
- **Low-Power**: 1-2 cores, <15W (mobile, embedded)
- **Budget**: 2-4 cores, 15-65W (entry desktop/laptop)
- **Mid-Range**: 4-8 cores, 65-125W (mainstream)
- **High-End**: 8-16 cores, 125-200W (enthusiast)
- **Halo**: 16+ cores, >200W (HEDT, server)

**GRADE** (Market Segment):

Based on design characteristics:
- **Consumer**:
  - 3-8 cores per memory controller
  - 0.5-2.5 mm² L3 cache per core
  - Balanced design

- **Workstation**:
  - Has both iGPU + support for discrete GPU
  - Multi-purpose processing

- **Enterprise/Server**:
  - 1.5-4 cores per memory controller (many controllers)
  - 3-8 mm² L3 cache per core (huge caches)
  - Memory-intensive workloads

- **Military/Aerospace**:
  - Uses 22nm+ node (mature, reliable)
  - High power management ratio
  - Conservative clocks (reliability over performance)

---

## Manufacturing Simulation

**Yield Calculation** (Murphy's Law):
```
Yield = e^(-Defect_Density × Die_Area)
```

Where:
- Defect_Density varies by process node and maturity
- Die_Area in mm²
- Result: Fraction of working dies (0.0 to 1.0)

**Maturity System**:

Process node maturity affects yield:

| Maturity | Time Period | Yield Multiplier |
|----------|-------------|------------------|
| New Process | 0-3 months | 0.75× (learning curve) |
| Early | 3-6 months | 1.00× (baseline) |
| Mature | 6-18 months | 1.15× (optimized) |
| Optimized | 18+ months | 1.25× (peak performance) |

**Cost Multiplier**:
```
Cost_Multiplier = 1 / Yield
```

Lower yield = higher cost per good die

**Larger Dies**:
- Lower yields (exponential area penalty)
- Higher cost per good die
- Trade-off: More features vs. manufacturing cost

---

## Wafer Planning System

**Wafer Visualization**:
- Circular wafer with notch indicator
- Die placement grid
- Edge exclusion zone (3mm)
- Color coding by yield category

**Die Placement Algorithm**:
1. Calculate dies that fit within wafer diameter
2. Exclude dies in edge exclusion zone (3mm from edge)
3. Optimize layout to maximize dies per wafer
4. Account for reticle size (stepper field)

**Reticle System**:
- Stepper exposure field size
- Multiple dies per reticle shot (if die is small enough)
- Reticle shots × dies per shot = total dies per wafer

**Poisson Defect Distribution**:
- Random defect placement using Poisson process
- Area-based probability (larger components more likely hit)
- Blank space absorption (defects in empty areas don't matter)
- Per-component defect tracking

**Yield Categorization**:
- **Perfect**: 0 defects
- **Diminished**: Minor defects, reduced functionality
- **Damaged**: Multiple defects, may be salvageable
- **Unusable**: Critical defects, scrap

**Defect Simulation** (Fabrication Phase):
Each wafer is individually "rolled" with randomized defects based on:
- Defect density from process node
- Die area (larger = more defects)
- Component layout (defects hit components by area probability)
- Maturity multiplier

**Wafer Sizes Supported**:
- 50mm (2-inch)
- 100mm (4-inch)
- 150mm (6-inch)
- 200mm (8-inch)
- 300mm (12-inch) - industry standard
- 450mm (18-inch) - future

---

## Fabrication System (Planned)

**Process Stages** (modern CMOS):

1. **Oxidation**: Grow silicon dioxide layers
2. **Photolithography**: Pattern transfer using reticle (stepper)
3. **Etching**: Remove unwanted material
4. **Deposition**: Add metal/dielectric layers
5. **Ion Implantation**: Doping for transistors
6. **CMP** (Chemical Mechanical Polishing): Planarization
7. **Metrology**: Measurement and inspection

**Equipment Slot System**:

Each stage has equipment slots:
- Multiple slots allow parallel processing
- All machines in same stage must be identical
- Wafers move sequentially through stages
- Bottleneck detection (slowest stage limits throughput)

**Example Configuration**:
```
Oxidation: 2× Furnaces (25 wafers each, 120s cycle)
Photolithography: 1× EUV Scanner (1 wafer, 45s cycle) ← Bottleneck
Etching: 1× Plasma Etcher (1 wafer, 90s cycle)
Deposition: 1× CVD Chamber (1 wafer, 120s cycle)
Ion Implantation: 1× Implanter (1 wafer, 60s cycle)
CMP: 1× CMP Tool (1 wafer, 180s cycle)
Metrology: 1× Inspection System (1 wafer, 30s cycle)
```

**Per-Wafer Cycle Time**:
```
cycle_time = sum(stage_times_accounting_for_slots)
```

**Batch Time**:
```
batch_time = (wafer_count × cycle_time) / pipeline_efficiency
```

Pipeline efficiency: Multiple wafers in different stages simultaneously

**Maturity Progression**:
- Fab tracks time on each process node
- Maturity advances: New → Early → Mature → Optimized
- Affects yield multiplier
- Realistic: 18+ months to reach peak yields

---

## Binning System (Planned)

**Stages**:

1. **Die Testing**: Electrical test of all dies on wafer
   - Tests which components work
   - Identifies dead cores, cache slices, controllers

2. **Sorting**: Physical separation by functional units
   - Group dies by working component counts

3. **Locking**: Configure bin limits
   - Disable defective cores, cache slices
   - Set clock speed limits (defects reduce max frequency)
   - Set voltage/power limits
   - Configure which components enabled/disabled

4. **SKU Assignment**: Link configurations to product SKUs
   - Example: 8-core die → Ryzen 9 (perfect), Ryzen 7 (1 dead core), Ryzen 5 (2-3 dead cores)

**Component-Specific Defect System**:

Defect probability per component:
```
P(defect hits component) = (Component_Area / Die_Area) × Defect_Sensitivity
```

**Defect Sensitivity** by component type:
- **CPU/GPU cores**: 1.0× (standard)
- **Cache**: 0.7× (redundant arrays, error correction)
- **Memory controllers**: 1.2× (complex digital logic)
- **I/O**: 1.5× (sensitive analog circuits)
- **Power management**: 1.3× (precision analog)

**Example**: 120mm² die with 3 defects
- CPU cores (64mm²): 64/120 × 1.0 = 53.3% chance per defect
- L3 cache (24mm²): 24/120 × 0.7 = 14.0% chance per defect
- Memory controller (5.2mm²): 5.2/120 × 1.2 = 5.2% chance per defect

**Die Variant Detection**:
Algorithm automatically detects:
- How many of each component type work
- Creates signature: "8C/16MB/2MC" (8 cores, 16MB L3, 2 memory controllers)
- Groups dies by signature
- Suggests SKU assignments

**Quality Grades**:
- **Grade A**: Perfect or near-perfect dies
- **Grade B**: Minor defects, fully functional at lower clocks
- **Grade C**: Salvage bins, significant defects

**Clock Capability**:
Defects can reduce maximum stable frequency:
- Perfect die: 100% of max clock
- 1 minor defect: 95-98% of max clock
- Multiple defects: 85-95% of max clock

---

## Packaging System (Planned)

**Product Hierarchy** (7-tier naming):
```
Type → Family → Line → Generation → Model → Variant → Signifier
```

**Examples**:
- CPU → Core → Core i → 14 → i9-14900 → K → S
- CPU → Ryzen → Ryzen 9 → 9000 → 9950 → X → 3D
- GPU → Radeon → RX → 7000 → 7900 → XTX → (none)

**Tier Definitions**:
- **Type**: CPU, GPU, FPGA, RAM, NPU, APU, SoC
- **Family**: Brand line (Core, Ryzen, Radeon, GeForce)
- **Line**: Sub-family (Core i, Ryzen 9, RX, RTX)
- **Generation**: Number or year (14, 9000, 7000, 4000)
- **Model**: Specific model number (i9-14900, 7900, 4090)
- **Variant**: Performance tier (X, XT, K, F)
- **Signifier**: Special features (3D, Ti, HX, HS, U)

**Package Configuration Slots**:

1. **Pads/Contacts**: Pin count, layout
   - LGA (Land Grid Array): Pads on package, pins in socket
   - PGA (Pin Grid Array): Pins on package, holes in socket
   - BGA (Ball Grid Array): Solder balls, soldered to board

2. **Substrate**: PCB with traces
   - Power planes
   - Signal routing
   - Chiplet interconnect traces (for multi-die)

3. **Die(s)**: Single or multi-die
   - Monolithic: Single die
   - Chiplet: Multiple dies on same substrate

4. **Heat Spreader** (IHS): Material and design
   - Copper, nickel-plated copper, aluminum
   - Affects thermal transfer to cooler

**Chiplet System**:
- Unlocked after tech milestone
- Requires interconnect component on dies:
  - UCIe (Universal Chiplet Interconnect Express)
  - Infinity Fabric (AMD)
  - EMIB (Intel Embedded Multi-die Interconnect Bridge)
  - Foveros (Intel 3D stacking)
- Can combine different dies:
  - CPU + GPU (APU)
  - CPU cores + I/O die (AMD Ryzen)
  - Multiple core chiplets + I/O die (AMD EPYC)
- Substrate routes chiplet-to-chiplet communication

**Socket Compatibility**:
- Intel: LGA 1151, 1200, 1700, 2066 (HEDT), 3647/4677 (server)
- AMD: AM4, AM5, TR4/sTRX4 (Threadripper), SP3/SP5 (EPYC)
- Historical: Socket 7, Socket A, Socket 478, LGA 775

**Packaging Line Stages**:
1. **Die Attach**: Bond die to substrate (15s per die)
2. **Wire Bonding**: Connect die pads to substrate (45s) [if not flip-chip]
3. **Substrate Attach**: Mount to package substrate (30s)
4. **Underfill/Encapsulation**: Protective material (60s)
5. **IHS Attach**: Apply thermal interface material + heat spreader (20s)
6. **Cure/Bake**: Thermal oven (25 packages, 2 hours)
7. **Final Test**: Package-level testing (5 minutes)

---

## Memory & Storage Chip Design (Planned)

### SRAM (Static RAM)

**Use Cases**: L1/L2/L3 cache chips, high-speed buffers

**Cell Types**:
- **6T** (6 transistors): Standard, balanced
- **8T**: Better noise immunity
- **10T**: Lowest power, largest area

**Characteristics**:
- Fast (0.5-2ns access time)
- Expensive (area per bit)
- Volatile (loses data without power)
- No refresh needed
- Density: 6-10× less dense than DRAM

**Components**:
- SRAM Cell Array (configurable density, cell type)
- Bit Line Drivers
- Word Line Drivers
- Sense Amplifiers
- Control Logic
- I/O Buffers

**Performance**:
- Access time: 0.5-2ns
- Bandwidth: Very high
- Power: ~0.5-2W per GB (active), ~0.01W per GB (idle)
- Endurance: Unlimited

---

### DRAM (Dynamic RAM)

**Use Cases**: System memory (DDR modules), graphics memory (GDDR)

**Cell Type**: 1T1C (1 transistor + 1 capacitor)

**Characteristics**:
- Moderate speed (10-100ns latency)
- Volatile (needs constant refresh)
- 6-10× denser than SRAM
- Requires refresh (capacitor leakage)

**Types**:
- SDR, DDR, DDR2, DDR3, DDR4, DDR5
- GDDR5, GDDR6, GDDR6X (graphics)
- HBM, HBM2, HBM3 (high-bandwidth stacked)
- LPDDR (low-power mobile)

**Components**:
- DRAM Cell Array (1T1C cells in rows/columns)
- Row Decoder (select memory row)
- Column Decoder (select specific bits)
- Sense Amplifiers (read cell charge state)
- Refresh Logic (periodic capacitor recharge)
- Memory Controller (command scheduling, timing)
- I/O PHY (high-speed signaling for DDR interface)

**Capacity Calculation**:
```
Capacity = (Rows × Columns × Banks × Channels) × Bits_Per_Cell
```

**Bandwidth Calculation**:
```
Bandwidth = (Bus_Width / 8) × Clock_Speed × Transfers_Per_Clock
```

Examples:
- DDR4-3200: (64-bit / 8) × 3200MHz × 2 = 51.2 GB/s per channel
- HBM2: (1024-bit / 8) × 1800MHz × 2 = 460 GB/s per stack

**Latency**:
```
CAS_Latency_ns = CL_cycles / Clock_frequency_MHz × 1000
```

Example: DDR4-3200 CL16 = 16 / 3200 × 1000 = 10ns

**Performance**:
- Access time: 10-100ns
- Bandwidth: 51-460+ GB/s (depends on type)
- Power: ~3-5W per 8GB DDR4 module
- Endurance: Unlimited writes (but data retention ~64ms, needs refresh)

---

### NAND Flash (Non-Volatile Storage)

**Use Cases**: SSDs, USB drives, memory cards, embedded storage

**Cell Types**:
- **SLC** (Single-Level Cell): 1 bit/cell
  - Fastest, most durable, expensive
  - 100K program/erase cycles
- **MLC** (Multi-Level Cell): 2 bits/cell
  - Balanced performance/endurance
  - 10K P/E cycles
- **TLC** (Triple-Level Cell): 3 bits/cell
  - High capacity, slower writes
  - 3K P/E cycles
- **QLC** (Quad-Level Cell): 4 bits/cell
  - Highest density, slowest, shortest life
  - 1K P/E cycles

**Architecture**:
- **2D NAND**: Planar, single layer
- **3D NAND**: Vertical stacking (V-NAND, BiCS)
  - 64-layer, 96-layer, 128-layer, 176-layer, 232-layer

**Components**:
- NAND Array (flash cells in blocks/pages)
- Charge Pump (generate high voltages for program/erase)
- Page Buffer (temporary storage for page operations)
- ECC Engine (error correction: BCH, LDPC codes)
- Controller (Flash Translation Layer, wear leveling, garbage collection)
- Interface Controller (SATA, NVMe, eMMC, UFS)

**Capacity Calculation**:
```
Capacity = (Blocks × Pages_Per_Block × Page_Size) × Bits_Per_Cell
```

**Performance**:
- Read: 25-100µs (page read time)
- Write: 200µs-1ms (page program time)
- Erase: 1-10ms (block erase time)
- Sequential bandwidth: 500 MB/s (SATA) to 7000+ MB/s (PCIe 4.0/5.0 NVMe)

**Endurance**:
- SLC: 100,000 P/E cycles
- MLC: 10,000 P/E cycles
- TLC: 3,000 P/E cycles
- QLC: 1,000 P/E cycles

**Power**:
- Active: ~2-5W per 1TB SSD
- Idle: ~0.03W

**Wear Leveling**: Algorithm distributes writes across all blocks evenly to maximize lifespan

---

### Advanced Memory Types

**HBM (High Bandwidth Memory)**:
- Stacked DRAM with through-silicon vias (TSV)
- 1024-bit+ bus width
- 460-1200 GB/s bandwidth per stack
- Used in GPUs, AI accelerators

**MRAM (Magnetoresistive RAM)**:
- Non-volatile, fast, emerging
- Magnetic storage, similar speed to DRAM
- Unlimited endurance

**ReRAM (Resistive RAM)**:
- Non-volatile, low power
- Resistance-based storage
- Future potential

**Phase-Change Memory**:
- Non-volatile, byte-addressable
- Uses phase change material
- Emerging technology

**NOR Flash**:
- Fast random read
- Slow write, slower than NAND
- Used for firmware/code storage (BIOS, bootloaders)

---

## Board-Level Design (Planned)

### Motherboard Design

**Platform Components**:

**1. CPU Socket**:
- Determines compatible CPUs
- Pin count, layout, mechanical mounting
- Examples: LGA 1700 (Intel 12th-14th gen), AM5 (AMD Ryzen 7000)

**2. Chipset**:
- **Budget** (B-series): Limited PCIe lanes, no overclocking
- **Mainstream** (H-series): Standard features
- **Enthusiast** (Z-series, X670): Maximum PCIe lanes, overclocking
- **Server** (C-series, X-series): ECC support, more features

Determines:
- PCIe lane count
- USB port count
- SATA port count
- Overclocking capability
- Memory channel count

**3. Memory Configuration**:
- Slot count: 2, 4, 8 (consumer), up to 24 (server)
- Type: DDR4, DDR5, LPDDR (soldered)
- ECC support (server/workstation)
- Max capacity per slot: 8GB, 16GB, 32GB, 64GB
- Channels: Dual (mainstream), Quad (HEDT), Octa (server)

**4. Expansion Slots**:
- PCIe Gen 3/4/5
- Slot configurations: x1, x4, x8, x16
- Total lanes = CPU lanes + chipset lanes
- M.2 slots for NVMe SSDs (Gen 3/4/5)

**5. Storage Interfaces**:
- SATA 3.0 (6 Gbps): Port count (2-12)
- M.2 NVMe (PCIe): Count and generation
- U.2/U.3 (enterprise NVMe)

**6. I/O Configuration**:
- **USB**: 2.0, 3.0, 3.1 Gen2, 3.2, 4.0
- **Networking**: 1G, 2.5G, 10G Ethernet; Wi-Fi 6/6E/7
- **Audio**: Realtek ALC (budget), Creative/ESS (premium)
- **Video**: HDMI, DisplayPort (for iGPU support)

**7. Power Delivery (VRM)**:
- **Phases**: 4 (budget), 8-12 (mainstream), 16-20+ (enthusiast/HEDT)
- **Power Stages**: Analog (cheap) vs Digital (efficient, monitored)
- **Capacitors**: Solid (premium) vs Electrolytic (budget)
- **Heatsinks**: Affects VRM cooling, sustained boost clocks
- **Connectors**: 24-pin ATX, 4+4-pin CPU, 8-pin CPU (HEDT)

**PCB Design**:

**Layer Count**:
- 4-layer: Budget, simple layouts
- 6-layer: Mainstream, better signal integrity
- 8-layer: Enthusiast, reduced crosstalk
- 10-12 layer: High-end/server, complex routing

**Trace Routing**:
- Memory traces: Length matching critical (±25ps skew)
- PCIe lanes: Differential pairs, impedance controlled
- Power distribution: Wide traces, multiple planes
- Signal integrity: Minimize vias, avoid crossover

**Form Factors**:
- Mini-ITX: 170×170mm (compact)
- Micro-ATX: 244×244mm (budget/mainstream)
- ATX: 305×244mm (standard)
- E-ATX: 305×330mm (enthusiast)
- SSI EEB: 305×330mm (dual-socket server)

---

### Graphics Card Design

**GPU Die Selection**:
- Use own GPU designs from die library
- Or license existing GPU designs

**VRAM Configuration**:
- **Type**: GDDR5, GDDR6, GDDR6X, HBM2, HBM3
- **Capacity**: 4GB, 6GB, 8GB, 12GB, 16GB, 24GB, 48GB
- **Bus Width**: 128-bit, 192-bit, 256-bit, 384-bit, 512-bit, 1024-bit+ (HBM)
- **Speed**: GDDR6 14-21 Gbps, HBM2 2-3.6 Gbps

**Bandwidth Calculation**:
```
Bandwidth = (Bus_Width / 8) × Speed_Gbps × 1000 / 8
```

Examples:
- GDDR6 384-bit @ 18Gbps = 864 GB/s
- HBM2 4096-bit @ 2.4Gbps = 1.2 TB/s

**Power Delivery**:
- **Connectors**:
  - 6-pin (75W)
  - 8-pin (150W)
  - Dual 8-pin (300W)
  - 12VHPWR / 12V-2×6 (450-600W)
- **VRM Phases**: 6-8 (budget), 10-14 (mid-range), 16-24 (high-end)
- **Power Limit**: Affects boost clocks, sustained performance

**Cooling Solutions**:

**Air Cooling**:
- Single-fan: Budget, <150W
- Dual-fan: Mainstream, 150-250W
- Triple-fan: High-end, 250-450W
- Heatsink size affects capacity and noise

**Liquid Cooling**:
- AIO (All-In-One): Pre-attached radiator
- Hybrid: Air + liquid combined
- Custom loop compatible: Water block

**PCB Design**:
- **Layers**: 6 (budget), 8-10 (mainstream), 12-14 (high-end)
- **Length**: 170mm (compact), 267mm (standard), 305mm+ (extreme)
- **Slot Width**: Single-slot, 2-slot, 2.5-slot, 3-slot, 4-slot

**Output Configuration**:
- **Ports**: DisplayPort 1.4/2.0/2.1, HDMI 2.0/2.1/2.1a
- **Count**: 3-5 outputs typical
- **Resolution**: 4K, 8K support
- **Multi-monitor**: Depends on GPU capabilities

---

## Business Models (Planned)

### Fabless Designer Model

**Core Activities**:
- Design chips (CPU, GPU, memory, custom)
- License ISAs (x86, ARM)
- Contract fabrication to foundries
- Manage testing, packaging, distribution

**Revenue**:
- Chip sales
- IP licensing
- ISA royalties

**Costs**:
- R&D: 20-30% revenue
- Wafer costs: 30-50% revenue
- Marketing: 10-15% revenue
- Licensing fees: 5-10% revenue

**Advantages**:
- Lower capital requirements
- Focus on core design competency
- Flexibility to switch fabs
- Faster market entry

**Disadvantages**:
- Dependent on fab capacity
- Lower margins
- Supply chain risks
- Less manufacturing control

**Contract Structure**:
```javascript
{
  fabPartner: "TSMC",
  processNode: 7,  // nm
  minimumWafers: 5000,  // per quarter
  maximumWafers: 20000,
  pricePerWafer: 12000,  // USD
  yieldGuarantee: 0.75,
  priorityLevel: "standard",
  leadTime: 90  // days
}
```

---

### Fab Services Model

**Core Activities**:
- Operate fabrication facilities
- Process wafers for design companies
- Maintain equipment, upgrade nodes
- Yield management, quality control

**Revenue**:
- Wafer manufacturing fees
- Process development fees
- IP licensing (PHY, SerDes)
- Mask set fees

**Costs**:
- CapEx (fab construction, equipment): 40-50% revenue
- Operations (labor, materials, utilities): 30-40% revenue
- R&D (new process nodes): 15-20% revenue
- Depreciation: 5-7 years

**Advantages**:
- Steady revenue from multiple customers
- Diversified customer base
- Process technology leadership
- High barriers to entry

**Disadvantages**:
- Massive capital requirements ($10-20B per fab)
- Constant R&D needed
- Capacity utilization critical
- Customer concentration risk
- Geopolitical risks

**Contract Types**:
1. **Standard**: Pay-per-wafer, no guarantee
2. **Volume Commitment**: Minimum quarterly commitment, discounts
3. **Strategic Partnership**: Joint development, guaranteed capacity
4. **Tech Development**: Customer-funded R&D

**Capacity Allocation**:
```javascript
{
  totalWafersPerMonth: 50000,
  utilization: 0.92,
  allocation: [
    { customer: "Apple", wafers: 12500, priority: "strategic" },
    { customer: "AMD", wafers: 10000, priority: "high" },
    { customer: "Nvidia", wafers: 10000, priority: "high" },
    // ...
  ],
  pricing: {
    strategic: 15000,
    high: 16000,
    standard: 17500,
    spot: 20000
  }
}
```

---

### Vertically Integrated Model

**Core Activities**:
- Everything: Design + Fab + Package + Test + Sell + Support

**Real-World Examples**:
- Intel: x86 CPUs + captive fabs (now adding foundry)
- Samsung: Exynos + fabs + foundry + consumer products
- Texas Instruments: Analog/embedded + captive fabs

**Advantages**:
- Maximum control over value chain
- Highest potential margins
- Design-manufacturing co-optimization
- Supply chain independence

**Disadvantages**:
- Requires massive capital ($50B+)
- Operational complexity
- Risk if design OR fab falls behind
- Less flexibility (locked to own fab)

**Transition Timeline**:

**Fabless → Integrated**:
1. Year 0: Successful fabless, $5B revenue
2. Year 1: Announce fab, raise $10B
3. Year 2-4: Fab construction (3-5 years)
4. Year 5: Fab operational, internal production
5. Year 5-7: Transition from external fabs
6. Year 8+: Fully integrated

**Fab → Integrated**:
1. Year 0: Fab services company
2. Year 1: Acquire design company or hire team
3. Year 2-3: Develop first designs
4. Year 4: Launch own-brand chips
5. Year 5+: Dual model (own chips + foundry)

---

## System Integration & OEM (Planned)

### System Builder Modes

**1. White-Box Integrator**:
- Generic systems, commodity branding
- B2B focus
- Margins: 5-10%
- High volume

**2. Boutique Builder**:
- High-end custom builds
- Niche markets (gaming, workstations)
- Margins: 15-25%
- Lower volume, enthusiast focus

**3. Brand OEM**:
- Own brand, mass production
- Retail/enterprise sales
- Margins: 10-20%
- Massive volume
- Examples: Dell, HP, Lenovo

**4. Hyperscaler**:
- Design own datacenter hardware
- Vertical integration
- Margins: 25-40%
- Captive use
- Examples: Google TPU, AWS Graviton, Meta OCP

---

### Component Compatibility System

**Socket Matching**:
```
CPU.socket must equal Motherboard.socket
```

**RAM Compatibility**:
```
RAM.type must equal Motherboard.ramType
RAM.speed <= Motherboard.maxRamSpeed (warning if exceeds)
```

**Power Requirements**:
```
Total_Power = CPU.tdp + GPU.tdp + (RAM.count × 5) + (Storage.count × 5) + 30
PSU_Required = Total_Power / 0.8  (80% max recommended)
```

**Physical Fitment**:
```
GPU.length <= Case.gpuClearance
Cooler.height <= Case.coolerClearance
Motherboard.formFactor in Case.supportedFormFactors
```

**Thermal Adequacy**:
```
HeatOutput = CPU.tdp + GPU.tdp
If HeatOutput > 300W AND Case.airflow == "restricted":
  Warning: Need better airflow
```

---

### Product Line Management

**Market Segments**:

1. **Budget Desktop** ($400-$700):
   - Entry CPU (4-6 cores), iGPU
   - 8-16GB DDR4, 256-512GB SSD
   - Target: Office, web, students

2. **Mainstream Desktop** ($700-$1200):
   - Mid-range CPU (6-8 cores), optional GPU
   - 16GB DDR4/DDR5, 512GB-1TB NVMe
   - Target: General use, light gaming

3. **Gaming Desktop** ($1200-$2500):
   - High-performance CPU (8-12 cores), strong GPU
   - 16-32GB DDR5, 1-2TB NVMe
   - RGB, AIO cooling
   - Target: 1080p/1440p/4K gaming

4. **Enthusiast/HEDT** ($2500-$5000+):
   - HEDT CPU (16-32 cores), top GPU(s)
   - 64-128GB DDR5, 2-4TB NVMe RAID
   - Custom cooling
   - Target: Content creation, rendering

5. **Workstation** ($2000-$10000+):
   - Workstation CPU (Xeon, Threadripper, EPYC)
   - ECC RAM 64-256GB, pro GPU
   - Target: CAD, simulation, video editing

6. **Server** ($3000-$50000+):
   - Server CPUs (1-4 sockets)
   - ECC RAM 128GB-2TB, redundant storage
   - Redundant PSUs, IPMI
   - Target: Enterprise, datacenters

---

### Supply Chain Management

**Component Inventory Tracking**:
```javascript
{
  component: "DDR5-5600 16GB DIMM",
  supplier: "SK Hynix",

  inventory: {
    onHand: 5000,
    onOrder: 10000,
    reserved: 3000,
    available: 2000
  },

  pricing: {
    unitCost: 45,
    volumeBreaks: [
      { quantity: 1000, price: 45 },
      { quantity: 5000, price: 42 },
      { quantity: 10000, price: 40 }
    ]
  },

  leadTime: {
    standard: 30,  // days
    expedited: 7,  // +20% cost
    rush: 3  // +50% cost
  },

  qualityMetrics: {
    defectRate: 0.002,  // 0.2% DOA
    rmaRate: 0.015,  // 1.5% warranty failures
    supplierRating: 92
  }
}
```

**Outsourcing Options**:
1. **Assembly**: Contract manufacturer (-5-10% margin)
2. **Procurement**: Third-party sourcing (-2-5% fee)
3. **Logistics**: 3PL warehousing/shipping ($5-20 per unit)
4. **Support**: Call center ($15-40 per ticket)
5. **Full ODM**: Complete outsourcing (3-7% margin, minimal control)

**Quality Control**:
```javascript
{
  productSKU: "PowerStation-RTX4070-001",
  unitsProduced: 5000,

  qualityMetrics: {
    doa: 15,  // 0.3%
    withinWarranty: 75,  // 1.5%
    customerSatisfaction: 4.3,  // out of 5

    topIssues: [
      { component: "RAM", count: 25 },
      { component: "SSD", count: 20 },
      { component: "GPU", count: 15 }
    ]
  },

  rmaProcess: {
    policyLength: 24,  // months
    avgTurnaround: 7,  // days
    costPerRMA: 85
  },

  brandImpact: {
    positiveReviews: 4200,
    negativeReviews: 380,
    netPromoterScore: 65
  }
}
```

---

## Data Structures

### Die Design
```javascript
{
  id: "die_12345",
  sku: "ZEN5-8C",
  type: "CPU",
  description: "8-core Zen 5 CPU die",

  reticleSize: { width: 26, height: 33 },  // mm
  dimensions: { width: 12, height: 10 },  // mm
  processNode: 7,  // nm

  components: [
    {
      id: "comp_001",
      type: "cpu_core",
      name: "CPU Core 1",
      dimensions: { width: 2.5, height: 2.0 },
      position: { x: 1.0, y: 1.0 },
      color: 0x3B82F6
    },
    // ... more components
  ],

  createdDate: "2025-10-24T10:00:00Z",
  lastModified: "2025-10-24T15:30:00Z"
}
```

### Batch Plan
```javascript
{
  id: "batch_plan_001",
  name: "Ryzen 9000X Batch",
  dieId: "die_12345",
  waferSize: 300,  // mm
  diesPerWafer: 347,
  reticleShots: 52,

  yieldByMaturity: {
    new: 0.452,
    early: 0.628,
    mature: 0.785,
    optimized: 0.853
  },

  createdDate: "2025-10-24T16:00:00Z",
  lastModified: "2025-10-24T16:00:00Z"
}
```

### Batch Run
```javascript
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
        { dieIndex: 0, defectCount: 0, hitComponents: [] },  // Perfect
        { dieIndex: 1, defectCount: 1, hitComponents: ['blank_space'] },  // Good
        { dieIndex: 2, defectCount: 2, hitComponents: ['cpu_core_3', 'l3_cache'] },  // Failed
        // ... 347 dies per wafer
      ]
    },
    // ... per wafer
  ]
}
```

### Product Definition
```javascript
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
    type: "chiplet",

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
    coreCount: 8,
    threadCount: 16,
    baseClockGHz: 4.2,
    boostClockGHz: 5.4,
    tdp: 120,
    l3CacheMB: 16
  }
}
```

---

## UI Themes

Silicon Tycoon features a dual-theme system with comprehensive visual styling.

### Theme System Architecture

**Implementation**: `js/themeManager.js`
- Theme state stored in localStorage as `'ui-theme'`
- Data attribute on body: `data-theme="artdeco"` or `data-theme="retro"`
- Dynamic theme switching without page reload
- Theme persistence across all pages (index.html, architecture.html, wafer.html)

**Theme Toggle Button**:
- Emoji-based toggle: 💎 (Art Deco) ⟷ 📺 (Retro)
- Fixed position: top-right of all screens
- Event handler: Single `addEventListener('click')` to prevent double-toggle bugs
- CSS transitions for smooth icon changes

### Art Deco Theme (Default)

**Color Palette**:
- Primary: Teal cyan (#00CED1, #00FFFF)
- Accent: Magenta (#FF00FF, #FF1493)
- Background: Deep black (#000000, #0A0A0F)
- Metallics: Gold (#FFD700), Cream (#FFF8DC)

**Border System** (Beefy Geometric Borders):
- Multi-layer box-shadow technique for 3D depth
- `.panel-frame`: 10px total border (2px + 4px + 6px + 10px layered)
  ```css
  box-shadow:
      0 0 0 2px var(--black),
      0 0 0 4px var(--teal-primary),
      0 0 0 6px var(--black),
      0 0 0 10px var(--magenta-primary),
      0 0 30px rgba(0, 255, 255, 0.6),
      0 0 60px rgba(255, 0, 255, 0.4),
      inset 0 0 30px rgba(0, 255, 255, 0.15),
      0 12px 40px rgba(0, 0, 0, 0.9);
  ```
- `.canvas-frame`: 13px total border
- `.stats-frame`: 10px total border
- `.art-deco-button`: 9px total border
- Animated glow effects on hover
- Clip-path geometric cutouts (chevron corners)

**Typography**:
- Display: "Poiret One" (geometric sans-serif)
- Body: "Montserrat" (modern sans-serif)
- Letter-spacing: 0.2em for headers (Art Deco style)

**Design Elements**:
- Geometric chevron corners via clip-path
- Animated corner decorations (::before, ::after pseudo-elements)
- Neon glow effects (cyan/magenta dual-color shadows)
- Metallic gradients on headers

### Retro TVA Theme

**Inspired by**: Loki series TVA (Time Variance Authority) aesthetic
**Era**: Mid-century modern, 1960s-70s NASA/government office

**Color Palette**:
- Primary: Burnt orange (#E67E22)
- Dark brown: #1A0F08
- Warm beige: #D4A574
- CRT green: #00FF00 (limited use)

**Border System** (Chunky CRT Borders):
- 6-8px solid borders with rounded corners
- TVA-style header bars with orange gradient
  ```css
  body[data-theme="retro"] .panel-header {
      background: linear-gradient(180deg, var(--teal-primary) 0%, var(--teal-dark) 100%);
      padding: 10px 15px;
      border-radius: 6px 6px 0 0;
      border: 4px solid var(--teal-dark);
  }
  ```
- Rounded corners (4-8px border-radius)
- No sharp geometric cutouts (contrast to Art Deco)
- Softer, warmer shadows

**Design Elements**:
- Rounded panel corners (CRT monitor aesthetic)
- Orange header bars with retro typography
- Chunky borders reminiscent of 1970s computer terminals
- Warm color temperature (orange/brown vs Art Deco's cool cyan/magenta)

### Scrollbar Styling

**Custom scrollbar implementation** (WebKit browsers):
```css
.component-list::-webkit-scrollbar {
    width: 8px;
}
.component-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
}
.component-list::-webkit-scrollbar-thumb {
    background: var(--teal-primary);
    border-radius: 4px;
}
```

**Overflow Management**:
- Parent containers: `overflow: hidden` to prevent scrollbars outside clip-path
- Child scrollable areas: `overflow-y: auto` with custom scrollbar styling
- Prevents scrollbar rendering conflicts with geometric borders/clip-paths

### Page Layout

**Header Structure** (All pages):
```html
<header class="art-deco-header">
    <button id="theme-switcher-btn" class="theme-switcher">💎</button>
    <div class="header-decoration top"></div>
    <h1 class="game-title">SILICON TYCOON</h1>
    <div class="header-decoration bottom"></div>
    <h2 class="subtitle">Page Title</h2>
</header>
```

**Subtitle Positioning**:
- Located outside/below header decorations (margin-top: 20px)
- Consistent across index.html, architecture.html, wafer.html

### Die Architecture Editor Panels

**Component Palette** (Left sidebar):
- Multi-layer Art Deco borders
- Retro theme: Orange chunky borders with rounded corners
- Scrolling handled by `.component-list` child element
- Custom scrollbar matching theme colors

**Properties Panel** (Right sidebar):
- Matching border styling to component palette
- `overflow: hidden` to prevent scrollbar conflicts
- Theme-specific styling overrides in `theme-retro.css`

**Canvas Area**:
- `.canvas-frame` with 13px multi-layer border (Art Deco)
- 8px solid orange border (Retro)
- Toolbar with snap grid controls
- PixiJS rendering area for die design

### Files

- `css/style.css` - Art Deco theme base styles
- `css/theme-retro.css` - Retro TVA theme overrides
- `css/architecture.css` - Die editor panel styles (both themes)
- `js/themeManager.js` - Theme switching logic

---

**Last Updated**: 2025-10-26
**Total Features Documented**: 16+ major systems
**Status**: Comprehensive technical reference for implemented and planned features
