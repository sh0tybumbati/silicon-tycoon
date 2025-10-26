# Silicon Tycoon

A realistic semiconductor design and manufacturing simulation game.

## Overview

Silicon Tycoon lets you design custom silicon dies (CPUs, GPUs, memory, etc.), simulate realistic manufacturing processes, and manage a semiconductor company. The game features simulation-level realism based on real-world semiconductor physics and industry data.

## Features

### ✅ Currently Implemented

- **Die Designer**: Visual canvas-based die layout tool with PixiJS
- **Component Library**: CPU cores, GPU SMs, cache, memory controllers, I/O, power management
- **Process Nodes**: 180nm to 3nm with realistic transistor densities
- **Performance Simulation**: Clock speeds, IPC, performance scoring
- **Power Modeling**: Dynamic power + leakage with thermal throttling
- **Layout Optimization**: Interconnect penalties, clustering bonuses, bandwidth analysis
- **Chip Classification**: Two-axis system (CLASS: Low-Power to Halo, GRADE: Consumer to Military)
- **Manufacturing Yield**: Murphy's Law based yield calculation

### 🔄 In Development

- **Wafer Planning**: Create batch plans, calculate dies per wafer
- **Fabrication**: Multi-stage fab lines with equipment slots
- **Binning**: Component-specific defect distribution and SKU creation
- **Packaging**: Product naming, chiplet designs, socket configuration

### Visual Themes
- **Modern (Default)**: Clean, professional flat design with soft colors
- **CyberDeco**: Neon cyberpunk aesthetic with teal/magenta colors and geometric patterns
- **TVA**: Retro 60s-70s warm orange/brown palette with rounded corners
- **Apple II**: Vintage computer terminal with green phosphor display
- Fully responsive mobile-optimized layout

## Getting Started

1. Open `architecture.html` in a modern web browser
2. Click "CREATE NEW DIE" to start designing
3. Select a process node and add components to the canvas
4. Review performance metrics in the properties panel
5. Save your designs to the die library

### Optional: Local Web Server

If you encounter CORS issues with ES6 modules:

```bash
# Using Python
cd "Silicon Tycoon"
python -m http.server 8000

# Using Node.js
npx http-server -p 8000
```

Then open: http://localhost:8000/architecture.html

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Rendering**: PixiJS 7.3.2 for WebGL canvas
- **Storage**: Browser localStorage with auto-recovery
- **Design**: Multiple theme options (Modern, CyberDeco, Retro, Apple II)
- **Fonts**: Poiret One & Montserrat from Google Fonts
- **Mobile**: Fully responsive with touch-optimized controls

## Documentation

- **[README.md](README.md)** (this file) - Getting started guide
- **[FEATURES.md](FEATURES.md)** - Technical reference for all features (formulas, algorithms, data structures)
- **[PLANNING.md](PLANNING.md)** - Development roadmap with progress tracking
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[REFACTOR_SUMMARY.md](REFACTOR_SUMMARY.md)** - CSS theme architecture refactor details

## Project Structure

```
Silicon Tycoon/
├── index.html                # Landing page / menu
├── architecture.html         # Die designer screen
├── wafer.html                # Wafer planning screen
├── css/
│   ├── style.css             # Base styles (Modern/Vanilla theme)
│   ├── theme-deco.css        # CyberDeco cyberpunk theme
│   ├── theme-retro.css       # Retro 60s-70s TVA theme
│   ├── theme-apple2.css      # Apple II vintage terminal theme
│   ├── theme-selector.css    # Radial theme picker widget
│   └── architecture.css      # Die designer specific styles
├── js/
│   ├── constants.js          # Process nodes, densities, power tables
│   ├── dieLibrary.js         # Die data management
│   ├── dieDesigner.js        # PixiJS canvas controller
│   ├── architecture.js       # Main app + performance engine
│   ├── waferPlanner.js       # Wafer yield calculations
│   ├── renderer.js           # Wafer visualization
│   ├── physics.js            # Physics engine
│   ├── themeManager.js       # Theme switching system
│   └── main.js               # Wafer app entry point
├── FEATURES.md               # Technical feature documentation
├── PLANNING.md               # Development roadmap
├── CHANGELOG.md              # Version history
└── README.md                 # This file
```

## Development

No build process required - just open the HTML files in a browser. The game uses ES6 modules loaded directly by the browser.

### Key Files

- `js/constants.js` - Industry data and simulation parameters
- `js/architecture.js` - Performance calculation engine
- `js/dieDesigner.js` - Canvas interaction and rendering
- **[FEATURES.md](FEATURES.md)** - Detailed technical specifications
- **[PLANNING.md](PLANNING.md)** - Implementation roadmap

## Roadmap

See **[PLANNING.md](PLANNING.md)** for the complete development roadmap with progress tracking.

**Phase 1**: Wafer Planning (Next)
**Phase 2**: Fabrication Lines
**Phase 3**: Binning & SKU Creation
**Phase 4**: Packaging & Products
**Phase 5**: Market & Economics

## License

All rights reserved.

## Version

Current: v0.3.1 Alpha (Architecture complete, Wafer Planning 50%, Theme system with 4 themes)

---

**Last Updated**: 2025-10-27
