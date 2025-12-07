// ============================================
// REPORTS MODULE - Reporting & Excel Export
// ============================================

const Reports = {
    currentStartDate: '',
    currentEndDate: '',
    charts: {
        category: null,
        project: null
    },

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        // Set default date range (current month)
        this.currentStartDate = Utils.getFirstDayOfMonth();
        this.currentEndDate = Utils.getLastDayOfMonth();

        document.getElementById('reportStartDate').value = this.currentStartDate;
        document.getElementById('reportEndDate').value = this.currentEndDate;

        this.populateFilters();
        this.generateReports();
    },

    populateFilters() {
        // Projects
        const projects = Storage.getProjects();
        const projectSelect = document.getElementById('reportFilterProject');
        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">Tümü</option>' +
                projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }

        // Recipients
        const recipients = Storage.getRecipients();
        const recipientSelect = document.getElementById('reportFilterRecipient');
        if (recipientSelect) {
            recipientSelect.innerHTML = '<option value="">Tümü</option>' +
                recipients.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        }

        // Categories
        const categories = Storage.getCategories();
        const categorySelect = document.getElementById('reportFilterCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Tümü</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    },

    getFilteredPayments() {
        this.currentStartDate = document.getElementById('reportStartDate').value;
        this.currentEndDate = document.getElementById('reportEndDate').value;
        const projectId = document.getElementById('reportFilterProject').value;
        const recipientId = document.getElementById('reportFilterRecipient').value;
        const categoryId = document.getElementById('reportFilterCategory').value;

        if (!this.currentStartDate || !this.currentEndDate) {
            Utils.showToast('Lütfen tarih aralığı seçin!', 'error');
            return [];
        }

        let payments = Storage.getPaymentsByDateRange(this.currentStartDate, this.currentEndDate);

        if (projectId) {
            payments = payments.filter(p => p.projectId === projectId);
        }
        if (recipientId) {
            payments = payments.filter(p => p.recipientId === recipientId);
        }
        if (categoryId) {
            payments = payments.filter(p => p.categoryId === categoryId);
        }

        return payments;
    },

    // ============================================
    // GENERATE REPORTS
    // ============================================
    generateReports() {
        const payments = this.getFilteredPayments();

        // Pass filtered payments to generator functions instead of re-fetching
        this.generateMonthlyReport(payments);
        this.generateCategoryReport(payments);
        this.generateProjectReport(payments);
        this.generateRecipientReport(payments);
    },

    // Monthly report
    generateMonthlyReport(payments) {
        // payments argument is now passed in
        // const payments = Storage.getPaymentsByDateRange(this.currentStartDate, this.currentEndDate); // REMOVED

        const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const paid = payments.filter(p => p.status === 'paid');
        const paidTotal = paid.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const pending = payments.filter(p => p.status === 'pending');
        const pendingTotal = pending.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Group by payment method
        const byMethod = Utils.groupBy(payments, 'paymentMethod');
        const methodTotals = Object.entries(byMethod).map(([method, items]) => ({
            method,
            total: items.reduce((sum, p) => sum + parseFloat(p.amount), 0)
        }));

        const container = document.getElementById('monthlyReport');
        container.innerHTML = `
            <div class="report-item">
                <span class="report-label">Toplam Ödeme</span>
                <span class="report-value">${Utils.formatCurrency(total)}</span>
            </div>
            <div class="report-item">
                <span class="report-label">Ödenenler (${paid.length} adet)</span>
                <span class="report-value">${Utils.formatCurrency(paidTotal)}</span>
            </div>
            <div class="report-item">
                <span class="report-label">Bekleyenler (${pending.length} adet)</span>
                <span class="report-value" style="color: var(--warning);">${Utils.formatCurrency(pendingTotal)}</span>
            </div>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">
            <h4 style="margin-bottom: 1rem; font-size: 1rem;">Ödeme Yöntemine Göre</h4>
            ${methodTotals.map(item => `
                <div class="report-item">
                    <span class="report-label">${Utils.getPaymentMethodLabel(item.method)}</span>
                    <span class="report-value">${Utils.formatCurrency(item.total)}</span>
                </div>
            `).join('')}
        `;
    },

    // Category report
    generateCategoryReport(payments) {
        // const payments = Storage.getPaymentsByDateRange(this.currentStartDate, this.currentEndDate);
        const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Group by category
        const byCategory = Utils.groupBy(payments, 'categoryId');
        const categoryTotals = Object.entries(byCategory).map(([catId, items]) => {
            const category = Storage.getCategory(catId);
            const amount = items.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            return {
                category,
                amount,
                percentage: Utils.calculatePercentage(amount, total),
                count: items.length
            };
        }).sort((a, b) => b.amount - a.amount);

        // Render Chart
        this.renderCategoryChart(categoryTotals);

        const container = document.getElementById('categoryReport');

        if (categoryTotals.length === 0) {
            container.innerHTML = UI.getEmptyStateHTML('Bu tarih aralığında ödeme yok', 'event_busy');
            return;
        }

        container.innerHTML = categoryTotals.map(item => `
            <div class="report-item">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons" style="font-size: 1.25rem; color: ${item.category?.color};">
                        ${item.category?.icon || 'label'}
                    </span>
                    <span class="report-label">${item.category?.name || 'Silinmiş'}</span>
                    <span style="color: var(--text-tertiary); font-size: 0.875rem;">(${item.count} adet)</span>
                </div>
                <div style="text-align: right;">
                    <div class="report-value">${Utils.formatCurrency(item.amount)}</div>
                    <div style="font-size: 0.875rem; color: var(--text-tertiary);">%${item.percentage}</div>
                </div>
            </div>
        `).join('');
    },

    renderCategoryChart(data) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        if (data.length === 0) return;

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.category?.name || 'Diğer'),
                datasets: [{
                    data: data.map(d => d.amount),
                    backgroundColor: data.map(d => d.category?.color || '#cbd5e1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12
                        }
                    }
                }
            }
        });
    },

    // Project report
    generateProjectReport(payments) {
        // const payments = Storage.getPaymentsByDateRange(this.currentStartDate, this.currentEndDate);

        // Group by project
        const byProject = Utils.groupBy(payments, 'projectId');
        const projectTotals = Object.entries(byProject).map(([projId, items]) => {
            const project = Storage.getProject(projId);
            const amount = items.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            return {
                project,
                amount,
                count: items.length
            };
        }).sort((a, b) => b.amount - a.amount);

        // Render Chart
        this.renderProjectChart(projectTotals);

        const container = document.getElementById('projectReport');

        if (projectTotals.length === 0) {
            container.innerHTML = UI.getEmptyStateHTML('Bu tarih aralığında ödeme yok', 'event_busy');
            return;
        }

        container.innerHTML = projectTotals.map(item => `
            <div class="report-item">
                <div>
                    <div class="report-label">${item.project?.name || 'Silinmiş Proje'}</div>
                    <div style="font-size: 0.875rem; color: var(--text-tertiary);">${item.count} ödeme</div>
                </div>
                <span class="report-value">${Utils.formatCurrency(item.amount)}</span>
            </div>
        `).join('');
    },

    renderProjectChart(data) {
        const ctx = document.getElementById('projectChart');
        if (!ctx) return;

        if (this.charts.project) {
            this.charts.project.destroy();
        }

        if (data.length === 0) return;

        this.charts.project = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.project?.name || 'Diğer'),
                datasets: [{
                    label: 'Toplam Harcama',
                    data: data.map(d => d.amount),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₺' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    },

    // Recipient report
    generateRecipientReport(payments) {
        // const payments = Storage.getPaymentsByDateRange(this.currentStartDate, this.currentEndDate);

        // Group by recipient
        const byRecipient = Utils.groupBy(payments, 'recipientId');
        const recipientTotals = Object.entries(byRecipient).map(([recId, items]) => {
            const recipient = Storage.getRecipient(recId);
            const amount = items.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            return {
                recipient,
                amount,
                count: items.length
            };
        }).sort((a, b) => b.amount - a.amount).slice(0, 10); // Top 10

        const container = document.getElementById('recipientReport');

        if (recipientTotals.length === 0) {
            container.innerHTML = UI.getEmptyStateHTML('Bu tarih aralığında ödeme yok', 'event_busy');
            return;
        }

        container.innerHTML = recipientTotals.map((item, index) => `
            <div class="report-item">
                <div>
                    <div class="report-label">${index + 1}. ${item.recipient?.name || 'Silinmiş'}</div>
                    <div style="font-size: 0.875rem; color: var(--text-tertiary);">
                        ${item.count} ödeme • ${Utils.getRecipientTypeLabel(item.recipient?.type)}
                    </div>
                </div>
                <span class="report-value">${Utils.formatCurrency(item.amount)}</span>
            </div>
        `).join('');
    },

    // ============================================
    // EXCEL EXPORT
    // ============================================
    exportToExcel() {
        const payments = this.getFilteredPayments();

        if (payments.length === 0) {
            Utils.showToast('Seçili tarih aralığında ve filtrelerde ödeme yok!', 'error');
            return;
        }

        // Prepare data for Excel
        const data = payments.map(payment => {
            const project = Storage.getProject(payment.projectId);
            const recipient = Storage.getRecipient(payment.recipientId);
            const category = Storage.getCategory(payment.categoryId);

            return {
                'Tarih': Utils.formatDateShort(payment.paymentDate),
                'Proje': project?.name || '-',
                'Firma': recipient?.name || '-',
                'Firma Tipi': Utils.getRecipientTypeLabel(recipient?.type),
                'Kategori': category?.name || '-',
                'Açıklama': payment.description || '-',
                'Ödeme Yöntemi': Utils.getPaymentMethodLabel(payment.paymentMethod),
                'Tutar (₺)': parseFloat(payment.amount),
                'Durum': Utils.getStatusLabel(payment.status)
            };
        });

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 }, // Tarih
            { wch: 20 }, // Proje
            { wch: 25 }, // Firma
            { wch: 12 }, // Firma Tipi
            { wch: 15 }, // Kategori
            { wch: 30 }, // Açıklama
            { wch: 15 }, // Ödeme Yöntemi
            { wch: 12 }, // Tutar
            { wch: 12 }  // Durum
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Ödemeler');

        // Generate filename
        const filename = `Odemeler_${this.currentStartDate}_${this.currentEndDate}.xlsx`;

        // Write file
        XLSX.writeFile(wb, filename);

        Utils.showToast('Excel dosyası başarıyla oluşturuldu!', 'success');
    }
};
