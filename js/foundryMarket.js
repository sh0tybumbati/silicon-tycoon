/**
 * Foundry Market System
 *
 * Manages AI-controlled foundries that players can contract for manufacturing.
 * Includes foundry database, pricing, capacity, and market dynamics.
 */

/**
 * AI-Controlled Foundry Database
 * Based on real semiconductor foundries with historical accuracy
 */
export const FOUNDRIES = [
    {
        id: 'tsmc',
        name: 'TSMC',
        fullName: 'Taiwan Semiconductor Manufacturing Company',
        founded: 1987,
        location: 'Taiwan',

        // Market positioning
        tier: 'premium',
        pricingMultiplier: 1.15,        // 15% premium over baseline
        qualityMultiplier: 1.15,        // 15% better yield
        reputation: 98,                 // 0-100 scale

        // Capacity (wafers per week by year)
        capacityByYear: {
            1990: 500,
            1995: 2000,
            2000: 5000,
            2005: 15000,
            2010: 30000,
            2015: 50000,
            2020: 80000,
            2025: 120000
        },

        // Available process nodes by year
        nodesByYear: {
            1987: [800, 600],
            1990: [600, 350],
            1995: [350, 250],
            2000: [250, 180, 130],
            2005: [130, 90, 65],
            2010: [65, 45, 32, 28],
            2015: [28, 16, 10, 7],
            2020: [7, 5],
            2022: [5, 3]
        },

        // Services offered
        services: {
            fabrication: true,
            binning: true,
            packaging: true,
            turnkey: true
        },

        // Specialties
        specialties: ['cutting-edge', 'high-volume', 'mobile', 'hpc'],

        // Lead time (weeks from order to production start)
        leadTime: {
            spot: 4,
            shortTerm: 8,
            longTerm: 12
        },

        description: 'Industry leader in advanced process technology. Premium pricing but exceptional quality and cutting-edge nodes.'
    },

    {
        id: 'globalfoundries',
        name: 'GlobalFoundries',
        fullName: 'GlobalFoundries Inc.',
        founded: 2009,
        location: 'USA/Singapore/Germany',

        tier: 'mid-range',
        pricingMultiplier: 0.95,        // 5% below baseline
        qualityMultiplier: 1.05,        // 5% better yield
        reputation: 85,

        capacityByYear: {
            2010: 8000,
            2015: 25000,
            2020: 40000,
            2025: 45000
        },

        nodesByYear: {
            2009: [65, 45, 32],
            2012: [32, 28],
            2015: [28, 14],
            2018: [14, 12],          // Stopped at 14nm in 2018
            2020: [14, 12],          // No further advancement
            2025: [14, 12, 22]       // Focus on mature nodes
        },

        services: {
            fabrication: true,
            binning: true,
            packaging: true,
            turnkey: false
        },

        specialties: ['mature-nodes', 'automotive', 'iot', 'rf'],

        leadTime: {
            spot: 3,
            shortTerm: 6,
            longTerm: 10
        },

        description: 'Competitive pricing on mature nodes. Exited cutting-edge race in 2018, focuses on 14nm and older. Strong in automotive and IoT.'
    },

    {
        id: 'umc',
        name: 'UMC',
        fullName: 'United Microelectronics Corporation',
        founded: 1980,
        location: 'Taiwan',

        tier: 'budget',
        pricingMultiplier: 0.80,        // 20% below baseline
        qualityMultiplier: 0.95,        // 5% lower yield
        reputation: 78,

        capacityByYear: {
            1990: 300,
            1995: 1500,
            2000: 4000,
            2005: 10000,
            2010: 20000,
            2015: 30000,
            2020: 35000,
            2025: 38000
        },

        nodesByYear: {
            1980: [3000, 1500],
            1990: [800, 600],
            1995: [600, 350],
            2000: [250, 180],
            2005: [130, 90],
            2010: [65, 45, 40],
            2015: [40, 28],
            2020: [28, 22],          // Trails leaders by ~2 generations
            2025: [22, 14]
        },

        services: {
            fabrication: true,
            binning: false,
            packaging: false,
            turnkey: false
        },

        specialties: ['cost-effective', 'trailing-edge', 'high-volume'],

        leadTime: {
            spot: 2,
            shortTerm: 4,
            longTerm: 8
        },

        description: 'Budget-friendly option for mature and trailing-edge nodes. Good for cost-sensitive products. Fab-only service.'
    },

    {
        id: 'smic',
        name: 'SMIC',
        fullName: 'Semiconductor Manufacturing International Corporation',
        founded: 2000,
        location: 'China',

        tier: 'mid-range',
        pricingMultiplier: 0.85,        // 15% below baseline
        qualityMultiplier: 0.90,        // 10% lower yield
        reputation: 72,

        capacityByYear: {
            2005: 2000,
            2010: 8000,
            2015: 20000,
            2020: 35000,
            2025: 50000
        },

        nodesByYear: {
            2000: [250, 180],
            2005: [130, 90],
            2010: [65, 45],
            2015: [28, 22],
            2019: [14],
            2020: [14, 28],          // US sanctions limit access to cutting-edge tools
            2025: [14, 28]           // Stuck at 14nm due to export restrictions
        },

        services: {
            fabrication: true,
            binning: true,
            packaging: false,
            turnkey: false
        },

        specialties: ['china-market', 'government-backed', 'cost-effective'],

        leadTime: {
            spot: 3,
            shortTerm: 6,
            longTerm: 10
        },

        // Geopolitical risks
        sanctionsAffected: true,        // After 2019
        exportRestrictions: ['usa'],    // Cannot export to these markets

        description: 'Chinese foundry with government backing. Competitive pricing but affected by US export restrictions. Limited to 14nm due to sanctions.'
    },

    {
        id: 'samsung',
        name: 'Samsung Foundry',
        fullName: 'Samsung Electronics Foundry Division',
        founded: 2017,                  // Foundry services separated
        location: 'South Korea',

        tier: 'premium',
        pricingMultiplier: 1.10,        // 10% premium
        qualityMultiplier: 1.10,        // 10% better yield
        reputation: 88,

        capacityByYear: {
            2018: 15000,
            2020: 25000,
            2025: 40000
        },

        nodesByYear: {
            2017: [14, 10],
            2018: [10, 8, 7],
            2020: [7, 5],
            2022: [5, 3],
            2025: [3, 2]             // GAA (Gate-All-Around) leader
        },

        services: {
            fabrication: true,
            binning: true,
            packaging: true,
            turnkey: true
        },

        specialties: ['cutting-edge', 'gaa-technology', 'mobile'],

        leadTime: {
            spot: 5,
            shortTerm: 10,
            longTerm: 14
        },

        prioritizesInternalProduction: true,  // Samsung's own chips get priority

        description: 'Advanced process technology with GAA transistors. Competitive to TSMC at cutting edge. May prioritize internal Samsung products.'
    },

    {
        id: 'intel_foundry',
        name: 'Intel Foundry Services',
        fullName: 'Intel Foundry Services (IFS)',
        founded: 2021,
        location: 'USA',

        tier: 'premium',
        pricingMultiplier: 1.05,        // 5% premium
        qualityMultiplier: 1.08,        // 8% better yield
        reputation: 80,                 // New to foundry business

        capacityByYear: {
            2022: 5000,
            2025: 15000,
            2030: 40000                 // Expanding aggressively
        },

        nodesByYear: {
            2021: [10, 7],
            2023: [7, 4],                // Intel 7 = ~7nm-class
            2025: [4, 3, 1.8]            // Intel 4, 3, 18A (1.8nm-class)
        },

        services: {
            fabrication: true,
            binning: true,
            packaging: true,
            turnkey: true
        },

        specialties: ['usa-domestic', 'advanced-packaging', 'x86-expertise'],

        leadTime: {
            spot: 6,
            shortTerm: 12,
            longTerm: 16
        },

        prioritizesInternalProduction: true,  // Intel's own chips get priority
        governmentIncentives: true,          // CHIPS Act funding

        description: 'Legacy IDM entering foundry market. US-based with government support. Priority may go to Intel\'s own products. Advanced packaging expertise.'
    },

    {
        id: 'tower',
        name: 'Tower Semiconductor',
        fullName: 'Tower Semiconductor Ltd.',
        founded: 1993,
        location: 'Israel/USA',

        tier: 'specialty',
        pricingMultiplier: 1.20,        // 20% premium for specialty
        qualityMultiplier: 1.12,        // 12% better yield in specialty processes
        reputation: 85,

        capacityByYear: {
            1995: 200,
            2000: 800,
            2005: 3000,
            2010: 8000,
            2015: 12000,
            2020: 15000,
            2025: 18000
        },

        nodesByYear: {
            1993: [600, 350],
            2000: [250, 180],
            2005: [180, 130],
            2010: [130, 90, 65],
            2015: [65, 45],
            2020: [65, 45],          // Stays at mature nodes
            2025: [65, 45, 40]
        },

        services: {
            fabrication: true,
            binning: true,
            packaging: false,
            turnkey: false
        },

        specialties: ['analog', 'power', 'sensors', 'rf-soi', 'cmos-image-sensors'],

        leadTime: {
            spot: 4,
            shortTerm: 8,
            longTerm: 12
        },

        description: 'Specialty process expert. Focus on analog, power management, RF, and image sensors rather than cutting-edge digital logic.'
    }
];

/**
 * Get available foundries for a given year and process node
 */
export function getAvailableFoundries(year, processNode = null) {
    return FOUNDRIES.filter(foundry => {
        // Check if foundry exists in this year
        if (year < foundry.founded) {
            return false;
        }

        // If process node specified, check if foundry supports it
        if (processNode !== null) {
            const availableNodes = getFoundryNodes(foundry, year);
            if (!availableNodes.includes(processNode)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Get available process nodes for a foundry in a given year
 */
export function getFoundryNodes(foundry, year) {
    // Find the most recent year <= current year with node data
    const years = Object.keys(foundry.nodesByYear).map(Number).sort((a, b) => b - a);

    for (const dataYear of years) {
        if (dataYear <= year) {
            return foundry.nodesByYear[dataYear];
        }
    }

    return [];
}

/**
 * Get foundry capacity for a given year
 */
export function getFoundryCapacity(foundry, year) {
    // Linear interpolation between known years
    const years = Object.keys(foundry.capacityByYear).map(Number).sort((a, b) => a - b);

    // Before first year
    if (year <= years[0]) {
        return foundry.capacityByYear[years[0]];
    }

    // After last year
    if (year >= years[years.length - 1]) {
        return foundry.capacityByYear[years[years.length - 1]];
    }

    // Find surrounding years and interpolate
    for (let i = 0; i < years.length - 1; i++) {
        if (year >= years[i] && year <= years[i + 1]) {
            const y1 = years[i];
            const y2 = years[i + 1];
            const c1 = foundry.capacityByYear[y1];
            const c2 = foundry.capacityByYear[y2];

            const ratio = (year - y1) / (y2 - y1);
            return Math.round(c1 + (c2 - c1) * ratio);
        }
    }

    return 0;
}

/**
 * Calculate base wafer price for a process node
 */
export function getBaseWaferPrice(processNode) {
    // Cutting-edge nodes are exponentially more expensive
    if (processNode <= 3) return 30000;      // 3nm: $30k
    if (processNode <= 5) return 25000;      // 5nm: $25k
    if (processNode <= 7) return 18000;      // 7nm: $18k
    if (processNode <= 10) return 12000;     // 10nm: $12k
    if (processNode <= 14) return 8000;      // 14nm: $8k
    if (processNode <= 22) return 5000;      // 22nm: $5k
    if (processNode <= 28) return 4000;      // 28nm: $4k
    if (processNode <= 45) return 3000;      // 45nm: $3k
    if (processNode <= 65) return 2500;      // 65nm: $2.5k
    if (processNode <= 90) return 2000;      // 90nm: $2k
    if (processNode <= 130) return 1500;     // 130nm: $1.5k
    if (processNode <= 180) return 1200;     // 180nm: $1.2k
    if (processNode <= 250) return 1000;     // 250nm: $1k
    if (processNode <= 350) return 800;      // 350nm: $800
    if (processNode <= 600) return 600;      // 600nm: $600
    return 400;                              // Older: $400
}

/**
 * Calculate contract pricing
 */
export function calculateContractPricing(foundry, contractType, processNode, wafersPerWeek, durationWeeks) {
    const basePrice = getBaseWaferPrice(processNode);
    const foundryPrice = basePrice * foundry.pricingMultiplier;

    let finalPrice = foundryPrice;
    let discount = 0;

    // Contract type discounts
    if (contractType === 'spot') {
        // Spot orders have 10% premium
        finalPrice *= 1.10;
    } else if (contractType === 'short-term') {
        // Short-term gets 5-10% discount based on volume
        const totalWafers = wafersPerWeek * durationWeeks;
        if (totalWafers >= 10000) {
            discount = 0.10;
        } else if (totalWafers >= 5000) {
            discount = 0.07;
        } else {
            discount = 0.05;
        }
        finalPrice *= (1 - discount);
    } else if (contractType === 'long-term') {
        // Long-term gets 10-20% discount based on volume and duration
        const totalWafers = wafersPerWeek * durationWeeks;

        if (totalWafers >= 100000) {
            discount = 0.20;
        } else if (totalWafers >= 50000) {
            discount = 0.17;
        } else if (totalWafers >= 20000) {
            discount = 0.15;
        } else if (totalWafers >= 10000) {
            discount = 0.12;
        } else {
            discount = 0.10;
        }

        finalPrice *= (1 - discount);
    }

    return {
        basePrice,
        foundryMultiplier: foundry.pricingMultiplier,
        priceBeforeDiscount: foundryPrice,
        discount,
        pricePerWafer: Math.round(finalPrice),
        totalWafers: wafersPerWeek * durationWeeks,
        totalValue: Math.round(finalPrice * wafersPerWeek * durationWeeks)
    };
}

/**
 * Get foundry by ID
 */
export function getFoundryById(id) {
    return FOUNDRIES.find(f => f.id === id);
}

/**
 * Market dynamics - calculate current utilization and spot pricing adjustments
 */
export function getMarketConditions(foundry, year, currentWeek) {
    // TODO: Track actual contract commitments
    // For now, simulate utilization based on reputation and tier

    let baseUtilization = 0.75; // 75% baseline

    if (foundry.tier === 'premium') {
        baseUtilization = 0.90; // Premium fabs are heavily booked
    } else if (foundry.tier === 'budget') {
        baseUtilization = 0.65; // Budget fabs have more availability
    }

    // Add some randomness
    const variance = (Math.random() - 0.5) * 0.1; // ±5%
    const utilization = Math.max(0.4, Math.min(0.98, baseUtilization + variance));

    // High utilization = spot prices go up
    let spotPriceMultiplier = 1.0;
    if (utilization > 0.95) {
        spotPriceMultiplier = 1.25; // 25% premium when near capacity
    } else if (utilization > 0.90) {
        spotPriceMultiplier = 1.15;
    } else if (utilization < 0.60) {
        spotPriceMultiplier = 0.90; // 10% discount when idle
    }

    return {
        utilization,
        spotPriceMultiplier,
        availableCapacity: Math.round(getFoundryCapacity(foundry, year) * (1 - utilization))
    };
}
