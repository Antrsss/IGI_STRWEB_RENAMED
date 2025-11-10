class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        this.themeText = this.themeToggle.querySelector('.theme-text');
        this.currentTheme = this.getSavedTheme() || 'light';
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        this.updateToggleUI();
    }

    getSavedTheme() {
        return localStorage.getItem('zooTheme');
    }

    saveTheme(theme) {
        localStorage.setItem('zooTheme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateToggleUI();
    }

    updateToggleUI() {
        if (this.currentTheme === 'dark') {
            this.themeIcon.textContent = '☀️';
            this.themeText.textContent = 'Light Mode';
        } else {
            this.themeIcon.textContent = '🌙';
            this.themeText.textContent = 'Dark Mode';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});