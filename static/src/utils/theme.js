/* ==========================================================================
   UTILS — THEME MANAGEMENT
   Handles light/dark mode with persistence and system preference detection
   ========================================================================== */

export const Theme = {
  STORAGE_KEY: 'voluntariado-theme',
  ATTRIBUTE: 'data-theme',

  init() {
    // Apply saved theme immediately (prevents flash)
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });

    // Listen for storage changes (other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY && e.newValue) {
        this.apply(e.newValue);
      }
    });
  },

  apply(theme) {
    document.documentElement.setAttribute(this.ATTRIBUTE, theme);
    localStorage.setItem(this.STORAGE_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#0d6efd';
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  },

  toggle() {
    const current = document.documentElement.getAttribute(this.ATTRIBUTE) || 'light';
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  get() {
    return document.documentElement.getAttribute(this.ATTRIBUTE) || 'light';
  },

  set(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.apply(theme);
    }
  },
};