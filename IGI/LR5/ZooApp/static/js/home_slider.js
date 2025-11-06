class Slider {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.slide');
        this.current = 0;

        // Читаем настройки из data-атрибутов
        this.loop = container.dataset.loop === 'true';
        this.navs = container.dataset.navs === 'true';
        this.pags = container.dataset.pags === 'true';
        this.auto = container.dataset.auto === 'true';
        this.stopMouseHover = container.dataset.stopmousehover === 'true';
        this.delay = parseInt(container.dataset.delay) * 1000 || 5000;

        this.timer = null;
        this.counterElem = null;
        this.pagination = null;

        this.init();
    }

    init() {
        this.showSlide(this.current);

        // Делаем слайды кликабельными
        this.makeSlidesClickable();

        if (this.navs) this.createNavButtons();
        if (this.pags) this.createPagination();

        if (this.auto) {
            this.startAutoPlay();
            if (this.stopMouseHover) {
                this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.container.addEventListener('mouseleave', () => this.startAutoPlay());
            }
        }
    }

    makeSlidesClickable() {
        this.slides.forEach(slide => {
            const link = slide.dataset.link;
            if (link) {
                slide.style.cursor = 'pointer';
                slide.addEventListener('click', () => {
                    window.open(link, '_blank');
                });
            }
        });
    }

    showSlide(index) {
        this.slides.forEach((s, i) => {
            s.style.display = i === index ? 'block' : 'none';
        });

        // Обновляем счетчик
        this.updateCounter(index);
        
        if (this.pags) this.updatePagination();
    }

    updateCounter(index) {
        const counter = `${index + 1}/${this.slides.length}`;
        if (!this.counterElem) {
            this.counterElem = document.createElement('div');
            this.counterElem.className = 'slider-counter';
            this.container.appendChild(this.counterElem);
        }
        this.counterElem.textContent = counter;
    }

    nextSlide() {
        let nextIndex = this.current + 1;
        
        if (nextIndex >= this.slides.length) {
            if (this.loop) {
                nextIndex = 0;
            } else {
                nextIndex = this.slides.length - 1;
            }
        }
        
        this.current = nextIndex;
        this.showSlide(this.current);
    }

    prevSlide() {
        let prevIndex = this.current - 1;
        
        if (prevIndex < 0) {
            if (this.loop) {
                prevIndex = this.slides.length - 1;
            } else {
                prevIndex = 0;
            }
        }
        
        this.current = prevIndex;
        this.showSlide(this.current);
    }

    createNavButtons() {
        const prev = document.createElement('button');
        const next = document.createElement('button');
        prev.textContent = '◀';
        next.textContent = '▶';
        prev.className = 'slider-prev';
        next.className = 'slider-next';
        
        // Добавляем кнопки в контейнер слайдера
        this.container.appendChild(prev);
        this.container.appendChild(next);
        
        prev.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevSlide();
        });
        next.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextSlide();
        });
    }

    createPagination() {
        this.pagination = document.createElement('div');
        this.pagination.className = 'slider-pagination';
        this.container.appendChild(this.pagination);

        this.slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'slider-dot';
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.current = i;
                this.showSlide(i);
            });
            this.pagination.appendChild(dot);
        });
        this.updatePagination();
    }

    updatePagination() {
        if (!this.pagination) return;
        
        const dots = this.pagination.querySelectorAll('.slider-dot');
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === this.current);
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.timer = setInterval(() => this.nextSlide(), this.delay);
    }

    stopAutoPlay() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Метод для обновления задержки
    updateDelay(newDelay) {
        this.delay = newDelay * 1000;
        if (this.auto) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }

    // Метод для обновления авто-воспроизведения
    updateAutoPlay(auto) {
        this.auto = auto;
        if (this.auto) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.zoo_banners');
    const sliderInstances = [];
    
    sliders.forEach(slider => {
        sliderInstances.push(new Slider(slider));
    });

    // Обработка формы для администратора
    const settingsForm = document.getElementById('sliderSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const autoPlay = document.getElementById('autoPlay').checked;
            const delay = parseInt(document.getElementById('sliderDelay').value);
            
            // Применяем настройки ко всем слайдерам
            sliderInstances.forEach(slider => {
                slider.updateAutoPlay(autoPlay);
                slider.updateDelay(delay);
            });
            
            alert('Slider settings updated!');
        });
    }
});