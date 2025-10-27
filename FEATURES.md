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

## Contract Manufacturing System (Planned)

**Overview**: Fabless designers can contract out manufacturing to AI-controlled foundries. Players can also own foundries and accept contracts from AI design firms. The system simulates the real semiconductor industry's fabless/foundry business model.

**Business Models** (Player can choose or do both):

1. **Fabless Designer** (AMD, NVIDIA, Apple, Qualcomm model):
   - Design chips in-house using Architecture screen
   - Contract out fabrication/binning/packaging
   - Low capital requirements
   - Focus on IP and architecture

2. **Contract Foundry** (TSMC, GlobalFoundries, UMC model):
   - Own fabrication equipment and cleanrooms
   - Accept contracts from design firms
   - High capital requirements
   - Focus on manufacturing excellence and yield

3. **Integrated (IDM)** (Intel, Samsung model):
   - Design own chips AND run foundry services
   - Highest capital requirements
   - Compete in both design and manufacturing
   - Can prioritize internal or external customers

**AI-Controlled Foundries**:

Based on real companies with historical accuracy:
- **TSMC** (1987+): Premium quality, premium pricing, all modern nodes
- **GlobalFoundries** (2009+): Competitive pricing, stopped at 14nm in 2018
- **UMC** (1980+): Budget-friendly, trailing-edge focus
- **SMIC** (2000+): Chinese foundry, government-backed, US sanctions affect node access
- **Samsung Foundry** (2017+): 2nd-gen FinFET, GAA leader
- **Intel Foundry Services** (2021+): Legacy IDM enters foundry market
- **Tower Semiconductor** (1993+): Specialty processes (analog, power, sensors)

Each foundry has:
- **Available Nodes**: Based on historical R&D progression
- **Services**: Fabrication, binning, packaging, or full turnkey
- **Quality Multiplier**: Affects yield (TSMC +15%, budget fabs -5%)
- **Pricing Multiplier**: Market positioning (premium vs. cost leader)
- **Capacity**: Weekly wafer throughput (scales with time)
- **Reputation**: 0-100 score affecting customer trust

**Contract Types**:

1. **Spot Order** (Immediate, single batch):
   - Book 1 wafer run on-demand
   - Pay market rate + 10% spot premium
   - No commitment required
   - Subject to available capacity
   - Use case: Prototyping, testing, low volume

2. **Short-term Contract** (13-52 weeks):
   - Reserve X wafers/week for up to 1 year
   - Fixed price locked at signing
   - 10% deposit required upfront
   - Cancellation fee: 25% of remaining value
   - Use case: Product ramp, market testing

3. **Long-term Contract** (52-260 weeks / 1-5 years):
   - Reserve capacity for multi-year volume production
   - Volume discount: 5-20% off spot rate (based on volume + duration)
   - 20% deposit required upfront
   - Better yield priority (mature process assignments)
   - Price protection against market fluctuations
   - Use case: Flagship products, sustained volume

**Contract Data Structure**:
```javascript
{
  id: 'contract_2024_tsmc_001',
  type: 'long-term',

  // Parties
  foundryId: 'tsmc',
  foundryName: 'TSMC',
  customerId: 'player', // or AI company ID

  // Production Specifications
  dieId: 'zen5_ccd',
  processNode: 7,
  waferSize: 300,
  wafersPerWeek: 1000,
  services: ['fabrication', 'binning', 'packaging'], // or 'turnkey'

  // Timeline (in weeks from game start)
  signedWeek: 2600,
  startWeek: 2608, // +8 weeks lead time
  endWeek: 2764,   // +156 weeks = 3 years
  durationWeeks: 156,

  // Pricing
  basePricePerWafer: 30000,      // $30k spot rate for 7nm
  discountPercent: 15,            // -15% for long-term volume
  pricePerWafer: 25500,          // $25.5k contracted

  // Financials
  totalWafers: 156000,            // 1000/week × 156 weeks
  totalValue: 3978000000,         // $3.978 billion
  depositPercent: 20,
  depositPaid: 795600000,         // $795.6M
  amountPaid: 1200000000,         // $1.2B paid so far
  remainingBalance: 2778000000,   // $2.778B remaining

  // Progress
  status: 'active',               // pending | active | completed | cancelled
  weeksElapsed: 47,
  wafersCompleted: 47000,
  wafersRemaining: 109000,
  diesDelivered: 1645000,         // binned + packaged

  // Quality Metrics
  averageYield: 0.78,             // 78% average yield
  defectRate: 0.008,              // defects/cm²

  // Deliverables (if binning/packaging included)
  binningComplete: true,
  packagingComplete: true,
  skusProduced: {
    'zen5_8c': 850000,            // 8-core SKU
    'zen5_6c': 450000,            // 6-core SKU
    'zen5_4c': 345000             // 4-core SKU
  },

  // Terms
  cancellationFee: 0.25,          // 25% of remaining
  yieldGuarantee: 0.70,           // Foundry guarantees 70%+ yield
  penaltyPerWaferBelowGuarantee: 1000,

  // Events Log
  events: [
    { week: 2600, type: 'signed', note: 'Contract signed' },
    { week: 2608, type: 'started', note: 'First wafer lot started' },
    { week: 2650, type: 'milestone', note: '50k wafers completed' }
  ]
}
```

**Pricing Formula**:
```
Spot Price = Base Node Cost × Foundry Pricing Multiplier × Wafer Size Factor

Short-term Discount = -5% to -10% (based on volume)
Long-term Discount = -10% to -20% (based on volume × duration)

Service Add-ons:
- Binning: +$50-500 per die (based on complexity)
- Packaging: +$0.50-5.00 per die (based on package type)
- Turnkey: Bundled discount -5%
```

**Foundry Selection Factors**:
- **Node Capability**: Does foundry support your process node?
- **Capacity**: Can they handle your volume?
- **Quality**: Higher yield = fewer defective dies
- **Price**: Spot vs. contract rates
- **Lead Time**: How soon can they start?
- **Reputation**: Track record of on-time delivery
- **Geographic Risk**: Tariffs, sanctions, geopolitical stability
- **Technology Leadership**: Cutting-edge vs. trailing-edge

**Market Dynamics**:

**Supply & Demand**:
- Popular nodes get booked up (high demand)
- Older nodes have excess capacity (low demand)
- Spot prices fluctuate based on utilization
- Long-term contracts lock in prices

**Foundry Competition**:
- AI foundries compete for contracts
- Lower prices when capacity is idle
- Raise prices when demand exceeds supply
- Invest in new nodes based on profitability

**Customer Relationships**:
- Repeat customers get priority allocation
- Contract fulfillment builds reputation
- Failed deliveries damage reputation
- VIP status for high-volume customers

---

## Player-Owned Foundry System (Planned)

**Overview**: Players can build and operate their own fabrication facilities, competing with AI foundries for contracts from AI design firms.

**Foundry Setup**:

1. **Purchase Cleanroom Facility**:
   - Buy or lease manufacturing space
   - Size: 10,000 - 500,000 m² cleanroom
   - Cost: $500M - $20B (scales with size and class)
   - Cleanroom classes: Class 1 (3nm-7nm), Class 10 (14nm-22nm), Class 100 (older nodes)

2. **Buy Equipment**:
   - Lithography tools (most expensive)
   - Etching systems
   - Deposition tools
   - Metrology equipment
   - CMP systems

**Equipment Catalog Example**:

**Lithography Tools**:
```javascript
{
  name: 'ASML Twinscan NXT:2000i (ArF Immersion)',
  manufacturer: 'ASML',
  type: 'lithography',
  year: 2016,
  purchaseCost: 120000000,        // $120M
  usedCost: 60000000,             // $60M (5+ years old)
  supportedNodes: [14, 10, 7],
  throughput: 275,                 // wafers/hour
  wavelength: '193nm ArF',
  resolution: '38nm',

  // Operating Costs (per week)
  maintenanceCost: 100000,         // $100k/week
  powerConsumption: 850,           // kW
  consumablesCost: 50000,          // $50k/week (gases, chemicals)
  technicianHours: 168,            // 24/7 operation

  // Physical
  floorSpace: 120,                 // m²
  weightTons: 180,
  powerRequirement: '1.5 MVA',

  // Reliability
  uptime: 0.95,                    // 95% uptime
  mtbf: 720,                       // hours between failures

  // Capabilities
  immersion: true,
  multiPatterning: true,
  overlaySigma: 1.3                // nm (overlay accuracy)
}
```

```javascript
{
  name: 'ASML Twinscan NXE:3400C (EUV)',
  manufacturer: 'ASML',
  type: 'lithography',
  year: 2018,
  purchaseCost: 150000000,         // $150M
  usedCost: null,                  // Not available used (too new)
  supportedNodes: [7, 5, 3],
  throughput: 170,                 // wafers/hour
  wavelength: '13.5nm EUV',
  resolution: '13nm',

  maintenanceCost: 250000,         // $250k/week (EUV is expensive)
  powerConsumption: 1000,          // kW
  consumablesCost: 150000,         // $150k/week
  technicianHours: 336,            // 2 shifts 24/7

  floorSpace: 200,
  weightTons: 250,

  uptime: 0.85,                    // EUV has lower uptime
  mtbf: 480,

  singlePatterning: true,          // No multi-patterning needed
  pellicle: false                  // EUV pellicles not ready yet
}
```

**Other Equipment Types**:
- Etching: Lam Research, Applied Materials (~$5M-20M each)
- Deposition: Applied Materials, Tokyo Electron (~$3M-15M each)
- CMP: Applied Materials, Ebara (~$2M-8M each)
- Metrology: KLA-Tencor, Hitachi (~$5M-50M each)

**Staffing**:
- **Process Engineers**: $150k/year, improve yield
- **Equipment Technicians**: $80k/year, maintain uptime
- **Cleanroom Operators**: $50k/year, run tools
- **Quality Engineers**: $120k/year, catch defects early

**Accepting Contracts**:

1. **Receive RFQ** (Request for Quote) from AI design firm
2. **Review Specs**: Die design, volume, timeline, services needed
3. **Calculate Costs**: Equipment time, materials, labor, overhead
4. **Set Price**: Cost + margin (compete with other foundries)
5. **Submit Bid**: AI customer evaluates (price, reputation, lead time)
6. **Win Contract**: If competitive
7. **Allocate Capacity**: Reserve equipment and cleanroom space
8. **Execute Production**: Fab → Bin → Package → Deliver
9. **Invoice Customer**: Weekly or upon delivery

**Reputation System**:
- **On-time Delivery**: +1 rep per week on schedule
- **Yield Above Guarantee**: +2 rep per percentage point
- **Late Delivery**: -5 rep per week late
- **Yield Below Guarantee**: -10 rep, pay penalty
- **Contract Cancellation**: -50 rep (devastating)

**Expansion Strategy**:
- Start small: 1-2 older nodes, 10k m² cleanroom
- Build reputation with AI customers
- Reinvest profits into new equipment
- Add cutting-edge nodes
- Scale capacity (more tools, bigger cleanroom)
- Eventually compete with TSMC for flagship products

---

## Die Design IP Licensing System (Planned)

**Overview**: Players can license die designs from AI design firms, or sell/license their own designs to AI companies. This reflects the real semiconductor industry's IP licensing business model (ARM, Synopsys, Cadence, Imagination Technologies).

**Business Models Enabled**:

1. **Pure IP Company** (ARM, Imagination model):
   - Design cores and IP blocks
   - License to AI design firms and player
   - No fabrication, pure licensing revenue
   - Low capital requirements, high margins

2. **Fabless with Licensed IP** (Many startups):
   - Buy/license designs instead of designing in-house
   - Focus on packaging, marketing, sales
   - Reduce R&D costs and time-to-market
   - Pay royalties per unit manufactured

3. **Hybrid Designer** (Most companies):
   - Design some components in-house
   - License others (e.g., design CPU, license GPU)
   - Balance R&D investment vs. speed
   - Mix proprietary and licensed IP

**Marketplace Structure**:

**AI Design Firms Offering IP**:
- **ARM Limited** (1990+): CPU cores (Cortex-A, Cortex-M, Cortex-R series)
- **Imagination Technologies** (1985+): GPU cores (PowerVR series)
- **Synopsys** (1986+): Interface IP (USB, PCIe, DDR controllers)
- **Cadence** (1988+): SerDes, PHY IP
- **CEVA** (1999+): DSP cores
- **Rambus** (1990+): Memory interface IP
- **Arm China** (2018+): Modified ARM cores for Chinese market

Each vendor has:
- **IP Catalog**: Available designs by year
- **Pricing Models**: Purchase, royalty, exclusive, time-limited
- **Process Node Support**: Which nodes the IP is validated for
- **Customization Options**: Configurable parameters
- **Support Level**: Documentation, tools, reference designs
- **Reputation**: Quality, reliability, support responsiveness

**License Types**:

1. **One-Time Purchase** (Outright ownership):
   - Pay once: $500K - $50M (based on IP complexity)
   - Own the design forever
   - No ongoing royalties
   - Can modify and customize freely
   - Use case: Long-term products, high volume
   - Example: $10M for ARM Cortex-A78 core design

2. **Per-Unit Royalty** (Pay per chip):
   - Low/no upfront cost: $0 - $2M
   - Pay $0.01 - $5.00 per chip manufactured
   - Scales with volume
   - Lower risk for startups
   - Use case: Uncertain volume, rapid iteration
   - Example: $1.50 per chip using ARM core

3. **Perpetual License with Royalty**:
   - Moderate upfront: $2M - $20M
   - Ongoing royalty: $0.50 - $3.00 per chip
   - Never expires
   - Balance upfront cost and ongoing payments
   - Use case: Long-term partnership
   - **This is ARM's primary model**: Pay licensing fee + per-chip royalty forever
   - Example: $5M upfront + $1.20 per chip

4. **Exclusive License** (Prevent competitors):
   - Premium pricing: 3-10× standard license
   - Only you can use this IP
   - Competitive advantage
   - Limited availability (vendors prefer non-exclusive)
   - Use case: Flagship differentiator
   - Example: $100M exclusive for 5 years

5. **Time-Limited License** (Rental):
   - Pay for X weeks/years: $100K - $10M per year
   - Can be exclusive or non-exclusive
   - Renegotiate at expiry
   - Flexible for changing needs
   - Use case: Short product lifecycle, testing market
   - Example: $2M/year for 3 years

**IP License Contract Data Structure**:
```javascript
{
  id: 'ip_license_2025_arm_001',
  type: 'perpetual-royalty',

  // Parties
  vendorId: 'arm_limited',
  vendorName: 'ARM Limited',
  licenseeId: 'player',

  // IP Details
  ipId: 'cortex_a78_core',
  ipName: 'ARM Cortex-A78 CPU Core',
  ipCategory: 'cpu_core',
  ipVersion: 'r1p0',

  // Technical Specs
  processNodes: [7, 5, 3],          // Validated for these nodes
  dimensions: { width: 2.5, height: 2.0 },  // mm²
  transistorCount: 150000000,       // 150M transistors (approximate)
  performance: {
    baseIPC: 4.5,
    maxClockGHz: 3.0,
    powerEfficiency: 'high'
  },

  // License Terms
  upfrontCost: 5000000,             // $5M licensing fee
  perUnitRoyalty: 1.20,             // $1.20 per chip
  exclusivity: false,               // Non-exclusive
  transferable: false,              // Cannot resell

  // Timeline (in weeks from game start)
  signedWeek: 2600,
  expiryWeek: null,                 // null = perpetual

  // Restrictions
  allowedMarkets: ['consumer', 'mobile', 'automotive'],  // null = all markets
  prohibitedMarkets: ['military'],  // Cannot sell to military without separate license
  territoryRestrictions: null,      // null = worldwide
  modificationRights: 'limited',    // 'none', 'limited', 'full'
  redistributionRights: false,      // Cannot sublicense to others

  // Financials
  totalUpfrontPaid: 5000000,
  unitsManufactured: 2500000,       // 2.5M chips produced
  royaltiesPaid: 3000000,           // $1.20 × 2.5M = $3M
  totalCost: 8000000,               // $5M + $3M
  nextRoyaltyDue: 2750,             // Week number

  // Support & Services
  technicalSupport: true,
  referenceDesigns: true,
  developmentTools: true,           // Includes compiler, debugger, profiler
  documentation: 'full',            // 'basic', 'standard', 'full'

  // Usage Tracking
  diesCreated: 3,                   // Player created 3 different die designs using this IP
  dieIds: ['die_001', 'die_005', 'die_012'],
  activeProducts: 2,                // 2 products currently in production

  // Events Log
  events: [
    { week: 2600, type: 'signed', note: 'License agreement signed' },
    { week: 2608, type: 'first_use', note: 'First die design created using IP' },
    { week: 2620, type: 'first_royalty', note: 'First royalty payment: $120k for 100k units' },
    { week: 2700, type: 'milestone', note: '1M units milestone reached' }
  ]
}
```

**ARM Timeline Integration**:

ARM's business model becomes a major gameplay element:

**1990-2000**: ARM7, ARM9 cores available
- Mobile and embedded focus
- Modest royalties ($0.05-$0.25 per chip)
- Growing ecosystem

**2000-2010**: ARM11, Cortex-A8/A9 emergence
- Smartphone explosion (iPhone 2007)
- Royalties increase ($0.50-$1.50 per chip)
- ARM becomes dominant in mobile

**2010-2020**: Cortex-A15/A53/A57/A72/A76/A78 progression
- 64-bit (ARMv8) arrives
- Premium cores for flagship phones
- Royalties reach $1.00-$3.00 per chip
- Server push begins (AWS Graviton)

**2020+**: Cortex-A78/X1/X2, ARMv9
- Desktop-class performance (Apple M1)
- PC/laptop invasion
- Premium licensing: $5M-$20M upfront + $1.50-$3.00 royalty

**Player Decision Points**:
- Early ARM adoption: Cheap licenses, low performance
- Design own cores: No royalties, high R&D cost, differentiation
- Late ARM adoption: Expensive licenses, high performance, proven ecosystem
- Mix: ARM for mobile, own designs for flagship desktop

**Pricing Formula**:
```
Upfront Cost = Base IP Cost × Complexity Multiplier × Exclusivity Multiplier × Market Factor

Base IP Cost:
- Simple core (Cortex-M): $500K - $2M
- Mid-range core (Cortex-A53): $3M - $8M
- High-performance core (Cortex-A78): $10M - $20M
- GPU core: $5M - $50M
- Interface IP (USB, PCIe): $200K - $5M

Complexity Multiplier:
- Transistor count factor
- Performance tier factor
- Customization requirements

Exclusivity Multiplier:
- Non-exclusive: 1.0×
- Market-exclusive (e.g., only mobile): 2-3×
- Geographic-exclusive: 2-4×
- Full exclusive: 5-10× (rarely offered)

Market Factor:
- Consumer: 1.0×
- Automotive: 1.3× (safety critical)
- Server: 1.5× (higher margins)
- Military/Aerospace: 3-5× (restricted export, certifications)

Per-Unit Royalty = Base Royalty × Performance Tier × Volume Discount

Base Royalty:
- Microcontroller core: $0.01 - $0.10
- Mobile CPU core: $0.50 - $2.00
- Desktop/server core: $1.50 - $5.00
- GPU core: $0.50 - $3.00

Performance Tier:
- Entry-level: 0.5×
- Mid-range: 1.0×
- High-performance: 1.5-2.0×

Volume Discount:
- < 100K units/year: 1.0×
- 100K - 1M: 0.9×
- 1M - 10M: 0.75×
- 10M+: 0.6-0.7×
```

**Player IP Monetization**:

When player designs high-quality dies, AI design firms may approach to license:

**Licensing Your Designs**:
1. **List in Marketplace**: Set pricing, license terms
2. **AI Inquiries**: AI companies send RFQs (Request for Quote)
3. **Negotiation**: AI offers terms, player accepts/counters
4. **Contract Signed**: Receive upfront payment
5. **Royalty Stream**: Receive payments as AI manufactures chips

**Factors Affecting Licensing Value**:
- **Performance**: Higher IPC, clock speed = premium pricing
- **Efficiency**: Lower power = more valuable (mobile market)
- **Process Node**: Cutting-edge nodes command premiums
- **Uniqueness**: Novel architectures worth more
- **Validation**: Proven designs (already in production) worth more
- **Market Fit**: Right performance tier for target market

**Example Player IP License**:
```javascript
{
  // Player licenses their "Quantum Core" CPU design to AI company
  ipId: 'player_quantum_core_v2',
  ipName: 'Quantum Core v2 (Player Design)',
  vendor: 'player',
  licensee: 'qualcomm_ai',

  terms: {
    upfront: 15000000,              // $15M upfront (strong performance)
    royalty: 2.50,                  // $2.50 per chip
    exclusive: false,
    duration: 156                   // 3 years
  },

  // Revenue tracking
  totalRevenue: 42500000,           // $15M + $27.5M royalties (11M units)
  projectedLifetimeRevenue: 80000000  // AI projects 32M total units
}
```

**Market Dynamics**:

**Supply & Demand**:
- Popular IP (ARM Cortex-A series) has many licensees
- Niche IP (DSP cores) fewer buyers but higher margins
- Commodity IP (USB controllers) cheap, ubiquitous
- Premium IP (Apple-class cores) scarce, expensive

**Competitive Licensing**:
- ARM vs. RISC-V vs. MIPS vs. x86 (ISA wars)
- Imagination vs. ARM Mali vs. Qualcomm Adreno (GPU wars)
- Players compete by offering better performance/$ or power efficiency

**Tech Shifts**:
- RISC-V emergence (2015+): Free ISA threatens ARM royalty model
- Chiplets (2018+): Modular IP increases licensing complexity
- AI accelerators (2016+): New IP category, high growth

**Discovery & Search**:

**IP Marketplace UI**:
- Browse by category (CPU, GPU, memory controller, interface)
- Filter by process node, performance tier, price range
- Sort by popularity, newest, price
- Vendor reputation scores
- Customer reviews (AI companies rate IP quality)
- Comparison tool (compare 2-4 IP side-by-side)

**Search Criteria**:
- Transistor count range
- Performance requirements (IPC, clock, power)
- License type preference
- Budget constraints
- Time-to-market urgency

---

## Microcontroller & Simpler Silicon Production (Planned)

**Overview**: Players can design and manufacture microcontrollers (MCUs) and other simpler chips for high-volume, low-margin markets. This diversifies the business away from flagship CPUs/GPUs into commodity silicon for industrial, automotive, consumer electronics, and IoT applications.

**Market Opportunity**:

**Why MCUs Matter**:
- **Huge Volume**: Billions of MCUs shipped annually (vs. millions of CPUs)
- **Long Lifecycles**: 10-20+ year production runs (vs. 2-3 years for CPUs)
- **Older Nodes Profitable**: 180nm-350nm nodes remain cost-effective
- **Stable Demand**: Less cyclical than consumer tech
- **Diverse Applications**: Every electronic device needs control logic

**Real-World Scale**:
- Global MCU market: ~$20-25B annually (vs. ~$100B for PCs/servers)
- Unit volume: 25-30 billion MCUs/year
- Price range: $0.10 - $20 per unit (vs. $50-$2000 for CPUs)
- Top vendors: NXP, Microchip, Renesas, STMicroelectronics, Texas Instruments

**Product Categories**:

### 1. Microcontrollers (MCUs)

**8-bit MCUs**:
- **Architectures**: 8051, PIC, AVR, 68HC08
- **Die Size**: 2-6 mm²
- **Optimal Nodes**: 350nm, 250nm, 180nm
- **Price Target**: $0.15 - $2.00
- **Applications**: Toys, appliances, simple sensors
- **Volume**: Very high (millions per customer)

**16-bit MCUs**:
- **Architectures**: MSP430, PIC24, 68HC16
- **Die Size**: 4-10 mm²
- **Optimal Nodes**: 180nm, 130nm
- **Price Target**: $0.50 - $4.00
- **Applications**: Industrial controls, automotive subsystems
- **Volume**: High (hundreds of thousands per customer)

**32-bit MCUs**:
- **Architectures**: ARM Cortex-M0/M3/M4/M7, RISC-V
- **Die Size**: 6-15 mm²
- **Optimal Nodes**: 130nm, 90nm, 65nm
- **Price Target**: $1.00 - $15.00
- **Applications**: IoT, wearables, automotive (ADAS), industrial
- **Volume**: High to medium

**Typical MCU Components**:
- Small CPU core (0.5-2 mm²)
- ROM/Flash (program storage): 8KB - 2MB
- SRAM (data memory): 256 bytes - 512KB
- GPIO (general purpose I/O): 16-128 pins
- Timers/Counters: 2-8 units
- ADC (analog-to-digital): 4-16 channels, 8-16 bit resolution
- Communication interfaces: UART, SPI, I2C, CAN, USB
- Clock/oscillator circuitry
- Power management: Sleep modes, brownout detection

### 2. Simpler CPUs for Embedded/IoT

**Application Processors** (between MCU and full CPU):
- ARM Cortex-A5/A7 (low-power application cores)
- RISC-V RV32/RV64 cores
- MIPS M-class
- Use cases: Smart displays, set-top boxes, IoT gateways
- Die size: 10-30 mm²
- Nodes: 65nm, 45nm, 28nm

### 3. Specialty Chips

**Power Management ICs**:
- Voltage regulators, battery chargers
- Mixed analog/digital design
- Die size: 3-10 mm²
- Higher margins (specialized)

**Sensor Controllers**:
- Image sensors (cameras)
- Accelerometers, gyroscopes (MEMS interface)
- Temperature, pressure sensors

**Communication Chips**:
- Bluetooth/Wi-Fi/Zigbee radios
- NFC controllers
- GPS receivers

**Design Approach**:

### MCU Template System

**Pre-Configured Templates** (Quick Start):

Player selects from template library:
- **8051-Compatible**: Classic architecture, huge ecosystem
- **ARM Cortex-M0+**: Ultra-low power, modern
- **ARM Cortex-M3**: Balanced performance/power
- **ARM Cortex-M4**: DSP extensions, audio/signal processing
- **ARM Cortex-M7**: High performance, automotive-grade
- **RISC-V RV32IMAC**: Open source, customizable
- **AVR**: Arduino ecosystem compatibility
- **PIC**: Microchip legacy, wide adoption

**Template Structure**:
```javascript
{
  id: 'template_cortex_m4',
  name: 'ARM Cortex-M4 MCU',
  category: 'microcontroller',
  architecture: '32-bit',
  isa: 'ARMv7-M',

  // Requires ARM license
  requiredLicense: 'arm_cortex_m4_license',
  licenseCost: {
    upfront: 500000,                // $500K
    perUnit: 0.08                   // $0.08 per chip
  },

  // Pre-configured components
  baseComponents: [
    {
      type: 'cpu_core',
      name: 'Cortex-M4 Core',
      fixed: true,                  // Cannot remove
      dimensions: { width: 1.2, height: 1.0 }
    },
    {
      type: 'memory',
      name: 'Flash ROM',
      customizable: true,
      sizeOptions: [64, 128, 256, 512, 1024, 2048],  // KB
      dimensions: { width: 2.0, height: 1.5 }  // @ 256KB
    },
    {
      type: 'memory',
      name: 'SRAM',
      customizable: true,
      sizeOptions: [16, 32, 64, 128, 256],  // KB
      dimensions: { width: 1.0, height: 0.8 }  // @ 64KB
    },
    {
      type: 'io_controller',
      name: 'GPIO Bank',
      customizable: true,
      pinOptions: [32, 64, 96, 128],
      dimensions: { width: 0.8, height: 0.6 }
    },
    {
      type: 'io_controller',
      name: 'Timer/PWM',
      customizable: true,
      countOptions: [4, 6, 8, 12],  // Number of timers
      dimensions: { width: 0.5, height: 0.4 }
    },
    {
      type: 'io_controller',
      name: 'ADC',
      customizable: true,
      channelOptions: [8, 12, 16],
      resolutionOptions: [10, 12, 16],  // bits
      dimensions: { width: 0.6, height: 0.5 }
    },
    {
      type: 'io_controller',
      name: 'UART/SPI/I2C',
      fixed: false,                 // Can remove if not needed
      dimensions: { width: 0.4, height: 0.3 }
    }
  ],

  // Economics
  optimalNodes: [90, 65, 45],       // Most cost-effective
  typicalDieSize: 8.5,              // mm² (configured above)
  yieldExpectation: 0.85,           // Higher than cutting-edge CPUs

  // Market positioning
  targetPrice: 3.50,                // $3.50 per unit at 100K volume
  targetMargin: 0.40,               // 40% gross margin
  targetCustomers: ['automotive', 'industrial', 'consumer_electronics', 'iot'],
  typicalOrderSize: 250000,         // 250K units per customer per year
  productLifecycle: 12,             // 12 years typical

  // Development ecosystem
  developmentTools: {
    compiler: 'ARM Keil MDK',
    debugger: 'J-Link',
    ide: 'Keil uVision / IAR Embedded Workbench',
    costPerSeat: 5000               // $5K per developer license
  },
  referenceDesigns: true,           // Eval boards, schematics
  documentationQuality: 'excellent',
  communitySize: 'very large'       // Affects customer adoption rate
}
```

**Customization Options**:
- Memory sizes (ROM/RAM)
- Peripheral counts (GPIO, timers, ADC channels)
- Communication interfaces (add/remove UART, SPI, I2C, CAN, USB)
- Power modes (number of sleep states)
- Package type (QFN, TQFP, BGA)

**Also Use Existing Die Designer**:

Players can:
1. Start from template → customize in die designer
2. Design from scratch using simple components
3. Clone template → modify layout/components

Templates just provide **validated starting points** with realistic configurations.

### Sales & Marketing System

**New Dedicated Screen**: `sales.html`

Unlike flagship CPUs sold through retail (future Market screen), MCUs are sold B2B to system integrators and industrial customers.

**Customer Database** (AI System Integrators):

**Consumer Electronics**:
- **TV Manufacturers**: Samsung, LG, Sony (need MCUs for remotes, power, tuning)
- **Appliance Makers**: Whirlpool, GE, Bosch (washers, fridges, ovens)
- **Toy Companies**: Hasbro, Mattel (electronic toys)
- Volume: 1M - 10M units/year per customer
- Price sensitivity: High (cost-driven)
- Lifecycle: 2-5 years

**Automotive**:
- **OEMs**: Toyota, Ford, VW, Tesla
- **Tier-1 Suppliers**: Bosch, Continental, Denso
- Applications: Engine control, ADAS, infotainment, body electronics
- Volume: 100K - 5M units/year per platform
- Price sensitivity: Medium (reliability critical)
- Lifecycle: 7-15 years (automotive grade)
- Certifications required: AEC-Q100, ISO 26262

**Industrial Automation**:
- **PLC Manufacturers**: Siemens, Rockwell, Schneider Electric
- **Robotics**: ABB, FANUC, KUKA
- **Instrumentation**: Honeywell, Emerson
- Volume: 10K - 500K units/year
- Price sensitivity: Low (performance/reliability priority)
- Lifecycle: 10-20 years
- Certifications: IEC 61508

**IoT/Smart Home**:
- **IoT Platforms**: Amazon (Alexa devices), Google (Nest)
- **Wearables**: Fitbit, Garmin
- **Smart Lighting**: Philips Hue, LIFX
- Volume: 500K - 10M units/year
- Price sensitivity: Medium-high
- Lifecycle: 2-4 years
- Connectivity requirements: BLE, Zigbee, Wi-Fi

**Sales Process**:

1. **Lead Generation**:
   - AI customers browse MCU catalog
   - Match requirements (performance, price, features)
   - Submit RFQ (Request for Quote)

2. **RFQ Evaluation**:
   ```javascript
   {
     rfqId: 'rfq_toyota_ecu_2025',
     customer: 'Toyota Motor Corporation',
     application: 'Engine Control Unit (ECU)',

     requirements: {
       architecture: '32-bit',
       minClock: 120,              // MHz
       minFlash: 512,              // KB
       minRAM: 64,                 // KB
       peripherals: ['CAN', 'ADC_12bit', 'PWM', 'SPI'],
       tempRange: [-40, 125],      // °C (automotive grade)
       certifications: ['AEC-Q100', 'ISO26262_ASIL-D']
     },

     volume: {
       yearlyEstimate: 2000000,    // 2M units/year
       contractLength: 260,        // 5 years (in weeks)
       totalVolume: 10000000       // 10M units over 5 years
     },

     pricing: {
       targetPrice: 4.50,          // $4.50 per unit
       flexibilityPercent: 10      // Willing to pay up to $4.95
     },

     timeline: {
       samplesNeeded: 2620,        // Week number
       productionStart: 2650       // 30 weeks for validation
     }
   }
   ```

3. **Quotation**:
   - Calculate costs (wafer, binning, packaging, testing)
   - Add margin
   - Submit quote to customer

4. **Negotiation**:
   - AI customer accepts/counters/rejects
   - Player can adjust price, terms, volume commitments

5. **Contract Signed**:
   - Long-term supply agreement
   - Volume commitments with penalties
   - Price locks (or escalation clauses)
   - Quality requirements

6. **Order Fulfillment**:
   - Manufacturing triggered automatically
   - Weekly/monthly shipments
   - Quality tracking
   - Invoice and payment

**Marketing Activities**:

**Trade Shows**:
- **Embedded World** (Nuremberg): $50K booth, reach industrial customers
- **CES** (Las Vegas): $200K booth, reach consumer electronics
- **Automotive World** (Tokyo): $75K booth, reach automotive OEMs
- ROI: Increases awareness, generates leads

**Development Boards** (Eval Kits):
- Design reference board with MCU
- Cost: $50K-$200K development + $50-$200 per board
- Give away or sell at cost to engineers
- Critical for adoption: Engineers test on eval boards before committing
- Ecosystem effect: More boards → more designs → more orders

**Reference Designs**:
- Publish schematics, PCB layouts, example code
- Cost: $100K-$500K per design
- Accelerates customer time-to-market
- Example: "Smart Thermostat Reference Design"

**Documentation**:
- Datasheets, user manuals, application notes
- Quality affects adoption rate
- Cost: $500K-$2M for comprehensive documentation
- Ongoing updates

**Developer Tools**:
- Compilers, debuggers, IDEs
- License or provide free
- Critical for ecosystem
- Example: Free GCC toolchain vs. $5K commercial toolchain

**Long-Term Contracts**:

```javascript
{
  id: 'contract_bosch_adas_2025',
  type: 'long-term-supply',

  customer: {
    id: 'bosch_automotive',
    name: 'Robert Bosch GmbH',
    segment: 'automotive_tier1',
    reputation: 95
  },

  product: {
    mcuId: 'player_cortex_m7_adas',
    mcuName: 'Player M7-ADAS MCU',
    specification: '32-bit ARM Cortex-M7, 300MHz, 2MB Flash, 512KB RAM, CAN-FD, AEC-Q100'
  },

  volume: {
    weekly: 10000,                  // 10K units per week
    yearly: 520000,                 // 520K per year
    totalCommitment: 2600000,       // 2.6M units (5 years)
    contractWeeks: 260              // 5 years
  },

  pricing: {
    unitPrice: 8.50,                // $8.50 per unit
    priceProtection: true,          // Price locked for contract duration
    volumeIncentive: {
      threshold: 600000,            // If yearly volume exceeds 600K
      discount: 0.05                // -5% price reduction
    }
  },

  financial: {
    yearlyRevenue: 4420000,         // $4.42M per year
    totalValue: 22100000,           // $22.1M over 5 years
    marginPercent: 45               // 45% gross margin
  },

  quality: {
    maxDefectRate: 0.0001,          // 100 PPM (parts per million)
    penaltyPerDefect: 500,          // $500 penalty per defective unit
    testingRequired: 'AEC-Q100',
    traceabilityRequired: true      // Lot traceability mandatory
  },

  terms: {
    paymentTerms: 'Net 60',         // Payment 60 days after delivery
    cancellationPenalty: 0.30,      // 30% of remaining value
    forecastRequired: 13,           // 13-week rolling forecast
    leadTime: 12                    // 12 weeks from order to delivery
  },

  status: 'active',
  startWeek: 2600,
  endWeek: 2860,
  weeklyDeliveries: [
    { week: 2600, ordered: 10000, delivered: 10000, defects: 0, revenue: 85000 },
    { week: 2601, ordered: 10000, delivered: 10000, defects: 1, revenue: 84500 },
    // ...
  ]
}
```

**Economics**:

**Cost Structure** (example 32-bit MCU @ 90nm):
- Wafer cost: $3,500
- Dies per wafer: 450
- Yield: 85%
- Good dies per wafer: 383
- **Cost per die**: $9.14
- Packaging cost: $0.80
- Testing cost: $0.30
- **Total manufacturing cost**: $10.24

**Pricing Strategy**:
- Low volume (< 10K): $15.00 (47% margin)
- Medium volume (10K-100K): $12.00 (17% margin)
- High volume (100K-1M): $10.50 (2.5% margin)
- Very high volume (1M+): $10.30 (0.6% margin)

**Profitability**:
- Low margins per unit (0.5% - 20%)
- High volume compensates
- Stable, predictable revenue
- Long-term relationships

**Strategic Value**:

1. **Diversification**: Balance high-risk flagship CPUs with stable MCU revenue
2. **Older Node Utilization**: Keep 180nm-350nm fabs profitable
3. **Customer Relationships**: MCU customers become partners
4. **Ecosystem Lock-In**: Dev tools, reference designs create switching costs
5. **Market Intelligence**: Industrial customers provide early demand signals

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

**Last Updated**: 2025-10-27
**Total Features Documented**: 18+ major systems
**Status**: Comprehensive technical reference for implemented and planned features
