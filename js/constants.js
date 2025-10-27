// Silicon Tycoon - Industry Constants and Historical Data

export const WAFER_SIZES = [
    { diameter: 25, year: 1960, label: '25mm (1")' },
    { diameter: 50, year: 1965, label: '50mm (2")' },
    { diameter: 75, year: 1970, label: '75mm (3")' },
    { diameter: 100, year: 1975, label: '100mm (4")' },
    { diameter: 150, year: 1983, label: '150mm (6")' },
    { diameter: 200, year: 1992, label: '200mm (8")' },
    { diameter: 300, year: 2002, label: '300mm (12")' },
    { diameter: 450, year: 2020, label: '450mm (18")' }
];

// Process nodes with historical data
// BALANCED: Defect densities reduced to "early production" levels (85-90% reduction)
// Represents processes that have been in production 1-2 years (not brand new, not fully mature)
// Mature processes would be even lower (wafer planner maturity system can simulate this)
export const PROCESS_NODES = [
    { node: 10000, label: '10μm', year: 1971, baseDefectDensity: 0.05 },  // Was 0.1
    { node: 6000, label: '6μm', year: 1974, baseDefectDensity: 0.08 },    // Was 0.15
    { node: 3000, label: '3μm', year: 1977, baseDefectDensity: 0.10 },    // Was 0.2
    { node: 1500, label: '1.5μm', year: 1982, baseDefectDensity: 0.12 },  // Was 0.3
    { node: 1000, label: '1μm', year: 1985, baseDefectDensity: 0.15 },    // Was 0.4
    { node: 800, label: '800nm', year: 1989, baseDefectDensity: 0.18 },   // Was 0.5
    { node: 600, label: '600nm', year: 1994, baseDefectDensity: 0.20 },   // Was 0.6
    { node: 350, label: '350nm', year: 1995, baseDefectDensity: 0.22 },   // Was 0.7
    { node: 250, label: '250nm', year: 1997, baseDefectDensity: 0.25 },   // Was 0.8
    { node: 180, label: '180nm', year: 1999, baseDefectDensity: 0.15 },   // Was 1.0 - mature process
    { node: 130, label: '130nm', year: 2001, baseDefectDensity: 0.18 },   // Was 1.2
    { node: 90, label: '90nm', year: 2004, baseDefectDensity: 0.20 },     // Was 1.5
    { node: 65, label: '65nm', year: 2006, baseDefectDensity: 0.25 },     // Was 1.8
    { node: 45, label: '45nm', year: 2008, baseDefectDensity: 0.30 },     // Was 2.2
    { node: 32, label: '32nm', year: 2010, baseDefectDensity: 0.35 },     // Was 2.5
    { node: 22, label: '22nm', year: 2012, baseDefectDensity: 0.40 },     // Was 3.0
    { node: 14, label: '14nm', year: 2014, baseDefectDensity: 0.45 },     // Was 3.5 - Your chip!
    { node: 12, label: '12nm', year: 2017, baseDefectDensity: 0.50 },     // Was 3.8
    { node: 10, label: '10nm', year: 2016, baseDefectDensity: 0.55 },     // Was 4.0
    { node: 7, label: '7nm', year: 2018, baseDefectDensity: 0.60 },       // Was 4.5
    { node: 5, label: '5nm', year: 2020, baseDefectDensity: 0.70 },       // Was 5.0
    { node: 3, label: '3nm', year: 2022, baseDefectDensity: 0.80 }        // Was 5.5
];

// Realistic transistor density by process node (Million transistors per mm²)
// Based on real-world chip data - mid-range values from industry research
// Research sources: AnandTech, TechPowerUp, WikiChip, manufacturer data
export const TRANSISTOR_DENSITY = {
    10000: 0.001,   // 10μm: ~1K/mm² (Intel 4004 era)
    6000: 0.003,    // 6μm
    3000: 0.010,    // 3μm: ~10K/mm²
    1500: 0.035,    // 1.5μm
    1000: 0.100,    // 1μm: ~100K/mm²
    800: 0.180,     // 800nm
    600: 0.350,     // 600nm
    350: 0.800,     // 350nm: ~800K/mm²
    250: 1.5,       // 250nm: ~1.5M/mm²
    180: 0.25,      // 180nm: ~0.25M/mm² (Pentium III, GeForce2)
    130: 0.54,      // 130nm: ~0.54M/mm² (Pentium 4 Northwood, GeForce4)
    90: 1.00,       // 90nm: ~1.0M/mm² (Pentium 4 Prescott, Athlon 64)
    65: 1.61,       // 65nm: ~1.61M/mm² (Core 2 Duo, Athlon 64 X2)
    45: 3.39,       // 45nm: ~3.39M/mm² (Core 2 Duo Penryn, Phenom II)
    32: 4.47,       // 32nm: ~4.47M/mm² (Sandy Bridge)
    22: 8.33,       // 22nm: ~8.33M/mm² (Ivy Bridge, Haswell)
    14: 19.7,       // 14nm: ~19.7M/mm² (Skylake, Ryzen 1000)
    12: 23.7,       // 12nm: ~23.7M/mm² (Ryzen 2000, NVIDIA Turing)
    10: 72.3,       // 10nm: ~72.3M/mm² (Apple A11, Intel Ice Lake)
    7: 60.1,        // 7nm: ~60.1M/mm² (Ryzen 3000, Apple A12/A13, Radeon RX 5700)
    5: 125.8,       // 5nm: ~125.8M/mm² (Apple M1/M2, Ryzen 7000)
    3: 175.0        // 3nm: ~175M/mm² (Apple A17 Pro)
};

// Expected memory controller area by process node (mm²)
// Used to scale bandwidth based on actual controller size
export const EXPECTED_MEM_CTRL_AREA = {
    10000: 10.0,  // 10μm: large controllers
    6000: 8.0,
    3000: 6.0,
    1500: 5.0,
    1000: 4.5,
    800: 4.2,
    600: 4.0,
    350: 4.0,
    250: 4.0,
    180: 4.0,    // 180nm: ~4mm² for memory controller
    130: 3.5,
    90: 3.0,
    65: 2.5,
    45: 2.0,
    32: 1.8,
    22: 1.5,
    14: 1.3,     // 14nm: ~1.3mm² for DDR4 controller
    12: 1.2,
    10: 1.0,
    7: 0.9,      // 7nm: ~0.9mm² for DDR5 controller
    5: 0.7,
    3: 0.6
};

// Component-specific density multipliers
// Different component types have different transistor densities
// Multiplied by base TRANSISTOR_DENSITY for the process node
export const COMPONENT_DENSITY_MULTIPLIERS = {
    'cpu_core': 1.2,        // Logic optimized for density
    'gpu_sm': 0.9,          // Wider data paths, less dense
    'l2_cache': 1.5,        // SRAM is very dense
    'l3_cache': 1.3,        // Slightly less dense than L2
    'memory_array': 1.6,    // Densest SRAM
    'mem_ctrl': 0.7,        // Wide buses, I/O pads
    'io_ctrl': 0.6,         // Lots of I/O pads
    'interconnect': 0.5,    // Mostly wiring, low transistor count
    'power_mgmt': 0.4,      // Analog circuits, less dense
    'igpu': 0.9,            // Similar to discrete GPU
    'texture_unit': 0.9,    // Similar to GPU
    'display_engine': 0.8,  // Mixed logic and I/O
    'control_logic': 0.8,   // Standard digital logic
    'npu': 1.0              // Baseline density
};

// Maximum achievable clock speeds by process node (GHz)
// Based on real-world silicon: AMD Ryzen, Intel Core, Apple M-series
export const MAX_CLOCK_BY_NODE = {
    10000: 0.0001,  // 10μm: 108 KHz (Intel 4004)
    6000: 0.001,    // 6μm: ~1 MHz
    3000: 0.008,    // 3μm: ~8 MHz
    1500: 0.025,    // 1.5μm: ~25 MHz
    1000: 0.050,    // 1μm: ~50 MHz
    800: 0.100,     // 800nm: ~100 MHz
    600: 0.200,     // 600nm: ~200 MHz (Pentium)
    350: 0.450,     // 350nm: ~450 MHz
    250: 0.750,     // 250nm: ~750 MHz (Pentium II)
    180: 1.3,       // 180nm: ~1.3 GHz (Pentium III)
    130: 2.2,       // 130nm: ~2.2 GHz (Pentium 4)
    90: 3.2,        // 90nm: ~3.2 GHz
    65: 3.6,        // 65nm: ~3.6 GHz (Core 2 Duo)
    45: 3.8,        // 45nm: ~3.8 GHz
    32: 4.0,        // 32nm: ~4.0 GHz
    22: 4.2,        // 22nm: ~4.2 GHz (Intel Ivy Bridge)
    14: 4.5,        // 14nm: ~4.5 GHz (Intel Skylake)
    12: 4.6,        // 12nm: ~4.6 GHz (AMD Zen+)
    10: 4.8,        // 10nm: ~4.8 GHz
    7: 5.0,         // 7nm: ~5.0 GHz (AMD Zen 3)
    5: 5.5,         // 5nm: ~5.5 GHz (AMD Zen 4, Apple M2)
    3: 5.8          // 3nm: ~5.8 GHz (Apple A17 Pro)
};

// Voltage by process node (Volts) - affects power consumption
export const NODE_VOLTAGE = {
    10000: 5.0,     // 10μm: 5V
    6000: 5.0,      // 6μm: 5V
    3000: 5.0,      // 3μm: 5V
    1500: 3.3,      // 1.5μm: 3.3V
    1000: 3.3,      // 1μm: 3.3V
    800: 2.5,       // 800nm: 2.5V
    600: 2.5,       // 600nm: 2.5V
    350: 2.5,       // 350nm: 2.5V
    250: 1.8,       // 250nm: 1.8V
    180: 1.5,       // 180nm: 1.5V
    130: 1.2,       // 130nm: 1.2V
    90: 1.0,        // 90nm: 1.0V
    65: 1.0,        // 65nm: 1.0V
    45: 1.0,        // 45nm: 1.0V
    32: 0.9,        // 32nm: 0.9V
    22: 0.9,        // 22nm: 0.9V
    14: 0.85,       // 14nm: 0.85V
    12: 0.80,       // 12nm: 0.80V
    10: 0.75,       // 10nm: 0.75V (lower voltage for efficiency)
    7: 0.72,        // 7nm: 0.72V (optimized for density)
    5: 0.70,        // 5nm: 0.70V
    3: 0.65         // 3nm: 0.65V
};

// Leakage power per million transistors (Watts) - static power consumption
// Smaller nodes have worse leakage due to quantum tunneling, BUT modern nodes
// use FinFET, GAA, and power gating to mitigate this
// Real-world values: modern chips have 10-30W total leakage for billions of transistors
// BALANCED: Flattened curve at 10nm and below to reflect real-world efficiency gains
export const LEAKAGE_PER_M_TRANSISTORS = {
    10000: 0.000001, // 10μm: negligible leakage
    6000: 0.000002,
    3000: 0.000005,
    1500: 0.00001,
    1000: 0.00002,
    800: 0.00005,
    600: 0.0001,
    350: 0.0002,
    250: 0.0005,
    180: 0.0004,     // 180nm: reduced from 0.001
    130: 0.0008,     // Reduced from 0.002
    90: 0.0016,      // Reduced from 0.004
    65: 0.0024,      // Reduced from 0.006 - Leakage becomes significant
    45: 0.0032,      // Reduced from 0.008
    32: 0.004,       // Reduced from 0.010
    22: 0.005,       // Reduced from 0.012 - leakage major concern
    14: 0.006,       // Reduced from 0.015 - Real: ~15W leakage for 2.6B transistors = 0.006W/M
    12: 0.007,       // Reduced from 0.017 - peak leakage before mitigation
    10: 0.004,       // FinFET adoption - leakage controlled, better than pre-FinFET
    7: 0.003,        // Advanced FinFET - superior leakage control
    5: 0.0025,       // GAA transistors - excellent leakage control
    3: 0.002         // Advanced GAA + power gating - best-in-class efficiency
};

// Thermal limits by chip type (W/mm²)
// BALANCED: Increased to reflect modern cooling capabilities
// Modern tower coolers and AIOs can handle higher densities at smaller nodes
export const THERMAL_LIMITS = {
    consumer_cpu: 1.00,     // Consumer desktop CPU - modern cooling handles 0.8-1.2 W/mm²
    server_cpu: 1.20,       // Server CPU with better cooling and larger heatsinks
    laptop_cpu: 0.60,       // Laptop CPU (thermal constrained but improved)
    gpu: 0.65,              // GPU (large area, challenging cooling)
    mobile_soc: 0.40        // Mobile SoC (very thermal constrained)
};

// Interconnect requirements: which components need to communicate
// bandwidth in GB/s, latency importance: 'critical', 'high', 'medium', 'low'
export const INTERCONNECT_REQUIREMENTS = {
    'cpu_core': {
        'l2_cache': { bandwidth: 500, latency: 'critical' },
        'l3_cache': { bandwidth: 200, latency: 'high' },
        'mem_ctrl': { bandwidth: 50, latency: 'medium' },
        'interconnect': { bandwidth: 100, latency: 'high' },
        'power_mgmt': { bandwidth: 1, latency: 'low' }
    },
    'gpu_sm': {
        'l2_cache': { bandwidth: 300, latency: 'high' },
        'mem_ctrl': { bandwidth: 200, latency: 'critical' },
        'texture_unit': { bandwidth: 400, latency: 'critical' },
        'interconnect': { bandwidth: 150, latency: 'high' }
    },
    'igpu': {
        'l2_cache': { bandwidth: 200, latency: 'high' },
        'mem_ctrl': { bandwidth: 150, latency: 'critical' },
        'interconnect': { bandwidth: 100, latency: 'medium' }
    },
    'l3_cache': {
        'mem_ctrl': { bandwidth: 100, latency: 'medium' },
        'interconnect': { bandwidth: 50, latency: 'medium' }
    }
};

// Memory bandwidth per controller (GB/s) by technology generation
export const MEMORY_BANDWIDTH_PER_CONTROLLER = {
    180: 3.2,       // DDR ~3.2 GB/s
    130: 6.4,       // DDR ~6.4 GB/s
    90: 10.6,       // DDR2 ~10.6 GB/s
    65: 12.8,       // DDR2 ~12.8 GB/s
    45: 17.0,       // DDR3 ~17 GB/s
    32: 21.3,       // DDR3 ~21 GB/s
    22: 25.6,       // DDR4 ~25.6 GB/s
    14: 34.1,       // DDR4 ~34 GB/s
    12: 38.4,       // DDR4 ~38 GB/s
    10: 42.7,       // DDR4 ~42 GB/s
    7: 51.2,        // DDR5 ~51 GB/s
    5: 68.3,        // DDR5 ~68 GB/s
    3: 85.3         // DDR5 ~85 GB/s
};

// Chip classification criteria for two-axis system
// CLASS = performance tier, GRADE = market segment
// BALANCED: Adjusted TDP ranges for easier progression and overlap
export const CHIP_CLASSIFICATION_CRITERIA = {
    // Performance class thresholds (cores OR tdp, not AND)
    class: {
        'Low-Power': { cores: [1, 2], tdp: [0, 15] },
        'Budget': { cores: [2, 4], tdp: [15, 80] },         // Was [15, 65] - easier to reach
        'Mid-Range': { cores: [4, 8], tdp: [60, 125] },     // Was [65, 125] - overlap allows 8-core chips
        'High-End': { cores: [8, 16], tdp: [100, 200] },    // Was [125, 200] - lower entry point
        'Halo': { cores: [16, 256], tdp: [180, 1000] }      // Was [200, 1000] - achievable with 16+ cores
    },

    // Market grade detection ratios
    grade: {
        'Consumer': {
            coresPerController: [3, 8],      // 1 controller per 3-8 cores
            l3PerCore: [0.5, 2.5],           // 0.5-2.5mm² L3 per core
            powerMgmtRatio: [0.02, 0.08]     // 2-8% of die for power mgmt
        },
        'Workstation': {
            coresPerController: [2, 5],      // More memory than consumer
            l3PerCore: [2.0, 4.0],           // Large cache
            powerMgmtRatio: [0.05, 0.10]
        },
        'Enterprise': {
            coresPerController: [1.5, 4],    // Very high memory bandwidth
            l3PerCore: [3.0, 8.0],           // Huge L3 cache
            powerMgmtRatio: [0.03, 0.08]
        },
        'Military': {
            coresPerController: [2, 6],
            l3PerCore: [1.0, 4.0],
            minProcessNode: 22,              // Older, proven nodes
            powerMgmtRatio: [0.12, 0.30],    // Extreme power management/redundancy
            minInterconnects: 2,             // Redundant interconnects
            maxClockRatio: 0.7               // Low clocks for reliability (70% of max)
        }
    }
};

// Edge exclusion zone in mm (unusable area around wafer edge)
export const EDGE_EXCLUSION_MM = 3;

// Reticle sizes (stepper/scanner field sizes in mm) - Historical progression
export const RETICLE_SIZES = [
    { width: 10, height: 10, year: 1970, label: '10mm × 10mm (Early Contact Aligner)', type: 'Contact' },
    { width: 15, height: 15, year: 1975, label: '15mm × 15mm (Contact Aligner)', type: 'Contact' },
    { width: 14, height: 14, year: 1980, label: '14mm × 14mm (Early Stepper)', type: 'Stepper' },
    { width: 17, height: 17, year: 1985, label: '17mm × 17mm (Stepper)', type: 'Stepper' },
    { width: 20, height: 20, year: 1990, label: '20mm × 20mm (Stepper)', type: 'Stepper' },
    { width: 22, height: 22, year: 1995, label: '22mm × 22mm (Standard Stepper)', type: 'Stepper' },
    { width: 22, height: 26, year: 2000, label: '22mm × 26mm (Scanner)', type: 'Scanner' },
    { width: 26, height: 33, year: 2005, label: '26mm × 33mm (Large Field Scanner)', type: 'Scanner' },
    { width: 26, height: 32, year: 2010, label: '26mm × 32mm (ArF Immersion)', type: 'ArF' },
    { width: 26, height: 33, year: 2015, label: '26mm × 33mm (ArF Immersion)', type: 'ArF' },
    { width: 26, height: 33, year: 2020, label: '26mm × 33mm (EUV)', type: 'EUV' }
];

// Physics constants
export const PHYSICS = {
    // Transistor density scaling factor
    // Approximate relationship: density ≈ k / (feature_size_nm²)
    // where k is a technology-dependent constant
    DENSITY_SCALING_FACTOR: 2.5e7, // transistors per mm² per (nm²)

    // Process maturity affects defect density
    // mature_defect = base_defect × (1 - maturity × maturity_factor)
    MATURITY_REDUCTION_FACTOR: 0.90, // 90% reduction at full maturity

    // Minimum defect density (even perfect processes have some defects)
    MIN_DEFECT_DENSITY: 0.01 // defects per cm²
};

// Yield categorization based on defect count
export const YIELD_CATEGORIES = {
    PERFECT: {
        color: 0x00FF00,      // Green
        hexString: '#00FF00',
        label: 'Perfect',
        minDefects: 0,
        maxDefects: 0,
        functionalityMin: 1.0,
        functionalityMax: 1.0
    },
    DIMINISHED: {
        color: 0xFFFF00,      // Yellow
        hexString: '#FFFF00',
        label: 'Diminished',
        minDefects: 1,
        maxDefects: 2,
        functionalityMin: 0.5,
        functionalityMax: 0.99
    },
    DAMAGED: {
        color: 0xFFA500,      // Orange
        hexString: '#FFA500',
        label: 'Damaged',
        minDefects: 3,
        maxDefects: 5,
        functionalityMin: 0.01,
        functionalityMax: 0.49
    },
    UNUSABLE: {
        color: 0xFF0000,      // Red
        hexString: '#FF0000',
        label: 'Unusable',
        minDefects: 6,
        maxDefects: Infinity,
        functionalityMin: 0.0,
        functionalityMax: 0.0
    }
};

// Art Deco color scheme
export const COLORS = {
    TEAL_PRIMARY: '#00CED1',
    TEAL_DARK: '#008B8B',
    TEAL_LIGHT: '#20B2AA',
    MAGENTA_PRIMARY: '#FF00FF',
    MAGENTA_DARK: '#C71585',
    MAGENTA_LIGHT: '#DA70D6',
    GOLD: '#FFD700',
    BLACK: '#1a1a1a',
    CREAM: '#F5F5DC',
    DARK_BG: '#0d0d0d'
};
