class ContactsManager {
    constructor() {
        this.table = document.getElementById('contactsTable');
        this.tableBody = document.getElementById('contactsTableBody');
        this.selectedContacts = new Set();
        this.currentSort = {
            column: null,
            direction: 'asc'
        };
        
        this.currentPage = 1;
        this.itemsPerPage = 3;
        this.totalPages = 1;
        this.allContacts = [];
        this.filteredContacts = [];
        
        this.filterText = '';
        
        this.nextContactId = 1000;

        this.preloader = document.getElementById('preloader');
        
        this.init();
    }

    init() {
        this.hidePreloader();
        
        this.allContacts = Array.from(this.tableBody.querySelectorAll('.contact-row'));
        this.filteredContacts = [...this.allContacts];
        
        this.allContacts.forEach(contact => {
            const id = parseInt(contact.dataset.contactId);
            if (id >= this.nextContactId) {
                this.nextContactId = id + 1;
            }
        });
        
        this.calculateTotalPages();
        this.bindEvents();
        this.renderPage();
        this.updatePaginationControls();
        this.updatePremiumButton();
    }

    showPreloader(message = 'Loading...') {
        
        if (this.preloader) {
            const messageElement = this.preloader.querySelector('p');
            if (messageElement && message) {
                messageElement.textContent = message;
            }

            this.preloader.classList.remove('preloader-hidden');
            this.preloader.classList.add('preloader-visible');
        } else {
            console.error('Preloader element not found!');
        }
        
        this.createLoadingOverlay();
    }

    hidePreloader() {
        
        if (this.preloader) {
            this.preloader.classList.remove('preloader-visible');
            this.preloader.classList.add('preloader-hidden');
        }
        
        this.removeLoadingOverlay();
    }

    createLoadingOverlay() {
        this.removeLoadingOverlay();
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        document.body.appendChild(overlay);
    }

    removeLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    handleFilter() {
        this.showPreloader('Filtering contacts...');
        
        const filterInput = document.getElementById('filterInput');
        this.filterText = filterInput.value.trim().toLowerCase();
        
        setTimeout(() => {
            try {
                if (this.filterText === '') {
                    this.filteredContacts = [...this.allContacts];
                } else {
                    this.filteredContacts = this.allContacts.filter(row => {
                        const name = row.dataset.name || '';
                        const position = row.dataset.position || '';
                        const phone = row.dataset.phone || '';
                        const email = row.dataset.email || '';
                        const info = row.dataset.info || '';
                        
                        return name.includes(this.filterText) ||
                               position.includes(this.filterText) ||
                               phone.includes(this.filterText) ||
                               email.includes(this.filterText) ||
                               info.includes(this.filterText);
                    });
                }
                
                this.selectedContacts.clear();
                document.querySelectorAll('.contact-checkbox').forEach(cb => {
                    cb.checked = false;
                    cb.closest('tr').classList.remove('selected');
                });
                document.getElementById('selectAllCheckbox').checked = false;
                this.updatePremiumButton();
                
                this.currentPage = 1;
                this.calculateTotalPages();
                this.renderPage();
                this.updatePaginationControls();
            } catch (error) {
                console.error('Error during filtering:', error);
            } finally {
                this.hidePreloader();
            }
        }, 800);
    }

    handleSort(header) {
        this.showPreloader('Sorting contacts...');
        
        const sortBy = header.dataset.sortBy;

        if (this.currentSort.column === sortBy) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = sortBy;
            this.currentSort.direction = 'asc';
        }

        setTimeout(() => {
            try {
                this.sortContacts(sortBy, this.currentSort.direction);
                this.updateSortIndicators(header);
                
                this.currentPage = 1;
                this.renderPage();
                this.updatePaginationControls();
            } catch (error) {
                console.error('Error during sorting:', error);
            } finally {
                this.hidePreloader();
            }
        }, 600);
    }

    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
            this.showPreloader(`Loading page ${pageNumber}...`);
            
            setTimeout(() => {
                try {
                    this.currentPage = pageNumber;
                    this.renderPage();
                    this.updatePaginationControls();
                } catch (error) {
                    console.error('Error during pagination:', error);
                } finally {
                    this.hidePreloader();
                }
            }, 400);
        }
    }

    addEmployeeToTable() {
        if (!this.validateForm()) {
            alert('Please fix validation errors before adding.');
            return;
        }

        this.showPreloader('Adding employee...');

        const formData = {
            id: this.nextContactId++,
            name: document.getElementById('employeeName').value.trim(),
            position: document.getElementById('employeePosition').value.trim(),
            phone: document.getElementById('employeePhone').value.trim(),
            email: document.getElementById('employeeEmail').value.trim(),
            info: document.getElementById('employeeInfo').value.trim(),
            photo: document.getElementById('employeePhoto').value.trim(),
            website: document.getElementById('employeeWebsite').value.trim()
        };

        formData.phone = this.formatPhoneNumber(formData.phone);

        setTimeout(() => {
            try {
                const newRow = this.createTableRow(formData);
                this.tableBody.appendChild(newRow);

                this.allContacts = Array.from(this.tableBody.querySelectorAll('.contact-row'));
                this.filteredContacts = [...this.allContacts];

                this.hideAddForm();
                
                this.currentPage = 1;
                this.calculateTotalPages();
                this.renderPage();
                this.updatePaginationControls();
            } catch (error) {
                console.error('Error adding employee:', error);
                alert('Error adding employee. Please try again.');
            } finally {
                this.hidePreloader();
                alert('Employee added successfully!');
            }
        }, 1000);
    }

    generatePremiumText() {
        if (this.selectedContacts.size === 0) {
            alert('Please select employees to premium.');
            return;
        }

        this.showPreloader('Generating premium announcement...');

        setTimeout(() => {
            try {
                const selectedNames = [];
                this.allContacts.forEach(contact => {
                    if (this.selectedContacts.has(contact.dataset.contactId)) {
                        const name = contact.querySelector('.name-column strong').textContent;
                        selectedNames.push(name);
                    }
                });

                const namesText = selectedNames.join(', ');
                const premiumText = `We are pleased to announce that the following employees have been awarded a premium for their outstanding performance and dedication: ${namesText}. Congratulations on this well-deserved recognition! Your hard work and commitment are greatly appreciated.`;

                document.getElementById('premiumText').textContent = premiumText;
                document.getElementById('premiumBlock').style.display = 'block';
                
                document.getElementById('premiumBlock').scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Error generating premium text:', error);
            } finally {
                this.hidePreloader();
            }
        }, 700);
    }

    bindEvents() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('contact-checkbox')) {
                this.handleContactSelection(e.target);
            }
            if (e.target.id === 'selectAllCheckbox') {
                this.handleSelectAll(e.target);
            }
        });

        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                this.handleSort(header);
            });
        });

        document.getElementById('firstPage').addEventListener('click', () => this.goToPage(1));
        document.getElementById('prevPage').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage').addEventListener('click', () => this.goToPage(this.currentPage + 1));
        document.getElementById('lastPage').addEventListener('click', () => this.goToPage(this.totalPages));

        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFilter();
        });

        document.addEventListener('click', (e) => {
            const row = e.target.closest('.contact-row');
            if (row && !e.target.classList.contains('contact-checkbox')) {
                this.handleRowClick(row);
            }
        });

        document.getElementById('closeDetails').addEventListener('click', () => {
            this.hideContactDetails();
        });

        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.showAddForm();
        });

        document.getElementById('closeFormBtn').addEventListener('click', () => {
            this.hideAddForm();
        });

        document.getElementById('validateBtn').addEventListener('click', () => {
            this.validateForm();
        });

        document.getElementById('employeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEmployeeToTable();
        });

        document.getElementById('employeeForm').addEventListener('input', () => {
            this.checkFormCompletion();
        });

        document.getElementById('premiumBtn').addEventListener('click', () => {
            this.generatePremiumText();
        });

        document.getElementById('closePremiumBtn').addEventListener('click', () => {
            this.hidePremiumBlock();
        });
    }

    validateForm() {
        const website = document.getElementById('employeeWebsite').value.trim();
        const phone = document.getElementById('employeePhone').value.trim();
        const email = document.getElementById('employeeEmail').value.trim();
        const photo = document.getElementById('employeePhoto').value.trim();
        const name = document.getElementById('employeeName').value.trim();
        const position = document.getElementById('employeePosition').value.trim();
        
        let isValid = true;
        let validationMessage = '';

        this.resetValidationStyles();

        if (!name) {
            this.markFieldInvalid('employeeName', 'Full name is required');
            isValid = false;
        } else {
            this.markFieldValid('employeeName');
        }

        if (!position) {
            this.markFieldInvalid('employeePosition', 'Position is required');
            isValid = false;
        } else {
            this.markFieldValid('employeePosition');
        }

        if (!phone) {
            this.markFieldInvalid('employeePhone', 'Phone number is required');
            isValid = false;
        } else if (!this.validatePhone(phone)) {
            this.markFieldInvalid('employeePhone', 'Invalid phone number format. Examples: 80291112233, 8 (029) 1112233, +375 (29) 111-22-33');
            isValid = false;
        } else {
            this.markFieldValid('employeePhone');
        }

        if (!email) {
            this.markFieldInvalid('employeeEmail', 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.markFieldInvalid('employeeEmail', 'Invalid email format');
            isValid = false;
        } else {
            this.markFieldValid('employeeEmail');
        }

        if (website && !this.validateURL(website)) {
            this.markFieldInvalid('employeeWebsite', 'Invalid URL format. Must start with http:// or https:// and end with .php or .html');
            isValid = false;
        } else if (website) {
            this.markFieldValid('employeeWebsite');
        }

        if (photo && !this.validatePhotoURL(photo)) {
            this.markFieldInvalid('employeePhoto', 'Invalid photo URL');
            isValid = false;
        } else if (photo) {
            this.markFieldValid('employeePhoto');
        }

        if (isValid) {
            validationMessage = 'All fields are valid! You can add the employee to the table.';
            document.getElementById('addToTableBtn').disabled = false;
        } else {
            validationMessage = 'Please fix the validation errors above.';
            document.getElementById('addToTableBtn').disabled = true;
        }

        document.getElementById('validationResult').textContent = validationMessage;
        document.getElementById('validationResult').className = `validation-result ${isValid ? 'valid' : 'invalid'}`;

        return isValid;
    }

    validatePhone(phone) {
        // Очищаем номер от пробелов, скобок и дефисов для проверки
        const cleanPhone = phone.replace(/[\s\(\-\+\)]/g, '');
        
        // 80291112233, 8 (029) 1112233, +375 (29) 111-22-33, +375 (29) 111 22 33
        
        // 8xxxxxxxxxx (11 цифр)
        if (cleanPhone.startsWith('8') && cleanPhone.length === 11 && /^\d+$/.test(cleanPhone)) {
            return true;
        }
        
        // +375xxxxxxxxx (13 символов, 12 цифр после +)
        if (cleanPhone.startsWith('375') && cleanPhone.length === 12 && /^\d+$/.test(cleanPhone)) {
            return true;
        }
        
        const phonePattern = /^(\+375|8)[\s\-]?\(?\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
        return phonePattern.test(phone);
    }

    validateURL(url) {
        const urlPattern = /^https?:\/\/.+(\.php|\.html)$/;
        return urlPattern.test(url);
    }

    validatePhotoURL(url) {
        try {
            new URL(url);
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            return imageExtensions.some(ext => url.toLowerCase().includes(ext));
        } catch {
            return false;
        }
    }

    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    markFieldValid(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    markFieldInvalid(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.classList.remove('valid');
            field.classList.add('invalid');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    resetValidationStyles() {
        const inputs = document.querySelectorAll('#employeeForm input, #employeeForm textarea');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
            const errorElement = document.getElementById(input.id + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    }

    formatPhoneNumber(phone) {
        //+375 (29) XXX-XX-XX
        const cleanPhone = phone.replace(/[\s\(\-\+\)]/g, '');
        
        if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
            //8XXXXXXXXXX -> +375 (XX) XXX-XX-XX
            const code = cleanPhone.substring(1, 4);
            const part1 = cleanPhone.substring(4, 7);
            const part2 = cleanPhone.substring(7, 9);
            const part3 = cleanPhone.substring(9, 11);
            return `+375 (${code}) ${part1}-${part2}-${part3}`;
        } else if (cleanPhone.startsWith('375') && cleanPhone.length === 12) {
            //375XXXXXXXXX -> +375 (XX) XXX-XX-XX
            const code = cleanPhone.substring(3, 5);
            const part1 = cleanPhone.substring(5, 8);
            const part2 = cleanPhone.substring(8, 10);
            const part3 = cleanPhone.substring(10, 12);
            return `+375 (${code}) ${part1}-${part2}-${part3}`;
        }
        
        return phone;
    }

    createTableRow(contact) {
        const row = document.createElement('tr');
        row.className = 'contact-row';
        row.dataset.contactId = contact.id;
        row.dataset.name = contact.name.toLowerCase();
        row.dataset.position = contact.position.toLowerCase();
        row.dataset.phone = contact.phone;
        row.dataset.email = contact.email.toLowerCase();
        row.dataset.info = (contact.info || '').toLowerCase();

        const firstLetter = contact.name.charAt(0).toUpperCase();

        row.innerHTML = `
            <td class="checkbox-column">
                <input type="checkbox" class="contact-checkbox" data-contact-id="${contact.id}">
            </td>
            <td class="photo-column">
                <div class="contact-photo">
                    ${contact.photo ? 
                        `<img src="${contact.photo}" alt="${contact.name}" class="employee-photo">` :
                        `<div class="photo-placeholder">${firstLetter}</div>`
                    }
                </div>
            </td>
            <td class="name-column">
                <strong>${contact.name}</strong>
            </td>
            <td class="position-column">
                ${contact.position}
            </td>
            <td class="work-column">
                ${contact.info ? contact.info : '<span class="no-info">No description available</span>'}
            </td>
            <td class="phone-column">
                <a href="tel:${contact.phone}" class="phone-link">
                    ${contact.phone}
                </a>
            </td>
            <td class="email-column">
                <a href="mailto:${contact.email}" class="email-link">
                    ${contact.email}
                </a>
            </td>
        `;

        return row;
    }

    handleSelectAll(checkbox) {
        const isChecked = checkbox.checked;
        const visibleCheckboxes = this.getVisibleCheckboxes();
        
        visibleCheckboxes.forEach(cb => {
            cb.checked = isChecked;
            this.handleContactSelection(cb);
        });
        
        this.updatePremiumButton();
    }

    getVisibleCheckboxes() {
        return Array.from(document.querySelectorAll('.contact-checkbox'))
                   .filter(cb => cb.closest('tr').style.display !== 'none');
    }

    handleContactSelection(checkbox) {
        const contactId = checkbox.dataset.contactId;

        if (checkbox.checked) {
            this.selectedContacts.add(contactId);
            checkbox.closest('tr').classList.add('selected');
        } else {
            this.selectedContacts.delete(contactId);
            checkbox.closest('tr').classList.remove('selected');
            document.getElementById('selectAllCheckbox').checked = false;
        }
        
        this.updatePremiumButton();
    }

    updatePremiumButton() {
        const premiumBtn = document.getElementById('premiumBtn');
        premiumBtn.disabled = this.selectedContacts.size === 0;
    }

    hidePremiumBlock() {
        document.getElementById('premiumBlock').style.display = 'none';
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.filteredContacts.length / this.itemsPerPage);
    }

    renderPage() {
        this.allContacts.forEach(row => {
            row.style.display = 'none';
        });
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        for (let i = startIndex; i < endIndex && i < this.filteredContacts.length; i++) {
            this.filteredContacts[i].style.display = '';
        }
        
        this.updatePaginationInfo();
    }

    updatePaginationInfo() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredContacts.length);
        
        const currentPageElem = document.getElementById('currentPage');
        const totalPagesElem = document.getElementById('totalPages');
        const totalContactsElem = document.getElementById('totalContacts');
        
        if (currentPageElem) currentPageElem.textContent = this.currentPage;
        if (totalPagesElem) totalPagesElem.textContent = this.totalPages;
        if (totalContactsElem) totalContactsElem.textContent = this.filteredContacts.length;
    }

    updatePaginationControls() {
        document.getElementById('firstPage').disabled = this.currentPage === 1;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === this.totalPages;
        document.getElementById('lastPage').disabled = this.currentPage === this.totalPages;

        this.generatePageNumbers();
    }

    generatePageNumbers() {
        const pageNumbersContainer = document.getElementById('pageNumbers');
        pageNumbersContainer.innerHTML = '';
        
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
        document.getElementById('pageNumbers').appendChild(pageElement);
    }

    addDots() {
        const dotsElement = document.createElement('span');
        dotsElement.className = 'page-number dots';
        dotsElement.textContent = '...';
        document.getElementById('pageNumbers').appendChild(dotsElement);
    }

    sortContacts(sortBy, direction) {
        this.filteredContacts.sort((a, b) => {
            let aValue = a.dataset[sortBy];
            let bValue = b.dataset[sortBy];

            if (sortBy === 'phone') {
                aValue = this.extractNumbers(aValue);
                bValue = this.extractNumbers(bValue);
            }

            if (!aValue) aValue = '';
            if (!bValue) bValue = '';

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    extractNumbers(str) {
        return str.replace(/\D/g, '');
    }

    updateSortIndicators(activeHeader) {
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sorted', 'asc', 'desc');
        });
        
        activeHeader.classList.add('sorted', this.currentSort.direction);
        activeHeader.title = `Sorted ${this.currentSort.direction === 'asc' ? 'ascending' : 'descending'}`;
    }

    showContactDetails(contact) {
        const detailsContainer = document.getElementById('contactDetails');
        const content = detailsContainer.querySelector('.contact-details-content');
        
        const photoContainer = content.querySelector('.detail-photo-container');
        photoContainer.innerHTML = contact.photoHTML;
        
        document.getElementById('detailName').textContent = contact.name;
        document.getElementById('detailPosition').textContent = contact.position;
        document.getElementById('detailInfo').textContent = contact.info;
        
        const phoneLink = document.getElementById('detailPhone');
        phoneLink.textContent = contact.phone;
        phoneLink.href = `tel:${contact.phone}`;
        
        const emailLink = document.getElementById('detailEmail');
        emailLink.textContent = contact.email;
        emailLink.href = `mailto:${contact.email}`;
        
        detailsContainer.style.display = 'block';
        
        document.querySelectorAll('.contact-row').forEach(row => {
            row.classList.remove('active-row');
        });
        
        const activeRow = Array.from(this.allContacts).find(row => 
            row.querySelector('.name-column strong').textContent === contact.name
        );
        if (activeRow) {
            activeRow.classList.add('active-row');
        }
    }

    hideContactDetails() {
        document.getElementById('contactDetails').style.display = 'none';
        document.querySelectorAll('.contact-row').forEach(row => {
            row.classList.remove('active-row');
        });
    }

    showAddForm() {
        document.getElementById('addEmployeeForm').style.display = 'block';
        document.getElementById('employeeForm').reset();
        document.getElementById('validationResult').textContent = '';
        this.resetValidationStyles();
        this.checkFormCompletion();
    }

    hideAddForm() {
        document.getElementById('addEmployeeForm').style.display = 'none';
        this.resetValidationStyles();
    }

    checkFormCompletion() {
        const requiredFields = ['employeeName', 'employeePosition', 'employeePhone', 'employeeEmail'];
        const isComplete = requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field.value.trim() !== '';
        });
        
        document.getElementById('addToTableBtn').disabled = !isComplete;
        return isComplete;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new ContactsManager();
});