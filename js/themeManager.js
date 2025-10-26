/**
 * Theme Manager
 * Handles switching between Art Deco, Retro TVA, and Apple II themes
 * with unlock system and radial theme selector
 */

const THEME_KEY = 'silicon-tycoon-theme';
const UNLOCK_KEY = 'silicon-tycoon-theme-unlocks';

const THEMES = {
    VANILLA: 'vanilla',
    DECO: 'deco',
    RETRO: 'retro',
    APPLE2: 'apple2'
};

const THEME_CONFIG = {
    [THEMES.VANILLA]: {
        name: 'Modern',
        icon: '📊',
        defaultUnlocked: true
    },
    [THEMES.DECO]: {
        name: 'CyberDeco',
        icon: '💎',
        defaultUnlocked: true
    },
    [THEMES.RETRO]: {
        name: 'TVA',
        icon: '📼',
        defaultUnlocked: true
    },
    [THEMES.APPLE2]: {
        name: 'Apple II',
        icon: '🖥️',
        defaultUnlocked: true
    }
};

let currentTheme = THEMES.VANILLA;
let themeUnlocks = {};
let stylesheets = {};
let wheelOpen = false;

/**
 * Initialize theme system
 * - Loads saved theme preference and unlock status from localStorage
 * - Applies theme to body element
 * - Sets up stylesheet references
 */
export function initTheme() {
    console.log('[ThemeManager] Initializing theme system...');

    // Get references to theme stylesheets
    stylesheets = {
        [THEMES.DECO]: document.getElementById('theme-deco-css'),
        [THEMES.RETRO]: document.getElementById('theme-retro-css'),
        [THEMES.APPLE2]: document.getElementById('theme-apple2-css')
    };

    // Check for missing stylesheets
    Object.entries(stylesheets).forEach(([theme, stylesheet]) => {
        if (!stylesheet) {
            console.warn(`[ThemeManager] ${theme} stylesheet not found in DOM`);
        }
    });

    // Load unlock status or set defaults
    const savedUnlocks = localStorage.getItem(UNLOCK_KEY);
    if (savedUnlocks) {
        themeUnlocks = JSON.parse(savedUnlocks);

        // Merge with defaults for any new themes that were added
        let needsSave = false;
        Object.entries(THEME_CONFIG).forEach(([theme, config]) => {
            if (themeUnlocks[theme] === undefined) {
                themeUnlocks[theme] = config.defaultUnlocked;
                needsSave = true;
                console.log('[ThemeManager] New theme detected, setting default unlock:', theme);
            }
        });

        if (needsSave) {
            saveUnlocks();
        }
    } else {
        // Set default unlocks
        Object.entries(THEME_CONFIG).forEach(([theme, config]) => {
            themeUnlocks[theme] = config.defaultUnlocked;
        });
        saveUnlocks();
    }

    // Load saved theme preference or default to Vanilla
    const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.VANILLA;

    // Validate saved theme is unlocked
    if (isThemeUnlocked(savedTheme)) {
        currentTheme = savedTheme;
    } else {
        currentTheme = THEMES.VANILLA;
    }

    // Apply theme
    applyTheme(currentTheme);

    console.log('[ThemeManager] Theme initialized:', currentTheme);
    console.log('[ThemeManager] Unlocked themes:', Object.entries(themeUnlocks).filter(([, unlocked]) => unlocked).map(([theme]) => theme));
}

/**
 * Apply a specific theme
 * @param {string} theme - 'vanilla', 'deco', 'retro', or 'apple2'
 */
function applyTheme(theme) {
    console.log('[ThemeManager] Applying theme:', theme);

    // Disable all theme stylesheets
    Object.values(stylesheets).forEach(stylesheet => {
        if (stylesheet) stylesheet.disabled = true;
    });

    // Remove any existing theme attribute
    document.body.removeAttribute('data-theme');

    // Apply the selected theme
    if (theme === THEMES.VANILLA) {
        // Vanilla is now the base theme (no data-theme attribute or stylesheet needed)
        // Just ensure all theme stylesheets are disabled (already done above)
    } else if (theme === THEMES.DECO && stylesheets[THEMES.DECO]) {
        // CyberDeco theme overlay - uses body:not([data-theme]) selector
        // No data-theme attribute, but enable the stylesheet
        stylesheets[THEMES.DECO].disabled = false;
    } else if (theme === THEMES.RETRO && stylesheets[THEMES.RETRO]) {
        document.body.setAttribute('data-theme', 'retro');
        stylesheets[THEMES.RETRO].disabled = false;
    } else if (theme === THEMES.APPLE2 && stylesheets[THEMES.APPLE2]) {
        document.body.setAttribute('data-theme', 'apple2');
        stylesheets[THEMES.APPLE2].disabled = false;
    }

    // Notify renderers of theme change (for PixiJS canvases)
    notifyThemeChange();
}

/**
 * Set a specific theme (if unlocked)
 * @param {string} theme - Theme to set
 * @returns {boolean} True if theme was set, false if locked
 */
export function setTheme(theme) {
    if (!isThemeUnlocked(theme)) {
        console.warn('[ThemeManager] Theme is locked:', theme);
        return false;
    }

    currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    updateThemeWheel();

    console.log('[ThemeManager] Theme changed to:', theme);
    return true;
}

/**
 * Check if a theme is unlocked
 * @param {string} theme - Theme to check
 * @returns {boolean} True if unlocked
 */
export function isThemeUnlocked(theme) {
    return themeUnlocks[theme] === true;
}

/**
 * Unlock a theme
 * @param {string} theme - Theme to unlock
 */
export function unlockTheme(theme) {
    if (themeUnlocks[theme] === true) {
        console.log('[ThemeManager] Theme already unlocked:', theme);
        return;
    }

    themeUnlocks[theme] = true;
    saveUnlocks();
    updateThemeWheel();

    console.log('[ThemeManager] 🎉 Theme unlocked:', theme);

    // Show unlock notification (future enhancement)
    // showUnlockNotification(theme);
}

/**
 * Save unlock status to localStorage
 */
function saveUnlocks() {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(themeUnlocks));
}

/**
 * Get current active theme
 * @returns {string} Current theme
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Set up radial theme selector
 * Call this after the selector is in DOM
 */
export function setupThemeSelector() {
    console.log('[ThemeManager] Setting up radial theme selector...');

    const brushBtn = document.getElementById('theme-brush-btn');
    const themeWheel = document.getElementById('theme-wheel');
    const themeButtons = document.querySelectorAll('.theme-wheel-btn');

    if (!brushBtn) {
        console.error('[ThemeManager] Brush button not found!');
        return;
    }

    if (!themeWheel) {
        console.error('[ThemeManager] Theme wheel not found!');
        return;
    }

    // Set up brush button (toggle wheel)
    brushBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWheel();
    });

    // Set up theme buttons
    themeButtons.forEach(btn => {
        const theme = btn.getAttribute('data-theme');

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isThemeUnlocked(theme)) {
                setTheme(theme);
                closeWheel();
            } else {
                console.log('[ThemeManager] Theme locked:', theme);
                // Future: Show "locked" message or unlock requirement
            }
        });
    });

    // Close wheel when clicking outside
    document.addEventListener('click', (e) => {
        if (wheelOpen && !e.target.closest('.theme-selector-container')) {
            closeWheel();
        }
    });

    // Initial state
    updateThemeWheel();

    console.log('[ThemeManager] Theme selector configured successfully');
}

/**
 * Toggle theme wheel open/closed
 */
function toggleWheel() {
    wheelOpen = !wheelOpen;
    const brushBtn = document.getElementById('theme-brush-btn');
    const themeWheel = document.getElementById('theme-wheel');

    if (wheelOpen) {
        brushBtn.classList.add('active');
        themeWheel.classList.add('open');
        themeWheel.style.display = 'block';
    } else {
        closeWheel();
    }
}

/**
 * Close theme wheel
 */
function closeWheel() {
    wheelOpen = false;
    const brushBtn = document.getElementById('theme-brush-btn');
    const themeWheel = document.getElementById('theme-wheel');

    if (brushBtn) brushBtn.classList.remove('active');
    if (themeWheel) {
        themeWheel.classList.remove('open');
        // Delay hiding to allow animation
        setTimeout(() => {
            if (!wheelOpen) themeWheel.style.display = 'none';
        }, 400);
    }
}

/**
 * Update theme wheel button states (locked/unlocked/active)
 */
function updateThemeWheel() {
    const themeButtons = document.querySelectorAll('.theme-wheel-btn');

    themeButtons.forEach(btn => {
        const theme = btn.getAttribute('data-theme');
        const unlocked = isThemeUnlocked(theme);
        const active = theme === currentTheme;

        // Update locked state
        if (unlocked) {
            btn.classList.remove('theme-locked');
            btn.removeAttribute('data-locked-tooltip');
            btn.setAttribute('title', THEME_CONFIG[theme]?.name || theme);
        } else {
            btn.classList.add('theme-locked');
            btn.setAttribute('data-locked-tooltip', '🔒 Locked');
            btn.setAttribute('title', '🔒 Locked');
        }

        // Update active state
        if (active) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Notify renderers that theme has changed
 * (For PixiJS canvases to update colors)
 */
function notifyThemeChange() {
    // Dispatch custom event for renderers to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: currentTheme }
    }));
}

/**
 * Debug function - Expose to window for console testing
 */
if (typeof window !== 'undefined') {
    window.debugUnlockTheme = (theme) => {
        console.log('[ThemeManager] 🔓 DEBUG: Unlocking theme:', theme);
        unlockTheme(theme);
    };

    window.debugLockTheme = (theme) => {
        console.log('[ThemeManager] 🔒 DEBUG: Locking theme:', theme);
        themeUnlocks[theme] = false;
        saveUnlocks();
        updateThemeWheel();
    };

    window.debugResetThemes = () => {
        console.log('[ThemeManager] 🔄 DEBUG: Resetting all themes to defaults');
        localStorage.removeItem(UNLOCK_KEY);
        localStorage.removeItem(THEME_KEY);
        location.reload();
    };

    window.debugUnlockAll = () => {
        console.log('[ThemeManager] 🔓🔓🔓 DEBUG: Unlocking all themes');
        Object.keys(THEME_CONFIG).forEach(theme => unlockTheme(theme));
    };
}

// Keep old function name for backwards compatibility (deprecated)
export function setupThemeButton() {
    console.warn('[ThemeManager] setupThemeButton() is deprecated, use setupThemeSelector()');
    setupThemeSelector();
}
