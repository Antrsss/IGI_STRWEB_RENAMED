class ServicesPagination {
    constructor() {
        this.servicesContainer = document.getElementById('servicesContainer');
        this.services = Array.from(this.servicesContainer.querySelectorAll('.service-item'));
        this.itemsPerPageSelect = document.getElementById('itemsPerPage');
        this.shoppingStart = document.getElementById('showingStart');
        this.shoppingEnd = document.getElementById('showingEnd');
        this.totalItems = document.getElementById('totalItems');
        this.firstPageBtn = document.getElementById('firstPage');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.lastPageBtn = document.getElementById('lastPage');
        this.pageNumbers = document.getElementById('pageNumbers');
        
        this.currentPage = 1;
        this.itemsPerPage = 3;
        this.totalPages = 1;
        
        this.init();
    }

    init() {
        // Инициализация
        this.updateTotalItems();
        this.calculateTotalPages();
        
        // Обработчики событий
        this.itemsPerPageSelect.addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.calculateTotalPages();
            this.renderPage();
            this.updatePaginationControls();
        });

        this.firstPageBtn.addEventListener('click', () => this.goToPage(1));
        this.prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        this.lastPageBtn.addEventListener('click', () => this.goToPage(this.totalPages));

        // Первоначальный рендер
        this.renderPage();
        this.updatePaginationControls();
    }

    updateTotalItems() {
        this.totalItems.textContent = this.services.length;
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.services.length / this.itemsPerPage);
    }

    renderPage() {
        // Скрываем все элементы
        this.services.forEach(service => {
            service.style.display = 'none';
        });

        // Показываем элементы для текущей страницы
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        const visibleServices = this.services.slice(startIndex, endIndex);
        visibleServices.forEach(service => {
            service.style.display = 'block';
        });

        // Обновляем информацию о показе
        this.shoppingStart.textContent = startIndex + 1;
        this.shoppingEnd.textContent = Math.min(endIndex, this.services.length);
    }

    updatePaginationControls() {
        // Обновляем состояние кнопок
        this.firstPageBtn.disabled = this.currentPage === 1;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages;
        this.lastPageBtn.disabled = this.currentPage === this.totalPages;

        // Генерируем номера страниц
        this.generatePageNumbers();
    }

    generatePageNumbers() {
        this.pageNumbers.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        // Корректируем startPage если нужно
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Добавляем первую страницу и многоточие если нужно
        if (startPage > 1) {
            this.addPageNumber(1);
            if (startPage > 2) {
                this.addDots();
            }
        }

        // Добавляем видимые страницы
        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i);
        }

        // Добавляем многоточие и последнюю страницу если нужно
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                this.addDots();
            }
            this.addPageNumber(this.totalPages);
        }
    }

    addPageNumber(pageNumber) {
        const pageElement = document.createElement('button');
        pageElement.className = `page-number ${pageNumber === this.currentPage ? 'active' : ''}`;
        pageElement.textContent = pageNumber;
        pageElement.addEventListener('click', () => this.goToPage(pageNumber));
        this.pageNumbers.appendChild(pageElement);
    }

    addDots() {
        const dotsElement = document.createElement('span');
        dotsElement.className = 'page-number dots';
        dotsElement.textContent = '...';
        this.pageNumbers.appendChild(dotsElement);
    }

    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.renderPage();
            this.updatePaginationControls();
            
            // Плавная прокрутка к началу секции
            this.servicesContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    // Метод для добавления тестовых данных (если нужно больше 10 элементов)
    addTestServices() {
        const testServices = [
            { name: "Guided Tour", price: "25", description: "Professional guided tour with expert zoologist" },
            { name: "Animal Feeding", price: "15", description: "Participate in feeding sessions with zoo animals" },
            { name: "Photo Session", price: "50", description: "Professional photo session with animals" },
            { name: "Zoo Keeper for a Day", price: "75", description: "Experience life as a zoo keeper" },
            { name: "Night Safari", price: "35", description: "Special evening tour of the zoo" },
            { name: "Educational Workshop", price: "20", description: "Interactive learning experience for kids" },
            { name: "Animal Encounter", price: "40", description: "Close encounter with selected animals" },
            { name: "Behind the Scenes", price: "30", description: "Exclusive access to restricted areas" },
            { name: "Conservation Program", price: "60", description: "Participate in animal conservation activities" },
            { name: "VIP Experience", price: "100", description: "Premium all-inclusive zoo experience" },
            { name: "Animal Training Show", price: "18", description: "Watch and learn about animal training" },
            { name: "Zoo Camp", price: "85", description: "Full day immersive zoo experience" }
        ];

        const container = this.servicesContainer;
        
        testServices.forEach((service, index) => {
            const card = document.createElement('div');
            card.className = 'card service-item';
            card.dataset.serviceId = this.services.length + index;
            card.innerHTML = `
                <h4>${service.name}</h4>
                <p class="price">$${service.price}</p>
                <p>${service.description}</p>
            `;
            container.appendChild(card);
        });

        // Обновляем массив services
        this.services = Array.from(container.querySelectorAll('.service-item'));
        
        // Обновляем пагинацию
        this.updateTotalItems();
        this.calculateTotalPages();
        this.renderPage();
        this.updatePaginationControls();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const pagination = new ServicesPagination();
    
    // Если нужно добавить тестовые данные для демонстрации
    // (раскомментируйте следующую строку если у вас меньше 10 услуг)
    // pagination.addTestServices();
});