class ParallaxCards {
    constructor() {
        this.cards = document.querySelectorAll('.parallax-card');
        this.walk = { x: 5, y: 3 };
        
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.parallax(e, card));
            card.addEventListener('mouseleave', () => this.reset(card));
            card.addEventListener('mouseenter', () => this.enter(card));
        });
    }

    parallax(e, card) {
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        
        const x = e.offsetX;
        const y = e.offsetY;
        
        const xWalk = ((x / width) * this.walk.x) - (this.walk.x / 2);
        const yWalk = ((y / height) * this.walk.y) - (this.walk.y / 2);
        
        card.style.transform = `
            rotateY(${-xWalk}deg) 
            rotateX(${yWalk}deg) 
            translateZ(10px)
        `;
        
        const price = card.querySelector('.parallax-card__price');
        const category = card.querySelector('.parallax-card__category');
        const text = card.querySelector('.parallax-card__text');
        const pagers = card.querySelectorAll('.parallax-card__pager');
        
        if (price) price.style.transform = `translateZ(35px) translateX(${xWalk * 2}px)`;
        if (category) category.style.transform = `translateZ(30px) translateX(${-xWalk * 2}px)`;
        if (text) text.style.transform = `translateZ(45px) translateY(${yWalk * 2}px)`;
        
        pagers.forEach(pager => {
            pager.style.transform = `translateZ(30px) translateY(${yWalk * 3}px)`;
        });
    }

    reset(card) {
        card.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
        
        const price = card.querySelector('.parallax-card__price');
        const category = card.querySelector('.parallax-card__category');
        const text = card.querySelector('.parallax-card__text');
        const pagers = card.querySelectorAll('.parallax-card__pager');
        
        if (price) price.style.transform = 'translateZ(30px)';
        if (category) category.style.transform = 'translateZ(25px)';
        if (text) text.style.transform = 'translateZ(40px)';
        if (pagers) pagers.forEach(pager => pager.style.transform = 'translateZ(25px)');
    }

    enter(card) {
        card.style.transition = 'all 0.1s ease-out';
    }
}

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

        this.parallax = new ParallaxCards();
        
        this.init();
    }

    init() {
        this.updateTotalItems();
        this.calculateTotalPages();
        
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
        this.services.forEach(service => {
            service.style.display = 'none';
        });

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        const visibleServices = this.services.slice(startIndex, endIndex);
        visibleServices.forEach(service => {
            service.style.display = 'block';
        });

        this.shoppingStart.textContent = startIndex + 1;
        this.shoppingEnd.textContent = Math.min(endIndex, this.services.length);

        setTimeout(() => {
            this.parallax = new ParallaxCards();
        }, 50);
    }

    updatePaginationControls() {
        this.firstPageBtn.disabled = this.currentPage === 1;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages;
        this.lastPageBtn.disabled = this.currentPage === this.totalPages;

        this.generatePageNumbers();
    }

    generatePageNumbers() {
        this.pageNumbers.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            this.addPageNumber(1);
            if (startPage > 2) {
                this.addDots();
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i);
        }

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
            
            this.servicesContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pagination = new ServicesPagination();
    new ParallaxCards();
});