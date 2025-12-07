// ============================================
// CHECK PAYMENT MODULE
// ============================================

const CheckModule = {
    /**
     * Get next check payment with upcoming due date
     */
    getNextDueCheck() {
        const payments = Storage.getPayments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter check payments with due dates
        const checks = payments.filter(p =>
            p.paymentMethod === 'cek' &&
            p.dueDate &&
            p.status === 'pending'
        );

        if (checks.length === 0) return null;

        // Sort by due date (ascending)
        checks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        return checks[0];
    },

    /**
     * Get all checks that are due within specified days
     */
    getChecksDueWithin(days = 7) {
        const payments = Storage.getPayments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);

        return payments.filter(p => {
            if (p.paymentMethod !== 'cek' || !p.dueDate || p.status !== 'pending') {
                return false;
            }
            const dueDate = new Date(p.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= futureDate;
        });
    },

    /**
     * Get overdue checks
     */
    getOverdueChecks() {
        const payments = Storage.getPayments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return payments.filter(p => {
            if (p.paymentMethod !== 'cek' || !p.dueDate || p.status !== 'pending') {
                return false;
            }
            const dueDate = new Date(p.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        });
    },

    /**
     * Toggle due date field based on payment method
     */
    toggleDueDateField() {
        const paymentMethod = document.getElementById('paymentMethod').value;
        const dueDateGroup = document.getElementById('dueDateGroup');
        const dueDateInput = document.getElementById('paymentDueDate');

        if (paymentMethod === 'cek') {
            dueDateGroup.style.display = 'block';
            dueDateInput.setAttribute('required', 'required');

            // Auto-set status to pending for checks
            const statusSelect = document.getElementById('paymentStatus');
            if (statusSelect.value !== 'pending') {
                statusSelect.value = 'pending';
            }
        } else {
            dueDateGroup.style.display = 'none';
            dueDateInput.removeAttribute('required');
            dueDateInput.value = '';
        }
    },

    /**
     * Initialize check module
     */
    init() {
        // Add event listener for payment method change
        const paymentMethodSelect = document.getElementById('paymentMethod');
        if (paymentMethodSelect) {
            paymentMethodSelect.addEventListener('change', () => this.toggleDueDateField());
        }
    }
};
