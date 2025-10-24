// Silicon Tycoon - Die Library Management System

export const DIE_TYPES = {
    CPU: { id: 'cpu', label: 'CPU', icon: '🖥️', color: 0x00CED1 },
    GPU: { id: 'gpu', label: 'GPU', icon: '🎮', color: 0xFF00FF },
    MEMORY: { id: 'memory', label: 'Memory', icon: '💾', color: 0xFFD700 },
    IO_DIE: { id: 'io_die', label: 'I/O Die', icon: '🔌', color: 0x20B2AA },
    NPU: { id: 'npu', label: 'NPU', icon: '🧠', color: 0xDA70D6 },
    CUSTOM: { id: 'custom', label: 'Custom', icon: '🔧', color: 0xC71585 }
};

export const COMPONENT_TYPES = {
    // CPU Components
    CPU_CORE: { id: 'cpu_core', label: 'CPU Core', color: '#00CED1', category: 'cpu' },
    L2_CACHE: { id: 'l2_cache', label: 'L2 Cache', color: '#20B2AA', category: 'common' },
    L3_CACHE: { id: 'l3_cache', label: 'L3 Cache', color: '#008B8B', category: 'common' },
    MEMORY_CONTROLLER: { id: 'mem_ctrl', label: 'Memory Controller', color: '#FFD700', category: 'common' },
    INTERCONNECT: { id: 'interconnect', label: 'Interconnect', color: '#DA70D6', category: 'common' },
    POWER_MGMT: { id: 'power_mgmt', label: 'Power Management', color: '#FFA500', category: 'common' },
    IO_CONTROLLER: { id: 'io_ctrl', label: 'I/O Controller', color: '#FF00FF', category: 'common' },
    IGPU: { id: 'igpu', label: 'Integrated GPU', color: '#C71585', category: 'cpu' },

    // GPU Components
    GPU_SM: { id: 'gpu_sm', label: 'GPU SM/CU', color: '#FF00FF', category: 'gpu' },
    TEXTURE_UNIT: { id: 'texture_unit', label: 'Texture Units', color: '#DA70D6', category: 'gpu' },
    DISPLAY_ENGINE: { id: 'display_engine', label: 'Display Engine', color: '#C71585', category: 'gpu' },

    // Memory Components
    MEMORY_ARRAY: { id: 'memory_array', label: 'Memory Array', color: '#FFD700', category: 'memory' },
    CONTROL_LOGIC: { id: 'control_logic', label: 'Control Logic', color: '#FFA500', category: 'memory' }
};

// Required components for each die type
export const DIE_REQUIREMENTS = {
    cpu: {
        required: [
            { type: 'cpu_core', minCount: 1, label: 'CPU Core(s)' },
            { type: 'l2_cache', minCount: 1, label: 'L2 Cache' },
            { type: 'mem_ctrl', minCount: 1, label: 'Memory Controller' },
            { type: 'power_mgmt', minCount: 1, label: 'Power Management' }
        ],
        optional: [
            { type: 'l3_cache', label: 'L3 Cache' },
            { type: 'igpu', label: 'Integrated GPU' },
            { type: 'io_ctrl', label: 'I/O Controller' }
        ]
    },
    gpu: {
        required: [
            { type: 'gpu_sm', minCount: 1, label: 'GPU SM/CU' },
            { type: 'mem_ctrl', minCount: 1, label: 'Memory Controller' },
            { type: 'power_mgmt', minCount: 1, label: 'Power Management' }
        ],
        optional: [
            { type: 'texture_unit', label: 'Texture Units' },
            { type: 'display_engine', label: 'Display Engine' }
        ]
    },
    memory: {
        required: [
            { type: 'memory_array', minCount: 1, label: 'Memory Array' },
            { type: 'control_logic', minCount: 1, label: 'Control Logic' }
        ],
        optional: []
    },
    io_die: {
        required: [
            { type: 'io_ctrl', minCount: 1, label: 'I/O Controller' },
            { type: 'interconnect', minCount: 1, label: 'Interconnect' }
        ],
        optional: []
    },
    npu: {
        required: [
            { type: 'power_mgmt', minCount: 1, label: 'Power Management' }
        ],
        optional: []
    },
    custom: {
        required: [],
        optional: []
    }
};

export class DieLibrary {
    constructor() {
        console.log('[DieLibrary] Initializing...');
        this.dies = [];
        try {
            this.loadFromStorage();
            console.log('[DieLibrary] Loaded', this.dies.length, 'dies');
        } catch (e) {
            console.error('[DieLibrary] Critical error during initialization:', e);
            console.error('[DieLibrary] Stack trace:', e.stack);
            // Reset to defaults on any error
            this.dies = [];
            this.createDefaultDies();
            this.saveToStorage();
        }
    }

    /**
     * Create a new die design
     */
    createDie(config) {
        console.log('[DieLibrary] Creating new die with config:', config);
        try {
            const die = {
                id: this.generateId(),
                sku: config.sku || 'Untitled Die',
                type: config.type || DIE_TYPES.CPU.id,
                description: config.description || '',
                reticleSize: config.reticleSize || { width: 26, height: 33 },
                dimensions: config.dimensions || { width: 10, height: 10 },
                processNode: config.processNode || 7, // Default to 7nm
                components: [],
                createdDate: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            this.dies.push(die);
            this.saveToStorage();
            console.log('[DieLibrary] Successfully created die:', die.sku);
            return die;
        } catch (e) {
            console.error('[DieLibrary] Error creating die:', e);
            console.error('[DieLibrary] Stack trace:', e.stack);
            throw e;
        }
    }

    /**
     * Get die by ID
     */
    getDie(id) {
        return this.dies.find(d => d.id === id);
    }

    /**
     * Get all dies
     */
    getAllDies() {
        return [...this.dies];
    }

    /**
     * Get dies by type
     */
    getDiesByType(type) {
        return this.dies.filter(d => d.type === type);
    }

    /**
     * Update die
     */
    updateDie(id, updates) {
        const die = this.getDie(id);
        if (die) {
            Object.assign(die, updates);
            die.lastModified = new Date().toISOString();
            this.saveToStorage();
            return die;
        }
        return null;
    }

    /**
     * Clone die
     */
    cloneDie(id) {
        const original = this.getDie(id);
        if (original) {
            const clone = JSON.parse(JSON.stringify(original));
            clone.id = this.generateId();
            clone.sku = `${original.sku} (Copy)`;
            clone.createdDate = new Date().toISOString();
            clone.lastModified = new Date().toISOString();
            this.dies.push(clone);
            this.saveToStorage();
            return clone;
        }
        return null;
    }

    /**
     * Delete die
     */
    deleteDie(id) {
        const index = this.dies.findIndex(d => d.id === id);
        if (index !== -1) {
            this.dies.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Add component to die
     */
    addComponent(dieId, component) {
        const die = this.getDie(dieId);
        if (die) {
            component.id = this.generateId();
            die.components.push(component);
            die.lastModified = new Date().toISOString();
            this.saveToStorage();
            return component;
        }
        return null;
    }

    /**
     * Update component
     */
    updateComponent(dieId, componentId, updates) {
        const die = this.getDie(dieId);
        if (die) {
            const component = die.components.find(c => c.id === componentId);
            if (component) {
                Object.assign(component, updates);
                die.lastModified = new Date().toISOString();
                this.saveToStorage();
                return component;
            }
        }
        return null;
    }

    /**
     * Remove component
     */
    removeComponent(dieId, componentId) {
        const die = this.getDie(dieId);
        if (die) {
            const index = die.components.findIndex(c => c.id === componentId);
            if (index !== -1) {
                die.components.splice(index, 1);
                die.lastModified = new Date().toISOString();
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    /**
     * Calculate die statistics
     */
    calculateDieStats(die) {
        const area = die.dimensions.width * die.dimensions.height;
        const componentsArea = die.components.reduce((sum, c) => {
            return sum + (c.dimensions.width * c.dimensions.height);
        }, 0);

        const utilization = area > 0 ? (componentsArea / area) * 100 : 0;

        const totalTransistors = die.components.reduce((sum, c) => {
            return sum + (c.transistors || 0);
        }, 0);

        return {
            area,
            componentsArea,
            utilizationPercent: utilization,
            totalTransistors,
            componentCount: die.components.length
        };
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('silicon_tycoon_dies', JSON.stringify(this.dies));
        } catch (e) {
            console.error('Failed to save die library:', e);
        }
    }

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        console.log('[DieLibrary] Loading from localStorage...');
        try {
            const stored = localStorage.getItem('silicon_tycoon_dies');
            if (stored) {
                console.log('[DieLibrary] Found stored data, parsing...');
                this.dies = JSON.parse(stored);
                console.log('[DieLibrary] Parsed', this.dies.length, 'dies successfully');

                // Validate the data structure
                if (!Array.isArray(this.dies)) {
                    console.error('[DieLibrary] Stored data is not an array, resetting...');
                    throw new Error('Invalid dies array');
                }
            } else {
                console.log('[DieLibrary] No stored data found, creating defaults...');
                // Create default example dies
                this.createDefaultDies();
            }
        } catch (e) {
            console.error('[DieLibrary] Failed to load die library:', e);
            console.error('[DieLibrary] Error message:', e.message);
            console.error('[DieLibrary] Stack trace:', e.stack);
            console.log('[DieLibrary] Clearing corrupted data and creating defaults...');
            // Clear corrupted data
            try {
                localStorage.removeItem('silicon_tycoon_dies');
            } catch (storageError) {
                console.error('[DieLibrary] Could not clear localStorage:', storageError);
            }
            this.dies = [];
            this.createDefaultDies();
        }
    }

    /**
     * Create default example dies
     */
    createDefaultDies() {
        console.log('[DieLibrary] Creating default example dies...');
        try {
            // Example CPU die
            this.createDie({
                sku: 'Example 8-Core CPU',
                type: DIE_TYPES.CPU.id,
                description: 'Sample 8-core processor design',
                dimensions: { width: 12, height: 10 },
                reticleSize: { width: 26, height: 33 },
                processNode: 7 // 7nm process
            });

            // Example GPU die
            this.createDie({
                sku: 'Example GPU',
                type: DIE_TYPES.GPU.id,
                description: 'Sample graphics processor',
                dimensions: { width: 18, height: 15 },
                reticleSize: { width: 26, height: 33 },
                processNode: 7 // 7nm process
            });
            console.log('[DieLibrary] Successfully created default dies');
        } catch (e) {
            console.error('[DieLibrary] Error creating default dies:', e);
            console.error('[DieLibrary] Stack trace:', e.stack);
        }
    }
}

// Singleton instance
let libraryInstance = null;

export function getDieLibrary() {
    if (!libraryInstance) {
        libraryInstance = new DieLibrary();
    }
    return libraryInstance;
}
