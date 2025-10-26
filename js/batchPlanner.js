// Silicon Tycoon - Batch Planning System

import { PROCESS_NODES } from './constants.js';
import { getDieLibrary } from './dieLibrary.js';

const STORAGE_KEY = 'silicon_tycoon_batch_plans';
const RECOVERY_KEY = 'silicon_tycoon_batch_plans_recovery';

// Maturity multipliers for yield calculation
export const MATURITY_MULTIPLIERS = {
    new: 0.75,      // 0-3 months: 75% of base yield
    early: 1.00,    // 3-6 months: 100% of base yield
    mature: 1.15,   // 6-18 months: 115% of base yield
    optimized: 1.25 // 18+ months: 125% of base yield
};

export const MATURITY_LABELS = {
    new: 'New Process (0-3 months)',
    early: 'Early (3-6 months)',
    mature: 'Mature (6-18 months)',
    optimized: 'Optimized (18+ months)'
};

// Cost per wafer by process node (in thousands of dollars)
const WAFER_COST_BY_NODE = {
    10000: 0.05,   // 10μm: $50
    6000: 0.08,
    3000: 0.12,
    1500: 0.20,
    1000: 0.35,
    800: 0.50,
    600: 0.75,
    350: 1.0,
    250: 1.5,
    180: 2.0,      // 180nm: $2k
    130: 3.0,
    90: 4.5,
    65: 6.5,
    45: 9.0,
    32: 12.0,
    22: 16.0,
    14: 20.0,      // 14nm: $20k
    12: 22.0,
    10: 25.0,
    7: 30.0,       // 7nm: $30k
    5: 40.0,
    3: 50.0        // 3nm: $50k
};

/**
 * BatchPlan class - represents a wafer fabrication batch plan
 */
export class BatchPlan {
    constructor(data = {}) {
        this.id = data.id || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = data.name || 'Unnamed Batch';
        this.dieId = data.dieId || null;
        this.waferSize = data.waferSize || 300; // mm
        this.processNode = data.processNode || 7; // nm
        this.diesPerWafer = data.diesPerWafer || 0;
        this.reticleShots = data.reticleShots || 0;
        this.reticleSize = data.reticleSize || { width: 26, height: 33 }; // mm
        this.yieldByMaturity = data.yieldByMaturity || {
            new: 0,
            early: 0,
            mature: 0,
            optimized: 0
        };
        this.costPerWafer = data.costPerWafer || 0;
        this.createdDate = data.createdDate || new Date().toISOString();
        this.lastModified = data.lastModified || new Date().toISOString();
    }

    /**
     * Calculate batch metrics based on die design
     */
    static calculateMetrics(die, waferSize, reticleSize) {
        if (!die || !die.dimensions) {
            return {
                diesPerReticle: 0,
                reticleShotsPerWafer: 0,
                diesPerWafer: 0,
                waferAreaUtilization: 0
            };
        }

        const dieWidth = die.dimensions.width;
        const dieHeight = die.dimensions.height;
        const dieArea = dieWidth * dieHeight;

        // Dies per reticle (grid layout)
        const diesPerReticleX = Math.floor(reticleSize.width / dieWidth);
        const diesPerReticleY = Math.floor(reticleSize.height / dieHeight);
        const diesPerReticle = diesPerReticleX * diesPerReticleY;

        // Reticle shots per wafer (hexagonal packing approximation)
        const waferRadius = waferSize / 2;
        const waferArea = Math.PI * waferRadius * waferRadius;
        const reticleArea = reticleSize.width * reticleSize.height;

        // Approximate number of reticle shots that fit on wafer
        // Account for edge exclusion (5mm edge exclusion zone)
        const usableRadius = waferRadius - 5;
        const usableArea = Math.PI * usableRadius * usableRadius;
        const reticleShotsPerWafer = Math.floor(usableArea / reticleArea * 0.85); // 85% packing efficiency

        // Total dies per wafer
        const diesPerWafer = diesPerReticle * reticleShotsPerWafer;

        // Wafer area utilization
        const totalDieArea = diesPerWafer * dieArea;
        const waferAreaUtilization = (totalDieArea / usableArea) * 100;

        return {
            diesPerReticle,
            diesPerReticleX,
            diesPerReticleY,
            reticleShotsPerWafer,
            diesPerWafer,
            waferAreaUtilization: Math.min(100, waferAreaUtilization)
        };
    }

    /**
     * Calculate yields by maturity level
     */
    static calculateYieldByMaturity(baseYield) {
        return {
            new: baseYield * MATURITY_MULTIPLIERS.new,
            early: baseYield * MATURITY_MULTIPLIERS.early,
            mature: baseYield * MATURITY_MULTIPLIERS.mature,
            optimized: baseYield * MATURITY_MULTIPLIERS.optimized
        };
    }

    /**
     * Get cost per wafer for a process node
     */
    static getCostPerWafer(processNode) {
        const nodes = Object.keys(WAFER_COST_BY_NODE).map(Number).sort((a, b) => a - b);
        const closestNode = nodes.reduce((prev, curr) => {
            return Math.abs(curr - processNode) < Math.abs(prev - processNode) ? curr : prev;
        });
        return WAFER_COST_BY_NODE[closestNode] || 10.0;
    }

    /**
     * Update this batch plan with new die and calculate all metrics
     */
    updateFromDie(die, waferSize, reticleSize) {
        this.dieId = die.id;
        this.waferSize = waferSize;
        this.processNode = die.processNode || 7;
        this.reticleSize = reticleSize;

        // Calculate layout metrics
        const metrics = BatchPlan.calculateMetrics(die, waferSize, reticleSize);
        this.diesPerWafer = metrics.diesPerWafer;
        this.reticleShots = metrics.reticleShotsPerWafer;

        // Get base yield from die (this should come from architecture.js estimateYield)
        // For now, use a simple calculation
        const area = die.dimensions.width * die.dimensions.height;
        const processNode = PROCESS_NODES.find(n => n.node === this.processNode) || PROCESS_NODES.find(n => n.node === 7);
        const defectDensity = processNode.baseDefectDensity;
        const areaCm2 = area / 100;
        const baseYield = Math.exp(-defectDensity * areaCm2);

        // Calculate yields by maturity
        this.yieldByMaturity = BatchPlan.calculateYieldByMaturity(baseYield);

        // Calculate cost
        this.costPerWafer = BatchPlan.getCostPerWafer(this.processNode);

        this.lastModified = new Date().toISOString();

        return metrics;
    }

    /**
     * Get die name from library
     */
    getDieName() {
        if (!this.dieId) return 'No die selected';
        const dieLibrary = getDieLibrary();
        const die = dieLibrary.find(d => d.id === this.dieId);
        return die ? die.sku : 'Unknown die';
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            dieId: this.dieId,
            waferSize: this.waferSize,
            processNode: this.processNode,
            diesPerWafer: this.diesPerWafer,
            reticleShots: this.reticleShots,
            reticleSize: this.reticleSize,
            yieldByMaturity: this.yieldByMaturity,
            costPerWafer: this.costPerWafer,
            createdDate: this.createdDate,
            lastModified: this.lastModified
        };
    }
}

/**
 * Batch Plan Library Management
 */
let batchPlanLibrary = [];

/**
 * Load batch plans from localStorage
 */
export function loadBatchPlans() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            batchPlanLibrary = data.map(bp => new BatchPlan(bp));
            console.log(`[BatchPlanner] Loaded ${batchPlanLibrary.length} batch plans`);
        } else {
            batchPlanLibrary = [];
            console.log('[BatchPlanner] No saved batch plans found, starting fresh');
        }
    } catch (error) {
        console.error('[BatchPlanner] Error loading batch plans:', error);
        // Try recovery
        try {
            const recovery = localStorage.getItem(RECOVERY_KEY);
            if (recovery) {
                const data = JSON.parse(recovery);
                batchPlanLibrary = data.map(bp => new BatchPlan(bp));
                console.log(`[BatchPlanner] Recovered ${batchPlanLibrary.length} batch plans from backup`);
                saveBatchPlans(); // Save recovered data
            }
        } catch (recoveryError) {
            console.error('[BatchPlanner] Recovery failed:', recoveryError);
            batchPlanLibrary = [];
        }
    }
    return batchPlanLibrary;
}

/**
 * Save batch plans to localStorage
 */
export function saveBatchPlans() {
    try {
        // Save current data
        const data = batchPlanLibrary.map(bp => bp.toJSON());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Create recovery backup
        localStorage.setItem(RECOVERY_KEY, JSON.stringify(data));

        console.log(`[BatchPlanner] Saved ${batchPlanLibrary.length} batch plans`);
        return true;
    } catch (error) {
        console.error('[BatchPlanner] Error saving batch plans:', error);
        return false;
    }
}

/**
 * Get all batch plans
 */
export function getBatchPlans() {
    return batchPlanLibrary;
}

/**
 * Get batch plan by ID
 */
export function getBatchPlanById(id) {
    return batchPlanLibrary.find(bp => bp.id === id);
}

/**
 * Add new batch plan
 */
export function addBatchPlan(batchPlan) {
    batchPlanLibrary.push(batchPlan);
    saveBatchPlans();
    console.log('[BatchPlanner] Added new batch plan:', batchPlan.name);
    return batchPlan;
}

/**
 * Update existing batch plan
 */
export function updateBatchPlan(batchPlan) {
    const index = batchPlanLibrary.findIndex(bp => bp.id === batchPlan.id);
    if (index !== -1) {
        batchPlan.lastModified = new Date().toISOString();
        batchPlanLibrary[index] = batchPlan;
        saveBatchPlans();
        console.log('[BatchPlanner] Updated batch plan:', batchPlan.name);
        return true;
    }
    return false;
}

/**
 * Delete batch plan
 */
export function deleteBatchPlan(id) {
    const index = batchPlanLibrary.findIndex(bp => bp.id === id);
    if (index !== -1) {
        const deleted = batchPlanLibrary.splice(index, 1)[0];
        saveBatchPlans();
        console.log('[BatchPlanner] Deleted batch plan:', deleted.name);
        return true;
    }
    return false;
}

/**
 * Clone batch plan
 */
export function cloneBatchPlan(id) {
    const original = getBatchPlanById(id);
    if (original) {
        const cloned = new BatchPlan({
            ...original.toJSON(),
            id: undefined, // Will generate new ID
            name: `${original.name} (Copy)`,
            createdDate: undefined, // Will use current date
            lastModified: undefined
        });
        addBatchPlan(cloned);
        return cloned;
    }
    return null;
}
