// Silicon Tycoon - Wafer Planner Core Logic

import { EDGE_EXCLUSION_MM, YIELD_CATEGORIES } from './constants.js';
import {
    calculateTransistorDensity,
    calculateDieTransistors,
    calculateEffectiveDefectDensity,
    calculateExpectedDefects,
    poissonSample,
    getYieldCategory,
    calculateFunctionality,
    isInEdgeExclusion
} from './physics.js';

export class WaferPlanner {
    constructor() {
        this.config = {
            waferDiameterMm: 300,
            processNodeNm: 14,
            processMaturity: 50,
            reticleWidthMm: 26,
            reticleHeightMm: 33,
            dieWidthMm: 10,
            dieHeightMm: 10,
            baseDefectDensity: 3.5
        };

        this.results = {
            dies: [],
            totalDies: 0,
            transistorDensity: 0,
            transistorsPerDie: 0,
            yieldBreakdown: {
                perfect: 0,
                diminished: 0,
                damaged: 0,
                unusable: 0
            },
            overallYield: 0
        };
    }

    /**
     * Update configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Main calculation function
     */
    calculate() {
        // Step 1: Calculate transistor density
        this.results.transistorDensity = calculateTransistorDensity(this.config.processNodeNm);

        // Step 2: Calculate transistors per die
        this.results.transistorsPerDie = calculateDieTransistors(
            this.config.dieWidthMm,
            this.config.dieHeightMm,
            this.results.transistorDensity
        );

        // Step 3: Calculate effective defect density based on maturity
        const effectiveDefectDensity = calculateEffectiveDefectDensity(
            this.config.baseDefectDensity,
            this.config.processMaturity
        );

        // Step 4: Calculate expected defects per die
        const expectedDefects = calculateExpectedDefects(
            this.config.dieWidthMm,
            this.config.dieHeightMm,
            effectiveDefectDensity
        );

        // Step 5: Place dies on wafer
        this.results.dies = this.placeDies(expectedDefects);
        this.results.totalDies = this.results.dies.length;

        // Step 6: Calculate yield statistics
        this.calculateYieldStats();

        return this.results;
    }

    /**
     * Place dies on the wafer in a grid pattern
     */
    placeDies(expectedDefects) {
        const dies = [];
        const waferRadiusMm = this.config.waferDiameterMm / 2;
        const dieWidth = this.config.dieWidthMm;
        const dieHeight = this.config.dieHeightMm;

        // Calculate how many dies fit in each direction
        const maxDiesX = Math.ceil(this.config.waferDiameterMm / dieWidth);
        const maxDiesY = Math.ceil(this.config.waferDiameterMm / dieHeight);

        // Start from center and work outward
        const startX = -Math.floor(maxDiesX / 2) * dieWidth + dieWidth / 2;
        const startY = -Math.floor(maxDiesY / 2) * dieHeight + dieHeight / 2;

        let dieIdCounter = 1; // Start die IDs at 1

        for (let row = 0; row < maxDiesY; row++) {
            for (let col = 0; col < maxDiesX; col++) {
                const dieX = startX + col * dieWidth;
                const dieY = startY + row * dieHeight;

                // Check if die fits within wafer bounds
                if (!this.dieFitsInWafer(dieX, dieY, dieWidth, dieHeight, waferRadiusMm)) {
                    continue;
                }

                // Check if die is in edge exclusion zone
                const inEdgeExclusion = isInEdgeExclusion(
                    dieX, dieY,
                    dieWidth, dieHeight,
                    waferRadiusMm,
                    EDGE_EXCLUSION_MM
                );

                // Calculate defects for this die using Poisson distribution
                let defectCount;
                let category;

                if (inEdgeExclusion) {
                    // Dies in edge exclusion zone are automatically unusable
                    defectCount = 999;
                    category = YIELD_CATEGORIES.UNUSABLE;
                } else {
                    // Sample defect count from Poisson distribution
                    defectCount = poissonSample(expectedDefects);
                    category = getYieldCategory(defectCount);
                }

                // Calculate functionality
                const functionality = calculateFunctionality(defectCount, category);

                // Create die object
                dies.push({
                    id: dieIdCounter++, // Assign unique ID
                    x: dieX,
                    y: dieY,
                    defectCount,
                    category,
                    functionality,
                    inEdgeExclusion,
                    row,
                    col
                });
            }
        }

        return dies;
    }

    /**
     * Check if die fits within wafer circular boundary
     */
    dieFitsInWafer(dieX, dieY, dieWidth, dieHeight, waferRadius) {
        // Check if all four corners are within wafer radius
        const corners = [
            { x: dieX - dieWidth / 2, y: dieY - dieHeight / 2 },
            { x: dieX + dieWidth / 2, y: dieY - dieHeight / 2 },
            { x: dieX - dieWidth / 2, y: dieY + dieHeight / 2 },
            { x: dieX + dieWidth / 2, y: dieY + dieHeight / 2 }
        ];

        for (const corner of corners) {
            const distance = Math.sqrt(corner.x * corner.x + corner.y * corner.y);
            if (distance > waferRadius) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate yield statistics
     */
    calculateYieldStats() {
        const breakdown = {
            perfect: 0,
            diminished: 0,
            damaged: 0,
            unusable: 0
        };

        this.results.dies.forEach(die => {
            switch (die.category) {
                case YIELD_CATEGORIES.PERFECT:
                    breakdown.perfect++;
                    break;
                case YIELD_CATEGORIES.DIMINISHED:
                    breakdown.diminished++;
                    break;
                case YIELD_CATEGORIES.DAMAGED:
                    breakdown.damaged++;
                    break;
                case YIELD_CATEGORIES.UNUSABLE:
                    breakdown.unusable++;
                    break;
            }
        });

        this.results.yieldBreakdown = breakdown;

        // Calculate overall yield (perfect + diminished dies)
        const totalDies = this.results.totalDies;
        if (totalDies > 0) {
            const usableDies = breakdown.perfect + breakdown.diminished;
            this.results.overallYield = (usableDies / totalDies) * 100;
        } else {
            this.results.overallYield = 0;
        }
    }

    /**
     * Get results formatted for rendering
     */
    getWaferData() {
        return {
            waferDiameterMm: this.config.waferDiameterMm,
            dies: this.results.dies,
            dieWidthMm: this.config.dieWidthMm,
            dieHeightMm: this.config.dieHeightMm
        };
    }

    /**
     * Get statistics for UI display
     */
    getStats() {
        return {
            totalDies: this.results.totalDies,
            transistorsPerDie: this.results.transistorsPerDie,
            overallYield: this.results.overallYield,
            yieldBreakdown: this.results.yieldBreakdown
        };
    }
}
