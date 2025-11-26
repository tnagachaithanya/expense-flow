// Theme Manager Utility
export const ThemeManager = {
    // Get current theme from localStorage or system preference
    getTheme: () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return 'dark';
    },

    // Apply theme to document
    applyTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'light' ? '#f5f7fa' : '#6c63ff');
        }
    },

    // Toggle between themes
    toggleTheme: () => {
        const currentTheme = ThemeManager.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        ThemeManager.applyTheme(newTheme);
        return newTheme;
    },

    // Listen for system theme changes
    watchSystemTheme: (callback) => {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            mediaQuery.addEventListener('change', (e) => {
                const newTheme = e.matches ? 'light' : 'dark';
                callback(newTheme);
            });
        }
    }
};
