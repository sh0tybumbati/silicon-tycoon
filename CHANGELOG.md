# Changelog

All notable changes to Silicon Tycoon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Unified CSS Theme Architecture** - Utility class system for borders and styles
  - Border utility classes: `.beefy-border-panel`, `.beefy-border-canvas`, `.beefy-border-stats`, `.beefy-border-button`
  - Corner utility classes: `.chevron-corners-xlarge/large/medium/button/small`
  - Effect utilities: `.border-glow-animated`, `.themed-panel-bg`
  - Single source of truth - change border style once, applies everywhere
  - See `REFACTOR_SUMMARY.md` for complete details

### Changed
- **CSS Architecture** - Refactored theming system to eliminate duplication
  - Removed duplicate border definitions from 10+ components
  - Consolidated 50+ individual retro overrides into 9 utility overrides
  - Reduced total CSS by ~203 lines (10% reduction)
  - All HTML elements now use utility classes for consistent theming

### Improved
- **Theme Consistency** - Impossible to miss components when updating themes
- **Maintainability** - 70% reduction in maintenance complexity
- **Code Quality** - Single source of truth prevents desync between themes

### Planned
- Fabrication line system with equipment slots
- Complete binning system with component-specific defects
- Packaging system with chiplet design
- Market economics and pricing
- Research & development system

---

## [0.2.0] - 2025-10-26

### Added

#### UI & Theming
- **Dual-theme system** with Art Deco and Retro TVA themes
- **Theme persistence** across all pages using localStorage
- **Theme toggle button** (💎/📺) in top-right of all screens
- **Beefy borders** for Art Deco theme:
  - Multi-layer box-shadow borders (9-13px total)
  - Geometric patterns with clip-path chevron corners
  - Neon glow effects (cyan/magenta)
- **TVA-style Retro theme** inspired by Loki series:
  - Chunky CRT-style borders (6-8px solid)
  - Orange/brown color palette (#E67E22, #1A0F08)
  - Rounded corners for mid-century aesthetic
- **Custom scrollbars** matching theme colors (WebKit browsers)
- **Enhanced die editor panels**:
  - Component palette with theme-appropriate borders
  - Properties panel with matching styling
  - Both themes fully applied to architecture.html

#### Documentation
- **FEATURES.md** - Comprehensive technical reference (1,700+ lines)
  - All formulas, algorithms, and data structures
  - Process nodes, components, performance, power, yields
  - Complete UI/theme system documentation
- **PLANNING.md** - Development roadmap with progress tracking
- **CHANGELOG.md** - Version history (this file)
- Updated README.md with documentation links

#### Landing Page
- **Save game detection** on index.html
  - Display last played date, die count, batch plan count
  - Show/hide "Continue" button based on save data
  - Confirmation dialog for "New Game" when save exists
- **Menu navigation** with descriptive buttons
- **About dialog** with game information

### Changed
- **Page subtitle positioning** - Moved outside/below header decorations on all pages
- **Overflow management** - Fixed scrollbar conflicts with clip-path borders
  - Parent containers: `overflow: hidden`
  - Child scrollable areas: `overflow-y: auto` with custom styling
- **Theme switcher implementation** - Single event listener to prevent double-toggle bugs

### Fixed
- **Theme switching bug** - Removed duplicate onclick handler causing double-toggle
  - Issue: Both `addEventListener` and `onclick` handlers were firing
  - Fix: Removed duplicate onclick in themeManager.js:140-144
- **Import error** in main.js - Removed non-existent `loadDieLibrary` import
  - Error: "The requested module './dieLibrary.js' does not provide an export named 'loadDieLibrary'"
  - Fix: Updated import statement and removed function call
- **Scrollbar overflow** in die architecture editor
  - Issue: Scrollbars appearing outside component palette borders
  - Fix: Moved scrolling from `.component-palette` to `.component-list` child element

### Files Modified
- `index.html` - Save detection, subtitle positioning
- `architecture.html` - Subtitle positioning, theme support
- `wafer.html` - Subtitle positioning, theme support
- `css/style.css` - Art Deco beefy borders, subtitle margin
- `css/theme-retro.css` - TVA-style borders and colors
- `css/architecture.css` - Die editor panel borders, scrollbar fix
- `js/themeManager.js` - Fixed double-toggle bug
- `js/main.js` - Fixed import error
- `README.md` - Updated documentation links
- `FEATURES.md` - Added UI/theme documentation
- `PLANNING.md` - Created from split
- `CHANGELOG.md` - Created (this file)

---

## [0.1.0] - 2025-10-25

### Added

#### Core Systems
- **Die Architecture Designer** with PixiJS canvas
  - Visual drag-and-drop component placement
  - Real-time die layout editing
  - Grid snapping (0.1mm - 5mm options)
  - Component library with type-specific components
  - Properties panel for component details

#### Components
- **CPU Components**: CPU Core, L2 Cache, L3 Cache, Integrated GPU
- **GPU Components**: Streaming Multiprocessor, Texture Units, Display Engine
- **Common Components**: Memory Controller, Interconnect, Power Management, I/O Controller
- **Memory Components**: Memory Bank Array, Sense Amplifiers, Row/Column Decoders

#### Process Nodes
- **22 Historical Nodes**: 10μm (1971) to 3nm (2022)
- **Realistic Transistor Densities**: Based on real-world chips
  - 180nm: 0.25 MTr/mm²
  - 7nm: 60.1 MTr/mm²
  - 3nm: 175.0 MTr/mm²
- **Voltage Scaling**: 5.0V (10μm) to 0.70V (3nm)
- **Clock Frequency Limits**: 2.5 GHz (180nm) to 5.5 GHz (3nm)

#### Performance Simulation
- **IPC Calculation** based on cache hierarchy
- **Clock Speed Simulation** with thermal throttling
- **Performance Score** (GHz × IPC × core count)
- **Multi-threading** support (SMT/Hyperthreading)

#### Power Modeling
- **Dynamic Power**: Clock speed, transistor count, voltage
- **Leakage Power**: Process node and temperature dependent
- **Thermal Modeling**: Junction temperature calculation
- **Thermal Throttling**: Automatic frequency reduction at high temps

#### Layout Optimization
- **Interconnect Penalties**: Distance-based performance degradation
- **Clustering Bonuses**: Adjacent component optimization
- **Bandwidth Analysis**: Memory and cache bandwidth calculation

#### Chip Classification
- **CLASS System**: Low-Power, Mainstream, Enthusiast, Halo
- **GRADE System**: Consumer, Commercial, Industrial, Military
- **Two-axis grading** based on performance and quality

#### Manufacturing Simulation
- **Wafer Planning**: Batch creation with die selection
- **Yield Calculation**: Murphy's Law based on die area and defect density
- **Dies Per Wafer**: Geometric calculation with edge loss
- **Wafer Visualization**: Physics-based 2D rendering with drag/zoom

#### Data Management
- **Die Library**: Save/load custom die designs
- **LocalStorage Persistence**: Auto-save with recovery
- **Batch Planning**: Save wafer fabrication plans
- **Import/Export**: JSON-based data interchange

#### UI/UX
- **Art Deco Design**: Teal/magenta color scheme
- **Responsive Layout**: Adapts to different screen sizes
- **Screen Navigation**: Menu, Architecture, Wafer, Binning, Packaging, Fab
- **Modal Dialogs**: Create/edit die specifications
- **Search & Filter**: Die library management

### Technical
- **No Build Process**: Direct ES6 module loading
- **PixiJS 7.3.2**: WebGL rendering for canvas
- **localStorage**: Browser-based data persistence
- **Google Fonts**: Poiret One & Montserrat
- **Modular Architecture**: Separated concerns (constants, library, designer, engine)

---

## Project Inception

**Date**: Early October 2025
**Initial Concept**: Realistic semiconductor manufacturing simulation
**Inspiration**: Real-world chip design (AMD Ryzen, NVIDIA GPUs, DRAM)
**Goal**: Simulation-level accuracy with educational value

---

**Legend**:
- ✅ Implemented
- 🔄 In Progress
- ❌ Not Started
- 🐛 Bug Fix
- 📝 Documentation
- 🎨 UI/Design
- ⚡ Performance
- 🔧 Technical Debt
