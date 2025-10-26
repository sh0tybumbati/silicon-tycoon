// Silicon Tycoon - Main Application Entry Point

import { WAFER_SIZES, PROCESS_NODES, RETICLE_SIZES } from './constants.js';
import { WaferPlanner } from './waferPlanner.js';
import { WaferRenderer } from './renderer.js';
import { formatNumber } from './physics.js';
import { initTheme, setupThemeSelector } from './themeManager.js';
import { getDieLibrary } from './dieLibrary.js';
import { loadBatchPlans, MATURITY_MULTIPLIERS, MATURITY_LABELS } from './batchPlanner.js';

class SiliconTycoonApp {
    constructor() {
        this.planner = new WaferPlanner();
        this.renderer = null;

        this.init();
    }

    init() {
        // Initialize theme system first
        initTheme();
        setupThemeSelector();

        // Load batch plans (die library loads automatically when getDieLibrary() is called)
        loadBatchPlans();

        // Initialize renderer
        const container = document.getElementById('pixi-container');
        this.renderer = new WaferRenderer(container);

        // Setup navigation
        this.setupNavigation();

        // Populate dropdowns
        this.populateWaferSizes();
        this.populateProcessNodes();
        this.populateReticleSizes();
        this.populateDieLibrary();

        // Set up event listeners
        this.setupEventListeners();

        // Set default values
        this.setDefaultValues();

        // Initial calculation and render
        this.onCalculate();
    }

    /**
     * Setup navigation buttons
     */
    setupNavigation() {
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = btn.dataset.screen;
                console.log('Navigation clicked:', screen);

                // Don't navigate if disabled
                if (btn.disabled) {
                    console.log('Button is disabled');
                    return;
                }

                if (screen === 'architecture') {
                    console.log('Navigating to architecture.html');
                    window.location.href = 'architecture.html';
                } else if (screen === 'wafer') {
                    // Already here
                    console.log('Already on wafer screen');
                    return;
                }
            });
        });
    }

    /**
     * Populate wafer size dropdown
     */
    populateWaferSizes() {
        const select = document.getElementById('wafer-size');
        select.innerHTML = '';

        WAFER_SIZES.forEach(wafer => {
            const option = document.createElement('option');
            option.value = wafer.diameter;
            option.textContent = `${wafer.label} (${wafer.year})`;
            select.appendChild(option);
        });
    }

    /**
     * Populate process node dropdown
     */
    populateProcessNodes() {
        const select = document.getElementById('process-node');
        select.innerHTML = '';

        // Reverse order to show newest first
        [...PROCESS_NODES].reverse().forEach(node => {
            const option = document.createElement('option');
            option.value = node.node;
            option.textContent = `${node.label} (${node.year})`;
            option.dataset.defectDensity = node.baseDefectDensity;
            select.appendChild(option);
        });
    }

    /**
     * Populate reticle size dropdown
     */
    populateReticleSizes() {
        const select = document.getElementById('reticle-size');
        select.innerHTML = '';

        RETICLE_SIZES.forEach(reticle => {
            const option = document.createElement('option');
            option.value = `${reticle.width}x${reticle.height}`;
            option.textContent = `${reticle.label} (${reticle.year})`;
            option.dataset.width = reticle.width;
            option.dataset.height = reticle.height;
            select.appendChild(option);
        });
    }

    /**
     * Populate die library dropdown
     */
    populateDieLibrary() {
        const select = document.getElementById('die-select');
        // Keep the "Manual Entry" option
        const manualOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (manualOption) {
            select.appendChild(manualOption);
        }

        const dieLibrary = getDieLibrary();
        dieLibrary.forEach(die => {
            const option = document.createElement('option');
            option.value = die.id;
            option.textContent = `${die.sku} (${die.dimensions.width}×${die.dimensions.height}mm, ${die.processNode}nm)`;
            option.dataset.width = die.dimensions.width;
            option.dataset.height = die.dimensions.height;
            option.dataset.processNode = die.processNode;
            select.appendChild(option);
        });
    }

    /**
     * Set default values from planner config
     */
    setDefaultValues() {
        document.getElementById('wafer-size').value = this.planner.config.waferDiameterMm;
        document.getElementById('process-node').value = this.planner.config.processNodeNm;
        document.getElementById('process-maturity').value = this.planner.config.processMaturity;
        document.getElementById('reticle-size').value = `${this.planner.config.reticleWidthMm}x${this.planner.config.reticleHeightMm}`;
        document.getElementById('die-width').value = this.planner.config.dieWidthMm;
        document.getElementById('die-height').value = this.planner.config.dieHeightMm;

        this.updateMaturityDisplay();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.onCalculate();
        });

        // Real-time maturity slider update
        document.getElementById('process-maturity').addEventListener('input', (e) => {
            this.updateMaturityDisplay();
        });

        // Auto-calculate on Enter key in input fields
        const inputs = document.querySelectorAll('.art-deco-input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.onCalculate();
                }
            });
        });

        // Die select handler
        document.getElementById('die-select').addEventListener('change', (e) => {
            this.onDieSelected(e.target.value);
        });

        // Auto-calculate on dropdown change
        const selects = document.querySelectorAll('.art-deco-select');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                // Update base defect density when process node changes
                if (select.id === 'process-node') {
                    const selectedOption = select.options[select.selectedIndex];
                    const defectDensity = parseFloat(selectedOption.dataset.defectDensity);
                    this.planner.config.baseDefectDensity = defectDensity;
                }
            });
        });
    }

    /**
     * Handle die selection from library
     */
    onDieSelected(dieId) {
        if (!dieId) {
            // Manual entry selected
            document.getElementById('die-width').disabled = false;
            document.getElementById('die-height').disabled = false;
            document.getElementById('process-node').disabled = false;
            return;
        }

        const dieLibrary = getDieLibrary();
        const die = dieLibrary.find(d => d.id === dieId);
        if (!die) {
            console.error('[WaferPlanner] Die not found:', dieId);
            return;
        }

        // Populate die dimensions and process node from library
        document.getElementById('die-width').value = die.dimensions.width;
        document.getElementById('die-height').value = die.dimensions.height;
        document.getElementById('process-node').value = die.processNode || 7;

        // Disable manual entry when die is selected
        document.getElementById('die-width').disabled = true;
        document.getElementById('die-height').disabled = true;
        document.getElementById('process-node').disabled = true;

        // Auto-calculate
        this.onCalculate();
    }

    /**
     * Update maturity display value
     */
    updateMaturityDisplay() {
        const maturity = document.getElementById('process-maturity').value;
        document.getElementById('maturity-display').textContent = `${maturity}%`;
    }

    /**
     * Get configuration from UI
     */
    getConfigFromUI() {
        // Get reticle dimensions from dropdown
        const reticleSelect = document.getElementById('reticle-size');
        const selectedReticle = reticleSelect.options[reticleSelect.selectedIndex];

        return {
            waferDiameterMm: parseFloat(document.getElementById('wafer-size').value),
            processNodeNm: parseFloat(document.getElementById('process-node').value),
            processMaturity: parseFloat(document.getElementById('process-maturity').value),
            reticleWidthMm: parseFloat(selectedReticle.dataset.width),
            reticleHeightMm: parseFloat(selectedReticle.dataset.height),
            dieWidthMm: parseFloat(document.getElementById('die-width').value),
            dieHeightMm: parseFloat(document.getElementById('die-height').value)
        };
    }

    /**
     * Validate inputs
     */
    validateInputs(config) {
        const errors = [];

        if (config.dieWidthMm <= 0 || config.dieWidthMm > config.waferDiameterMm) {
            errors.push('Die width must be positive and less than wafer diameter');
        }

        if (config.dieHeightMm <= 0 || config.dieHeightMm > config.waferDiameterMm) {
            errors.push('Die height must be positive and less than wafer diameter');
        }

        if (config.reticleWidthMm <= 0 || config.reticleHeightMm <= 0) {
            errors.push('Reticle dimensions must be positive');
        }

        if (errors.length > 0) {
            alert('Input Errors:\n\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    /**
     * Handle calculate button click
     */
    onCalculate() {
        // Get config from UI
        const config = this.getConfigFromUI();

        // Validate
        if (!this.validateInputs(config)) {
            return;
        }

        // Update base defect density from selected process node
        const processNodeSelect = document.getElementById('process-node');
        const selectedOption = processNodeSelect.options[processNodeSelect.selectedIndex];
        config.baseDefectDensity = parseFloat(selectedOption.dataset.defectDensity);

        // Update planner config
        this.planner.setConfig(config);

        // Run calculations
        const results = this.planner.calculate();

        // Update UI with results
        this.updateStatsDisplay(this.planner.getStats());

        // Render wafer
        this.renderer.renderWafer(this.planner.getWaferData());
    }

    /**
     * Update statistics display
     */
    updateStatsDisplay(stats) {
        // Total dies
        document.getElementById('total-dies').textContent = stats.totalDies;

        // Transistors per die
        document.getElementById('transistors-per-die').textContent =
            formatNumber(stats.transistorsPerDie * 1e6, 1);

        // Overall yield
        document.getElementById('overall-yield').textContent =
            stats.overallYield.toFixed(1) + '%';

        // Yield breakdown
        const breakdown = stats.yieldBreakdown;
        const total = stats.totalDies;

        // Perfect
        document.getElementById('perfect-count').textContent = breakdown.perfect;
        document.getElementById('perfect-percent').textContent =
            `(${((breakdown.perfect / total) * 100).toFixed(1)}%)`;

        // Diminished
        document.getElementById('diminished-count').textContent = breakdown.diminished;
        document.getElementById('diminished-percent').textContent =
            `(${((breakdown.diminished / total) * 100).toFixed(1)}%)`;

        // Damaged
        document.getElementById('damaged-count').textContent = breakdown.damaged;
        document.getElementById('damaged-percent').textContent =
            `(${((breakdown.damaged / total) * 100).toFixed(1)}%)`;

        // Unusable
        document.getElementById('unusable-count').textContent = breakdown.unusable;
        document.getElementById('unusable-percent').textContent =
            `(${((breakdown.unusable / total) * 100).toFixed(1)}%)`;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SiliconTycoonApp();
    });
} else {
    new SiliconTycoonApp();
}
