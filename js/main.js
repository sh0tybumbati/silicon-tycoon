// Silicon Tycoon - Main Application Entry Point

import { WAFER_SIZES, PROCESS_NODES, RETICLE_SIZES } from './constants.js';
import { WaferPlanner } from './waferPlanner.js';
import { WaferRenderer } from './renderer.js';
import { formatNumber } from './physics.js';
import { initTheme, setupThemeSelector } from './themeManager.js';
import { getDieLibrary } from './dieLibrary.js';
import { loadBatchPlans, getBatchPlans, addBatchPlan, deleteBatchPlan, BatchPlan } from './batchPlanner.js';

class SiliconTycoonApp {
    constructor() {
        this.planner = new WaferPlanner();
        this.renderer = null;
        this.currentBatchPlan = null;
        this.lastCalculatedResults = null;

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
     * Populate reticle size dropdown (optionally filtered by process node)
     */
    populateReticleSizes(processNode = null) {
        const select = document.getElementById('reticle-size');
        const currentValue = select.value;
        select.innerHTML = '';

        console.log('[WaferPlanner] Populating reticles for process node:', processNode);
        console.log('[WaferPlanner] RETICLE_SIZES:', RETICLE_SIZES);

        let compatibleReticles = RETICLE_SIZES;

        // Filter by process node compatibility if specified
        if (processNode !== null) {
            compatibleReticles = RETICLE_SIZES.filter(reticle => {
                const isCompatible = processNode >= reticle.maxNode && processNode <= reticle.minNode;
                console.log(`[WaferPlanner] Reticle ${reticle.label}: node=${processNode}, min=${reticle.minNode}, max=${reticle.maxNode}, compatible=${isCompatible}`);
                return isCompatible;
            });
        }

        console.log('[WaferPlanner] Compatible reticles:', compatibleReticles.length);

        compatibleReticles.forEach(reticle => {
            const option = document.createElement('option');
            option.value = `${reticle.width}x${reticle.height}`;
            option.textContent = `${reticle.label} (${reticle.year})`;
            option.dataset.width = reticle.width;
            option.dataset.height = reticle.height;
            select.appendChild(option);
        });

        console.log('[WaferPlanner] Reticle dropdown populated with', select.options.length, 'options');

        // Try to restore previous selection if it's still compatible
        if (currentValue) {
            const stillExists = Array.from(select.options).some(opt => opt.value === currentValue);
            if (stillExists) {
                select.value = currentValue;
            }
        }
    }

    /**
     * Populate die library dropdown
     */
    populateDieLibrary() {
        const select = document.getElementById('die-select');
        console.log('[WaferPlanner] Populating die library dropdown');

        // Clear all options
        select.innerHTML = '';

        // Always add the manual entry option first
        const manualOption = document.createElement('option');
        manualOption.value = '';
        manualOption.textContent = '-- Manual Entry --';
        select.appendChild(manualOption);
        console.log('[WaferPlanner] Added manual entry option');

        // Add all dies from library
        const library = getDieLibrary();
        console.log('[WaferPlanner] Got library:', library);
        const dies = library.getAllDies();
        console.log('[WaferPlanner] Got dies array, length:', dies.length);
        console.log('[WaferPlanner] Dies:', dies);

        dies.forEach(die => {
            const option = document.createElement('option');
            option.value = die.id;
            option.textContent = `${die.sku} (${die.dimensions.width}×${die.dimensions.height}mm, ${die.processNode}nm)`;
            option.dataset.width = die.dimensions.width;
            option.dataset.height = die.dimensions.height;
            option.dataset.processNode = die.processNode;
            select.appendChild(option);
            console.log('[WaferPlanner] Added die:', die.sku);
        });

        console.log('[WaferPlanner] Dropdown population complete, total options:', select.options.length);
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

        // Save batch plan button
        document.getElementById('save-batch-btn').addEventListener('click', () => {
            this.onSaveBatchPlan();
        });

        // Batch library button
        document.getElementById('library-btn').addEventListener('click', () => {
            this.showBatchLibrary();
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

                    // Update reticle options based on selected process node
                    const processNode = parseFloat(select.value);
                    this.populateReticleSizes(processNode);
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

        const library = getDieLibrary();
        const die = library.getDie(dieId);
        if (!die) {
            console.error('[WaferPlanner] Die not found:', dieId);
            return;
        }

        // Populate die dimensions and process node from library
        document.getElementById('die-width').value = die.dimensions.width;
        document.getElementById('die-height').value = die.dimensions.height;
        document.getElementById('process-node').value = die.processNode || 7;

        // Update reticle options for this process node
        this.populateReticleSizes(die.processNode || 7);

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
        this.lastCalculatedResults = results;

        // Update UI with results
        this.updateStatsDisplay(this.planner.getStats());

        // Render wafer
        this.renderer.renderWafer(this.planner.getWaferData());

        // Enable save button if we have valid results
        document.getElementById('save-batch-btn').disabled = false;
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

        // Cost per wafer
        const processNode = this.planner.config.processNodeNm;
        const costPerWafer = BatchPlan.getCostPerWafer(processNode);
        document.getElementById('cost-per-wafer').textContent = `$${costPerWafer.toFixed(1)}k`;

        // Cost per die (wafer cost / total dies)
        const costPerDie = stats.totalDies > 0 ? (costPerWafer * 1000) / stats.totalDies : 0;
        if (costPerDie >= 1000) {
            document.getElementById('cost-per-die').textContent = `$${(costPerDie / 1000).toFixed(2)}k`;
        } else if (costPerDie >= 1) {
            document.getElementById('cost-per-die').textContent = `$${costPerDie.toFixed(2)}`;
        } else {
            document.getElementById('cost-per-die').textContent = `$${costPerDie.toFixed(3)}`;
        }

        // Time per wafer (estimate based on process node complexity)
        const timePerWafer = this.estimateWaferTime(processNode);
        document.getElementById('time-per-wafer').textContent = `${timePerWafer} days`;

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

    /**
     * Estimate fabrication time per wafer based on process node
     */
    estimateWaferTime(processNode) {
        // More advanced nodes require more processing steps and take longer
        if (processNode <= 5) return 90; // 3nm-5nm: ~90 days
        if (processNode <= 10) return 75; // 7nm-10nm: ~75 days
        if (processNode <= 22) return 60; // 14nm-22nm: ~60 days
        if (processNode <= 65) return 45; // 32nm-65nm: ~45 days
        if (processNode <= 180) return 30; // 90nm-180nm: ~30 days
        return 20; // 250nm+: ~20 days
    }

    /**
     * Save current configuration as a batch plan
     */
    onSaveBatchPlan() {
        if (!this.lastCalculatedResults) {
            alert('Please calculate yield before saving');
            return;
        }

        // Prompt for batch plan name
        const name = prompt('Enter batch plan name:', 'Batch Plan ' + (getBatchPlans().length + 1));
        if (!name) return;

        // Get selected die (if any)
        const dieSelect = document.getElementById('die-select');
        const selectedDieId = dieSelect.value;

        // Create batch plan
        const batchPlan = new BatchPlan({
            name: name,
            dieId: selectedDieId || null,
            waferSize: this.planner.config.waferDiameterMm,
            processNode: this.planner.config.processNodeNm,
            diesPerWafer: this.planner.getStats().totalDies,
            reticleShots: 0, // TODO: Calculate from reticle layout
            reticleSize: {
                width: this.planner.config.reticleWidthMm,
                height: this.planner.config.reticleHeightMm
            },
            costPerWafer: BatchPlan.getCostPerWafer(this.planner.config.processNodeNm)
        });

        // Calculate yields by maturity
        const baseYield = this.planner.getStats().overallYield / 100;
        batchPlan.yieldByMaturity = BatchPlan.calculateYieldByMaturity(baseYield);

        // Save to library
        addBatchPlan(batchPlan);

        alert(`Batch plan "${name}" saved successfully!`);
        document.getElementById('save-batch-btn').disabled = true;
    }

    /**
     * Show batch library modal
     */
    showBatchLibrary() {
        const modal = document.getElementById('batch-library-modal');
        modal.style.display = 'flex';

        this.renderBatchLibrary();

        // Set up modal close handler
        const closeBtn = document.getElementById('close-library-modal');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };

        // Set up search
        const searchInput = document.getElementById('library-search');
        searchInput.oninput = () => {
            this.renderBatchLibrary(searchInput.value.toLowerCase());
        };
    }

    /**
     * Render batch library list
     */
    renderBatchLibrary(searchTerm = '') {
        const container = document.getElementById('batch-library-list');
        const batchPlans = getBatchPlans();

        // Filter by search term
        const filtered = batchPlans.filter(bp => {
            if (!searchTerm) return true;
            const dieName = bp.getDieName().toLowerCase();
            const name = bp.name.toLowerCase();
            return name.includes(searchTerm) || dieName.includes(searchTerm);
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No batch plans found.</p>
                    <p style="font-size: 0.85rem; margin-top: 10px;">
                        Create a batch plan by selecting a die design,<br>
                        configuring wafer parameters, calculating yield,<br>
                        and clicking "Save Batch Plan".
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(bp => `
            <div class="library-item" data-batch-id="${bp.id}">
                <div class="item-header">
                    <h3>${bp.name}</h3>
                    <div class="item-actions">
                        <button class="action-btn load-btn" data-batch-id="${bp.id}" title="Load this batch plan">
                            📂 Load
                        </button>
                        <button class="action-btn delete-btn" data-batch-id="${bp.id}" title="Delete this batch plan">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-row">
                        <span class="detail-label">Die Design:</span>
                        <span class="detail-value">${bp.getDieName()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Wafer:</span>
                        <span class="detail-value">${bp.waferSize}mm @ ${bp.processNode}nm</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Dies/Wafer:</span>
                        <span class="detail-value">${bp.diesPerWafer} dies</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cost/Wafer:</span>
                        <span class="detail-value">$${bp.costPerWafer.toFixed(1)}k</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Yields:</span>
                        <span class="detail-value">
                            New: ${(bp.yieldByMaturity.new * 100).toFixed(1)}% |
                            Mature: ${(bp.yieldByMaturity.mature * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.load-btn').forEach(btn => {
            btn.onclick = () => this.loadBatchPlan(btn.dataset.batchId);
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => this.deleteBatchPlanWithConfirm(btn.dataset.batchId);
        });
    }

    /**
     * Load a batch plan from library
     */
    loadBatchPlan(batchId) {
        const batchPlans = getBatchPlans();
        const bp = batchPlans.find(b => b.id === batchId);

        if (!bp) {
            alert('Batch plan not found');
            return;
        }

        // Load batch plan settings into UI
        document.getElementById('wafer-size').value = bp.waferSize;
        document.getElementById('process-node').value = bp.processNode;
        document.getElementById('reticle-size').value = `${bp.reticleSize.width}x${bp.reticleSize.height}`;

        if (bp.dieId) {
            document.getElementById('die-select').value = bp.dieId;
            this.onDieSelected(bp.dieId);
        }

        // Close modal
        document.getElementById('batch-library-modal').style.display = 'none';

        // Auto-calculate
        this.onCalculate();
    }

    /**
     * Delete a batch plan with confirmation
     */
    deleteBatchPlanWithConfirm(batchId) {
        const batchPlans = getBatchPlans();
        const bp = batchPlans.find(b => b.id === batchId);

        if (!bp) return;

        if (confirm(`Delete batch plan "${bp.name}"?\n\nThis action cannot be undone.`)) {
            deleteBatchPlan(batchId);
            this.renderBatchLibrary();
        }
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
