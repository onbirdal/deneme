// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    /**
     * Format date short
     */
    formatDateShort(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    },

    /**
     * Get today's date in YYYY-MM-DD format
     */
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },

    /**
     * Get first day of current month
     */
    getFirstDayOfMonth() {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    },

    /**
     * Get last day of current month
     */
    getLastDayOfMonth() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(0);
        return date.toISOString().split('T')[0];
    },

    /**
     * Add months to a date string
     */
    addMonths(dateString, months) {
        const date = new Date(dateString);
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    },

    /**
     * Get payment method label
     */
    getPaymentMethodLabel(method) {
        const labels = {
            'nakit': 'Nakit',
            'cek': 'Çek',
            'kredi_karti': 'Kredi Kartı',
            'havale': 'Havale'
        };
        return labels[method] || method;
    },

    /**
     * Get status label
     */
    getStatusLabel(status) {
        const labels = {
            'paid': 'Ödendi',
            'pending': 'Beklemede',
            'active': 'Aktif',
            'completed': 'Tamamlandı',
            'paused': 'Duraklatıldı'
        };
        return labels[status] || status;
    },

    /**
     * Get recipient type label
     */
    getRecipientTypeLabel(type) {
        const labels = {
            'taseron': 'Taşeron',
            'tedarikci': 'Tedarikçi'
        };
        return labels[type] || type;
    },

    /**
     * Validate email
     */
    isValidEmail(email) {
        if (!email) return true; // Optional field
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Confirm dialog
     */
    confirm(message) {
        return window.confirm(message);
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Convert file to base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    /**
     * Download file
     */
    downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Filter array by search term
     */
    filterBySearch(items, searchTerm, fields) {
        if (!searchTerm) return items;

        const term = searchTerm.toLowerCase().trim();
        return items.filter(item => {
            return fields.some(field => {
                const value = String(item[field] || '').toLowerCase();
                return value.includes(term);
            });
        });
    },

    /**
     * Sort array
     */
    sortArray(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Group array by key
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    },

    /**
     * Calculate percentage
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(1);
    }
};

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
