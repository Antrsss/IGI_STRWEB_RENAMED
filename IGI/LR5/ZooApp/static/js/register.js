class AgeCalculator {
    constructor() {
        this.birthDateInput = document.getElementById('id_birth_date');
        this.ageResult = document.getElementById('ageResult');
        this.parentConsentSection = document.getElementById('parentConsentSection');
        this.parentConsentCheckbox = document.getElementById('parent_consent');
        this.submitButton = document.getElementById('submitButton');
        this.form = document.getElementById('registrationForm');

        this.init();
    }

    init() {
        if (!this.birthDateInput) {
            console.error('Birth date field not found');
            return;
        }

        this.birthDateInput.max = new Date().toISOString().split('T')[0];

        this.birthDateInput.addEventListener('change', () => this.calculateAge());
        this.birthDateInput.addEventListener('input', () => this.updateSubmitButton());

        if (this.parentConsentCheckbox) {
            this.parentConsentCheckbox.addEventListener('change', () => this.updateSubmitButton());
        }

        this.form.addEventListener('submit', (event) => this.validateForm(event));

        this.updateSubmitButton();
    }

    calculateAge() {
        if (!this.birthDateInput.value) {
            this.clearAgeResult();
            return;
        }

        const birthDate = new Date(this.birthDateInput.value);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[birthDate.getDay()];

        const formattedDate = birthDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.displayAgeResult(age, dayOfWeek, formattedDate);
        this.handleAgeBasedActions(age);
    }

    displayAgeResult(age, dayOfWeek, formattedDate) {
        let message = '';
        let messageClass = '';

        if (age >= 18) {
            message = `You are <strong>${age} years old</strong>. Born on <strong>${dayOfWeek}</strong> (${formattedDate}). Welcome!`;
            messageClass = 'success';
        } else {
            message = `You are <strong>${age} years old</strong>. Born on <strong>${dayOfWeek}</strong> (${formattedDate}). Parental consent required.`;
            messageClass = 'warning';
        }

        this.ageResult.innerHTML = `<div class="age-info ${messageClass}">${message}</div>`;
    }

    handleAgeBasedActions(age) {
        if (age >= 18) {
            this.hideParentConsent();
            
            setTimeout(() => {
                if (confirm(`Congratulations! You were born on ${this.getDayOfWeek()}. Welcome to our community!`)) {
                    
                }
            }, 500);
            
        } else {
            this.showParentConsent();
            
            setTimeout(() => {
                alert(`ATTENTION: You are ${age} years old (under 18).\n\nParental consent is required to use this website. Please have your parent or legal guardian review and approve your registration.`);
            }, 500);
        }
    }

    getDayOfWeek() {
        if (!this.birthDateInput.value) return '';
        const birthDate = new Date(this.birthDateInput.value);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return daysOfWeek[birthDate.getDay()];
    }

    showParentConsent() {
        if (this.parentConsentSection) {
            this.parentConsentSection.style.display = 'block';
            if (this.parentConsentCheckbox) {
                this.parentConsentCheckbox.required = true;
            }
        }
    }

    hideParentConsent() {
        if (this.parentConsentSection) {
            this.parentConsentSection.style.display = 'none';
            if (this.parentConsentCheckbox) {
                this.parentConsentCheckbox.required = false;
                this.parentConsentCheckbox.checked = false;
            }
        }
    }

    clearAgeResult() {
        if (this.ageResult) {
            this.ageResult.innerHTML = '';
        }
        this.hideParentConsent();
    }

    updateSubmitButton() {
        if (!this.submitButton) return;

        const birthDate = this.birthDateInput ? this.birthDateInput.value : '';

        if (!birthDate) {
            this.disableSubmitButton('Please enter your date of birth');
            return;
        }

        if (this.parentConsentSection && this.parentConsentSection.style.display !== 'none') {
            if (this.parentConsentCheckbox && !this.parentConsentCheckbox.checked) {
                this.disableSubmitButton('Parental consent required');
                return;
            }
        }

        this.enableSubmitButton();
    }

    disableSubmitButton(message) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = message;
        this.submitButton.style.backgroundColor = '#6c757d';
    }

    enableSubmitButton() {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Register';
        this.submitButton.style.backgroundColor = '';
    }

    validateForm(event) {
        const birthDate = this.birthDateInput ? this.birthDateInput.value : '';
        
        if (!birthDate) {
            event.preventDefault();
            alert('Please enter your date of birth.');
            return;
        }

        const birthDateObj = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        if (age < 18) {
            const hasParentConsent = this.parentConsentCheckbox && this.parentConsentCheckbox.checked;
            
            if (!hasParentConsent) {
                event.preventDefault();
                alert('Parental consent is required for users under 18 years old.');
                return;
            }

            const confirmed = confirm(`You are ${age} years old. By submitting this form, you confirm that you have obtained parental consent. Continue?`);
            if (!confirmed) {
                event.preventDefault();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new AgeCalculator();
});