// Silicon Tycoon - Physics Engine for Semiconductor Calculations

import { PHYSICS, YIELD_CATEGORIES } from './constants.js';

/**
 * Calculate transistor density based on process node
 * Uses real-world scaling relationships
 * @param {number} processNodeNm - Process node size in nanometers
 * @returns {number} Transistor density in millions of transistors per mm²
 */
export function calculateTransistorDensity(processNodeNm) {
    // Real-world relationship: transistor density scales with 1/(feature_size²)
    // Using Dennard Scaling and Moore's Law approximations

    // Base scaling formula: density ≈ k / (feature_size²)
    const densityPerMm2 = PHYSICS.DENSITY_SCALING_FACTOR / (processNodeNm * processNodeNm);

    // Convert to millions of transistors per mm²
    return densityPerMm2 / 1e6;
}

/**
 * Calculate total transistors in a die
 * @param {number} widthMm - Die width in mm
 * @param {number} heightMm - Die height in mm
 * @param {number} densityMTperMm2 - Transistor density in millions per mm²
 * @returns {number} Total transistors in millions
 */
export function calculateDieTransistors(widthMm, heightMm, densityMTperMm2) {
    const areaMm2 = widthMm * heightMm;
    return areaMm2 * densityMTperMm2;
}

/**
 * Calculate effective defect density based on process maturity
 * @param {number} baseDefectDensity - Base defect density (defects per cm²)
 * @param {number} maturityPercent - Process maturity (0-100)
 * @returns {number} Effective defect density (defects per cm²)
 */
export function calculateEffectiveDefectDensity(baseDefectDensity, maturityPercent) {
    const maturityFactor = maturityPercent / 100.0;

    // As process maturity increases, defect density decreases
    // Formula: effective = base × (1 - maturity × reduction_factor)
    const reduction = maturityFactor * PHYSICS.MATURITY_REDUCTION_FACTOR;
    const effectiveDensity = baseDefectDensity * (1 - reduction);

    // Ensure we don't go below minimum defect density
    return Math.max(effectiveDensity, PHYSICS.MIN_DEFECT_DENSITY);
}

/**
 * Calculate expected number of defects in a die using Poisson distribution
 * @param {number} dieWidthMm - Die width in mm
 * @param {number} dieHeightMm - Die height in mm
 * @param {number} defectDensityPerCm2 - Defect density in defects per cm²
 * @returns {number} Expected number of defects (lambda parameter for Poisson)
 */
export function calculateExpectedDefects(dieWidthMm, dieHeightMm, defectDensityPerCm2) {
    // Convert die area from mm² to cm²
    const dieAreaMm2 = dieWidthMm * dieHeightMm;
    const dieAreaCm2 = dieAreaMm2 / 100; // 1 cm² = 100 mm²

    // Expected defects = area × defect_density
    return dieAreaCm2 * defectDensityPerCm2;
}

/**
 * Sample from Poisson distribution
 * Returns the number of defects for a single die
 * @param {number} lambda - Expected number of defects (mean)
 * @returns {number} Actual number of defects (integer)
 */
export function poissonSample(lambda) {
    // Using Knuth's algorithm for Poisson sampling
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
        k++;
        p *= Math.random();
    } while (p > L);

    return k - 1;
}

/**
 * Determine yield category based on defect count
 * @param {number} defectCount - Number of defects in the die
 * @returns {object} Yield category object
 */
export function getYieldCategory(defectCount) {
    if (defectCount === 0) {
        return YIELD_CATEGORIES.PERFECT;
    } else if (defectCount <= 2) {
        return YIELD_CATEGORIES.DIMINISHED;
    } else if (defectCount <= 5) {
        return YIELD_CATEGORIES.DAMAGED;
    } else {
        return YIELD_CATEGORIES.UNUSABLE;
    }
}

/**
 * Calculate functionality percentage based on defects
 * More defects = lower functionality
 * @param {number} defectCount - Number of defects
 * @param {object} category - Yield category
 * @returns {number} Functionality percentage (0.0 to 1.0)
 */
export function calculateFunctionality(defectCount, category) {
    if (defectCount === 0) {
        return 1.0;
    }

    if (category === YIELD_CATEGORIES.UNUSABLE) {
        return 0.0;
    }

    // Linear interpolation within category range
    const range = category.functionalityMax - category.functionalityMin;
    const defectRange = category.maxDefects - category.minDefects;

    if (defectRange === 0) {
        return category.functionalityMax;
    }

    const position = (defectCount - category.minDefects) / defectRange;
    return category.functionalityMax - (position * range);
}

/**
 * Check if a die position is in the edge exclusion zone
 * @param {number} dieX - Die center X position (mm from wafer center)
 * @param {number} dieY - Die center Y position (mm from wafer center)
 * @param {number} dieWidth - Die width in mm
 * @param {number} dieHeight - Die height in mm
 * @param {number} waferRadius - Wafer radius in mm
 * @param {number} edgeExclusionMm - Edge exclusion zone in mm
 * @returns {boolean} True if die is too close to edge or outside wafer
 */
export function isInEdgeExclusion(dieX, dieY, dieWidth, dieHeight, waferRadius, edgeExclusionMm) {
    const usableRadius = waferRadius - edgeExclusionMm;

    // Check all four corners of the die
    const corners = [
        { x: dieX - dieWidth / 2, y: dieY - dieHeight / 2 },
        { x: dieX + dieWidth / 2, y: dieY - dieHeight / 2 },
        { x: dieX - dieWidth / 2, y: dieY + dieHeight / 2 },
        { x: dieX + dieWidth / 2, y: dieY + dieHeight / 2 }
    ];

    // If any corner is outside the usable radius, die is in exclusion zone
    for (const corner of corners) {
        const distanceFromCenter = Math.sqrt(corner.x * corner.x + corner.y * corner.y);
        if (distanceFromCenter > usableRadius) {
            return true;
        }
    }

    return false;
}

/**
 * Calculate Murphy's yield model
 * Classic semiconductor yield formula
 * @param {number} dieAreaCm2 - Die area in cm²
 * @param {number} defectDensity - Defect density in defects per cm²
 * @param {number} alpha - Clustering parameter (typically 2-4)
 * @returns {number} Die yield (0.0 to 1.0)
 */
export function murphyYield(dieAreaCm2, defectDensity, alpha = 3) {
    // Murphy's yield model: Y = [(1 - e^(-D*A)) / (D*A)]^alpha
    // Where D = defect density, A = die area
    const DA = defectDensity * dieAreaCm2;

    if (DA === 0) {
        return 1.0;
    }

    const yield_ = Math.pow((1 - Math.exp(-DA)) / DA, alpha);
    return yield_;
}

/**
 * Format large numbers with appropriate suffix (K, M, B, T)
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(decimals) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(decimals) + 'K';
    } else {
        return num.toFixed(decimals);
    }
}
