# Die Architecture Designer - Improvements Plan

**Goal**: Polish the die designer with realistic specs and better UX

---

## 🐛 Issues Found

### **Problem 1: Unrealistic Component Sizes**

**Current behavior**: Users can draw components at any size, leading to:
- Tiny 0.5mm² CPU cores (should be ~4mm² each at 7nm)
- Massive 50mm² caches (real L3 cache is ~0.5mm² per MB)
- Unrealistic transistor counts (billions too high or too low)

**Example Bad Die**:
```
8× CPU cores @ 0.5mm² each = 4mm² → 240M transistors
Should be: 8× 4mm² = 32mm² → 1,920M transistors
```

**Root Cause**: No size constraints or guidance when drawing components

---

### **Problem 2: Spec Calculations "All Over the Place"**

**Issues**:
1. **Clock speeds** vary wildly based on random component placement
2. **Power/TDP** calculations give unrealistic values
3. **Performance scores** are meaningless (no reference point)
4. **IPC calculations** are too simplistic (just cache-based)

**Example**:
- Same die design gives 2.5 GHz one time, 4.8 GHz another time
- TDP ranges from 15W to 500W for similar dies
- Performance score: "42,000" (what does this mean?)

---

### **Problem 3: No Component Editing**

**Current**: Once placed, components are frozen
- Can't resize
- Can't rotate
- Can't change properties
- Can't see individual component stats

---

### **Problem 4: Poor UX for Layout**

**Missing Features**:
- No undo/redo
- No copy/paste
- Poor snapping (components overlap)
- No alignment guides
- No component selection feedback
- Can't delete individual components easily

---

## ✅ Solution Plan

### **Phase 1: Fix Component Sizes** (2-3 hours)

#### 1.1 Add Default Component Sizes
```javascript
const COMPONENT_DEFAULT_SIZES = {
    cpu_core: { width: 4.0, height: 4.0 },      // 16mm² per core (7nm)
    gpu_sm: { width: 3.5, height: 3.5 },        // 12mm² per SM
    l2_cache: { width: 1.0, height: 0.5 },      // 0.5mm² per MB
    l3_cache: { width: 4.0, height: 4.0 },      // 0.5mm² per MB × 32MB
    memory_controller: { width: 3.0, height: 2.0 },  // 6mm²
    interconnect: { width: 5.0, height: 1.5 },  // 7.5mm²
    power_management: { width: 2.0, height: 2.0 }, // 4mm²
    io_controller: { width: 4.0, height: 2.0 }  // 8mm²
};
```

#### 1.2 Component Templates by Process Node
Different sizes for different nodes:
- **7nm CPU core**: 4mm² (Zen 4 reference)
- **3nm CPU core**: 2.5mm² (smaller at advanced node)
- **180nm CPU core**: 25mm² (ancient large die)

#### 1.3 Smart Defaults When Drawing
- Snap to default size when user starts drawing
- Show "recommended size" tooltip
- Warn if component is 50%+ off expected size

---

### **Phase 2: Fix Spec Calculations** (3-4 hours)

#### 2.1 Realistic Clock Speed Formulas
```javascript
// Base clock depends on:
// 1. Process node max (fixed)
// 2. Die area (larger = harder to clock)
// 3. Core count (more cores = lower clocks)
// 4. Power budget (high TDP = can run faster)

const baseSpeed = MAX_CLOCK[node] *
    dieSizeMultiplier *      // 0.85-1.0
    coreCountMultiplier *    // 0.90-1.0
    powerBudgetMultiplier;   // 0.85-1.10
```

#### 2.2 Realistic Power Calculations
Use actual Dennard scaling breakdown:
```javascript
Power = (Capacitance × Voltage² × Frequency) + LeakagePower

// Real-world TDP ranges:
// Desktop CPU (8-core): 65-170W
// Server CPU (64-core): 200-400W
// Mobile CPU (4-core): 15-45W
// GPU (large): 250-450W
```

#### 2.3 Meaningful Performance Metrics
Instead of arbitrary "42,000 points":
```
Single-Thread: 2,100 (Cinebench R23 equivalent)
Multi-Thread: 16,800 (8× cores with 90% scaling)
GPU Compute: 45 TFLOPS (shader count × frequency)
```

#### 2.4 Better IPC Calculation
Based on actual architecture features:
```javascript
Base IPC = 4.0 (Zen 4 baseline)

Modifiers:
+ L1 cache per core: +0.0 (assumed standard)
+ L2 cache (1MB/core): +0.2
+ L3 cache (4MB/core): +0.3
+ Memory bandwidth (>100GB/s): +0.1
+ Branch predictor (assumed): +0.0
= Final IPC: ~4.6
```

---

### **Phase 3: Component Editing** (2-3 hours)

#### 3.1 Component Selection
- Click component → highlight with border
- Show component properties in right panel
- Display component-specific stats

#### 3.2 Resize Handles
- Add corner/edge handles when selected
- Drag to resize (with snap to grid)
- Show live area and transistor count while resizing
- Min/max size constraints

#### 3.3 Component Properties Panel
```
┌─ SELECTED COMPONENT ─────────┐
│ Type: CPU Core #3             │
│ Size: 4.0 × 4.0 mm (16mm²)   │
│ Position: (12.5, 8.0) mm      │
│ Transistors: 961M             │
│                               │
│ [Resize: Width] [4.0] mm      │
│ [Resize: Height] [4.0] mm     │
│                               │
│ [Delete Component]            │
└───────────────────────────────┘
```

#### 3.4 Component Configuration
Different components have different configs:
- **CPU Core**: SMT enabled (yes/no), core type (P/E)
- **Cache**: Size (MB), latency cycles
- **Memory Controller**: Channels (2/4/8), type (DDR4/DDR5)

---

### **Phase 4: Better UX** (2-3 hours)

#### 4.1 Undo/Redo System
```javascript
class UndoManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
    }

    addAction(action) {
        // Clear redo history
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(action);
        this.currentIndex++;
    }

    undo() {
        if (this.currentIndex >= 0) {
            this.history[this.currentIndex].undo();
            this.currentIndex--;
        }
    }

    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.history[this.currentIndex].redo();
        }
    }
}
```

**Actions**:
- Add component
- Delete component
- Move component
- Resize component

**Hotkeys**:
- Ctrl+Z: Undo
- Ctrl+Y / Ctrl+Shift+Z: Redo

#### 4.2 Copy/Paste
- Ctrl+C: Copy selected component
- Ctrl+V: Paste at mouse position
- Duplicate entire component with same size/config

#### 4.3 Better Snapping
```javascript
// Snap options:
1. Grid snap (0.1mm, 0.5mm, 1mm, 2mm, 5mm)
2. Component edge snap (align to other component edges)
3. Center snap (align centers)
4. Distribute evenly (space components equally)
```

#### 4.4 Alignment Guides
- Show dashed lines when component aligns with others
- Snap to alignment (magnetism)
- Show distance measurements

#### 4.5 Visual Feedback
- Highlight selected component with glow
- Show bounding box with dimensions
- Color-code components by type
- Show warning icons for issues

---

### **Phase 5: Die Validation** (1-2 hours)

#### 5.1 Validation Rules
```javascript
const VALIDATION_RULES = {
    cpu: {
        required: ['cpu_core', 'l2_cache', 'memory_controller'],
        warnings: {
            noCoreCluster: "Cores should be clustered for better latency",
            noL3: "L3 cache highly recommended for performance",
            asymmetric: "Asymmetric core placement affects thermal balance",
            tooManyMemControllers: "More than 2 memory controllers is unusual",
        }
    },
    gpu: {
        required: ['gpu_sm', 'memory_controller', 'display_engine'],
        warnings: {
            fewSMs: "< 20 SMs results in low performance for GPU",
            noL2: "L2 cache improves GPU memory efficiency",
        }
    }
};
```

#### 5.2 Warning Display
```
⚠ DESIGN WARNINGS
─────────────────
• Cores are widely spaced (>8mm avg)
  Impact: +15% interconnect penalty

• No L3 cache detected
  Impact: -20% IPC, poor memory latency

• Total TDP exceeds 250W
  Impact: May require exotic cooling
```

---

### **Phase 6: Live Performance Preview** (1 hour)

#### 6.1 Real-Time Stats
Update performance metrics as user draws:
```
┌─ LIVE STATS ─────────────┐
│ Transistors: 4,592M      │
│ Die Area: 68.2mm²        │
│ Utilization: 97.4%       │
│                          │
│ Est. Clock: 4.8 GHz      │
│ Est. TDP: 142W           │
│ Est. Performance: ⭐⭐⭐⭐  │
│                          │
│ Efficiency: 85% 🟢       │
└──────────────────────────┘
```

#### 6.2 Performance Rating
- ⭐ Low-End (< 5,000 points)
- ⭐⭐ Mainstream (5,000-15,000)
- ⭐⭐⭐ High-End (15,000-30,000)
- ⭐⭐⭐⭐ Enthusiast (30,000-50,000)
- ⭐⭐⭐⭐⭐ Halo/HEDT (> 50,000)

---

## 📋 Implementation Checklist

### **Quick Wins** (Do First - 2-3 hours)
- [ ] Add default component sizes
- [ ] Fix clock speed formula
- [ ] Add component selection highlighting
- [ ] Add delete selected component (Delete key)
- [ ] Add basic validation warnings

### **Medium Priority** (3-4 hours)
- [ ] Implement undo/redo
- [ ] Add component resize handles
- [ ] Fix power/TDP calculations
- [ ] Add component property panel
- [ ] Improve snapping system

### **Polish** (2-3 hours)
- [ ] Add copy/paste
- [ ] Add alignment guides
- [ ] Add live performance preview
- [ ] Add performance rating stars
- [ ] Add detailed validation rules

### **Nice-to-Have** (Future)
- [ ] Component rotation
- [ ] Component templates (save/load common blocks)
- [ ] Auto-layout suggestions
- [ ] Thermal heatmap visualization
- [ ] Power density heatmap

---

## 🎯 Expected Results

**Before**:
- ❌ Components any random size
- ❌ Specs make no sense
- ❌ Can't edit after placement
- ❌ No undo/feedback

**After**:
- ✅ Realistic component sizes with guidance
- ✅ Accurate specs matching real CPUs/GPUs
- ✅ Full component editing (resize, configure, delete)
- ✅ Undo/redo, copy/paste, alignment
- ✅ Validation warnings
- ✅ Live performance preview

**Target Experience**:
User can design a realistic Ryzen 9 9950X equivalent:
- 8× 4mm² CPU cores
- 4mm² L2 cache (1MB per core)
- 16mm² L3 cache (32MB shared)
- 6mm² memory controller
- ~70mm² total die
- **Result**: 4.2 GHz base, 5.4 GHz boost, 170W TDP ✅

---

**Ready to implement?** Start with Quick Wins for immediate impact! 🚀
