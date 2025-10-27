// Silicon Tycoon - Architecture Screen Main

import { getDieLibrary, DIE_TYPES, COMPONENT_TYPES, DIE_REQUIREMENTS } from './dieLibrary.js';
import {
    RETICLE_SIZES,
    PROCESS_NODES,
    TRANSISTOR_DENSITY,
    COMPONENT_DENSITY_MULTIPLIERS,
    EXPECTED_MEM_CTRL_AREA,
    MAX_CLOCK_BY_NODE,
    NODE_VOLTAGE,
    LEAKAGE_PER_M_TRANSISTORS,
    THERMAL_LIMITS,
    INTERCONNECT_REQUIREMENTS,
    MEMORY_BANDWIDTH_PER_CONTROLLER,
    CHIP_CLASSIFICATION_CRITERIA
} from './constants.js';
import { DieDesigner } from './dieDesigner.js';
import { initTheme, setupThemeSelector } from './themeManager.js';

class ArchitectureApp {
    constructor() {
        console.log('[ArchitectureApp] Initializing...');
        try {
            this.library = getDieLibrary();
            this.currentDie = null;
            this.currentView = 'library'; // 'library' or 'designer'
            this.designer = null;

            this.init();
            console.log('[ArchitectureApp] Initialization complete');
        } catch (e) {
            console.error('[ArchitectureApp] Critical error during initialization:', e);
            console.error('[ArchitectureApp] Stack trace:', e.stack);
            // Show user-friendly error message
            document.body.innerHTML = `
                <div style="padding: 40px; text-align: center; font-family: monospace; color: #ff0066;">
                    <h2>Initialization Error</h2>
                    <p>Failed to load the application. Please refresh the page.</p>
                    <p style="font-size: 0.9em; color: #00ced1;">Error: ${e.message}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; font-size: 1em;">Reload Page</button>
                </div>
            `;
        }
    }

    init() {
        console.log('[ArchitectureApp] Running init()...');
        try {
            // Initialize theme system first
            initTheme();
            setupThemeSelector();

            // Setup navigation
            this.setupNavigation();

            // Setup die library view
            this.setupLibraryView();

            // Setup dialog
            this.setupDialog();

            // Populate reticle dropdown
            this.populateReticles();

            // Initial render
            this.renderDieLibrary();
            console.log('[ArchitectureApp] Init complete');
        } catch (e) {
            console.error('[ArchitectureApp] Error in init():', e);
            console.error('[ArchitectureApp] Stack trace:', e.stack);
            throw e;
        }
    }

    /**
     * Setup navigation buttons
     */
    setupNavigation() {
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                if (screen === 'wafer') {
                    window.location.href = 'index.html';
                } else if (screen === 'architecture') {
                    // Already here
                    return;
                }
            });
        });
    }

    /**
     * Setup library view controls
     */
    setupLibraryView() {
        // Create die button
        document.getElementById('create-die-btn').addEventListener('click', () => {
            this.showDialog();
        });

        // Search
        document.getElementById('search-dies').addEventListener('input', (e) => {
            this.filterDies(e.target.value, document.getElementById('filter-type').value);
        });

        // Filter
        document.getElementById('filter-type').addEventListener('change', (e) => {
            this.filterDies(document.getElementById('search-dies').value, e.target.value);
        });
    }

    /**
     * Setup dialog controls
     */
    setupDialog() {
        const dialog = document.getElementById('die-dialog');
        const closeBtn = document.getElementById('close-dialog');
        const cancelBtn = document.getElementById('cancel-dialog');
        const saveBtn = document.getElementById('save-die-btn');

        // Close handlers
        closeBtn.addEventListener('click', () => this.hideDialog());
        cancelBtn.addEventListener('click', () => this.hideDialog());

        // Click outside to close
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                this.hideDialog();
            }
        });

        // Save handler
        saveBtn.addEventListener('click', () => this.saveDie());

        // Update area calculations when dimensions change
        document.getElementById('die-width').addEventListener('input', () => this.updateAreaDisplay());
        document.getElementById('die-height').addEventListener('input', () => this.updateAreaDisplay());
        document.getElementById('die-reticle').addEventListener('change', () => this.updateAreaDisplay());
    }

    /**
     * Populate reticle dropdown
     */
    populateReticles() {
        const select = document.getElementById('die-reticle');
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
     * Show create/edit die dialog
     */
    showDialog(die = null) {
        this.currentDie = die;
        const dialog = document.getElementById('die-dialog');
        const title = document.getElementById('dialog-title');
        const saveBtn = document.getElementById('save-die-btn');

        if (die) {
            // Edit mode
            title.textContent = 'Edit Die';
            saveBtn.textContent = 'SAVE CHANGES';

            document.getElementById('die-sku').value = die.sku;
            document.getElementById('die-type').value = die.type;
            document.getElementById('die-description').value = die.description || '';
            document.getElementById('die-reticle').value = `${die.reticleSize.width}x${die.reticleSize.height}`;
            document.getElementById('die-width').value = die.dimensions.width;
            document.getElementById('die-height').value = die.dimensions.height;
        } else {
            // Create mode
            title.textContent = 'Create New Die';
            saveBtn.textContent = 'CREATE DIE';

            document.getElementById('die-sku').value = '';
            document.getElementById('die-type').value = 'cpu';
            document.getElementById('die-description').value = '';
            document.getElementById('die-width').value = 10;
            document.getElementById('die-height').value = 10;
        }

        this.updateAreaDisplay();
        dialog.style.display = 'flex';
    }

    /**
     * Hide dialog
     */
    hideDialog() {
        document.getElementById('die-dialog').style.display = 'none';
        this.currentDie = null;
    }

    /**
     * Update area display in dialog
     */
    updateAreaDisplay() {
        const width = parseFloat(document.getElementById('die-width').value) || 0;
        const height = parseFloat(document.getElementById('die-height').value) || 0;
        const area = width * height;

        const reticleSelect = document.getElementById('die-reticle');
        const selectedOption = reticleSelect.options[reticleSelect.selectedIndex];
        const reticleWidth = parseFloat(selectedOption.dataset.width) || 26;
        const reticleHeight = parseFloat(selectedOption.dataset.height) || 33;
        const reticleArea = reticleWidth * reticleHeight;
        const utilization = reticleArea > 0 ? (area / reticleArea) * 100 : 0;

        document.getElementById('die-area-display').textContent = `${area.toFixed(1)} mm²`;
        document.getElementById('reticle-util-display').textContent = `${utilization.toFixed(1)}%`;
    }

    /**
     * Save die (create or update)
     */
    saveDie() {
        console.log('[ArchitectureApp] Saving die...');
        try {
            const sku = document.getElementById('die-sku').value.trim();
            const type = document.getElementById('die-type').value;
            const description = document.getElementById('die-description').value.trim();
            const width = parseFloat(document.getElementById('die-width').value);
            const height = parseFloat(document.getElementById('die-height').value);

            const reticleSelect = document.getElementById('die-reticle');
            const selectedOption = reticleSelect.options[reticleSelect.selectedIndex];
            const reticleWidth = parseFloat(selectedOption.dataset.width);
            const reticleHeight = parseFloat(selectedOption.dataset.height);

            console.log('[ArchitectureApp] Die data:', { sku, type, width, height });

            // Validation
            if (!sku) {
                alert('Please enter a die SKU/Name');
                return;
            }

            if (width <= 0 || height <= 0) {
                alert('Die dimensions must be greater than 0');
                return;
            }

            if (width > reticleWidth || height > reticleHeight) {
                alert('Die dimensions exceed reticle size');
                return;
            }

            const dieData = {
                sku,
                type,
                description,
                reticleSize: { width: reticleWidth, height: reticleHeight },
                dimensions: { width, height }
            };

            if (this.currentDie) {
                // Update existing
                console.log('[ArchitectureApp] Updating existing die:', this.currentDie.id);
                this.library.updateDie(this.currentDie.id, dieData);
            } else {
                // Create new
                console.log('[ArchitectureApp] Creating new die');
                this.library.createDie(dieData);
            }

            this.hideDialog();
            this.renderDieLibrary();
            console.log('[ArchitectureApp] Die saved successfully');
        } catch (e) {
            console.error('[ArchitectureApp] Error saving die:', e);
            console.error('[ArchitectureApp] Stack trace:', e.stack);
            alert('Error saving die: ' + e.message);
        }
    }

    /**
     * Render die library grid
     */
    renderDieLibrary(dies = null) {
        const grid = document.getElementById('die-grid');
        const allDies = dies || this.library.getAllDies();

        if (allDies.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--teal-light);">
                    <p style="font-size: 1.5rem; margin-bottom: 20px;">📐 No dies created yet</p>
                    <p>Click "CREATE NEW DIE" to get started</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = allDies.map(die => {
            const typeInfo = Object.values(DIE_TYPES).find(t => t.id === die.type);
            const stats = this.library.calculateDieStats(die);

            return `
                <div class="die-card" data-die-id="${die.id}">
                    <div class="die-card-header">
                        <div class="die-type-icon">${typeInfo.icon}</div>
                        <div class="die-card-actions">
                            <button class="icon-btn edit-die" title="Edit">✏️</button>
                            <button class="icon-btn clone-die" title="Clone">📋</button>
                            <button class="icon-btn delete-die" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="die-card-title">${die.sku}</div>
                    <div class="die-card-type">${typeInfo.label}</div>
                    <div class="die-card-stats">
                        <div class="die-stat">
                            <span class="die-stat-label">Dimensions</span>
                            <span class="die-stat-value">${die.dimensions.width} × ${die.dimensions.height} mm</span>
                        </div>
                        <div class="die-stat">
                            <span class="die-stat-label">Area</span>
                            <span class="die-stat-value">${stats.area.toFixed(1)} mm²</span>
                        </div>
                        <div class="die-stat">
                            <span class="die-stat-label">Components</span>
                            <span class="die-stat-value">${stats.componentCount}</span>
                        </div>
                        <div class="die-stat">
                            <span class="die-stat-label">Utilization</span>
                            <span class="die-stat-value">${stats.utilizationPercent.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        grid.querySelectorAll('.die-card').forEach(card => {
            const dieId = card.dataset.dieId;

            // Edit
            card.querySelector('.edit-die').addEventListener('click', (e) => {
                e.stopPropagation();
                const die = this.library.getDie(dieId);
                this.showDialog(die);
            });

            // Clone
            card.querySelector('.clone-die').addEventListener('click', (e) => {
                e.stopPropagation();
                this.library.cloneDie(dieId);
                this.renderDieLibrary();
            });

            // Delete
            card.querySelector('.delete-die').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this die design?')) {
                    this.library.deleteDie(dieId);
                    this.renderDieLibrary();
                }
            });

            // Open designer
            card.addEventListener('click', () => {
                const die = this.library.getDie(dieId);
                this.openDesigner(die);
            });
        });
    }

    /**
     * Filter dies by search term and type
     */
    filterDies(searchTerm, typeFilter) {
        let dies = this.library.getAllDies();

        // Filter by type
        if (typeFilter !== 'all') {
            dies = dies.filter(d => d.type === typeFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            dies = dies.filter(d =>
                d.sku.toLowerCase().includes(term) ||
                (d.description && d.description.toLowerCase().includes(term))
            );
        }

        this.renderDieLibrary(dies);
    }

    /**
     * Open die designer view
     */
    openDesigner(die) {
        this.currentDie = die;
        this.currentView = 'designer';

        // Hide library, show designer
        document.getElementById('die-library-view').style.display = 'none';
        document.getElementById('die-designer-view').style.display = 'block';

        // Initialize designer if needed
        if (!this.designer) {
            const container = document.getElementById('designer-canvas');
            this.designer = new DieDesigner(container);

            // Setup designer callbacks
            this.designer.onComponentSelected = (component) => {
                this.showComponentProperties(component);
            };

            this.designer.onComponentDeselected = () => {
                this.showDieProperties();
            };

            this.designer.onDieModified = (die) => {
                this.library.updateDie(die.id, die);
            };

            this.designer.onToolChanged = (tool) => {
                this.setActiveTool(tool);
            };

            this.designer.onComponentTypeCleared = () => {
                // Clear palette selection
                document.querySelectorAll('.component-item').forEach(item => {
                    item.classList.remove('selected');
                });
            };
        }

        // Load die into designer
        this.designer.loadDie(die);

        // Show die properties
        this.showDieProperties();

        // Setup designer controls
        this.setupDesignerControls();

        // Populate component palette
        this.populateComponentPalette();
    }

    /**
     * Close designer and return to library
     */
    closeDesigner() {
        this.currentView = 'library';
        document.getElementById('die-designer-view').style.display = 'none';
        document.getElementById('die-library-view').style.display = 'block';
        this.renderDieLibrary();
    }

    /**
     * Setup designer controls
     */
    setupDesignerControls() {
        // Back to library button
        document.getElementById('back-to-library').onclick = () => {
            this.closeDesigner();
        };

        // Save design button
        document.getElementById('save-design').onclick = () => {
            this.library.updateDie(this.currentDie.id, this.currentDie);
            alert('Die design saved!');
        };

        // Select tool (crosshair icon)
        document.getElementById('select-tool').onclick = () => {
            this.setActiveTool('select');
        };

        // Pan tool (hand icon)
        document.getElementById('pan-tool').onclick = () => {
            this.setActiveTool('pan');
        };

        // Draw tool (pencil icon)
        document.getElementById('draw-tool').onclick = () => {
            this.setActiveTool('draw');
        };

        // Copy tool (clipboard icon)
        document.getElementById('copy-tool').onclick = () => {
            this.designer.copySelectedComponent();
        };

        // Delete tool
        document.getElementById('delete-tool').onclick = () => {
            this.designer.removeSelectedComponent();
        };

        // Snap size selector
        document.getElementById('snap-size').onchange = (e) => {
            const snapSize = parseFloat(e.target.value);
            this.designer.gridSize = snapSize;
            console.log('[Architecture] Snap size changed to', snapSize, 'mm');
        };

        // Set initial tool to select
        this.setActiveTool('select');
    }

    /**
     * Set active tool and update UI
     */
    setActiveTool(tool) {
        // Update designer tool
        this.designer.setTool(tool);

        // Update button states
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (tool === 'select') {
            document.getElementById('select-tool').classList.add('active');
        } else if (tool === 'pan') {
            document.getElementById('pan-tool').classList.add('active');
        } else if (tool === 'draw') {
            document.getElementById('draw-tool').classList.add('active');
        }

        // Clear component palette selection when switching away from draw mode
        if (tool !== 'draw') {
            document.querySelectorAll('.component-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    }

    /**
     * Populate component palette based on die type
     */
    populateComponentPalette() {
        // Populate process node dropdown
        const processNodeSelect = document.getElementById('process-node-select');
        processNodeSelect.innerHTML = '';

        // Sort process nodes from smallest to largest for easier selection
        const sortedNodes = [...PROCESS_NODES].sort((a, b) => a.node - b.node);

        sortedNodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.node;
            option.textContent = `${node.label} (${node.year})`;
            processNodeSelect.appendChild(option);
        });

        // Set current process node
        if (this.currentDie.processNode) {
            processNodeSelect.value = this.currentDie.processNode;
        }

        // Handle process node changes
        processNodeSelect.onchange = () => {
            this.currentDie.processNode = parseInt(processNodeSelect.value);
            this.library.updateDie(this.currentDie.id, this.currentDie);
            this.showDieProperties(); // Update performance calculations
        };

        // Populate component palette
        const palette = document.getElementById('component-list');
        palette.innerHTML = '';

        // Filter components by die type
        const components = Object.values(COMPONENT_TYPES).filter(comp => {
            return comp.category === 'common' || comp.category === this.currentDie.type;
        });

        components.forEach(compType => {
            const item = document.createElement('div');
            item.className = 'component-item';
            item.textContent = compType.label;
            item.dataset.componentType = compType.id;

            item.addEventListener('click', () => {
                this.selectComponentForDrawing(compType);
            });

            palette.appendChild(item);
        });
    }

    /**
     * Select component type for drawing
     */
    selectComponentForDrawing(compType) {
        // Set the component type in designer
        this.designer.selectComponentType(compType);

        // Switch to draw tool
        this.setActiveTool('draw');

        // Highlight selected component in palette
        document.querySelectorAll('.component-item').forEach(item => {
            item.classList.remove('selected');
        });
        const selectedItem = document.querySelector(`[data-component-type="${compType.id}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }

    /**
     * Helper: Get transistor count for a component based on area and density
     */
    getComponentTransistorCount(component, processNode) {
        // Get base transistor density for this process node
        const baseDensity = TRANSISTOR_DENSITY[processNode] || 60.1;

        // Get component-specific density multiplier
        const multiplier = COMPONENT_DENSITY_MULTIPLIERS[component.type] || 1.0;

        // Calculate effective density for this component type
        const effectiveDensity = baseDensity * multiplier;

        // Calculate area
        const area = component.dimensions.width * component.dimensions.height;

        // Return transistor count (in millions)
        return area * effectiveDensity;
    }

    /**
     * Helper: Calculate total transistor count
     */
    calculateTotalTransistors(die) {
        const components = die.components || [];
        let total = 0;

        components.forEach(comp => {
            total += this.getComponentTransistorCount(comp, die.processNode);
        });

        return total; // millions
    }

    /**
     * Helper: Calculate size scaling factor for a component
     * Default size = 1.0x performance, larger = bonus, smaller = penalty
     */
    calculateSizeScaling(component, processNode) {
        // Import getDefaultComponentSize from designer
        // For now, inline the same logic
        const baseSizes = {
            'cpu_core': { width: 3.0, height: 3.0 },
            'l2_cache': { width: 2.5, height: 2.5 },
            'l3_cache': { width: 4.0, height: 4.0 },
            'mem_ctrl': { width: 2.0, height: 1.5 },
            'interconnect': { width: 6.0, height: 1.0 },
            'power_mgmt': { width: 1.5, height: 1.5 },
            'io_ctrl': { width: 2.5, height: 1.5 },
            'igpu': { width: 4.0, height: 3.0 },
            'gpu_sm': { width: 3.5, height: 3.5 },
            'texture_unit': { width: 2.0, height: 2.0 },
            'display_engine': { width: 2.0, height: 2.0 },
            'memory_array': { width: 6.0, height: 6.0 },
            'control_logic': { width: 2.0, height: 2.0 },
            'npu': { width: 3.0, height: 3.0 }
        };

        const nodeScaleFactors = {
            10000: 70, 6000: 40, 3000: 20, 1500: 8, 1000: 3.5,
            800: 2.5, 600: 2.0, 350: 1.5, 250: 1.2, 180: 1.3,
            130: 1.0, 90: 0.8, 65: 0.6, 45: 0.5, 32: 0.45,
            22: 0.42, 14: 0.4, 12: 0.38, 10: 0.35, 7: 0.3, 5: 0.25, 3: 0.2
        };

        const baseSize = baseSizes[component.type] || { width: 2.0, height: 2.0 };
        const scaleFactor = nodeScaleFactors[processNode] || 1.0;

        const defaultWidth = Math.max(1, Math.round(baseSize.width * scaleFactor * 2) / 2);
        const defaultHeight = Math.max(1, Math.round(baseSize.height * scaleFactor * 2) / 2);
        const defaultArea = defaultWidth * defaultHeight;

        const actualArea = component.dimensions.width * component.dimensions.height;
        const sizeRatio = actualArea / defaultArea;

        // Different components scale differently
        const scalingCurves = {
            'cpu_core': {
                // CPU cores: diminishing returns (sqrt scaling)
                // 0.5x size = 0.71x perf, 2x size = 1.41x perf
                scale: (ratio) => Math.pow(ratio, 0.5),
                maxBonus: 1.5, // Cap at 150%
                minPenalty: 0.6 // Floor at 60%
            },
            'l2_cache': {
                // Cache: linear scaling (more cache = more hits)
                // 0.5x size = 0.5x perf, 2x size = 2x perf
                scale: (ratio) => ratio,
                maxBonus: 2.0,
                minPenalty: 0.5
            },
            'l3_cache': {
                // Cache: linear scaling
                scale: (ratio) => ratio,
                maxBonus: 2.0,
                minPenalty: 0.5
            },
            'mem_ctrl': {
                // Memory controller: logarithmic (bandwidth saturates)
                // 0.5x = 0.82x, 2x = 1.18x
                scale: (ratio) => 0.8 + Math.log2(ratio) * 0.2,
                maxBonus: 1.3,
                minPenalty: 0.7
            },
            'gpu_sm': {
                // GPU: square root (parallel units)
                scale: (ratio) => Math.pow(ratio, 0.6),
                maxBonus: 1.6,
                minPenalty: 0.6
            },
            'npu': {
                // NPU: square root
                scale: (ratio) => Math.pow(ratio, 0.6),
                maxBonus: 1.6,
                minPenalty: 0.6
            },
            'interconnect': {
                // Interconnect: minimal scaling (just wiring)
                scale: (ratio) => 0.95 + Math.log2(ratio) * 0.05,
                maxBonus: 1.1,
                minPenalty: 0.9
            }
        };

        const curve = scalingCurves[component.type] || scalingCurves['cpu_core'];
        let scaling = curve.scale(sizeRatio);

        // Apply caps
        scaling = Math.max(curve.minPenalty, Math.min(curve.maxBonus, scaling));

        return scaling;
    }

    /**
     * Helper: Calculate IPC (Instructions Per Cycle) based on architecture
     */
    calculateIPC(die) {
        const components = die.components || [];
        let baseIPC = 4.0; // Modern out-of-order CPU baseline

        // Cache sizes improve IPC via lower miss rates
        const l2Cache = components.filter(c => c.type === 'l2_cache');
        const l3Cache = components.filter(c => c.type === 'l3_cache');

        // Calculate size-scaled cache performance
        let l2EffectiveArea = 0;
        let l3EffectiveArea = 0;

        l2Cache.forEach(c => {
            const area = c.dimensions.width * c.dimensions.height;
            const scaling = this.calculateSizeScaling(c, die.processNode);
            l2EffectiveArea += area * scaling; // Size * efficiency
        });

        l3Cache.forEach(c => {
            const area = c.dimensions.width * c.dimensions.height;
            const scaling = this.calculateSizeScaling(c, die.processNode);
            l3EffectiveArea += area * scaling;
        });

        // More cache = better IPC (up to a point)
        const l2Bonus = Math.min(0.5, l2EffectiveArea / 10 * 0.1); // +0.1 IPC per 10mm² L2
        const l3Bonus = Math.min(0.3, l3EffectiveArea / 50 * 0.1); // +0.1 IPC per 50mm² L3

        return baseIPC + l2Bonus + l3Bonus;
    }

    /**
     * Helper: Calculate distance between two components (mm)
     */
    calculateDistance(comp1, comp2) {
        const dx = (comp2.position.x + comp2.dimensions.width / 2) - (comp1.position.x + comp1.dimensions.width / 2);
        const dy = (comp2.position.y + comp2.dimensions.height / 2) - (comp1.position.y + comp1.dimensions.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Helper: Find nearest component of given type
     */
    findNearestComponent(die, sourceComp, targetType) {
        const components = die.components || [];
        const targets = components.filter(c => c.type === targetType);
        if (targets.length === 0) return null;

        let nearest = targets[0];
        let minDist = this.calculateDistance(sourceComp, nearest);

        targets.forEach(target => {
            const dist = this.calculateDistance(sourceComp, target);
            if (dist < minDist) {
                minDist = dist;
                nearest = target;
            }
        });

        return nearest;
    }

    /**
     * Helper: Calculate interconnect penalties based on component distances
     */
    calculateInterconnectPenalty(die) {
        const components = die.components || [];
        if (components.length === 0) return 0;

        let totalPenalty = 0;
        let penaltyCount = 0;

        components.forEach(comp => {
            const requirements = INTERCONNECT_REQUIREMENTS[comp.type];
            if (!requirements) return;

            Object.keys(requirements).forEach(targetType => {
                const target = this.findNearestComponent(die, comp, targetType);
                if (!target) return;

                const distance = this.calculateDistance(comp, target);
                const req = requirements[targetType];

                // Latency increases with distance (~100ps per mm in silicon)
                const criticalityWeight = {
                    'critical': 1.0,
                    'high': 0.5,
                    'medium': 0.25,
                    'low': 0.1
                }[req.latency] || 0.1;

                // Penalty: 0% at 0mm, 15% at 20mm for critical paths
                const penalty = Math.min(0.15, (distance / 20) * 0.15) * criticalityWeight;
                totalPenalty += penalty;
                penaltyCount++;
            });
        });

        return penaltyCount > 0 ? totalPenalty / penaltyCount : 0;
    }

    /**
     * Helper: Calculate clustering bonus for CPU cores
     */
    calculateClusteringBonus(die) {
        const components = die.components || [];
        const cpuCores = components.filter(c => c.type === 'cpu_core');
        if (cpuCores.length <= 1) return 1.0;

        // Calculate centroid
        const centroid = {
            x: cpuCores.reduce((sum, c) => sum + c.position.x + c.dimensions.width / 2, 0) / cpuCores.length,
            y: cpuCores.reduce((sum, c) => sum + c.position.y + c.dimensions.height / 2, 0) / cpuCores.length
        };

        // Calculate average distance from centroid
        const avgDistance = cpuCores.reduce((sum, core) => {
            const coreCenterX = core.position.x + core.dimensions.width / 2;
            const coreCenterY = core.position.y + core.dimensions.height / 2;
            const dx = coreCenterX - centroid.x;
            const dy = coreCenterY - centroid.y;
            return sum + Math.sqrt(dx * dx + dy * dy);
        }, 0) / cpuCores.length;

        // Bonus: 0% at 15mm avg distance, +10% at 3mm
        const bonus = Math.max(0, 0.10 * (1 - avgDistance / 15));
        return 1.0 + bonus;
    }

    /**
     * Helper: Calculate memory bandwidth bottleneck with area-based scaling
     */
    calculateBandwidthBottleneck(die) {
        const components = die.components || [];
        const memControllers = components.filter(c => c.type === 'mem_ctrl');

        if (memControllers.length === 0) return 0.5; // No memory controller = severe bottleneck

        // Get base bandwidth per controller for this process node
        const nodes = Object.keys(MEMORY_BANDWIDTH_PER_CONTROLLER).map(Number).sort((a, b) => a - b);
        const closestNode = nodes.reduce((prev, curr) => {
            return Math.abs(curr - die.processNode) < Math.abs(prev - die.processNode) ? curr : prev;
        });
        const baseBW = MEMORY_BANDWIDTH_PER_CONTROLLER[closestNode] || 25.6;

        // Get expected controller area for this node
        const expectedArea = EXPECTED_MEM_CTRL_AREA[closestNode] || 1.0;

        // Calculate total bandwidth with size-based scaling
        const totalMemBW = memControllers.reduce((sum, ctrl) => {
            // Use unified size scaling function
            const sizeScaling = this.calculateSizeScaling(ctrl, die.processNode);
            return sum + (baseBW * sizeScaling);
        }, 0);

        // Calculate demand (average workload, not peak)
        const cpuCores = components.filter(c => c.type === 'cpu_core').length;
        const gpuCores = components.filter(c => c.type === 'gpu_sm').length;
        // Realistic: 15 GB/s per CPU core average, 50 GB/s per GPU core
        // Peak would be 30/80, but that's unrealistic for sustained workloads
        const demandBW = (cpuCores * 15) + (gpuCores * 50); // GB/s per core

        // Return ratio (clamped to 1.0 max)
        return Math.min(1.0, totalMemBW / Math.max(1, demandBW));
    }

    /**
     * Helper: Calculate die size penalty/bonus
     */
    calculateDieSizePenalty(die) {
        const area = die.dimensions.width * die.dimensions.height;
        const optimalArea = 200; // mm²

        if (area <= optimalArea) {
            // Small bonus for compact designs
            return 1.0 + (optimalArea - area) / optimalArea * 0.05; // up to 5% bonus
        } else {
            // Penalty for oversized dies
            const excess = area - optimalArea;
            return 1.0 - Math.min(0.20, excess / 1000 * 0.20); // up to 20% penalty
        }
    }

    /**
     * Helper: Calculate utilization efficiency
     */
    calculateUtilizationEfficiency(die) {
        const stats = this.library.calculateDieStats(die);
        const utilization = stats.utilizationPercent / 100;

        if (utilization < 0.50) {
            // Wasted space penalty
            return 0.80 + (utilization * 0.40); // 80% at 0%, 100% at 50%
        } else if (utilization <= 0.85) {
            // Optimal range
            return 1.0;
        } else {
            // Over-packed penalty (power delivery, routing congestion)
            const overpacked = utilization - 0.85;
            return 1.0 - Math.min(0.15, overpacked * 0.75); // up to 15% penalty
        }
    }

    /**
     * Simulate defects on a die with area-based probability
     * Returns which components are hit and whether defects are in blank space
     */
    simulateDefects(die, numSimulations = 1000) {
        const totalArea = die.dimensions.width * die.dimensions.height;
        const components = die.components || [];

        // Calculate component areas
        const componentAreas = components.map(c => ({
            component: c,
            area: c.dimensions.width * c.dimensions.height
        }));

        const totalComponentArea = componentAreas.reduce((sum, c) => sum + c.area, 0);
        const blankArea = totalArea - totalComponentArea;

        // Get defect density
        const processNode = PROCESS_NODES.find(n => n.node === die.processNode) || PROCESS_NODES.find(n => n.node === 7);
        const defectDensity = processNode.baseDefectDensity;
        const areaCm2 = totalArea / 100; // convert mm² to cm²

        // Expected number of defects per die (from Poisson distribution)
        const expectedDefects = defectDensity * areaCm2;

        // Run Monte Carlo simulation
        let perfectDies = 0;
        let binnableDies = 0; // Dies with defects only in blank space
        let failedDies = 0;

        for (let sim = 0; sim < numSimulations; sim++) {
            // Generate number of defects for this die (Poisson approximation)
            // For small lambda, we can use simple sampling
            let numDefects = 0;
            if (expectedDefects < 10) {
                // Use inverse transform sampling for Poisson
                const L = Math.exp(-expectedDefects);
                let p = 1.0;
                let k = 0;
                do {
                    k++;
                    p *= Math.random();
                } while (p > L);
                numDefects = k - 1;
            } else {
                // For larger lambda, use normal approximation
                numDefects = Math.max(0, Math.round(expectedDefects + Math.sqrt(expectedDefects) * this.randn()));
            }

            if (numDefects === 0) {
                perfectDies++;
                continue;
            }

            // Check where each defect lands
            let hitComponent = false;
            for (let d = 0; d < numDefects; d++) {
                const randomArea = Math.random() * totalArea;

                // Check if defect hits blank space
                if (randomArea < blankArea) {
                    // Defect in blank space - doesn't affect functionality
                    continue;
                }

                // Check which component was hit
                let cumulativeArea = blankArea;
                for (const { component, area } of componentAreas) {
                    cumulativeArea += area;
                    if (randomArea < cumulativeArea) {
                        hitComponent = true;
                        break;
                    }
                }

                if (hitComponent) break;
            }

            if (!hitComponent) {
                // All defects hit blank space
                binnableDies++;
            } else {
                // At least one component was hit
                failedDies++;
            }
        }

        return {
            perfectDies,
            binnableDies,
            failedDies,
            totalSimulations: numSimulations,
            perfectYield: perfectDies / numSimulations,
            effectiveYield: (perfectDies + binnableDies) / numSimulations,
            expectedDefects,
            blankAreaPercent: (blankArea / totalArea) * 100
        };
    }

    /**
     * Helper for normal distribution sampling (Box-Muller transform)
     */
    randn() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    /**
     * Get theoretical yield estimate (for wafer planning)
     * Returns expected values without running Monte Carlo simulation
     */
    estimateTheoreticalYield(die) {
        const area = die.dimensions.width * die.dimensions.height;
        const components = die.components || [];
        const processNode = PROCESS_NODES.find(n => n.node === die.processNode) || PROCESS_NODES.find(n => n.node === 7);

        // Calculate component areas
        const totalComponentArea = components.reduce((sum, c) => {
            return sum + (c.dimensions.width * c.dimensions.height);
        }, 0);
        const blankArea = area - totalComponentArea;
        const blankAreaPercent = (blankArea / area) * 100;

        // Expected number of defects per die (Poisson distribution mean)
        const defectDensity = processNode.baseDefectDensity;
        const areaCm2 = area / 100;
        const expectedDefects = defectDensity * areaCm2;

        // Theoretical yield using Murphy's Law with blank space factor
        // Dies with defects in blank space can still be binned
        const blankSpaceAbsorption = blankAreaPercent / 100; // Probability defect hits blank space
        const baseYield = Math.exp(-expectedDefects);
        const effectiveYield = baseYield + (1 - baseYield) * blankSpaceAbsorption * 0.5; // 50% of blank-hit defects salvageable

        return {
            yieldPercent: (effectiveYield * 100).toFixed(1),
            yieldNumeric: effectiveYield,
            costMultiplier: 1 / Math.max(0.3, effectiveYield),
            perfectYield: (baseYield * 100).toFixed(1),
            binnableYield: ((effectiveYield - baseYield) * 100).toFixed(1),
            expectedDefects: expectedDefects.toFixed(2),
            blankAreaPercent: blankAreaPercent.toFixed(1)
        };
    }

    /**
     * Helper: Estimate manufacturing yield using realistic defect simulation
     * THIS IS FOR FABRICATION PHASE - runs actual Monte Carlo simulation
     */
    estimateYield(die) {
        const area = die.dimensions.width * die.dimensions.height;
        const processNode = PROCESS_NODES.find(n => n.node === die.processNode) || PROCESS_NODES.find(n => n.node === 7);

        // Run defect simulation (for die designer display)
        const defectSim = this.simulateDefects(die, 1000);

        // Use effective yield (includes dies with defects only in blank space)
        const yieldNumeric = defectSim.effectiveYield;

        return {
            yieldPercent: (yieldNumeric * 100).toFixed(1),
            yieldNumeric: yieldNumeric,
            costMultiplier: 1 / Math.max(0.3, yieldNumeric),
            // Additional details from simulation
            perfectYield: (defectSim.perfectYield * 100).toFixed(1),
            binnableYield: (defectSim.binnableDies / defectSim.totalSimulations * 100).toFixed(1),
            expectedDefects: defectSim.expectedDefects.toFixed(2),
            blankAreaPercent: defectSim.blankAreaPercent.toFixed(1)
        };
    }

    /**
     * Helper: Calculate realistic power consumption
     */
    calculatePower(die, baseClockGHz, totalTransistorsMillion) {
        // Get voltage for this node
        const nodes = Object.keys(NODE_VOLTAGE).map(Number).sort((a, b) => a - b);
        const closestNode = nodes.reduce((prev, curr) => {
            return Math.abs(curr - die.processNode) < Math.abs(prev - die.processNode) ? curr : prev;
        });
        const voltage = NODE_VOLTAGE[closestNode] || 0.75;

        // Get leakage for this node
        const leakagePerMT = LEAKAGE_PER_M_TRANSISTORS[closestNode] || 2.2;

        const components = die.components || [];
        let totalDynamicPower = 0;

        // Calculate power per component type (different activity factors)
        components.forEach(comp => {
            const area = comp.dimensions.width * comp.dimensions.height;
            const density = TRANSISTOR_DENSITY[die.processNode] || 60.1;
            const multiplier = COMPONENT_DENSITY_MULTIPLIERS[comp.type] || 1.0;
            const transistorsMillion = area * density * multiplier;

            // Activity factor varies by component type
            const activityFactors = {
                'cpu_core': 0.30,        // 30% of transistors switching per cycle
                'gpu_sm': 0.40,          // GPUs have higher utilization
                'l2_cache': 0.15,        // Cache has lower activity
                'l3_cache': 0.10,        // L3 even less active
                'mem_ctrl': 0.25,        // Memory controllers moderate
                'interconnect': 0.20,    // Interconnect moderate
                'power_mgmt': 0.10,      // Power management low activity
                'io_ctrl': 0.15,         // I/O moderate
                'igpu': 0.35,            // Integrated GPU high activity
                'texture_unit': 0.35,    // Texture units high activity
                'display_engine': 0.20,  // Display moderate
                'control_logic': 0.25,   // Control logic moderate
                'npu': 0.45              // NPUs very high utilization
            };

            const activityFactor = activityFactors[comp.type] || 0.25;

            // Dynamic power: C * V² * f * α (Capacitance * Voltage² * Frequency * Activity)
            // Base: ~10W per billion transistors at 1GHz at 0.75V with 100% activity
            // Modern nodes have lower capacitance per transistor due to smaller features
            const basePowerPerBTransistor = 10.0; // At 100% activity (reduced from 15W → 12W → 10W)
            const voltageScaling = (voltage / 0.75) ** 2;
            const frequencyScaling = baseClockGHz;

            const compDynamicPower = (transistorsMillion / 1000) * basePowerPerBTransistor *
                                    voltageScaling * frequencyScaling * activityFactor;

            totalDynamicPower += compDynamicPower;
        });

        // Static power (leakage) - affects all transistors regardless of activity
        const leakagePower = totalTransistorsMillion * leakagePerMT;

        const totalTDP = totalDynamicPower + leakagePower;

        return {
            dynamicPower: totalDynamicPower,
            leakagePower,
            totalTDP,
            voltage
        };
    }

    /**
     * Helper: Check thermal limits and calculate throttling
     */
    checkThermalLimits(die, tdp) {
        const area = die.dimensions.width * die.dimensions.height;
        const powerDensity = tdp / area; // W/mm²

        // Use consumer CPU limits by default
        const maxDensity = THERMAL_LIMITS.consumer_cpu;

        if (powerDensity > maxDensity) {
            // Need to throttle clocks
            const throttleRatio = maxDensity / powerDensity;
            return {
                overheated: true,
                throttleRatio,
                powerDensity,
                maxDensity,
                warning: `Power density ${powerDensity.toFixed(2)} W/mm² exceeds ${maxDensity.toFixed(2)} W/mm² limit`
            };
        }

        return {
            overheated: false,
            throttleRatio: 1.0,
            powerDensity,
            maxDensity
        };
    }

    /**
     * Helper: Classify chip into CLASS (performance tier) and GRADE (market segment)
     */
    classifyChip(die, perf) {
        const components = die.components || [];

        // Count key components
        const cpuCores = components.filter(c => c.type === 'cpu_core').length;
        const gpuCores = components.filter(c => c.type === 'gpu_sm').length;
        const memControllers = components.filter(c => c.type === 'mem_ctrl').length;
        const l3Cache = components.filter(c => c.type === 'l3_cache');
        const powerMgmt = components.filter(c => c.type === 'power_mgmt');
        const igpu = components.filter(c => c.type === 'igpu').length;

        // Calculate component areas for ratios
        const totalArea = die.dimensions.width * die.dimensions.height;
        const l3TotalArea = l3Cache.reduce((sum, c) => sum + (c.dimensions.width * c.dimensions.height), 0);
        const powerMgmtArea = powerMgmt.reduce((sum, c) => sum + (c.dimensions.width * c.dimensions.height), 0);

        // Calculate key ratios
        const coresPerController = memControllers > 0 ? cpuCores / memControllers : 0;
        const l3PerCore = cpuCores > 0 ? l3TotalArea / cpuCores : 0;
        const powerMgmtRatio = totalArea > 0 ? powerMgmtArea / totalArea : 0;
        const maxClockRatio = perf?.clockGHz && perf?.maxClock ? perf.clockGHz / perf.maxClock : 1.0;

        // Determine CLASS (performance tier based on cores + TDP)
        // Use scoring system to find best-fit classification
        const tdp = perf?.tdp || 0;
        const criteria = CHIP_CLASSIFICATION_CRITERIA.class;

        let bestClass = 'Budget';
        let bestScore = -Infinity;

        for (const [className, limits] of Object.entries(criteria)) {
            const [minCores, maxCores] = limits.cores;
            const [minTDP, maxTDP] = limits.tdp;

            // Calculate how well this chip fits each category
            let score = 0;

            // Core count scoring (weighted 2x - more important than TDP)
            if (cpuCores >= minCores && cpuCores <= maxCores) {
                // Perfect fit: chip is within range
                const coreRange = maxCores - minCores;
                const corePosition = (cpuCores - minCores) / coreRange;
                score += 100; // Base score for being in range (doubled from 50)
                // Bonus for being in middle of range (more typical)
                score += (1.0 - Math.abs(corePosition - 0.5) * 2) * 50; // Doubled from 25
            } else if (cpuCores > maxCores) {
                // Exceeds range - strongly prefer higher tier
                // Don't give partial credit, give strong penalty
                const overage = (cpuCores - maxCores) / maxCores;
                score -= overage * 50; // Changed to penalty
            } else {
                // Below range - strong penalty
                const underage = (minCores - cpuCores) / Math.max(minCores, 1);
                score -= underage * 60; // Increased penalty
            }

            // TDP scoring (secondary factor)
            if (tdp >= minTDP && tdp <= maxTDP) {
                // Perfect fit: chip is within range
                const tdpRange = maxTDP - minTDP;
                const tdpPosition = (tdp - minTDP) / tdpRange;
                score += 50; // Base score for being in range
                // Bonus for being in middle of range
                score += (1.0 - Math.abs(tdpPosition - 0.5) * 2) * 25;
            } else if (tdp > maxTDP) {
                // Exceeds range - slight penalty
                const overage = (tdp - maxTDP) / maxTDP;
                score += 20 - (overage * 15);
            } else {
                // Below range - small penalty (low power is often good)
                const underage = (minTDP - tdp) / Math.max(minTDP, 1);
                score -= underage * 20; // Reduced penalty
            }

            // Track best fit
            if (score > bestScore) {
                bestScore = score;
                bestClass = className;
            }
        }

        const chipClass = bestClass;

        // Determine GRADE (market segment based on component ratios)
        let chipGrade = 'Consumer';

        // Check Military grade first (most specific criteria)
        const militaryReqs = CHIP_CLASSIFICATION_CRITERIA.grade.Military;
        if (die.processNode >= militaryReqs.minProcessNode &&
            powerMgmtRatio >= militaryReqs.powerMgmtRatio[0] &&
            powerMgmtRatio <= militaryReqs.powerMgmtRatio[1] &&
            maxClockRatio <= militaryReqs.maxClockRatio) {
            chipGrade = 'Military/Aerospace';
        }
        // Check Enterprise grade
        else if (coresPerController >= CHIP_CLASSIFICATION_CRITERIA.grade.Enterprise.coresPerController[0] &&
                 coresPerController <= CHIP_CLASSIFICATION_CRITERIA.grade.Enterprise.coresPerController[1] &&
                 l3PerCore >= CHIP_CLASSIFICATION_CRITERIA.grade.Enterprise.l3PerCore[0]) {
            chipGrade = 'Enterprise/Server';
        }
        // Check Workstation grade (has both iGPU and discrete GPU cores)
        else if (igpu > 0 && gpuCores > 0) {
            chipGrade = 'Workstation';
        }
        // Default to Consumer
        else {
            chipGrade = 'Consumer';
        }

        return {
            class: chipClass,
            grade: chipGrade,
            metrics: {
                coresPerController: coresPerController.toFixed(2),
                l3PerCore: l3PerCore.toFixed(2),
                powerMgmtRatio: (powerMgmtRatio * 100).toFixed(2),
                maxClockRatio: (maxClockRatio * 100).toFixed(1)
            }
        };
    }

    /**
     * Calculate comprehensive performance metrics for the die
     */
    calculatePerformance(die) {
        const processNodeData = PROCESS_NODES.find(n => n.node === die.processNode) || PROCESS_NODES.find(n => n.node === 7);
        const components = die.components || [];

        // Count cores
        const cpuCores = components.filter(c => c.type === 'cpu_core').length;
        const gpuCores = components.filter(c => c.type === 'gpu_sm').length;

        // Calculate total transistors using realistic component counts
        const totalTransistors = this.calculateTotalTransistors(die);

        // Get realistic transistor density
        const transistorDensity = TRANSISTOR_DENSITY[die.processNode] || 138.0;

        // Get maximum clock for this node
        const maxClock = MAX_CLOCK_BY_NODE[die.processNode] || 5.0;

        // Apply penalties for core count (power delivery, thermal spreading)
        // Modern CPUs handle multi-core much better with improved power delivery
        // Penalty is logarithmic, not linear
        const coreCountPenalty = cpuCores > 0 ? Math.max(0.90, 1.0 - (Math.log2(cpuCores) * 0.02)) : 1.0;

        // CPU core SIZE affects clock speed
        // Larger cores can clock higher (more complex pipelines, better power delivery)
        // Smaller cores clock lower (simpler, efficiency-focused)
        const cpuCoreComponents = components.filter(c => c.type === 'cpu_core');
        let avgCoreSizeScaling = 1.0;
        if (cpuCoreComponents.length > 0) {
            const totalScaling = cpuCoreComponents.reduce((sum, core) => {
                return sum + this.calculateSizeScaling(core, die.processNode);
            }, 0);
            avgCoreSizeScaling = totalScaling / cpuCoreComponents.length;
        }
        // Convert scaling to clock bonus/penalty (0.6x size = 0.95x clock, 1.5x size = 1.05x clock)
        const coreClockScaling = 0.90 + (avgCoreSizeScaling - 1.0) * 0.1;

        // Layout efficiency affects achievable clocks
        // Better interconnect layout = higher clocks
        const interconnectQuality = this.calculateInterconnectPenalty(die);
        const layoutClockBonus = Math.max(0.85, 1.0 - (interconnectQuality * 0.15));

        // Calculate base clock with all factors
        // Well-designed chips can reach 90-95% of max, poorly designed 85-90%
        let baseClockGHz = maxClock * 0.90 * coreCountPenalty * layoutClockBonus * coreClockScaling;

        // Calculate power
        let powerMetrics = this.calculatePower(die, baseClockGHz, totalTransistors);
        let tdp = powerMetrics.totalTDP;

        // Check thermal limits and throttle if needed
        const thermalCheck = this.checkThermalLimits(die, tdp);
        if (thermalCheck.overheated) {
            baseClockGHz *= thermalCheck.throttleRatio;
            tdp *= thermalCheck.throttleRatio;
            // Recalculate power metrics with throttled clock
            powerMetrics = this.calculatePower(die, baseClockGHz, totalTransistors);
        }

        const boostClockGHz = Math.min(maxClock, baseClockGHz * 1.15); // Boost is 15% higher

        // Calculate IPC
        const ipc = this.calculateIPC(die);

        // Calculate layout efficiency factors
        const interconnectPenalty = this.calculateInterconnectPenalty(die);
        const clusteringBonus = this.calculateClusteringBonus(die);
        const bandwidthRatio = this.calculateBandwidthBottleneck(die);
        const dieSizeFactor = this.calculateDieSizePenalty(die);
        const utilizationFactor = this.calculateUtilizationEfficiency(die);

        // Overall layout efficiency (0.0 - 1.1)
        const layoutEfficiency = (1.0 - interconnectPenalty) * clusteringBonus;

        // Calculate performance score
        // Single-thread performance
        const singleThreadPerf = baseClockGHz * ipc * 1000; // Arbitrary units

        // Multi-thread with Amdahl's law (diminishing returns)
        const parallelEfficiency = cpuCores > 0 ? (cpuCores - (cpuCores * 0.05)) / cpuCores : 0;
        const multiThreadPerf = singleThreadPerf * cpuCores * parallelEfficiency;

        // GPU performance
        const gpuPerf = gpuCores * baseClockGHz * 1500; // GPUs scale better

        // Apply all efficiency factors
        const performanceScore = Math.round(
            (multiThreadPerf + gpuPerf) *
            layoutEfficiency *
            bandwidthRatio *
            dieSizeFactor *
            utilizationFactor
        );

        // Calculate yield
        const yieldData = this.estimateYield(die);

        // Calculate final power density after throttling
        const area = die.dimensions.width * die.dimensions.height;
        const finalPowerDensity = tdp / area;

        // Prepare performance data for classification
        const perfForClassification = {
            clockGHz: baseClockGHz,
            maxClock: maxClock,
            tdp: tdp
        };

        // Classify chip into CLASS and GRADE
        const classification = this.classifyChip(die, perfForClassification);

        return {
            // Basic info
            processNode: processNodeData.label,
            processYear: processNodeData.year,

            // Transistors
            transistorDensity: transistorDensity.toFixed(1),
            totalTransistors: totalTransistors.toFixed(1),

            // Clocks
            baseClockGHz: baseClockGHz.toFixed(2),
            boostClockGHz: boostClockGHz.toFixed(2),
            maxClockGHz: maxClock.toFixed(2),

            // Power
            tdp: Math.round(tdp),
            powerDensity: finalPowerDensity.toFixed(2),
            voltage: powerMetrics.voltage.toFixed(2),
            dynamicPower: Math.round(powerMetrics.dynamicPower),
            leakagePower: Math.round(powerMetrics.leakagePower),

            // Performance
            performanceScore,
            ipc: ipc.toFixed(2),
            singleThreadPerf: Math.round(singleThreadPerf),

            // Efficiency factors
            layoutEfficiency: (layoutEfficiency * 100).toFixed(1),
            interconnectPenalty: (interconnectPenalty * 100).toFixed(1),
            clusteringBonus: ((clusteringBonus - 1.0) * 100).toFixed(1),
            bandwidthRatio: (bandwidthRatio * 100).toFixed(1),
            dieSizeFactor: (dieSizeFactor * 100).toFixed(1),
            utilizationFactor: (utilizationFactor * 100).toFixed(1),

            // Manufacturing
            yieldPercent: yieldData.yieldPercent,
            costMultiplier: yieldData.costMultiplier.toFixed(2),

            // Classification
            chipClass: classification.class,
            chipGrade: classification.grade,
            classificationMetrics: classification.metrics,

            // Warnings
            thermalWarning: thermalCheck.overheated ? thermalCheck.warning : null,
            memoryBottleneck: bandwidthRatio < 0.8,

            // Counts
            cpuCores,
            gpuCores
        };
    }

    /**
     * Show die properties in panel
     */
    showDieProperties() {
        const panel = document.getElementById('properties-content');
        const stats = this.library.calculateDieStats(this.currentDie);

        // Get performance metrics
        const perf = this.calculatePerformance(this.currentDie);

        // Get requirements for this die type
        const requirements = DIE_REQUIREMENTS[this.currentDie.type];
        let requirementsHTML = '';

        if (requirements && requirements.required.length > 0) {
            // Check which requirements are met
            const requirementChecks = requirements.required.map(req => {
                const count = (this.currentDie.components || []).filter(c => c.type === req.type).length;
                const isMet = count >= req.minCount;
                const icon = isMet ? '✓' : '✗';
                const color = isMet ? 'var(--teal-light)' : 'var(--magenta-primary)';
                return `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${color}; font-weight: bold;">${icon}</span>
                        <span>${req.label}</span>
                        <span style="margin-left: auto; color: var(--teal-light);">${count}/${req.minCount}</span>
                    </div>
                `;
            }).join('');

            requirementsHTML = `
                <div style="margin-bottom: 20px;">
                    <h5 style="color: var(--gold); margin-bottom: 10px;">REQUIREMENTS</h5>
                    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem;">
                        ${requirementChecks}
                    </div>
                </div>
            `;
        }

        panel.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">DIE INFO</h5>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                    <div><span style="color: var(--teal-light);">SKU:</span> ${this.currentDie.sku}</div>
                    <div><span style="color: var(--teal-light);">Type:</span> ${DIE_TYPES[this.currentDie.type.toUpperCase()]?.label || this.currentDie.type}</div>
                    <div><span style="color: var(--teal-light);">Dimensions:</span> ${this.currentDie.dimensions.width} × ${this.currentDie.dimensions.height} mm</div>
                    <div><span style="color: var(--teal-light);">Area:</span> ${stats.area.toFixed(1)} mm²</div>
                    <div><span style="color: var(--teal-light);">Components:</span> ${stats.componentCount}</div>
                    <div><span style="color: var(--teal-light);">Utilization:</span> ${stats.utilizationPercent.toFixed(1)}%</div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">PERFORMANCE</h5>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                    <div><span style="color: var(--teal-light);">Process Node:</span> ${perf.processNode} (${perf.processYear})</div>
                    <div><span style="color: var(--teal-light);">Transistors:</span> ${perf.totalTransistors}M (${perf.transistorDensity}M/mm²)</div>
                    <div><span style="color: var(--teal-light);">Base / Boost Clock:</span> ${perf.baseClockGHz} / ${perf.boostClockGHz} GHz</div>
                    <div><span style="color: var(--teal-light);">IPC:</span> ${perf.ipc}</div>
                    <div><span style="color: var(--teal-light);">Performance Score:</span> <strong>${perf.performanceScore}</strong></div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">CLASSIFICATION</h5>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                    <div><span style="color: var(--teal-light);">Class:</span> <strong style="color: var(--magenta-primary);">${perf.chipClass}</strong></div>
                    <div><span style="color: var(--teal-light);">Grade:</span> <strong style="color: var(--magenta-primary);">${perf.chipGrade}</strong></div>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0, 206, 209, 0.3);">
                        <div style="font-size: 0.75rem; color: var(--cream); margin-bottom: 4px;">Classification Metrics:</div>
                        <div style="font-size: 0.8rem; padding-left: 10px;">
                            <div>Cores/Controller: ${perf.classificationMetrics.coresPerController}</div>
                            <div>L3 per Core: ${perf.classificationMetrics.l3PerCore} mm²</div>
                            <div>Power Mgmt: ${perf.classificationMetrics.powerMgmtRatio}%</div>
                            <div>Clock Ratio: ${perf.classificationMetrics.maxClockRatio}%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">POWER & THERMAL</h5>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                    <div><span style="color: var(--teal-light);">TDP:</span> ${perf.tdp}W (${perf.dynamicPower}W dynamic + ${perf.leakagePower}W leakage)</div>
                    <div><span style="color: var(--teal-light);">Power Density:</span> ${perf.powerDensity} W/mm² ${perf.thermalWarning ? '<span style="color: var(--magenta-primary);">⚠️ THROTTLED</span>' : '✓'}</div>
                    <div><span style="color: var(--teal-light);">Voltage:</span> ${perf.voltage}V</div>
                    ${perf.thermalWarning ? `<div style="color: var(--magenta-primary); font-size: 0.8rem;">⚠️ ${perf.thermalWarning}</div>` : ''}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">EFFICIENCY FACTORS</h5>
                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Layout Efficiency:</span>
                        <span style="color: ${perf.layoutEfficiency >= 95 ? 'var(--teal-light)' : perf.layoutEfficiency >= 85 ? 'var(--gold)' : 'var(--magenta-primary)'};">${perf.layoutEfficiency}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-left: 15px; font-size: 0.8rem;">
                        <span>Interconnect Penalty:</span>
                        <span style="color: ${perf.interconnectPenalty <= 5 ? 'var(--teal-light)' : 'var(--magenta-primary)'};">-${perf.interconnectPenalty}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-left: 15px; font-size: 0.8rem;">
                        <span>Core Clustering:</span>
                        <span style="color: ${perf.clusteringBonus > 0 ? 'var(--teal-light)' : 'var(--cream)'};">+${perf.clusteringBonus}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Memory Bandwidth:</span>
                        <span style="color: ${perf.bandwidthRatio >= 80 ? 'var(--teal-light)' : 'var(--magenta-primary)'};">${perf.bandwidthRatio}% ${perf.memoryBottleneck ? '⚠️' : '✓'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Die Size Factor:</span>
                        <span style="color: ${perf.dieSizeFactor >= 100 ? 'var(--teal-light)' : perf.dieSizeFactor >= 95 ? 'var(--gold)' : 'var(--magenta-primary)'};">${perf.dieSizeFactor}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Utilization Factor:</span>
                        <span style="color: ${perf.utilizationFactor >= 95 ? 'var(--teal-light)' : 'var(--gold)'};">${perf.utilizationFactor}%</span>
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">MANUFACTURING</h5>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                    <div><span style="color: var(--teal-light);">Effective Yield:</span> <span style="color: ${parseFloat(perf.yieldPercent) >= 70 ? 'var(--teal-light)' : parseFloat(perf.yieldPercent) >= 50 ? 'var(--gold)' : 'var(--magenta-primary)'};">${perf.yieldPercent}%</span></div>
                    <div style="margin-left: 15px; font-size: 0.8rem;">
                        <div><span style="color: var(--teal-light);">Perfect:</span> ${perf.perfectYield}%</div>
                        <div><span style="color: var(--teal-light);">Binnable:</span> ${perf.binnableYield}%</div>
                    </div>
                    <div><span style="color: var(--teal-light);">Expected Defects/Die:</span> ${perf.expectedDefects}</div>
                    <div><span style="color: var(--teal-light);">Blank Space:</span> ${perf.blankAreaPercent}%</div>
                    <div><span style="color: var(--teal-light);">Cost Multiplier:</span> ${perf.costMultiplier}x</div>
                </div>
            </div>
            ${requirementsHTML}
            <div style="padding: 10px; background: rgba(255, 0, 255, 0.1); border-left: 3px solid var(--magenta-primary); font-size: 0.85rem;">
                Click a component on the canvas to view/edit its properties
            </div>
        `;
    }

    /**
     * Show component properties in panel
     */
    showComponentProperties(component) {
        const panel = document.getElementById('properties-content');
        const compType = COMPONENT_TYPES[component.type];

        // Calculate size scaling information
        const sizeScaling = this.calculateSizeScaling(component, this.currentDie.processNode);
        const defaultSize = this.designer.getDefaultComponentSize(component.type);
        const actualArea = component.dimensions.width * component.dimensions.height;
        const defaultArea = defaultSize.width * defaultSize.height;
        const sizeRatio = actualArea / defaultArea;

        // Format scaling percentage
        const scalingPercent = ((sizeScaling - 1.0) * 100).toFixed(1);
        const scalingSign = sizeScaling >= 1.0 ? '+' : '';
        const scalingColor = sizeScaling >= 1.0 ? 'var(--teal-light)' : 'var(--magenta-primary)';

        // Format size ratio
        const ratioPercent = ((sizeRatio - 1.0) * 100).toFixed(1);
        const ratioSign = sizeRatio >= 1.0 ? '+' : '';
        const ratioColor = sizeRatio >= 1.0 ? 'var(--teal-light)' : 'var(--gold)';

        panel.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">COMPONENT</h5>
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem;">
                    <div>
                        <label style="color: var(--teal-light); display: block; margin-bottom: 5px;">Name</label>
                        <input type="text" value="${component.name}" class="art-deco-input" style="width: 100%; padding: 8px;" id="comp-name">
                    </div>
                    <div>
                        <label style="color: var(--teal-light); display: block; margin-bottom: 5px;">Type</label>
                        <input type="text" value="${compType?.label || 'Standard'}" class="art-deco-input" style="width: 100%; padding: 8px;" disabled>
                    </div>
                    <div>
                        <label style="color: var(--teal-light); display: block; margin-bottom: 5px;">Width (mm)</label>
                        <input type="number" value="${component.dimensions.width}" class="art-deco-input" style="width: 100%; padding: 8px;" step="0.1" min="0.1" id="comp-width">
                    </div>
                    <div>
                        <label style="color: var(--teal-light); display: block; margin-bottom: 5px;">Height (mm)</label>
                        <input type="number" value="${component.dimensions.height}" class="art-deco-input" style="width: 100%; padding: 8px;" step="0.1" min="0.1" id="comp-height">
                    </div>
                    <div>
                        <span style="color: var(--teal-light);">Area:</span> ${actualArea.toFixed(2)} mm²
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--gold); margin-bottom: 10px;">SIZE SCALING</h5>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Default Size:</span>
                        <span>${defaultSize.width} × ${defaultSize.height} mm (${defaultArea.toFixed(1)} mm²)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Size vs Default:</span>
                        <span style="color: ${ratioColor}; font-weight: bold;">${sizeRatio.toFixed(2)}x (${ratioSign}${ratioPercent}%)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--teal-light);">Performance Scaling:</span>
                        <span style="color: ${scalingColor}; font-weight: bold;">${sizeScaling.toFixed(2)}x (${scalingSign}${scalingPercent}%)</span>
                    </div>
                    <div style="padding: 8px; background: rgba(0, 206, 209, 0.1); border-left: 3px solid var(--teal-primary); font-size: 0.75rem; line-height: 1.4;">
                        ${sizeRatio > 1.0 ?
                            `Larger than standard: ${sizeRatio >= 1.5 ? 'High' : 'Moderate'} performance boost, uses more die space.` :
                            sizeRatio < 1.0 ?
                            `Smaller than standard: Reduced performance, saves die space.` :
                            `Standard size: Baseline performance for this process node.`
                        }
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <button id="update-component" class="art-deco-button primary" style="width: 100%;">UPDATE</button>
                <button id="delete-component" class="art-deco-button secondary" style="margin-top: 10px; width: 100%;">DELETE</button>
            </div>
        `;

        // Update component button
        document.getElementById('update-component').onclick = () => {
            const newName = document.getElementById('comp-name').value;
            const newWidth = parseFloat(document.getElementById('comp-width').value);
            const newHeight = parseFloat(document.getElementById('comp-height').value);

            // Validate dimensions
            if (isNaN(newWidth) || newWidth < 0.1) {
                alert('Width must be at least 0.1mm');
                return;
            }
            if (isNaN(newHeight) || newHeight < 0.1) {
                alert('Height must be at least 0.1mm');
                return;
            }

            // Check if component would fit on die with new dimensions
            const maxX = component.position.x + newWidth;
            const maxY = component.position.y + newHeight;
            if (maxX > this.currentDie.dimensions.width || maxY > this.currentDie.dimensions.height) {
                alert(`Component would extend beyond die bounds (${this.currentDie.dimensions.width} × ${this.currentDie.dimensions.height} mm)`);
                return;
            }

            // Update component
            component.name = newName;
            component.dimensions.width = newWidth;
            component.dimensions.height = newHeight;

            this.designer.render(true); // Preserve view when updating
            this.showComponentProperties(component);
        };

        // Delete component button
        document.getElementById('delete-component').onclick = () => {
            this.designer.removeSelectedComponent();
            this.showDieProperties();
        };
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ArchitectureApp();
    });
} else {
    new ArchitectureApp();
}
