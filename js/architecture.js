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
     * Update zoom display
     */
    updateZoomDisplay() {
        const zoomPercent = Math.round(this.designer.zoomLevel * 100);
        document.querySelector('.zoom-level').textContent = `${zoomPercent}%`;
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
     * Helper: Calculate IPC (Instructions Per Cycle) based on architecture
     */
    calculateIPC(die) {
        const components = die.components || [];
        let baseIPC = 4.0; // Modern out-of-order CPU baseline

        // Cache sizes improve IPC via lower miss rates
        const l2Cache = components.filter(c => c.type === 'l2_cache');
        const l3Cache = components.filter(c => c.type === 'l3_cache');

        const l2Area = l2Cache.reduce((sum, c) => sum + (c.dimensions.width * c.dimensions.height), 0);
        const l3Area = l3Cache.reduce((sum, c) => sum + (c.dimensions.width * c.dimensions.height), 0);

        // More cache = better IPC (up to a point)
        const l2Bonus = Math.min(0.5, l2Area / 10 * 0.1); // +0.1 IPC per 10mm² L2
        const l3Bonus = Math.min(0.3, l3Area / 50 * 0.1); // +0.1 IPC per 50mm² L3

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

        // Calculate total bandwidth with area-based scaling
        const totalMemBW = memControllers.reduce((sum, ctrl) => {
            const actualArea = ctrl.dimensions.width * ctrl.dimensions.height;
            const areaRatio = actualArea / expectedArea;

            let bandwidthMultiplier;
            if (areaRatio < 1.0) {
                // Penalty for undersized controllers (budget chips)
                // 0.5x area = 0.75x bandwidth (25% penalty)
                bandwidthMultiplier = 0.5 + (areaRatio * 0.5);
            } else {
                // Bonus for oversized controllers (high-end chips)
                // Square root scaling with diminishing returns
                // 2x area = 1.25x bandwidth, 4x area = 1.43x bandwidth
                bandwidthMultiplier = 1.0 + (Math.sqrt(areaRatio - 1.0) * 0.25);
            }

            return sum + (baseBW * bandwidthMultiplier);
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
     * Helper: Estimate manufacturing yield
     */
    estimateYield(die) {
        const area = die.dimensions.width * die.dimensions.height;
        const processNode = PROCESS_NODES.find(n => n.node === die.processNode) || PROCESS_NODES.find(n => n.node === 7);

        // Murphy's Law: Y = e^(-D × A)
        // D = defect density (defects/cm²)
        // A = die area (cm²)
        const defectDensity = processNode.baseDefectDensity;
        const areaCm2 = area / 100; // convert mm² to cm²
        const yieldNumeric = Math.exp(-defectDensity * areaCm2);

        return {
            yieldPercent: (yieldNumeric * 100).toFixed(1),
            yieldNumeric: yieldNumeric,
            costMultiplier: 1 / Math.max(0.3, yieldNumeric)
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

        // Simplified but realistic dynamic power calculation
        // Based on empirical data: ~10-20 watts per billion transistors at 1GHz at 7nm
        // Scales with V² and frequency
        const basePowerPerBTransistor = 15; // Watts per billion transistors at 1GHz, 0.75V
        const voltageScaling = (voltage / 0.75) ** 2; // Quadratic with voltage
        const frequencyScaling = baseClockGHz; // Linear with frequency

        const dynamicPower = (totalTransistorsMillion / 1000) * basePowerPerBTransistor * voltageScaling * frequencyScaling;

        // Static power (leakage)
        const leakagePower = totalTransistorsMillion * leakagePerMT;

        const totalTDP = dynamicPower + leakagePower;

        return {
            dynamicPower,
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
        let chipClass = 'Budget';
        const tdp = perf?.tdp || 0;
        const criteria = CHIP_CLASSIFICATION_CRITERIA.class;

        for (const [className, limits] of Object.entries(criteria)) {
            const [minCores, maxCores] = limits.cores;
            const [minTDP, maxTDP] = limits.tdp;

            if ((cpuCores >= minCores && cpuCores <= maxCores) ||
                (tdp >= minTDP && tdp <= maxTDP)) {
                chipClass = className;
                break;
            }
        }

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

        // Apply penalties for core count (thermal limits)
        const coreCountPenalty = Math.max(0.7, 1.0 - (cpuCores * 0.03)); // -3% per core after first

        // Calculate base clock after penalties
        let baseClockGHz = maxClock * 0.85 * coreCountPenalty; // Base is 85% of max

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
                    <div><span style="color: var(--teal-light);">Est. Yield:</span> <span style="color: ${parseFloat(perf.yieldPercent) >= 70 ? 'var(--teal-light)' : parseFloat(perf.yieldPercent) >= 50 ? 'var(--gold)' : 'var(--magenta-primary)'};">${perf.yieldPercent}%</span></div>
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
                        <input type="number" value="${component.dimensions.width}" class="art-deco-input" style="width: 100%; padding: 8px;" step="0.1" id="comp-width">
                    </div>
                    <div>
                        <label style="color: var(--teal-light); display: block; margin-bottom: 5px;">Height (mm)</label>
                        <input type="number" value="${component.dimensions.height}" class="art-deco-input" style="width: 100%; padding: 8px;" step="0.1" id="comp-height">
                    </div>
                    <div>
                        <span style="color: var(--teal-light);">Area:</span> ${(component.dimensions.width * component.dimensions.height).toFixed(2)} mm²
                    </div>
                </div>
                <button id="update-component" class="art-deco-button primary" style="margin-top: 15px; width: 100%;">UPDATE</button>
                <button id="delete-component" class="art-deco-button secondary" style="margin-top: 10px; width: 100%;">DELETE</button>
            </div>
        `;

        // Update component button
        document.getElementById('update-component').onclick = () => {
            component.name = document.getElementById('comp-name').value;
            component.dimensions.width = parseFloat(document.getElementById('comp-width').value);
            component.dimensions.height = parseFloat(document.getElementById('comp-height').value);
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
