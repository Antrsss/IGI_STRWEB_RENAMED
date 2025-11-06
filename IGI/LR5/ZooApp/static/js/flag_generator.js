class SelectGenerator {
    constructor() {
        this.checkbox = document.getElementById('generateSelectCheckbox');
        this.configForm = document.getElementById('selectConfigForm');
        this.container = document.getElementById('generatedSelectsContainer');
        this.generateBtn = document.getElementById('generateBtn');
        
        this.init();
        this.loadSavedSelects();
    }

    init() {
        // Обработчики событий
        this.checkbox.addEventListener('change', () => this.toggleConfigForm());
        this.generateBtn.addEventListener('click', () => this.generateSelect());
        
        // Делегирование событий для удаления и изменения выбора
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                this.deleteSelect(e.target.closest('.select-container'));
            }
        });
        
        // Делегирование событий для отслеживания изменений в select
        this.container.addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT') {
                this.updateSelectionDisplay(e.target);
                this.saveSelects(); // Сохраняем состояние при изменении выбора
            }
        });
    }

    toggleConfigForm() {
        this.configForm.style.display = this.checkbox.checked ? 'block' : 'none';
    }

    generateSelect() {
        const name = document.getElementById('selectName').value.trim() || 'unnamed_select';
        const optionsText = document.getElementById('selectOptions').value.trim();
        const size = parseInt(document.getElementById('selectSize').value) || 1;
        const multiple = document.getElementById('selectMultiple').checked;
        const required = document.getElementById('selectRequired').checked;
        const disabled = document.getElementById('selectDisabled').checked;

        if (!optionsText) {
            alert('Please enter some options for the select element.');
            return;
        }

        const options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
        
        const selectId = 'select_' + Date.now();
        const selectElement = this.createSelectElement(selectId, name, options, size, multiple, required, disabled);
        
        this.addSelectToContainer(selectId, name, selectElement, { size, multiple, required, disabled });
        this.saveSelects();
        
        // Сброс формы
        this.resetForm();
    }

    createSelectElement(id, name, options, size, multiple, required, disabled) {
        const select = document.createElement('select');
        select.id = id;
        select.name = name;
        select.size = size;
        
        if (multiple) select.multiple = true;
        if (required) select.required = true;
        if (disabled) select.disabled = true;
        
        // Добавляем опцию по умолчанию только для одиночного выбора
        if (!multiple) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Choose an option`;
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);
        }
        
        // Добавляем options
        options.forEach((optionText, index) => {
            const option = document.createElement('option');
            option.value = optionText.toLowerCase().replace(/\s+/g, '_');
            option.textContent = optionText;
            select.appendChild(option);
        });
        
        return select;
    }

    addSelectToContainer(id, name, selectElement, attributes) {
        const container = document.createElement('div');
        container.className = 'select-container';
        container.dataset.selectId = id;
        
        const attributesText = this.getAttributesText(attributes);
        
        container.innerHTML = `
            <h4>${name}</h4>
            <div class="select-attributes">Attributes: ${attributesText}</div>
            <div class="selection-display">
                <strong>Selected:</strong> 
                <span class="selected-values">None</span>
            </div>
            <button class="delete-btn">Delete</button>
        `;
        
        container.appendChild(selectElement);
        this.container.appendChild(container);
        
        // Инициализируем отображение выбранных значений
        this.updateSelectionDisplay(selectElement);
    }

    updateSelectionDisplay(selectElement) {
        const container = selectElement.closest('.select-container');
        const displayElement = container.querySelector('.selected-values');
        
        if (selectElement.multiple) {
            // Для множественного выбора
            const selectedOptions = Array.from(selectElement.selectedOptions)
                .map(option => option.textContent)
                .filter(text => text !== 'Choose an option');
            
            if (selectedOptions.length > 0) {
                displayElement.textContent = selectedOptions.join(', ');
                displayElement.style.color = 'darkgreen';
                displayElement.style.fontWeight = 'bold';
            } else {
                displayElement.textContent = 'None';
                displayElement.style.color = '#666';
                displayElement.style.fontWeight = 'normal';
            }
        } else {
            // Для одиночного выбора
            const selectedValue = selectElement.value;
            const selectedText = selectElement.options[selectElement.selectedIndex]?.textContent;
            
            if (selectedValue && selectedText !== 'Choose an option') {
                displayElement.textContent = selectedText;
                displayElement.style.color = 'darkgreen';
                displayElement.style.fontWeight = 'bold';
            } else {
                displayElement.textContent = 'None';
                displayElement.style.color = '#666';
                displayElement.style.fontWeight = 'normal';
            }
        }
    }

    getAttributesText(attributes) {
        const attrs = [];
        if (attributes.multiple) attrs.push('multiple');
        if (attributes.required) attrs.push('required');
        if (attributes.disabled) attrs.push('disabled');
        attrs.push(`size=${attributes.size}`);
        return attrs.join(', ');
    }

    deleteSelect(container) {
        container.remove();
        this.saveSelects();
    }

    resetForm() {
        document.getElementById('selectName').value = '';
        document.getElementById('selectOptions').value = '';
        document.getElementById('selectSize').value = '4';
        document.getElementById('selectMultiple').checked = false;
        document.getElementById('selectRequired').checked = false;
        document.getElementById('selectDisabled').checked = false;
        this.checkbox.checked = false;
        this.configForm.style.display = 'none';
    }

    saveSelects() {
        const selects = [];
        const containers = this.container.querySelectorAll('.select-container');
        
        containers.forEach(container => {
            const select = container.querySelector('select');
            const options = Array.from(select.options)
                .filter(opt => opt.value)
                .map(opt => ({
                    text: opt.textContent,
                    value: opt.value,
                    selected: opt.selected
                }));
            
            selects.push({
                id: select.id,
                name: select.name,
                options: options,
                size: select.size,
                multiple: select.multiple,
                required: select.required,
                disabled: select.disabled
            });
        });
        
        localStorage.setItem('generatedSelects', JSON.stringify(selects));
    }

    loadSavedSelects() {
        const saved = localStorage.getItem('generatedSelects');
        if (saved) {
            const selects = JSON.parse(saved);
            selects.forEach(selectData => {
                const selectElement = this.createSelectElement(
                    selectData.id,
                    selectData.name,
                    selectData.options.map(opt => opt.text),
                    selectData.size,
                    selectData.multiple,
                    selectData.required,
                    selectData.disabled
                );
                
                // Восстанавливаем выбранные значения
                selectData.options.forEach((optionData, index) => {
                    if (optionData.selected) {
                        selectElement.options[index].selected = true;
                    }
                });
                
                this.addSelectToContainer(
                    selectData.id,
                    selectData.name,
                    selectElement,
                    {
                        size: selectData.size,
                        multiple: selectData.multiple,
                        required: selectData.required,
                        disabled: selectData.disabled
                    }
                );
            });
        }
        
        if (this.container.children.length === 0) {
            this.container.innerHTML = '<div class="empty-message">No select elements generated yet. Check the box above to create one!</div>';
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new SelectGenerator();
});