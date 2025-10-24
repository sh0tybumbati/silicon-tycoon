// Silicon Tycoon - PixiJS Renderer for Wafer Visualization

import { COLORS } from './constants.js';

export class WaferRenderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.waferGraphics = null;
        this.diesContainer = null;
        this.currentWaferData = null;

        // Zoom and pan state
        this.viewport = null;
        this.zoomLevel = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 10.0;
        this.panX = 0;
        this.panY = 0;

        // Touch state for pinch zoom
        this.touches = {};
        this.lastDistance = 0;

        // Current tooltip
        this.currentTooltip = null;

        this.init();
    }

    init() {
        // Ensure container has dimensions
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        // Create PixiJS application
        this.app = new PIXI.Application({
            width: width,
            height: height,
            backgroundColor: 0x0d0d0d,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        this.container.appendChild(this.app.view);

        // Create viewport container for zoom/pan
        this.viewport = new PIXI.Container();
        this.app.stage.addChild(this.viewport);

        // Create wafer graphics FIRST (background layer)
        this.waferGraphics = new PIXI.Graphics();
        this.viewport.addChild(this.waferGraphics);

        // Create container for dies SECOND (foreground layer)
        this.diesContainer = new PIXI.Container();
        this.viewport.addChild(this.diesContainer);

        // Setup zoom and pan controls
        this.setupZoomPan();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        if (!this.app) return;

        // Store current zoom and pan state
        const currentZoom = this.zoomLevel;
        const currentPanX = this.viewport.x;
        const currentPanY = this.viewport.y;

        this.app.renderer.resize(
            this.container.clientWidth,
            this.container.clientHeight
        );

        // Re-render current wafer if exists, but preserve zoom/pan
        if (this.currentWaferData) {
            this.renderWafer(this.currentWaferData, true); // true = preserve view

            // Restore zoom and pan
            this.zoomLevel = currentZoom;
            this.viewport.scale.set(currentZoom, currentZoom);
            this.viewport.x = currentPanX;
            this.viewport.y = currentPanY;
        }
    }

    /**
     * Render wafer with dies
     * @param {object} waferData - Wafer configuration and die data
     * @param {boolean} preserveView - If true, don't reset zoom and pan
     */
    renderWafer(waferData, preserveView = false) {
        this.currentWaferData = waferData;

        // Clear previous render
        this.waferGraphics.clear();
        this.diesContainer.removeChildren();

        // Reset view (zoom and pan) only if not preserving
        if (!preserveView) {
            this.resetView();
            // Hide any open tooltip
            this.hideTooltip();
        }

        const {
            waferDiameterMm,
            dies,
            dieWidthMm,
            dieHeightMm
        } = waferData;

        // Calculate scale to fit wafer in canvas
        const canvasWidth = this.app.renderer.width;
        const canvasHeight = this.app.renderer.height;

        // Use smaller margin on mobile devices
        const margin = canvasWidth < 768 ? 10 : 50;

        const maxDimension = Math.min(canvasWidth, canvasHeight) - 2 * margin;
        const scale = maxDimension / waferDiameterMm;

        console.log('Canvas:', canvasWidth, 'x', canvasHeight, 'Margin:', margin, 'Scale:', scale);

        // Center position
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Draw wafer circle
        this.drawWafer(centerX, centerY, waferDiameterMm / 2 * scale);

        // Draw dies
        this.drawDies(dies, centerX, centerY, scale, dieWidthMm, dieHeightMm);
    }

    /**
     * Draw the wafer circle
     */
    drawWafer(centerX, centerY, radiusPixels) {
        const g = this.waferGraphics;

        // Outer glow
        g.beginFill(0x00CED1, 0.05);
        g.drawCircle(centerX, centerY, radiusPixels + 10);
        g.endFill();

        // Main wafer body - silicon gray with slight teal tint
        g.beginFill(0x2a2a3e);
        g.drawCircle(centerX, centerY, radiusPixels);
        g.endFill();

        // Teal border
        g.lineStyle(3, 0x00CED1, 1);
        g.drawCircle(centerX, centerY, radiusPixels);

        // Inner magenta accent circle
        g.lineStyle(1, 0xFF00FF, 0.3);
        g.drawCircle(centerX, centerY, radiusPixels - 5);

        // Draw notch (wafer orientation indicator)
        this.drawWaferNotch(centerX, centerY, radiusPixels);
    }

    /**
     * Draw wafer notch for orientation
     */
    drawWaferNotch(centerX, centerY, radiusPixels) {
        const g = this.waferGraphics;
        const notchSize = radiusPixels * 0.05;

        g.lineStyle(0);
        g.beginFill(0x0d0d0d);

        // Draw small notch at bottom
        const notchY = centerY + radiusPixels;
        g.moveTo(centerX - notchSize, notchY - notchSize);
        g.lineTo(centerX + notchSize, notchY - notchSize);
        g.lineTo(centerX, notchY + notchSize);
        g.closePath();
        g.endFill();
    }

    /**
     * Draw all dies on the wafer
     */
    drawDies(dies, centerX, centerY, scale, dieWidthMm, dieHeightMm) {
        const dieWidthPx = dieWidthMm * scale;
        const dieHeightPx = dieHeightMm * scale;

        console.log('Drawing', dies.length, 'dies at', dieWidthPx, 'x', dieHeightPx, 'pixels');

        dies.forEach((die, index) => {
            this.drawDie(
                die,
                centerX,
                centerY,
                scale,
                dieWidthPx,
                dieHeightPx,
                index
            );
        });

        console.log('Dies container has', this.diesContainer.children.length, 'children');
    }

    /**
     * Draw a single die
     */
    drawDie(die, centerX, centerY, scale, widthPx, heightPx, index) {
        const graphics = new PIXI.Graphics();

        // Convert die position from mm to pixels
        const diePosX = centerX + (die.x * scale);
        const diePosY = centerY + (die.y * scale);

        // Draw die rectangle
        const color = die.category.color;
        const alpha = 1.0; // Full opacity for maximum visibility

        // Ensure minimum visible size for tiny dies
        const minSize = 3; // minimum 3 pixels for better visibility
        const drawWidth = Math.max(widthPx, minSize);
        const drawHeight = Math.max(heightPx, minSize);

        // Border FIRST - draw thick border for visibility
        const borderColor = 0x000000; // Black border
        const borderWidth = Math.max(2, widthPx < 10 ? 1 : 2);

        graphics.lineStyle(borderWidth, borderColor, 1.0);
        graphics.beginFill(color, alpha);
        graphics.drawRect(
            diePosX - drawWidth / 2,
            diePosY - drawHeight / 2,
            drawWidth,
            drawHeight
        );
        graphics.endFill();

        // Make interactive for tooltips
        graphics.interactive = true;
        graphics.buttonMode = true;

        // Click to show persistent tooltip
        graphics.on('pointerdown', (event) => {
            event.stopPropagation();
            this.showDieTooltip(die, diePosX, diePosY, true);
        });

        // Highlight on hover
        graphics.on('pointerover', () => {
            graphics.tint = 0xCCCCCC;
        });

        graphics.on('pointerout', () => {
            graphics.tint = 0xFFFFFF;
        });

        this.diesContainer.addChild(graphics);
    }

    /**
     * Show tooltip with die information
     */
    showDieTooltip(die, x, y, persistent = false) {
        // Remove existing tooltip
        this.hideTooltip();

        const tooltip = new PIXI.Container();
        tooltip.name = 'tooltip';

        // Background
        const bg = new PIXI.Graphics();
        bg.beginFill(0x1a1a1a, 0.98);
        bg.lineStyle(3, 0x00CED1, 1);
        bg.drawRoundedRect(0, 0, 220, 140, 8);
        bg.endFill();

        // Add close button if persistent
        if (persistent) {
            const closeBtn = new PIXI.Graphics();
            closeBtn.beginFill(0xFF0000, 0.8);
            closeBtn.drawCircle(200, 20, 12);
            closeBtn.endFill();

            const closeX = new PIXI.Text('×', {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xFFFFFF,
                fontWeight: 'bold'
            });
            closeX.anchor.set(0.5);
            closeX.position.set(200, 20);

            closeBtn.interactive = true;
            closeBtn.buttonMode = true;
            closeBtn.on('pointerdown', (event) => {
                event.stopPropagation();
                this.hideTooltip();
            });

            tooltip.addChild(closeBtn);
            tooltip.addChild(closeX);
        }

        tooltip.addChild(bg);

        // Text style
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Montserrat, Arial',
            fontSize: 13,
            fill: 0xF5F5DC,
            wordWrap: true,
            wordWrapWidth: 190
        });

        // Die information
        const infoText = new PIXI.Text(
            `Die ID: #${die.id}\n` +
            `Category: ${die.category.label}\n` +
            `Defects: ${die.defectCount}\n` +
            `Functionality: ${(die.functionality * 100).toFixed(1)}%\n` +
            `Edge Exclusion: ${die.inEdgeExclusion ? 'Yes' : 'No'}`,
            textStyle
        );
        infoText.position.set(10, 40);

        tooltip.addChild(infoText);

        // Position tooltip - convert viewport coordinates to stage coordinates
        const globalPos = this.viewport.toGlobal(new PIXI.Point(x, y));
        tooltip.position.set(globalPos.x + 10, globalPos.y + 10);

        // Keep tooltip on screen
        if (tooltip.x + 220 > this.app.renderer.width) {
            tooltip.x = globalPos.x - 230;
        }
        if (tooltip.y + 140 > this.app.renderer.height) {
            tooltip.y = globalPos.y - 150;
        }

        // Store reference
        this.currentTooltip = tooltip;

        this.app.stage.addChild(tooltip);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = this.app.stage.getChildByName('tooltip');
        if (tooltip) {
            this.app.stage.removeChild(tooltip);
        }
    }

    /**
     * Setup zoom and pan controls
     */
    setupZoomPan() {
        // Mouse wheel zoom
        this.app.view.addEventListener('wheel', (e) => {
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

        // Touch events for pinch zoom
        this.app.view.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.touches = {
                    touch1: { x: e.touches[0].clientX, y: e.touches[0].clientY },
                    touch2: { x: e.touches[1].clientX, y: e.touches[1].clientY }
                };
                this.lastDistance = this.getTouchDistance();
            }
        }, { passive: false });

        this.app.view.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();

                const currentDistance = Math.sqrt(
                    Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
                    Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
                );

                if (this.lastDistance > 0) {
                    const delta = currentDistance / this.lastDistance;
                    const newZoom = this.zoomLevel * delta;

                    if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
                        // Get center point between touches
                        const rect = this.app.view.getBoundingClientRect();
                        const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
                        const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

                        this.zoomToPoint(centerX, centerY, newZoom);
                    }
                }

                this.lastDistance = currentDistance;
            }
        }, { passive: false });

        this.app.view.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                this.touches = {};
                this.lastDistance = 0;
            }
        });

        // Pan with drag
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let viewportStart = { x: 0, y: 0 };

        this.app.view.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                isDragging = true;
                dragStart = { x: e.clientX, y: e.clientY };
                viewportStart = { x: this.viewport.x, y: this.viewport.y };
                this.app.view.style.cursor = 'grabbing';
            }
        });

        this.app.view.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;

                this.viewport.x = viewportStart.x + dx;
                this.viewport.y = viewportStart.y + dy;
            }
        });

        this.app.view.addEventListener('mouseup', () => {
            isDragging = false;
            this.app.view.style.cursor = 'default';
        });

        this.app.view.addEventListener('mouseleave', () => {
            isDragging = false;
            this.app.view.style.cursor = 'default';
        });

        // Touch pan (single finger)
        let touchStartPos = null;
        let touchViewportStart = null;

        this.app.view.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                touchViewportStart = { x: this.viewport.x, y: this.viewport.y };
            }
        });

        this.app.view.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && touchStartPos) {
                e.preventDefault();
                const dx = e.touches[0].clientX - touchStartPos.x;
                const dy = e.touches[0].clientY - touchStartPos.y;

                this.viewport.x = touchViewportStart.x + dx;
                this.viewport.y = touchViewportStart.y + dy;
            }
        }, { passive: false });

        this.app.view.addEventListener('touchend', () => {
            touchStartPos = null;
            touchViewportStart = null;
        });

        // Click on stage to close tooltip
        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', () => {
            this.hideTooltip();
        });
    }

    /**
     * Get distance between two touches
     */
    getTouchDistance() {
        if (!this.touches.touch1 || !this.touches.touch2) return 0;

        return Math.sqrt(
            Math.pow(this.touches.touch2.x - this.touches.touch1.x, 2) +
            Math.pow(this.touches.touch2.y - this.touches.touch1.y, 2)
        );
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
     * Reset zoom and pan
     */
    resetView() {
        this.zoomLevel = 1.0;
        this.viewport.scale.set(1.0, 1.0);
        this.viewport.x = 0;
        this.viewport.y = 0;
    }

    /**
     * Destroy renderer
     */
    destroy() {
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true, baseTexture: true });
            this.app = null;
        }
    }
}
