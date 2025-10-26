// Silicon Tycoon - Die Designer Canvas (PixiJS)

import { COMPONENT_TYPES } from './dieLibrary.js';

/**
 * Get theme colors from CSS variables
 */
function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const tealPrimary = styles.getPropertyValue('--teal-primary').trim();
    const magentaPrimary = styles.getPropertyValue('--magenta-primary').trim();

    // Convert CSS color to hex number for PixiJS
    const cssToHex = (cssColor) => {
        if (cssColor.startsWith('#')) {
            return parseInt(cssColor.slice(1), 16);
        }
        // Handle named colors or rgb()
        const temp = document.createElement('div');
        temp.style.color = cssColor;
        document.body.appendChild(temp);
        const computed = getComputedStyle(temp).color;
        document.body.removeChild(temp);

        const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return (parseInt(match[1]) << 16) | (parseInt(match[2]) << 8) | parseInt(match[3]);
        }
        return 0x808080; // Grey fallback
    };

    return {
        tealPrimary: cssToHex(tealPrimary),
        magentaPrimary: cssToHex(magentaPrimary)
    };
}

export class DieDesigner {
    constructor(containerElement) {
        console.log('[DieDesigner] Initializing with component drag support');
        this.container = containerElement;
        this.themeColors = getThemeColors();
        this.app = null;
        this.viewport = null;
        this.gridGraphics = null;
        this.dieOutline = null;
        this.componentsContainer = null;

        this.currentDie = null;
        this.selectedComponent = null;
        this.selectedComponents = []; // For multi-select
        this.isDraggingComponent = false;
        this.componentDragStart = null;
        this.isResizingComponent = false;
        this.resizeHandle = null; // 'se', 'sw', 'ne', 'nw'
        this.resizeStart = null;

        // Zoom and pan
        this.zoomLevel = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 5.0;

        // Tool modes
        this.currentTool = 'select'; // 'select', 'pan', 'draw', or 'copy'
        this.selectedComponentType = null; // For draw mode

        // Draw mode state
        this.isDrawing = false;
        this.drawStartPos = null;
        this.drawPreview = null;

        // Copy mode state
        this.copiedComponent = null; // Component to copy
        this.copyPreview = null; // Preview graphic for copy placement

        // Grid settings
        this.gridSize = 0.5; // 0.5mm grid (finer granularity)
        this.pixelsPerMm = 30; // Scale factor (increased from 20 for crisper rendering)

        // Listen for theme changes
        window.addEventListener('themeChanged', () => {
            console.log('[DieDesigner] Theme changed, refreshing colors');
            this.refreshThemeColors();
        });

        this.init();
    }

    init() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        // Create PixiJS app
        this.app = new PIXI.Application({
            width: width,
            height: height,
            backgroundColor: 0x0d0d0d,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        this.container.appendChild(this.app.view);

        // Create viewport
        this.viewport = new PIXI.Container();
        this.app.stage.addChild(this.viewport);

        // Create layers
        this.gridGraphics = new PIXI.Graphics();
        this.viewport.addChild(this.gridGraphics);

        this.dieOutline = new PIXI.Graphics();
        this.viewport.addChild(this.dieOutline);

        this.componentsContainer = new PIXI.Container();
        this.viewport.addChild(this.componentsContainer);

        // Preview graphics for drawing
        this.drawPreview = new PIXI.Graphics();
        this.viewport.addChild(this.drawPreview);

        // Preview graphics for copying
        this.copyPreview = new PIXI.Graphics();
        this.viewport.addChild(this.copyPreview);

        // Resize handles container
        this.resizeHandlesContainer = new PIXI.Container();
        this.viewport.addChild(this.resizeHandlesContainer);

        // Setup interactions
        this.setupZoomPan();
        this.setupKeyboardShortcuts();

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Load die for editing
     */
    loadDie(die) {
        this.currentDie = die;
        this.render();
    }

    /**
     * Set current tool mode
     */
    setTool(tool) {
        this.currentTool = tool;

        // Clear selected component type when switching tools
        if (tool !== 'draw') {
            this.selectedComponentType = null;
        }

        // Clear copy mode when switching tools
        if (tool !== 'copy') {
            this.copiedComponent = null;
            if (this.copyPreview) {
                this.copyPreview.clear();
            }
        }

        // Update cursor based on tool
        if (tool === 'select') {
            this.app.view.style.cursor = 'default';
        } else if (tool === 'pan') {
            this.app.view.style.cursor = 'grab';
        } else if (tool === 'draw' || tool === 'copy') {
            this.app.view.style.cursor = 'crosshair';
        }

        // Update component interactivity based on tool mode
        this.updateComponentInteractivity();
    }

    /**
     * Select component type for drawing
     */
    selectComponentType(componentType) {
        this.selectedComponentType = componentType;
        this.setTool('draw');
    }

    /**
     * Clear selected component type
     */
    clearSelectedComponentType() {
        console.log('[DieDesigner] Clearing selected component type');
        this.selectedComponentType = null;
        if (this.onComponentTypeCleared) {
            this.onComponentTypeCleared();
        }
    }

    /**
     * Update component interactivity based on current tool
     */
    updateComponentInteractivity() {
        if (!this.componentsContainer) return;

        // Enable interactivity only in select mode
        const interactive = this.currentTool === 'select';

        this.componentsContainer.children.forEach(child => {
            child.interactive = interactive;
            child.buttonMode = interactive;
        });
    }

    /**
     * Render the die designer
     */
    render(preserveView = false) {
        if (!this.currentDie) return;

        // Store current zoom/pan if preserving
        let savedZoom = this.zoomLevel;
        let savedX = this.viewport.x;
        let savedY = this.viewport.y;

        // Clear previous
        this.gridGraphics.clear();
        this.dieOutline.clear();
        this.componentsContainer.removeChildren();

        if (!preserveView) {
            // Reset zoom/pan only if not preserving
            this.zoomLevel = 1.0;
            this.viewport.scale.set(1.0, 1.0);

            // Position die in upper-left with padding
            const margin = 50;
            this.viewport.x = margin;
            this.viewport.y = margin;
        } else {
            // Restore saved zoom/pan
            this.zoomLevel = savedZoom;
            this.viewport.scale.set(savedZoom, savedZoom);
            this.viewport.x = savedX;
            this.viewport.y = savedY;
        }

        // Draw grid
        this.drawGrid();

        // Draw die outline
        this.drawDieOutline();

        // Draw components
        this.drawComponents();

        // Update component interactivity based on current tool
        this.updateComponentInteractivity();
    }

    /**
     * Refresh theme colors (call when theme changes)
     */
    refreshThemeColors() {
        this.themeColors = getThemeColors();
        if (this.currentDie) {
            this.loadDie(this.currentDie); // Redraw with new colors
        }
    }

    /**
     * Abbreviate component name to prevent overflow
     * @param {string} name - Full component name
     * @returns {string} Abbreviated name
     */
    abbreviateComponentName(name) {
        // Extract number at end if present
        const match = name.match(/^(.+?)\s+(\d+)$/);
        const baseName = match ? match[1] : name;
        const number = match ? match[2] : '';

        // Abbreviation map
        const abbreviations = {
            'CPU Core': 'CPU C',
            'L2 Cache': 'L2 C',
            'L3 Cache': 'L3 C',
            'Memory Controller': 'MC',
            'Interconnect': 'IC',
            'Power Management': 'PM',
            'I/O Controller': 'I/O',
            'Integrated GPU': 'iGPU',
            'Streaming Multiprocessor': 'SM',
            'Compute Unit': 'CU',
            'Texture Unit': 'TEX',
            'Display Engine': 'DISP',
            'HBM Stack': 'HBM',
            'GDDR Controller': 'GDDR'
        };

        const abbreviated = abbreviations[baseName] || baseName;
        return number ? `${abbreviated} ${number}` : abbreviated;
    }

    /**
     * Get default component size based on type and process node
     * @param {string} componentType - Component type ID
     * @returns {{width: number, height: number}} Default size in mm
     */
    getDefaultComponentSize(componentType) {
        if (!this.currentDie) return { width: 5, height: 5 };

        const processNode = this.currentDie.processNode || 14;

        // Base sizes at 14nm (in mm) - realistic component sizes
        const baseSizes = {
            'cpu_core': { width: 3.0, height: 3.0 },        // ~9mm² per core
            'l2_cache': { width: 2.5, height: 2.5 },        // ~6.25mm² cache block
            'l3_cache': { width: 4.0, height: 4.0 },        // ~16mm² larger cache
            'mem_ctrl': { width: 2.0, height: 1.5 },        // ~3mm² MC (FIXED KEY)
            'interconnect': { width: 6.0, height: 1.0 },    // ~6mm² thin strip
            'power_mgmt': { width: 1.5, height: 1.5 },      // ~2.25mm² small block (FIXED KEY)
            'io_ctrl': { width: 2.5, height: 1.5 },         // ~3.75mm² (FIXED KEY)
            'igpu': { width: 4.0, height: 3.0 },            // ~12mm² iGPU (FIXED KEY)
            'gpu_sm': { width: 3.5, height: 3.5 },          // ~12.25mm² GPU SM/CU (FIXED KEY)
            'texture_unit': { width: 2.0, height: 2.0 },    // ~4mm²
            'display_engine': { width: 2.0, height: 2.0 },  // ~4mm²
            'memory_array': { width: 6.0, height: 6.0 },    // ~36mm² memory array
            'control_logic': { width: 2.0, height: 2.0 },   // ~4mm² control logic
            'npu': { width: 3.0, height: 3.0 }              // ~9mm² NPU core
        };

        const baseSize = baseSizes[componentType] || { width: 3, height: 3 };

        // Scale factor based on process node (inverse relationship)
        // Smaller nodes = smaller components (more dense)
        // 180nm is ~13x larger than 14nm, 7nm is ~0.5x size of 14nm
        const nodeScaleFactors = {
            10000: 70,   // 10μm - huge ancient chips
            6000: 42,    // 6μm
            3000: 21,    // 3μm
            1500: 11,    // 1.5μm
            1000: 7,     // 1μm
            800: 5.5,    // 800nm
            600: 4,      // 600nm
            350: 2.5,    // 350nm
            250: 1.8,    // 250nm
            180: 1.3,    // 180nm
            130: 1.0,    // 130nm - baseline
            90: 0.85,    // 90nm
            65: 0.7,     // 65nm
            45: 0.6,     // 45nm
            32: 0.5,     // 32nm
            22: 0.45,    // 22nm
            14: 0.4,     // 14nm - modern baseline
            12: 0.38,    // 12nm
            10: 0.35,    // 10nm
            7: 0.3,      // 7nm
            5: 0.25,     // 5nm
            3: 0.2       // 3nm - very dense
        };

        const scaleFactor = nodeScaleFactors[processNode] || 1.0;

        return {
            width: Math.max(0.1, Math.round(baseSize.width * scaleFactor * 2) / 2), // Round to 0.5mm, min 0.1mm
            height: Math.max(0.1, Math.round(baseSize.height * scaleFactor * 2) / 2)
        };
    }

    /**
     * Draw grid
     */
    drawGrid() {
        const g = this.gridGraphics;
        const dieWidth = this.currentDie.dimensions.width;
        const dieHeight = this.currentDie.dimensions.height;
        const widthPx = dieWidth * this.pixelsPerMm;
        const heightPx = dieHeight * this.pixelsPerMm;
        const gridPx = this.gridSize * this.pixelsPerMm;

        // Major grid lines (every 5mm)
        g.lineStyle(1, this.themeColors.tealPrimary, 0.2);
        for (let x = 0; x <= dieWidth; x += 5) {
            const xPx = x * this.pixelsPerMm;
            g.moveTo(xPx, 0);
            g.lineTo(xPx, heightPx);
        }
        for (let y = 0; y <= dieHeight; y += 5) {
            const yPx = y * this.pixelsPerMm;
            g.moveTo(0, yPx);
            g.lineTo(widthPx, yPx);
        }

        // Minor grid lines (every 1mm)
        g.lineStyle(1, this.themeColors.tealPrimary, 0.1);
        for (let x = 0; x <= dieWidth; x += this.gridSize) {
            const xPx = x * this.pixelsPerMm;
            g.moveTo(xPx, 0);
            g.lineTo(xPx, heightPx);
        }
        for (let y = 0; y <= dieHeight; y += this.gridSize) {
            const yPx = y * this.pixelsPerMm;
            g.moveTo(0, yPx);
            g.lineTo(widthPx, yPx);
        }
    }

    /**
     * Draw die outline
     */
    drawDieOutline() {
        const g = this.dieOutline;
        const widthPx = this.currentDie.dimensions.width * this.pixelsPerMm;
        const heightPx = this.currentDie.dimensions.height * this.pixelsPerMm;

        // Outline
        g.lineStyle(3, this.themeColors.magentaPrimary, 1);
        g.drawRect(0, 0, widthPx, heightPx);

        // Corner markers
        const markerSize = 10;
        g.lineStyle(2, 0xFFD700, 1);

        // Top-left
        g.moveTo(0, markerSize);
        g.lineTo(0, 0);
        g.lineTo(markerSize, 0);

        // Top-right
        g.moveTo(widthPx - markerSize, 0);
        g.lineTo(widthPx, 0);
        g.lineTo(widthPx, markerSize);

        // Bottom-right
        g.moveTo(widthPx, heightPx - markerSize);
        g.lineTo(widthPx, heightPx);
        g.lineTo(widthPx - markerSize, heightPx);

        // Bottom-left
        g.moveTo(markerSize, heightPx);
        g.lineTo(0, heightPx);
        g.lineTo(0, heightPx - markerSize);
    }

    /**
     * Draw components
     */
    drawComponents() {
        if (!this.currentDie.components) return;

        this.currentDie.components.forEach(component => {
            this.drawComponent(component);
        });
    }

    /**
     * Draw single component
     */
    drawComponent(component) {
        const graphics = new PIXI.Graphics();

        const xPx = component.position.x * this.pixelsPerMm;
        const yPx = component.position.y * this.pixelsPerMm;
        const widthPx = component.dimensions.width * this.pixelsPerMm;
        const heightPx = component.dimensions.height * this.pixelsPerMm;

        // Get component type info
        const typeInfo = COMPONENT_TYPES[component.type] || COMPONENT_TYPES.CPU_CORE;
        const color = parseInt(typeInfo.color.replace('#', '0x'));

        // Fill
        graphics.beginFill(color, 0.6);
        graphics.drawRect(xPx, yPx, widthPx, heightPx);
        graphics.endFill();

        // Border
        graphics.lineStyle(2, color, 1);
        graphics.drawRect(xPx, yPx, widthPx, heightPx);

        // Store component data
        graphics.componentData = component;

        // Click to select and start drag
        graphics.on('pointerdown', (e) => {
            e.stopPropagation();

            // Get shift key state from original event
            const originalEvent = e.data.originalEvent;
            const isShiftClick = originalEvent.shiftKey;

            this.selectComponent(component, graphics, isShiftClick);

            // Start dragging the component (only if single select)
            if (!isShiftClick) {
                // Use original event coordinates for consistency with mousemove
                const screenX = originalEvent.clientX || originalEvent.touches?.[0]?.clientX;
                const screenY = originalEvent.clientY || originalEvent.touches?.[0]?.clientY;

                this.isDraggingComponent = true;
                const pos = this.screenToMm(screenX, screenY);
                this.componentDragStart = {
                    x: pos.x,
                    y: pos.y,
                    componentX: component.position.x,
                    componentY: component.position.y
                };
            }
        });

        // Label with high-resolution rendering for crisp text
        const displayName = this.abbreviateComponentName(component.name || typeInfo.label);
        const label = new PIXI.Text(displayName, {
            fontFamily: 'Montserrat, Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            fontWeight: '600',
            wordWrap: true,
            wordWrapWidth: widthPx - 4,
            resolution: window.devicePixelRatio * 2 // 2x super-sampling for crisp text
        });
        label.position.set(xPx + 2, yPx + 2);
        graphics.addChild(label);

        this.componentsContainer.addChild(graphics);
    }

    /**
     * Select component
     * @param {Object} component - Component data
     * @param {PIXI.Graphics} graphics - Component graphics object
     * @param {boolean} multiSelect - If true, add to selection; if false, replace selection
     */
    selectComponent(component, graphics, multiSelect = false) {
        if (!multiSelect) {
            // Single select: clear previous selections first
            this.deselectAll();

            this.selectedComponent = { component, graphics };
            this.selectedComponents = [{ component, graphics }];

            // Highlight
            graphics.tint = 0xFFFF00;

            // Show resize handles for single selection only
            this.showResizeHandles(component);

            // Emit event for properties panel
            if (this.onComponentSelected) {
                this.onComponentSelected(component);
            }
        } else {
            // Multi-select: toggle component in selection
            const existingIndex = this.selectedComponents.findIndex(
                sel => sel.component === component
            );

            if (existingIndex !== -1) {
                // Already selected, deselect it
                this.selectedComponents.splice(existingIndex, 1);
                graphics.tint = 0xFFFFFF;

                // Update primary selection
                if (this.selectedComponents.length > 0) {
                    this.selectedComponent = this.selectedComponents[this.selectedComponents.length - 1];
                } else {
                    this.selectedComponent = null;
                    this.hideResizeHandles();
                }
            } else {
                // Not selected, add to selection
                this.selectedComponents.push({ component, graphics });
                this.selectedComponent = { component, graphics };
                graphics.tint = 0xFFFF00;
            }

            // Hide resize handles for multi-selection
            if (this.selectedComponents.length > 1) {
                this.hideResizeHandles();
            } else if (this.selectedComponents.length === 1) {
                this.showResizeHandles(this.selectedComponents[0].component);
            }

            // Emit event with multi-selection info
            if (this.onComponentSelected) {
                if (this.selectedComponents.length === 1) {
                    this.onComponentSelected(this.selectedComponents[0].component);
                } else if (this.selectedComponents.length > 1) {
                    this.onComponentSelected(null, this.selectedComponents.map(s => s.component));
                }
            }
        }
    }

    /**
     * Deselect all components
     */
    deselectAll() {
        this.componentsContainer.children.forEach(child => {
            child.tint = 0xFFFFFF;
        });
        this.selectedComponent = null;
        this.selectedComponents = [];

        // Hide resize handles
        this.hideResizeHandles();

        if (this.onComponentDeselected) {
            this.onComponentDeselected();
        }
    }

    /**
     * Add new component
     */
    addComponent(component) {
        if (!this.currentDie.components) {
            this.currentDie.components = [];
        }

        this.currentDie.components.push(component);
        this.drawComponent(component);

        if (this.onDieModified) {
            this.onDieModified(this.currentDie);
        }
    }

    /**
     * Remove selected component(s)
     */
    removeSelectedComponent() {
        if (this.selectedComponents.length === 0) return;

        const affectedTypes = new Set();

        // Remove all selected components
        this.selectedComponents.forEach(({ component }) => {
            affectedTypes.add(component.type);
            const index = this.currentDie.components.indexOf(component);
            if (index !== -1) {
                this.currentDie.components.splice(index, 1);
            }
        });

        // Renumber remaining components for each affected type
        affectedTypes.forEach(type => {
            this.renumberComponents(type);
        });

        // Clear selection
        this.deselectAll();

        this.render(true); // Preserve view when deleting

        if (this.onDieModified) {
            this.onDieModified(this.currentDie);
        }
    }

    /**
     * Renumber all components of a specific type to fill gaps
     */
    renumberComponents(componentType) {
        // Get the component type info
        const typeInfo = Object.values(COMPONENT_TYPES).find(t => t.id === componentType);
        if (!typeInfo) return;

        // Get all components of this type
        const componentsOfType = this.currentDie.components
            .filter(comp => comp.type === componentType)
            .map(comp => {
                // Extract number from name
                const match = comp.name.match(/(\d+)$/);
                const currentNumber = match ? parseInt(match[1]) : -1;
                return { component: comp, currentNumber };
            })
            .filter(item => item.currentNumber >= 0)
            .sort((a, b) => a.currentNumber - b.currentNumber);

        // Renumber them sequentially starting from 0
        componentsOfType.forEach((item, index) => {
            item.component.name = `${typeInfo.label} ${index}`;
        });

        console.log(`[DieDesigner] Renumbered ${componentsOfType.length} components of type ${componentType}`);
    }

    /**
     * Generate numbered name for component based on type
     */
    generateComponentName(componentType) {
        if (!this.currentDie.components) {
            this.currentDie.components = [];
        }

        // Find the component type info by id
        const typeInfo = Object.values(COMPONENT_TYPES).find(t => t.id === componentType) || COMPONENT_TYPES.CPU_CORE;
        const baseName = typeInfo.label;

        // Get all existing components of this type and find the highest number
        const existingNumbers = this.currentDie.components
            .filter(comp => comp.type === componentType)
            .map(comp => {
                // Extract number from name (e.g., "CPU Core 5" -> 5)
                const match = comp.name.match(/(\d+)$/);
                return match ? parseInt(match[1]) : -1;
            })
            .filter(num => num >= 0);

        // Use the next number after the highest existing number
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 0;

        // Return numbered name
        return `${baseName} ${nextNumber}`;
    }

    /**
     * Copy selected component for placement
     */
    copySelectedComponent() {
        if (!this.selectedComponent) {
            console.log('[DieDesigner] No component selected to copy');
            return;
        }

        // Store the component to copy (without the name, we'll generate it on placement)
        this.copiedComponent = {
            type: this.selectedComponent.component.type,
            dimensions: {
                width: this.selectedComponent.component.dimensions.width,
                height: this.selectedComponent.component.dimensions.height
            }
        };

        console.log('[DieDesigner] Copied component:', this.copiedComponent);

        // Switch to copy mode
        this.setTool('copy');

        // Update UI to show copy mode is active
        if (this.onToolChanged) {
            this.onToolChanged('copy');
        }
    }

    /**
     * Place copied component (mouse)
     */
    placeCopiedComponent(e) {
        if (!this.copiedComponent) return;

        const pos = this.screenToMm(e.clientX, e.clientY);

        // Snap to grid
        let x = this.snapToGrid(pos.x);
        let y = this.snapToGrid(pos.y);

        // Clamp to die boundaries
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - this.copiedComponent.dimensions.width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - this.copiedComponent.dimensions.height));

        // Check for overlap
        if (this.checkOverlap(x, y, this.copiedComponent.dimensions.width, this.copiedComponent.dimensions.height)) {
            console.log('[DieDesigner] Cannot place copy - overlaps existing component');
            return;
        }

        // Create new component with numbered name
        const newComponent = {
            id: Date.now().toString(),
            type: this.copiedComponent.type,
            name: this.generateComponentName(this.copiedComponent.type),
            position: { x, y },
            dimensions: {
                width: this.copiedComponent.dimensions.width,
                height: this.copiedComponent.dimensions.height
            }
        };

        console.log('[DieDesigner] Placing copied component at', x, y);

        this.addComponent(newComponent);

        // Exit copy mode after placement
        this.copiedComponent = null;
        this.copyPreview.clear();
        this.setTool('select');

        // Update UI
        if (this.onToolChanged) {
            this.onToolChanged('select');
        }
    }

    /**
     * Place copied component (touch)
     */
    placeCopiedComponentTouch(e) {
        if (!this.copiedComponent || e.touches.length !== 1) return;

        const pos = this.screenToMm(e.touches[0].clientX, e.touches[0].clientY);

        // Snap to grid
        let x = this.snapToGrid(pos.x);
        let y = this.snapToGrid(pos.y);

        // Clamp to die boundaries
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - this.copiedComponent.dimensions.width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - this.copiedComponent.dimensions.height));

        // Check for overlap
        if (this.checkOverlap(x, y, this.copiedComponent.dimensions.width, this.copiedComponent.dimensions.height)) {
            console.log('[DieDesigner] Cannot place copy - overlaps existing component');
            return;
        }

        // Create new component with numbered name
        const newComponent = {
            id: Date.now().toString(),
            type: this.copiedComponent.type,
            name: this.generateComponentName(this.copiedComponent.type),
            position: { x, y },
            dimensions: {
                width: this.copiedComponent.dimensions.width,
                height: this.copiedComponent.dimensions.height
            }
        };

        console.log('[DieDesigner] Placing copied component at', x, y);

        this.addComponent(newComponent);

        // Exit copy mode after placement
        this.copiedComponent = null;
        this.copyPreview.clear();
        this.setTool('select');

        // Update UI
        if (this.onToolChanged) {
            this.onToolChanged('select');
        }
    }

    /**
     * Update copy preview (mouse)
     */
    updateCopyPreview(e) {
        if (!this.copiedComponent) return;

        const pos = this.screenToMm(e.clientX, e.clientY);

        // Snap to grid
        let x = this.snapToGrid(pos.x);
        let y = this.snapToGrid(pos.y);

        // Clamp to die boundaries
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - this.copiedComponent.dimensions.width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - this.copiedComponent.dimensions.height));

        // Check for overlap
        const hasOverlap = this.checkOverlap(x, y, this.copiedComponent.dimensions.width, this.copiedComponent.dimensions.height);

        // Draw preview
        this.copyPreview.clear();

        const xPx = x * this.pixelsPerMm;
        const yPx = y * this.pixelsPerMm;
        const widthPx = this.copiedComponent.dimensions.width * this.pixelsPerMm;
        const heightPx = this.copiedComponent.dimensions.height * this.pixelsPerMm;

        // Get component type color
        const typeInfo = COMPONENT_TYPES[this.copiedComponent.type] || COMPONENT_TYPES.CPU_CORE;
        const color = parseInt(typeInfo.color.replace('#', '0x'));

        // Fill with transparency, red if overlapping
        const fillColor = hasOverlap ? 0xFF0000 : color;
        this.copyPreview.beginFill(fillColor, 0.3);
        this.copyPreview.drawRect(xPx, yPx, widthPx, heightPx);
        this.copyPreview.endFill();

        // Border
        this.copyPreview.lineStyle(2, fillColor, 0.8);
        this.copyPreview.drawRect(xPx, yPx, widthPx, heightPx);
    }

    /**
     * Update copy preview (touch)
     */
    updateCopyPreviewTouch(e) {
        if (!this.copiedComponent || e.touches.length !== 1) return;

        const pos = this.screenToMm(e.touches[0].clientX, e.touches[0].clientY);

        // Snap to grid
        let x = this.snapToGrid(pos.x);
        let y = this.snapToGrid(pos.y);

        // Clamp to die boundaries
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - this.copiedComponent.dimensions.width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - this.copiedComponent.dimensions.height));

        // Check for overlap
        const hasOverlap = this.checkOverlap(x, y, this.copiedComponent.dimensions.width, this.copiedComponent.dimensions.height);

        // Draw preview
        this.copyPreview.clear();

        const xPx = x * this.pixelsPerMm;
        const yPx = y * this.pixelsPerMm;
        const widthPx = this.copiedComponent.dimensions.width * this.pixelsPerMm;
        const heightPx = this.copiedComponent.dimensions.height * this.pixelsPerMm;

        // Get component type color
        const typeInfo = COMPONENT_TYPES[this.copiedComponent.type] || COMPONENT_TYPES.CPU_CORE;
        const color = parseInt(typeInfo.color.replace('#', '0x'));

        // Fill with transparency, red if overlapping
        const fillColor = hasOverlap ? 0xFF0000 : color;
        this.copyPreview.beginFill(fillColor, 0.3);
        this.copyPreview.drawRect(xPx, yPx, widthPx, heightPx);
        this.copyPreview.endFill();

        // Border
        this.copyPreview.lineStyle(2, fillColor, 0.8);
        this.copyPreview.drawRect(xPx, yPx, widthPx, heightPx);
    }

    /**
     * Setup zoom and pan
     */
    setupZoomPan() {
        // Mouse wheel zoom (in select and pan modes)
        this.app.view.addEventListener('wheel', (e) => {
            if (this.currentTool !== 'select' && this.currentTool !== 'pan') return;

            e.preventDefault();

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = this.zoomLevel * delta;

            if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
                // Get mouse position relative to canvas
                const rect = this.app.view.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Zoom toward mouse position
                this.zoomToPoint(mouseX, mouseY, newZoom);
            }
        }, { passive: false });

        // Touch events for pinch zoom (in select and pan modes)
        let touches = {};
        let lastDistance = 0;

        this.app.view.addEventListener('touchstart', (e) => {
            if (this.currentTool !== 'select' && this.currentTool !== 'pan') return;

            if (e.touches.length === 2) {
                e.preventDefault();
                touches = {
                    touch1: { x: e.touches[0].clientX, y: e.touches[0].clientY },
                    touch2: { x: e.touches[1].clientX, y: e.touches[1].clientY }
                };
                lastDistance = Math.sqrt(
                    Math.pow(touches.touch2.x - touches.touch1.x, 2) +
                    Math.pow(touches.touch2.y - touches.touch1.y, 2)
                );
            }
        }, { passive: false });

        this.app.view.addEventListener('touchmove', (e) => {
            if (this.currentTool !== 'select' && this.currentTool !== 'pan') return;

            if (e.touches.length === 2) {
                e.preventDefault();

                const currentDistance = Math.sqrt(
                    Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                    Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
                );

                if (lastDistance > 0) {
                    const delta = currentDistance / lastDistance;
                    const newZoom = this.zoomLevel * delta;

                    if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
                        // Get center point between touches
                        const rect = this.app.view.getBoundingClientRect();
                        const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
                        const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

                        this.zoomToPoint(centerX, centerY, newZoom);
                    }
                }

                lastDistance = currentDistance;
            }
        }, { passive: false });

        this.app.view.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                touches = {};
                lastDistance = 0;
            }
        });

        // Mouse handlers
        let isPanning = false;
        let panStart = { x: 0, y: 0 };
        let viewportStart = { x: 0, y: 0 };

        this.app.view.addEventListener('mousedown', (e) => {
            // Middle mouse button always pans, regardless of mode
            if (e.button === 1) {
                e.preventDefault(); // Prevent middle-click default behavior (auto-scroll)
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY };
                viewportStart = { x: this.viewport.x, y: this.viewport.y };
                this.app.view.style.cursor = 'grabbing';
            } else if (e.button === 0) {
                if (this.currentTool === 'pan') {
                    // Start panning in pan mode
                    isPanning = true;
                    panStart = { x: e.clientX, y: e.clientY };
                    viewportStart = { x: this.viewport.x, y: this.viewport.y };
                    this.app.view.style.cursor = 'grabbing';
                } else if (this.currentTool === 'select') {
                    // Check if clicking on empty canvas (not on a component)
                    // This will deselect all components if clicking blank space
                    const rect = this.app.view.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Check if we hit any component
                    const hit = this.componentsContainer.children.some(child => {
                        return child.getBounds().contains(x, y);
                    });

                    // If not holding shift and didn't hit anything, deselect all
                    if (!hit && !e.shiftKey) {
                        this.deselectAll();
                    }
                } else if (this.currentTool === 'draw' && this.selectedComponentType) {
                    // Start drawing in draw mode
                    this.startDrawing(e);
                } else if (this.currentTool === 'copy' && this.copiedComponent) {
                    // Place copied component in copy mode
                    this.placeCopiedComponent(e);
                }
                // Note: Component dragging starts in component's pointerdown handler
            }
        });

        this.app.view.addEventListener('mousemove', (e) => {
            // Handle panning (works with middle mouse or pan mode)
            if (isPanning) {
                const dx = e.clientX - panStart.x;
                const dy = e.clientY - panStart.y;
                this.viewport.x = viewportStart.x + dx;
                this.viewport.y = viewportStart.y + dy;
            } else if (this.currentTool === 'select') {
                if (this.isResizingComponent) {
                    // Resize component
                    this.updateComponentResize(e.clientX, e.clientY);
                } else if (this.isDraggingComponent) {
                    // Drag component
                    this.updateComponentDrag(e.clientX, e.clientY);
                }
            } else if (this.currentTool === 'draw' && this.isDrawing) {
                // Update draw preview
                this.updateDrawPreview(e);
            } else if (this.currentTool === 'copy' && this.copiedComponent) {
                // Update copy preview
                this.updateCopyPreview(e);
            }
        });

        this.app.view.addEventListener('mouseup', (e) => {
            // Handle middle mouse release
            if (e.button === 1 && isPanning) {
                isPanning = false;
                this.updateCursor();
                return;
            }

            if (this.currentTool === 'select') {
                if (this.isResizingComponent) {
                    this.finishComponentResize();
                } else if (this.isDraggingComponent) {
                    this.finishComponentDrag();
                }
            } else if (this.currentTool === 'pan') {
                isPanning = false;
                this.app.view.style.cursor = 'grab';
            } else if (this.currentTool === 'draw' && this.isDrawing) {
                // Finish drawing
                this.finishDrawing(e);
            }
            this.updateCursor();
        });

        this.app.view.addEventListener('mouseleave', () => {
            if (this.currentTool === 'select') {
                if (this.isResizingComponent) {
                    this.finishComponentResize();
                } else if (this.isDraggingComponent) {
                    this.finishComponentDrag();
                }
            } else if (this.currentTool === 'pan') {
                isPanning = false;
                this.app.view.style.cursor = 'grab';
            } else if (this.currentTool === 'draw' && this.isDrawing) {
                // Cancel drawing
                this.cancelDrawing();
            }
            this.updateCursor();
        });

        // Touch handlers
        let touchPanning = false;
        let touchPanStart = { x: 0, y: 0 };
        let touchViewportStart = { x: 0, y: 0 };

        this.app.view.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                if (this.currentTool === 'pan') {
                    // Start panning in pan mode
                    touchPanning = true;
                    touchPanStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    touchViewportStart = { x: this.viewport.x, y: this.viewport.y };
                } else if (this.currentTool === 'draw' && this.selectedComponentType) {
                    // Start drawing in draw mode
                    this.startDrawingTouch(e);
                } else if (this.currentTool === 'copy' && this.copiedComponent) {
                    // Place copied component in copy mode
                    this.placeCopiedComponentTouch(e);
                }
                // Component dragging starts in component's pointerdown handler
            }
        });

        this.app.view.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                if (this.currentTool === 'select') {
                    // Handle component dragging or resizing in select mode
                    if (this.isResizingComponent) {
                        e.preventDefault();
                        this.updateComponentResize(e.touches[0].clientX, e.touches[0].clientY);
                    } else if (this.isDraggingComponent) {
                        e.preventDefault();
                        this.updateComponentDrag(e.touches[0].clientX, e.touches[0].clientY);
                    }
                } else if (this.currentTool === 'pan' && touchPanning) {
                    // Pan in pan mode
                    e.preventDefault();
                    const dx = e.touches[0].clientX - touchPanStart.x;
                    const dy = e.touches[0].clientY - touchPanStart.y;
                    this.viewport.x = touchViewportStart.x + dx;
                    this.viewport.y = touchViewportStart.y + dy;
                } else if (this.currentTool === 'draw' && this.isDrawing) {
                    // Update draw preview in draw mode
                    e.preventDefault();
                    this.updateDrawPreviewTouch(e);
                } else if (this.currentTool === 'copy' && this.copiedComponent) {
                    // Update copy preview in copy mode
                    e.preventDefault();
                    this.updateCopyPreviewTouch(e);
                }
            }
        }, { passive: false });

        this.app.view.addEventListener('touchend', (e) => {
            if (this.currentTool === 'select') {
                // Finish component dragging or resizing in select mode
                if (this.isResizingComponent) {
                    this.finishComponentResize();
                } else if (this.isDraggingComponent) {
                    this.finishComponentDrag();
                }
            } else if (this.currentTool === 'pan') {
                touchPanning = false;
            } else if (this.currentTool === 'draw' && this.isDrawing) {
                // Finish drawing
                this.finishDrawingTouch(e);
            }
        });

        this.app.view.addEventListener('touchcancel', () => {
            if (this.currentTool === 'select') {
                // Cancel component dragging or resizing in select mode
                if (this.isResizingComponent) {
                    this.finishComponentResize();
                } else if (this.isDraggingComponent) {
                    this.finishComponentDrag();
                }
            } else if (this.currentTool === 'pan') {
                touchPanning = false;
            } else if (this.currentTool === 'draw' && this.isDrawing) {
                // Cancel drawing
                this.cancelDrawing();
            }
        });

        // Click stage to deselect
        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', () => {
            this.deselectAll();
        });
    }

    /**
     * Zoom to a specific point
     */
    zoomToPoint(x, y, newZoom) {
        // Calculate the point in viewport coordinates
        const worldPos = {
            x: (x - this.viewport.x) / this.zoomLevel,
            y: (y - this.viewport.y) / this.zoomLevel
        };

        // Update zoom
        this.zoomLevel = newZoom;
        this.viewport.scale.set(this.zoomLevel, this.zoomLevel);

        // Adjust position to keep the same point under the cursor
        this.viewport.x = x - worldPos.x * this.zoomLevel;
        this.viewport.y = y - worldPos.y * this.zoomLevel;
    }

    /**
     * Handle resize
     */
    handleResize() {
        if (!this.app) return;

        this.app.renderer.resize(
            this.container.clientWidth,
            this.container.clientHeight
        );

        if (this.currentDie) {
            this.render(true); // Preserve view on resize
        }
    }

    /**
     * Update cursor based on current tool
     */
    updateCursor() {
        if (this.currentTool === 'select') {
            this.app.view.style.cursor = 'grab';
        } else if (this.currentTool === 'draw') {
            this.app.view.style.cursor = 'crosshair';
        } else {
            this.app.view.style.cursor = 'default';
        }
    }

    /**
     * Convert screen coordinates to mm coordinates
     */
    screenToMm(screenX, screenY) {
        const rect = this.app.view.getBoundingClientRect();
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;

        // Convert to world coordinates
        const worldX = (canvasX - this.viewport.x) / this.zoomLevel;
        const worldY = (canvasY - this.viewport.y) / this.zoomLevel;

        // Convert pixels to mm
        const mmX = worldX / this.pixelsPerMm;
        const mmY = worldY / this.pixelsPerMm;

        return { x: mmX, y: mmY };
    }

    /**
     * Check if a rectangle overlaps with any existing components
     */
    checkOverlap(x, y, width, height) {
        if (!this.currentDie.components) return false;

        return this.currentDie.components.some(comp => {
            const comp2 = {
                x1: comp.position.x,
                y1: comp.position.y,
                x2: comp.position.x + comp.dimensions.width,
                y2: comp.position.y + comp.dimensions.height
            };

            const rect = {
                x1: x,
                y1: y,
                x2: x + width,
                y2: y + height
            };

            // Check if rectangles overlap
            return !(rect.x2 <= comp2.x1 ||
                     rect.x1 >= comp2.x2 ||
                     rect.y2 <= comp2.y1 ||
                     rect.y1 >= comp2.y2);
        });
    }

    /**
     * Start drawing a component
     */
    startDrawing(e) {
        if (!this.selectedComponentType || !this.currentDie) return;

        const pos = this.screenToMm(e.clientX, e.clientY);

        // Snap to grid
        this.drawStartPos = {
            x: this.snapToGrid(pos.x),
            y: this.snapToGrid(pos.y)
        };

        this.isDrawing = true;
    }

    /**
     * Update draw preview rectangle
     */
    updateDrawPreview(e) {
        if (!this.isDrawing || !this.drawStartPos) return;

        const pos = this.screenToMm(e.clientX, e.clientY);
        const endX = this.snapToGrid(pos.x);
        const endY = this.snapToGrid(pos.y);

        // Calculate dimensions
        let x = Math.min(this.drawStartPos.x, endX);
        let y = Math.min(this.drawStartPos.y, endY);
        let width = Math.abs(endX - this.drawStartPos.x);
        let height = Math.abs(endY - this.drawStartPos.y);

        // Minimum size of 0.1mm
        width = Math.max(0.1, width);
        height = Math.max(0.1, height);

        // Clamp to die bounds
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - height));

        // Check for overlap
        const hasOverlap = this.checkOverlap(x, y, width, height);

        // Draw preview
        const typeInfo = this.selectedComponentType;
        const color = hasOverlap ? 0xFF0000 : parseInt(typeInfo.color.replace('#', '0x'));
        const alpha = hasOverlap ? 0.5 : 0.3;

        this.drawPreview.clear();
        this.drawPreview.lineStyle(2, color, 1);
        this.drawPreview.beginFill(color, alpha);
        this.drawPreview.drawRect(
            x * this.pixelsPerMm,
            y * this.pixelsPerMm,
            width * this.pixelsPerMm,
            height * this.pixelsPerMm
        );
        this.drawPreview.endFill();
    }

    /**
     * Finish drawing and create component
     */
    finishDrawing(e) {
        if (!this.isDrawing || !this.drawStartPos) return;

        const pos = this.screenToMm(e.clientX, e.clientY);
        const endX = this.snapToGrid(pos.x);
        const endY = this.snapToGrid(pos.y);

        // Calculate dimensions
        let x = Math.min(this.drawStartPos.x, endX);
        let y = Math.min(this.drawStartPos.y, endY);
        let width = Math.abs(endX - this.drawStartPos.x);
        let height = Math.abs(endY - this.drawStartPos.y);

        // If user just clicked (didn't drag much), use default size
        // Use 2mm threshold to account for grid snapping and small movements
        if (width < 2.0 && height < 2.0) {
            const defaultSize = this.getDefaultComponentSize(this.selectedComponentType.id);
            width = defaultSize.width;
            height = defaultSize.height;
            // Center on click point
            x = this.drawStartPos.x - width / 2;
            y = this.drawStartPos.y - height / 2;
            x = this.snapToGrid(x);
            y = this.snapToGrid(y);
        } else {
            // User dragged - use drawn size
            width = Math.max(0.1, width);
            height = Math.max(0.1, height);
        }

        // Clamp to die bounds
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - height));

        // Check for overlap - don't place if overlapping
        if (!this.checkOverlap(x, y, width, height)) {
            // Create component with numbered name
            const component = {
                type: this.selectedComponentType.id,
                name: this.generateComponentName(this.selectedComponentType.id),
                position: { x, y },
                dimensions: { width, height },
                transistors: 0
            };

            this.addComponent(component);
        }

        // Clear preview and state
        this.cancelDrawing();

        // Clear selected component type and switch back to select tool (single-shot placement)
        this.clearSelectedComponentType();
        if (this.onToolChanged) {
            this.onToolChanged('select');
        }
    }

    /**
     * Cancel drawing
     */
    cancelDrawing() {
        this.isDrawing = false;
        this.drawStartPos = null;
        this.drawPreview.clear();
    }

    /**
     * Start drawing with touch
     */
    startDrawingTouch(e) {
        if (!this.selectedComponentType || !this.currentDie) return;

        const pos = this.screenToMm(e.touches[0].clientX, e.touches[0].clientY);

        // Snap to grid
        this.drawStartPos = {
            x: this.snapToGrid(pos.x),
            y: this.snapToGrid(pos.y)
        };

        this.isDrawing = true;
    }

    /**
     * Update draw preview with touch
     */
    updateDrawPreviewTouch(e) {
        if (!this.isDrawing || !this.drawStartPos) return;

        const pos = this.screenToMm(e.touches[0].clientX, e.touches[0].clientY);
        const endX = this.snapToGrid(pos.x);
        const endY = this.snapToGrid(pos.y);

        // Calculate dimensions
        let x = Math.min(this.drawStartPos.x, endX);
        let y = Math.min(this.drawStartPos.y, endY);
        let width = Math.abs(endX - this.drawStartPos.x);
        let height = Math.abs(endY - this.drawStartPos.y);

        // Minimum size of 0.1mm
        width = Math.max(0.1, width);
        height = Math.max(0.1, height);

        // Clamp to die bounds
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - height));

        // Check for overlap
        const hasOverlap = this.checkOverlap(x, y, width, height);

        // Draw preview
        const typeInfo = this.selectedComponentType;
        const color = hasOverlap ? 0xFF0000 : parseInt(typeInfo.color.replace('#', '0x'));
        const alpha = hasOverlap ? 0.5 : 0.3;

        this.drawPreview.clear();
        this.drawPreview.lineStyle(2, color, 1);
        this.drawPreview.beginFill(color, alpha);
        this.drawPreview.drawRect(
            x * this.pixelsPerMm,
            y * this.pixelsPerMm,
            width * this.pixelsPerMm,
            height * this.pixelsPerMm
        );
        this.drawPreview.endFill();
    }

    /**
     * Finish drawing with touch
     */
    finishDrawingTouch(e) {
        if (!this.isDrawing || !this.drawStartPos) return;

        // Use the last known touch position from changedTouches
        const lastTouch = e.changedTouches[0];
        const pos = this.screenToMm(lastTouch.clientX, lastTouch.clientY);
        const endX = this.snapToGrid(pos.x);
        const endY = this.snapToGrid(pos.y);

        // Calculate dimensions
        let x = Math.min(this.drawStartPos.x, endX);
        let y = Math.min(this.drawStartPos.y, endY);
        let width = Math.abs(endX - this.drawStartPos.x);
        let height = Math.abs(endY - this.drawStartPos.y);

        // If user just tapped (didn't drag much), use default size
        // Use 2mm threshold to account for grid snapping and small movements
        if (width < 2.0 && height < 2.0) {
            const defaultSize = this.getDefaultComponentSize(this.selectedComponentType.id);
            width = defaultSize.width;
            height = defaultSize.height;
            // Center on tap point
            x = this.drawStartPos.x - width / 2;
            y = this.drawStartPos.y - height / 2;
            x = this.snapToGrid(x);
            y = this.snapToGrid(y);
        } else {
            // User dragged - use drawn size
            width = Math.max(0.1, width);
            height = Math.max(0.1, height);
        }

        // Clamp to die bounds
        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - width));
        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - height));

        // Check for overlap - don't place if overlapping
        if (!this.checkOverlap(x, y, width, height)) {
            // Create component with numbered name
            const component = {
                type: this.selectedComponentType.id,
                name: this.generateComponentName(this.selectedComponentType.id),
                position: { x, y },
                dimensions: { width, height },
                transistors: 0
            };

            this.addComponent(component);
        }

        // Clear preview and state
        this.cancelDrawing();

        // Clear selected component type and switch back to select tool (single-shot placement)
        this.clearSelectedComponentType();
        if (this.onToolChanged) {
            this.onToolChanged('select');
        }
    }

    /**
     * Update component drag position
     */
    updateComponentDrag(screenX, screenY) {
        if (!this.isDraggingComponent || !this.componentDragStart || !this.selectedComponent) return;

        console.log('[DieDesigner] Dragging component');

        const pos = this.screenToMm(screenX, screenY);

        // Calculate new position
        const dx = pos.x - this.componentDragStart.x;
        const dy = pos.y - this.componentDragStart.y;

        let newX = this.componentDragStart.componentX + dx;
        let newY = this.componentDragStart.componentY + dy;

        // Snap to grid
        newX = this.snapToGrid(newX);
        newY = this.snapToGrid(newY);

        // Clamp to die bounds
        const component = this.selectedComponent.component;
        newX = Math.max(0, Math.min(newX, this.currentDie.dimensions.width - component.dimensions.width));
        newY = Math.max(0, Math.min(newY, this.currentDie.dimensions.height - component.dimensions.height));

        // Update component position
        component.position.x = newX;
        component.position.y = newY;

        // Re-render
        this.render(true);
    }

    /**
     * Finish component drag
     */
    finishComponentDrag() {
        if (this.isDraggingComponent) {
            this.isDraggingComponent = false;
            this.componentDragStart = null;

            if (this.onDieModified) {
                this.onDieModified(this.currentDie);
            }
        }
    }

    /**
     * Show resize handles for selected component
     */
    showResizeHandles(component) {
        this.hideResizeHandles();

        const handleSize = 8; // 8px handles
        const x = component.position.x * this.pixelsPerMm;
        const y = component.position.y * this.pixelsPerMm;
        const w = component.dimensions.width * this.pixelsPerMm;
        const h = component.dimensions.height * this.pixelsPerMm;

        const handles = [
            { name: 'se', x: x + w, y: y + h, cursor: 'nwse-resize' }, // bottom-right
            { name: 'sw', x: x, y: y + h, cursor: 'nesw-resize' },     // bottom-left
            { name: 'ne', x: x + w, y: y, cursor: 'nesw-resize' },     // top-right
            { name: 'nw', x: x, y: y, cursor: 'nwse-resize' }          // top-left
        ];

        handles.forEach(h => {
            const handle = new PIXI.Graphics();
            handle.beginFill(0xFFD700); // Gold color
            handle.drawRect(-handleSize/2, -handleSize/2, handleSize, handleSize);
            handle.endFill();
            handle.position.set(h.x, h.y);
            handle.interactive = true;
            handle.buttonMode = true;
            handle.cursor = h.cursor;
            handle.handleName = h.name;

            // Make sure the hit area is generous
            handle.hitArea = new PIXI.Rectangle(-handleSize, -handleSize, handleSize * 2, handleSize * 2);

            handle.on('pointerdown', (e) => {
                e.stopPropagation();
                this.startResize(h.name, e);
            });

            this.resizeHandlesContainer.addChild(handle);
        });
    }

    /**
     * Hide resize handles
     */
    hideResizeHandles() {
        this.resizeHandlesContainer.removeChildren();
    }

    /**
     * Start resizing component
     */
    startResize(handleName, e) {
        if (!this.selectedComponent) return;

        this.isResizingComponent = true;
        this.resizeHandle = handleName;

        // Use original event coordinates for consistency with mousemove
        const originalEvent = e.data.originalEvent;
        const screenX = originalEvent.clientX || originalEvent.touches?.[0]?.clientX;
        const screenY = originalEvent.clientY || originalEvent.touches?.[0]?.clientY;

        const pos = this.screenToMm(screenX, screenY);
        const comp = this.selectedComponent.component;

        this.resizeStart = {
            x: pos.x,
            y: pos.y,
            compX: comp.position.x,
            compY: comp.position.y,
            compWidth: comp.dimensions.width,
            compHeight: comp.dimensions.height
        };

        console.log('[DieDesigner] Starting resize with handle:', handleName);
    }

    /**
     * Update component resize
     */
    updateComponentResize(screenX, screenY) {
        if (!this.isResizingComponent || !this.resizeStart || !this.selectedComponent) return;

        console.log('[DieDesigner] Resizing component');

        const pos = this.screenToMm(screenX, screenY);
        const comp = this.selectedComponent.component;

        const dx = pos.x - this.resizeStart.x;
        const dy = pos.y - this.resizeStart.y;

        let newX = this.resizeStart.compX;
        let newY = this.resizeStart.compY;
        let newWidth = this.resizeStart.compWidth;
        let newHeight = this.resizeStart.compHeight;

        // Update based on which handle is being dragged
        switch (this.resizeHandle) {
            case 'se': // bottom-right
                newWidth = this.resizeStart.compWidth + dx;
                newHeight = this.resizeStart.compHeight + dy;
                break;
            case 'sw': // bottom-left
                newX = this.resizeStart.compX + dx;
                newWidth = this.resizeStart.compWidth - dx;
                newHeight = this.resizeStart.compHeight + dy;
                break;
            case 'ne': // top-right
                newY = this.resizeStart.compY + dy;
                newWidth = this.resizeStart.compWidth + dx;
                newHeight = this.resizeStart.compHeight - dy;
                break;
            case 'nw': // top-left
                newX = this.resizeStart.compX + dx;
                newY = this.resizeStart.compY + dy;
                newWidth = this.resizeStart.compWidth - dx;
                newHeight = this.resizeStart.compHeight - dy;
                break;
        }

        // Snap to grid
        newX = this.snapToGrid(newX);
        newY = this.snapToGrid(newY);
        newWidth = this.snapToGrid(newWidth);
        newHeight = this.snapToGrid(newHeight);

        // Minimum size
        newWidth = Math.max(0.1, newWidth);
        newHeight = Math.max(0.1, newHeight);

        // Clamp to die bounds
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        newWidth = Math.min(newWidth, this.currentDie.dimensions.width - newX);
        newHeight = Math.min(newHeight, this.currentDie.dimensions.height - newY);

        // Update component
        comp.position.x = newX;
        comp.position.y = newY;
        comp.dimensions.width = newWidth;
        comp.dimensions.height = newHeight;

        // Re-render
        this.render(true);

        // Update resize handles to follow the component
        this.showResizeHandles(comp);
    }

    /**
     * Finish component resize
     */
    finishComponentResize() {
        if (this.isResizingComponent) {
            console.log('[DieDesigner] Finished resizing');
            this.isResizingComponent = false;
            this.resizeHandle = null;
            this.resizeStart = null;

            if (this.onDieModified) {
                this.onDieModified(this.currentDie);
            }
        }
    }

    /**
     * Snap to grid
     */
    snapToGrid(value) {
        return Math.round(value / this.gridSize) * this.gridSize;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ignore if typing in input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Ctrl+C - Copy selected component (only works with single selection)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                if (this.selectedComponents.length === 1) {
                    this.copySelectedComponent();
                    console.log('[DieDesigner] Copied component via Ctrl+C');
                } else if (this.selectedComponents.length > 1) {
                    console.log('[DieDesigner] Cannot copy multiple components at once');
                }
            }

            // Ctrl+V - Paste copied component at mouse position
            else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                if (this.copiedComponent) {
                    // We need mouse position - store it during mousemove
                    if (this.lastMousePos) {
                        const pos = this.screenToMm(this.lastMousePos.x, this.lastMousePos.y);

                        // Snap to grid
                        let x = this.snapToGrid(pos.x);
                        let y = this.snapToGrid(pos.y);

                        // Clamp to die boundaries
                        x = Math.max(0, Math.min(x, this.currentDie.dimensions.width - this.copiedComponent.dimensions.width));
                        y = Math.max(0, Math.min(y, this.currentDie.dimensions.height - this.copiedComponent.dimensions.height));

                        // Check for overlap
                        if (!this.checkOverlap(x, y, this.copiedComponent.dimensions.width, this.copiedComponent.dimensions.height)) {
                            // Create new component
                            const newComponent = {
                                id: Date.now().toString(),
                                type: this.copiedComponent.type,
                                name: this.generateComponentName(this.copiedComponent.type),
                                position: { x, y },
                                dimensions: {
                                    width: this.copiedComponent.dimensions.width,
                                    height: this.copiedComponent.dimensions.height
                                }
                            };

                            this.addComponent(newComponent);
                            console.log('[DieDesigner] Pasted component via Ctrl+V at', x, y);
                        } else {
                            console.log('[DieDesigner] Cannot paste - overlaps existing component');
                        }
                    }
                }
            }

            // Delete / Backspace - Remove selected component(s)
            else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                if (this.selectedComponents.length > 0) {
                    const count = this.selectedComponents.length;
                    this.removeSelectedComponent();
                    console.log(`[DieDesigner] Deleted ${count} component(s) via Delete key`);
                }
            }

            // Escape - Deselect component / cancel operation
            else if (e.key === 'Escape') {
                e.preventDefault();
                if (this.selectedComponents.length > 0) {
                    this.deselectAll();
                    console.log('[DieDesigner] Deselected component(s) via Escape');
                } else if (this.currentTool === 'draw' && this.isDrawing) {
                    this.cancelDrawing();
                    console.log('[DieDesigner] Cancelled drawing via Escape');
                } else if (this.currentTool === 'copy') {
                    this.copiedComponent = null;
                    this.copyPreview.clear();
                    this.setTool('select');
                    if (this.onToolChanged) {
                        this.onToolChanged('select');
                    }
                    console.log('[DieDesigner] Cancelled copy mode via Escape');
                }
            }
        });

        // Track mouse position for Ctrl+V
        this.app.view.addEventListener('mousemove', (e) => {
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        });
    }

    /**
     * Deselect current component
     */
    deselectComponent() {
        if (this.selectedComponent) {
            this.selectedComponent = null;
            this.hideResizeHandles();
            this.render(true); // Re-render to remove selection highlight

            if (this.onComponentSelected) {
                this.onComponentSelected(null);
            }
        }
    }

    /**
     * Destroy
     */
    destroy() {
        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
    }
}
