// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        this.expenses = this.loadExpenses();
        this.filteredExpenses = [...this.expenses];
        this.initializeElements();
        this.bindEventListeners();
        this.initializeApp();
    }

    // Initialize DOM elements
    initializeElements() {
        this.form = document.getElementById('expenseForm');
        this.titleInput = document.getElementById('expenseTitle');
        this.amountInput = document.getElementById('expenseAmount');
        this.dateInput = document.getElementById('expenseDate');
        this.totalAmountElement = document.getElementById('totalAmount');
        this.expensesContainer = document.getElementById('expensesContainer');
        this.emptyState = document.getElementById('emptyState');
        this.monthFilter = document.getElementById('monthFilter');
        this.yearFilter = document.getElementById('yearFilter');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        
        // Error message elements
        this.titleError = document.getElementById('titleError');
        this.amountError = document.getElementById('amountError');
        this.dateError = document.getElementById('dateError');
    }

    // Bind all event listeners
    bindEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.monthFilter.addEventListener('change', () => this.applyFilters());
        this.yearFilter.addEventListener('change', () => this.applyFilters());
        this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        
        // Real-time validation
        this.titleInput.addEventListener('blur', () => this.validateTitle());
        this.amountInput.addEventListener('blur', () => this.validateAmount());
        this.dateInput.addEventListener('blur', () => this.validateDate());
        
        // Clear errors on input
        this.titleInput.addEventListener('input', () => this.clearError('title'));
        this.amountInput.addEventListener('input', () => this.clearError('amount'));
        this.dateInput.addEventListener('input', () => this.clearError('date'));
    }

    // Initialize the application
    initializeApp() {
        this.setDefaultDate();
        this.populateYearFilter();
        this.renderExpenses();
        this.updateTotal();
    }

    // Set today's date as default
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
    }

    // Populate year filter with available years
    populateYearFilter() {
        const years = new Set();
        const currentYear = new Date().getFullYear();
        
        // Add current year and previous 5 years
        for (let i = 0; i < 6; i++) {
            years.add(currentYear - i);
        }
        
        // Add years from existing expenses
        this.expenses.forEach(expense => {
            const year = new Date(expense.date).getFullYear();
            years.add(year);
        });

        // Sort years in descending order
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        
        // Clear existing options except "All Years"
        this.yearFilter.innerHTML = '<option value="">All Years</option>';
        
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.yearFilter.appendChild(option);
        });
    }

    // Load expenses from localStorage
    loadExpenses() {
        try {
            const stored = localStorage.getItem('expenses');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading expenses:', error);
            return [];
        }
    }

    // Save expenses to localStorage
    saveExpenses() {
        try {
            localStorage.setItem('expenses', JSON.stringify(this.expenses));
        } catch (error) {
            console.error('Error saving expenses:', error);
            this.showError('Failed to save expense. Storage may be full.');
        }
    }

    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.addExpense();
        }
    }

    // Validate entire form
    validateForm() {
        const isTitleValid = this.validateTitle();
        const isAmountValid = this.validateAmount();
        const isDateValid = this.validateDate();
        
        return isTitleValid && isAmountValid && isDateValid;
    }

    // Validate title field
    validateTitle() {
        const title = this.titleInput.value.trim();
        
        if (!title) {
            this.showFieldError('title', 'Title is required');
            return false;
        }
        
        if (title.length < 2) {
            this.showFieldError('title', 'Title must be at least 2 characters long');
            return false;
        }
        
        this.clearError('title');
        return true;
    }

    // Validate amount field
    validateAmount() {
        const amount = parseFloat(this.amountInput.value);
        
        if (!this.amountInput.value) {
            this.showFieldError('amount', 'Amount is required');
            return false;
        }
        
        if (isNaN(amount) || amount <= 0) {
            this.showFieldError('amount', 'Amount must be greater than 0');
            return false;
        }
        
        if (amount > 1000000) {
            this.showFieldError('amount', 'Amount cannot exceed $1,000,000');
            return false;
        }
        
        this.clearError('amount');
        return true;
    }

    // Validate date field
    validateDate() {
        const date = this.dateInput.value;
        
        if (!date) {
            this.showFieldError('date', 'Date is required');
            return false;
        }
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (selectedDate > today) {
            this.showFieldError('date', 'Date cannot be in the future');
            return false;
        }
        
        const earliestDate = new Date('2000-01-01');
        if (selectedDate < earliestDate) {
            this.showFieldError('date', 'Date cannot be before year 2000');
            return false;
        }
        
        this.clearError('date');
        return true;
    }

    // Show field-specific error
    showFieldError(field, message) {
        const errorElement = this[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = message;
            this[`${field}Input`].style.borderColor = '#e53e3e';
        }
    }

    // Clear field-specific error
    clearError(field) {
        const errorElement = this[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = '';
            this[`${field}Input`].style.borderColor = '#e2e8f0';
        }
    }

    // Show general error message
    showError(message) {
        // You could implement a toast notification system here
        alert(message);
    }

    // Add new expense
    addExpense() {
        const expense = {
            id: this.generateId(),
            title: this.titleInput.value.trim(),
            amount: parseFloat(this.amountInput.value),
            date: this.dateInput.value,
            timestamp: Date.now()
        };

        this.expenses.unshift(expense); // Add to beginning for latest first
        this.saveExpenses();
        this.populateYearFilter();
        this.applyFilters();
        this.updateTotal();
        this.resetForm();
        
        // Show success feedback
        this.showSuccessMessage();
    }

    // Generate unique ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // Reset form after successful submission
    resetForm() {
        this.titleInput.value = '';
        this.amountInput.value = '';
        this.setDefaultDate();
        this.titleInput.focus();
    }

    // Show success message
    showSuccessMessage() {
        const button = this.form.querySelector('.btn-primary');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Added Successfully!';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }

    // Delete expense
    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.populateYearFilter();
            this.applyFilters();
            this.updateTotal();
        }
    }

    // Apply filters
    applyFilters() {
        const selectedMonth = this.monthFilter.value;
        const selectedYear = this.yearFilter.value;
        
        this.filteredExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, '0');
            const expenseYear = expenseDate.getFullYear().toString();
            
            const monthMatch = !selectedMonth || expenseMonth === selectedMonth;
            const yearMatch = !selectedYear || expenseYear === selectedYear;
            
            return monthMatch && yearMatch;
        });
        
        this.renderExpenses();
        this.updateFilteredTotal();
    }

    // Clear all filters
    clearFilters() {
        this.monthFilter.value = '';
        this.yearFilter.value = '';
        this.filteredExpenses = [...this.expenses];
        this.renderExpenses();
        this.updateTotal();
    }

    // Render expenses in the container
    renderExpenses() {
        // Clear container
        this.expensesContainer.innerHTML = '';
        
        if (this.filteredExpenses.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.filteredExpenses.forEach((expense, index) => {
            const expenseCard = this.createExpenseCard(expense);
            this.expensesContainer.appendChild(expenseCard);
            
            // Add animation delay for staggered effect
            setTimeout(() => {
                expenseCard.classList.add('new');
            }, index * 50);
        });
    }

    // Create expense card element
    createExpenseCard(expense) {
        const card = document.createElement('div');
        card.className = 'expense-card';
        card.innerHTML = `
            <div class="expense-header">
                <div class="expense-title">${this.escapeHtml(expense.title)}</div>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <div class="expense-date">${this.formatDate(expense.date)}</div>
            <button class="delete-btn" onclick="expenseTracker.deleteExpense('${expense.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
        
        return card;
    }

    // Show empty state
    showEmptyState() {
        const hasFilters = this.monthFilter.value || this.yearFilter.value;
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.id = 'emptyState';
        
        if (hasFilters) {
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No expenses found</p>
                <span>Try adjusting your filters or add a new expense</span>
            `;
        } else {
            emptyState.innerHTML = `
                <i class="fas fa-receipt"></i>
                <p>No expenses found</p>
                <span>Start by adding your first expense above</span>
            `;
        }
        
        this.expensesContainer.appendChild(emptyState);
    }

    // Update total amount display
    updateTotal() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        this.totalAmountElement.textContent = `$${total.toFixed(2)}`;
    }

    // Update filtered total (when filters are applied)
    updateFilteredTotal() {
        const total = this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const hasFilters = this.monthFilter.value || this.yearFilter.value;
        
        if (hasFilters) {
            this.totalAmountElement.textContent = `$${total.toFixed(2)} (filtered)`;
        } else {
            this.totalAmountElement.textContent = `$${total.toFixed(2)}`;
        }
    }

    // Format date for display
    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});

// Service Worker registration for offline functionality (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker could be implemented for offline functionality
        console.log('Expense Tracker loaded successfully');
    });
}
