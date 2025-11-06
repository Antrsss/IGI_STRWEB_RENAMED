class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        this.themeText = this.themeToggle.querySelector('.theme-text');
        this.currentTheme = this.getSavedTheme() || 'light';
        
        this.init();
    }

    init() {
        // Применяем сохраненную тему при загрузке
        this.applyTheme(this.currentTheme);
        
        // Добавляем обработчик события
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Обновляем интерфейс
        this.updateToggleUI();
    }

    getSavedTheme() {
        // Пытаемся получить тему из localStorage
        return localStorage.getItem('zooTheme');
    }

    saveTheme(theme) {
        // Сохраняем тему в localStorage
        localStorage.setItem('zooTheme', theme);
    }

    applyTheme(theme) {
        // Применяем тему к документу
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
    }

    toggleTheme() {
        // Переключаем тему между light и dark
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateToggleUI();
    }

    updateToggleUI() {
        // Обновляем внешний вид переключателя
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