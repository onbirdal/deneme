// ============================================
// UI MODULE - User Interface Management
// ============================================

const UI = {
    currentFilters: {
        project: '',
        recipient: '',
        category: '',
        status: '',
        paymentMethod: '',
        startDate: '',
        endDate: '',
        search: ''
    },

    currentMaterialFilters: {
        project: '',
        supplier: '',
        category: '',
        startDate: '',
        endDate: '',
        search: ''
    },

    currentRecipientType: '',
    currentProjectStatus: '',
    currentDocuments: [],

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        this.setupEventListeners();
        this.loadDashboard();
    },

    setupEventListeners() {
        // Payment form
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePayment();
        });

        // Recipient form
        document.getElementById('recipientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecipient();
        });

        // Project form
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Category form
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Contract form
        // Contract form
        document.getElementById('contractForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContract();
        });

        document.getElementById('contractDocuments').addEventListener('change', (e) => {
            this.handleDocumentUpload(e);
        });

        // Material form
        document.getElementById('materialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaterial();
        });

        // Material Category form
        document.getElementById('materialCategoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaterialCategory();
        });

        // Document upload
        document.getElementById('paymentDocuments').addEventListener('change', (e) => {
            this.handleDocumentUpload(e);
        });

        document.getElementById('materialDocuments').addEventListener('change', (e) => {
            this.handleDocumentUpload(e);
        });

        // Filters
        document.getElementById('filterProject').addEventListener('change', () => this.applyPaymentFilters());
        document.getElementById('filterRecipient').addEventListener('change', () => this.applyPaymentFilters());
        document.getElementById('filterCategory').addEventListener('change', () => this.applyPaymentFilters());
        document.getElementById('filterStatus').addEventListener('change', () => this.applyPaymentFilters());
        document.getElementById('filterPaymentMethod').addEventListener('change', () => this.applyPaymentFilters());
        document.getElementById('filterStartDate').addEventListener('change', () => this.applyPaymentFilters());
        document.getElementById('filterEndDate').addEventListener('change', () => this.applyPaymentFilters());

        // Material Filters
        const matProject = document.getElementById('filterMaterialProject');
        if (matProject) matProject.addEventListener('change', () => this.applyMaterialFilters());

        const matSupplier = document.getElementById('filterMaterialSupplier');
        if (matSupplier) matSupplier.addEventListener('change', () => this.applyMaterialFilters());

        const matCategory = document.getElementById('filterMaterialCategory');
        if (matCategory) matCategory.addEventListener('change', () => this.applyMaterialFilters());

        const matStartDate = document.getElementById('filterMaterialStartDate');
        if (matStartDate) matStartDate.addEventListener('change', () => this.applyMaterialFilters());

        const matEndDate = document.getElementById('filterMaterialEndDate');
        if (matEndDate) matEndDate.addEventListener('change', () => this.applyMaterialFilters());

        const searchMaterials = document.getElementById('searchMaterials');
        if (searchMaterials) searchMaterials.addEventListener('input',
            Utils.debounce(() => this.applyMaterialFilters(), 300)
        );

        // Search with debounce
        document.getElementById('searchPayments').addEventListener('input',
            Utils.debounce(() => this.applyPaymentFilters(), 300)
        );

        document.getElementById('searchRecipients').addEventListener('input',
            Utils.debounce(() => this.renderRecipients(), 300)
        );

        // Initialize check module
        CheckModule.init();
    },

    // ============================================
    // DASHBOARD
    // ============================================
    loadDashboard() {
        const startOfMonth = Utils.getFirstDayOfMonth();
        const endOfMonth = Utils.getLastDayOfMonth();
        const monthlyPayments = Storage.getPaymentsByDateRange(startOfMonth, endOfMonth);

        // 1. Monthly Total
        const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        this.animateValue('statMonthlyTotal', 0, monthlyTotal, 1000, true);

        // Calculate Monthly Change (Simple comparison with previous month)
        // For now, let's keep the existing logic or simplify if Storage.getStats is too rigid
        // Let's rely on manual calculation for better control
        const lastMonthStart = Utils.addMonths(startOfMonth, -1);
        const lastMonthEnd = Utils.addMonths(endOfMonth, -1); // This might need a proper helper, but let's assume getStats logic was fine or re-implement simple version.
        // Actually, let's use the valid Storage.getStats for change percentage if it works, strictly for that.
        const stats = Storage.getStats();

        // Update monthly change text
        const changeEl = document.getElementById('statMonthlyChange');
        if (stats.monthlyChange > 0) {
            changeEl.textContent = `+${stats.monthlyChange}% geçen aya göre`;
            changeEl.className = 'stat-change positive';
        } else if (stats.monthlyChange < 0) {
            changeEl.textContent = `${stats.monthlyChange}% geçen aya göre`;
            changeEl.className = 'stat-change negative';
        } else {
            changeEl.textContent = 'Geçen ayla aynı';
            changeEl.className = 'stat-change';
        }

        // 2. Top Category (Monthly)
        const byCategory = Utils.groupBy(monthlyPayments, 'categoryId');
        let topCategory = { name: '-', amount: 0 };
        Object.entries(byCategory).forEach(([id, items]) => {
            const total = items.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            if (total > topCategory.amount) {
                const cat = Storage.getCategory(id);
                topCategory = { name: cat ? cat.name : 'Bilinmeyen', amount: total };
            }
        });
        document.getElementById('statTopCategory').innerHTML = `
            ${topCategory.name}
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
                ${Utils.formatCurrency(topCategory.amount)}
            </div>
        `;

        // 3. Top Recipient (Monthly)
        const byRecipient = Utils.groupBy(monthlyPayments, 'recipientId');
        let topRecipient = { name: '-', amount: 0 };
        Object.entries(byRecipient).forEach(([id, items]) => {
            const total = items.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            if (total > topRecipient.amount) {
                const rec = Storage.getRecipient(id);
                topRecipient = { name: rec ? rec.name : 'Bilinmeyen', amount: total };
            }
        });
        document.getElementById('statTopRecipient').innerHTML = `
            ${topRecipient.name}
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
                ${Utils.formatCurrency(topRecipient.amount)}
            </div>
        `;

        // 4. Next Due Check
        const nextCheck = this.getNextDueCheck();
        if (nextCheck) {
            this.animateValue('statNextCheck', 0, nextCheck.amount, 1000, true);
            const daysUntil = Math.ceil((new Date(nextCheck.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            const dateEl = document.getElementById('statNextCheckDate');
            if (daysUntil < 0) {
                dateEl.textContent = `${Math.abs(daysUntil)} gün gecikmiş`;
                dateEl.className = 'stat-change negative';
            } else if (daysUntil === 0) {
                dateEl.textContent = 'Bugün';
                dateEl.className = 'stat-change warning';
            } else if (daysUntil <= 7) {
                dateEl.textContent = `${daysUntil} gün içinde`;
                dateEl.className = 'stat-change warning';
            } else {
                dateEl.textContent = Utils.formatDate(nextCheck.dueDate);
                dateEl.className = 'stat-change';
            }
        } else {
            document.getElementById('statNextCheck').textContent = '-';
            document.getElementById('statNextCheckDate').textContent = 'Çek yok';
        }

        // Update badge
        const pendingCount = Storage.getPendingPayments().length;
        const badge = document.getElementById('pendingPaymentsBadge');
        if (pendingCount > 0) {
            badge.textContent = pendingCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

        // Render recent payments
        this.renderRecentPayments();

        // Render pending payments
        this.renderPendingPayments();
    },

    animateValue(id, start, end, duration, isCurrency = false) {
        if (start === end) return;
        const obj = document.getElementById(id);
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / (range / 100))); // Adjust step size logic if range is small

        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            current = Math.floor(progress * (end - start) + start);

            if (isCurrency) {
                // For currency, we might want to manually format slightly differently during animation or just show int
                // Let's just update periodically or use exact math
                // Actually, direct calculation is better
                const val = progress * (end - start) + start;
                obj.textContent = Utils.formatCurrency(val);
            } else {
                obj.textContent = current;
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Ensure final value is exact format
                obj.textContent = isCurrency ? Utils.formatCurrency(end) : end;
            }
        };

        window.requestAnimationFrame(step);
    },

    getEmptyStateHTML(message, icon = 'info', description = '', actionHtml = '') {
        return `
            <div class="empty-state-container">
                <div class="empty-state-icon">
                    <span class="material-icons">${icon}</span>
                </div>
                <h4 class="empty-state-title">${message}</h4>
                ${description ? `<p class="empty-state-description">${description}</p>` : ''}
                ${actionHtml ? `<div class="empty-state-action">${actionHtml}</div>` : ''}
            </div>
        `;
    },

    renderRecentPayments() {
        const payments = Storage.getPayments()
            .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
            .slice(0, 5);

        const container = document.getElementById('recentPayments');

        if (payments.length === 0) {
            container.innerHTML = this.getEmptyStateHTML(
                'Henüz ödeme kaydı bulunmuyor',
                'payments',
                'Yeni ödemeler eklediğinizde burada görünecek.'
            );
            return;
        }

        container.innerHTML = payments.map(payment => {
            const project = Storage.getProject(payment.projectId);
            const recipient = Storage.getRecipient(payment.recipientId);
            const category = Storage.getCategory(payment.categoryId);

            return `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-title">${project?.name || '-'}</span>
                            <span class="timeline-amount">${Utils.formatCurrency(payment.amount)}</span>
                        </div>
                        <div class="timeline-meta">
                            <span>${recipient?.name || '-'}</span>
                            <span>•</span>
                            <span>${category?.name || '-'}</span>
                            <span>•</span>
                            <span>${Utils.formatDateShort(payment.paymentDate)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderPendingPayments() {
        const payments = Storage.getPendingPayments()
            .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
            .slice(0, 5);

        const container = document.getElementById('pendingPaymentsList');

        if (payments.length === 0) {
            container.innerHTML = this.getEmptyStateHTML(
                'Bekleyen ödeme yok',
                'check_circle',
                'Tüm ödemeleriniz güncel görünüyor.'
            );
            return;
        }

        container.innerHTML = payments.map(payment => {
            const recipient = Storage.getRecipient(payment.recipientId);
            const project = Storage.getProject(payment.projectId);

            return `
                <div class="pending-item">
                    <div class="pending-header">
                        <span class="pending-title">${recipient?.name || '-'}</span>
                        <span class="pending-amount">${Utils.formatCurrency(payment.amount)}</span>
                    </div>
                    <div class="pending-meta">
                        ${project?.name || '-'} • ${Utils.formatDateShort(payment.paymentDate)}
                    </div>
                </div>
            `;
        }).join('');
    },

    // ============================================
    // PAYMENTS
    // ============================================
    loadPaymentsPage() {
        this.populatePaymentFilters();
        this.renderProjectQuickFilters();
        this.renderPayments();
    },

    renderProjectQuickFilters() {
        const projects = Storage.getProjects().filter(p => p.isActive !== false);
        const container = document.getElementById('projectQuickFilters');

        if (projects.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = projects.map(project => `
            <button class="project-filter-btn" onclick="UI.quickFilterProject('${project.id}')" data-project="${project.id}">
                <span class="material-icons">construction</span>
                ${project.name}
            </button>
        `).join('');
    },

    quickFilterProject(projectId) {
        document.getElementById('filterProject').value = projectId;
        this.applyPaymentFilters();

        // Update active button
        document.querySelectorAll('.project-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.project === projectId) {
                btn.classList.add('active');
            }
        });
    },

    populatePaymentFilters() {
        // Projects
        const projects = Storage.getProjects();
        const projectSelect = document.getElementById('filterProject');
        projectSelect.innerHTML = '<option value="">Tümü</option>' +
            projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        // Recipients
        const recipients = Storage.getRecipients();
        const recipientSelect = document.getElementById('filterRecipient');
        recipientSelect.innerHTML = '<option value="">Tümü</option>' +
            recipients.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

        // Categories
        const categories = Storage.getCategories();
        const categorySelect = document.getElementById('filterCategory');
        categorySelect.innerHTML = '<option value="">Tümü</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    },

    applyPaymentFilters() {
        this.currentFilters = {
            project: document.getElementById('filterProject').value,
            recipient: document.getElementById('filterRecipient').value,
            category: document.getElementById('filterCategory').value,
            status: document.getElementById('filterStatus').value,
            paymentMethod: document.getElementById('filterPaymentMethod').value,
            startDate: document.getElementById('filterStartDate').value,
            endDate: document.getElementById('filterEndDate').value,
            search: document.getElementById('searchPayments').value
        };
        this.renderPayments();
    },

    resetPaymentFilters() {
        document.getElementById('filterProject').value = '';
        document.getElementById('filterRecipient').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPaymentMethod').value = '';
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('searchPayments').value = '';
        this.currentFilters = {
            project: '', recipient: '', category: '', status: '', paymentMethod: '',
            startDate: '', endDate: '', search: ''
        };
        this.renderPayments();
    },

    currentCheckStatus: '', // 'pending', 'paid', 'overdue'

    setPaymentTypeFilter(type) {
        // Update tabs
        document.querySelectorAll('[data-payment-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.paymentType === type);
        });

        // Show/hide check status tabs
        const checkTabs = document.getElementById('checkStatusTabs');
        if (type === 'cek') {
            checkTabs.style.display = 'flex';
            // Set payment method filter to 'cek'
            document.getElementById('filterPaymentMethod').value = 'cek';
        } else {
            checkTabs.style.display = 'none';
            // Reset payment method filter if it was 'cek'
            if (document.getElementById('filterPaymentMethod').value === 'cek') {
                document.getElementById('filterPaymentMethod').value = '';
            }
            this.currentCheckStatus = ''; // Reset check status
        }

        this.applyPaymentFilters();
    },

    setCheckStatusFilter(status) {
        this.currentCheckStatus = status;

        // Update tabs
        const container = document.querySelector('#payments-page .project-quick-filters'); // Assuming check tabs are here or similar
        // Actually check tabs are in .quick-filters in index.html, let's target generic parent
        const page = document.getElementById('payments-page');
        if (page) {
            page.querySelectorAll('[data-check-status]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.checkStatus === status);
            });
        }

        this.renderPayments();
    },

    renderPayments() {
        let payments = Storage.getPayments();

        // Apply filters
        if (this.currentFilters.project) {
            payments = payments.filter(p => p.projectId === this.currentFilters.project);
        }
        if (this.currentFilters.recipient) {
            payments = payments.filter(p => p.recipientId === this.currentFilters.recipient);
        }
        if (this.currentFilters.category) {
            payments = payments.filter(p => p.categoryId === this.currentFilters.category);
        }
        if (this.currentFilters.status) {
            payments = payments.filter(p => p.status === this.currentFilters.status);
        }
        if (this.currentFilters.paymentMethod) {
            payments = payments.filter(p => p.paymentMethod === this.currentFilters.paymentMethod);
        }
        if (this.currentFilters.startDate) {
            payments = payments.filter(p => p.paymentDate >= this.currentFilters.startDate);
        }
        if (this.currentFilters.endDate) {
            payments = payments.filter(p => p.paymentDate <= this.currentFilters.endDate);
        }
        if (this.currentFilters.search) {
            const term = this.currentFilters.search.toLowerCase();
            payments = payments.filter(p =>
                (p.description || '').toLowerCase().includes(term)
            );
        }

        // Apply Check Status Filter
        if (this.currentCheckStatus) {
            if (this.currentCheckStatus === 'overdue') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                payments = payments.filter(p => {
                    if (!p.dueDate || p.status !== 'pending') return false;
                    return new Date(p.dueDate) < today;
                });
            } else {
                payments = payments.filter(p => p.status === this.currentCheckStatus);
            }
        }

        // Sort by date descending
        payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        // Render table
        const thead = document.querySelector('.data-table thead tr');
        const isCheckView = document.getElementById('filterPaymentMethod').value === 'cek';

        // Update header based on view
        if (isCheckView) {
            thead.innerHTML = `
                <th>Tarih</th>
                <th>Vade Tarihi</th>
                <th>Proje</th>
                <th>Firma</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlemler</th>
            `;
        } else {
            thead.innerHTML = `
                <th>Tarih</th>
                <th>Proje</th>
                <th>Firma</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Ödeme Yöntemi</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlemler</th>
            `;
        }

        const tbody = document.getElementById('paymentsTableBody');

        if (payments.length === 0) {
            const emptyStateHtml = this.getEmptyStateHTML(
                'Ödeme bulunamadı',
                'receipt_long',
                'Filtrelerinizi değiştirmeyi deneyin veya yeni bir ödeme ekleyin.'
            );

            tbody.innerHTML = `
                <tr>
                    <td colspan="${isCheckView ? 9 : 9}" class="empty-state-cell">
                        ${emptyStateHtml}
                    </td>
                </tr>
            `;
            document.getElementById('totalPaymentsDisplay').textContent = '0';
            document.getElementById('totalAmountDisplay').textContent = Utils.formatCurrency(0);
            return;
        }

        tbody.innerHTML = payments.map(payment => {
            const project = Storage.getProject(payment.projectId);
            const recipient = Storage.getRecipient(payment.recipientId);
            const category = Storage.getCategory(payment.categoryId);

            // Calculate days remaining for checks
            let dateDisplay = Utils.formatDateShort(payment.paymentDate);
            let dueDateDisplay = '';

            if (isCheckView && payment.dueDate) {
                const days = Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                let daysClass = '';
                let daysText = '';

                if (payment.status === 'pending') {
                    if (days < 0) {
                        daysClass = 'text-danger';
                        daysText = `${Math.abs(days)} gün gecikmiş`;
                    } else if (days === 0) {
                        daysClass = 'text-warning';
                        daysText = 'Bugün';
                    } else {
                        daysText = `${days} gün kaldı`;
                    }
                }

                dueDateDisplay = `
                    <td>
                        <div style="display: flex; flex-direction: column;">
                            <span>${Utils.formatDateShort(payment.dueDate)}</span>
                            <span style="font-size: 0.75rem; font-weight: 600;" class="${daysClass}">${daysText}</span>
                        </div>
                    </td>
                `;
            }

            if (isCheckView) {
                return `
                    <tr>
                        <td>${dateDisplay}</td>
                        ${dueDateDisplay}
                        <td>${project?.name || '-'}</td>
                        <td>${recipient?.name || '-'}</td>
                        <td>
                            <span class="category-badge" style="background: ${category?.color}22; color: ${category?.color};">
                                <span class="material-icons" style="font-size: 1rem;">${category?.icon || 'label'}</span>
                                ${category?.name || '-'}
                            </span>
                        </td>
                        <td>${payment.description || '-'}</td>
                        <td><strong>${Utils.formatCurrency(payment.amount)}</strong></td>
                        <td>
                            <span class="status-badge ${payment.status}">
                                ${Utils.getStatusLabel(payment.status)}
                            </span>
                        </td>
                        <td>
                            <div class="card-actions">
                                <button class="icon-btn" onclick="UI.editPayment('${payment.id}')" title="Düzenle">
                                    <span class="material-icons">edit</span>
                                </button>
                                <button class="icon-btn" onclick="UI.deletePayment('${payment.id}')" title="Sil">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                return `
                    <tr>
                        <td>${Utils.formatDateShort(payment.paymentDate)}</td>
                        <td>${project?.name || '-'}</td>
                        <td>${recipient?.name || '-'}</td>
                        <td>
                            <span class="category-badge" style="background: ${category?.color}22; color: ${category?.color};">
                                <span class="material-icons" style="font-size: 1rem;">${category?.icon || 'label'}</span>
                                ${category?.name || '-'}
                            </span>
                        </td>
                        <td>${payment.description || '-'}</td>
                        <td>${Utils.getPaymentMethodLabel(payment.paymentMethod)}</td>
                        <td><strong>${Utils.formatCurrency(payment.amount)}</strong></td>
                        <td>
                            <span class="status-badge ${payment.status}">
                                ${Utils.getStatusLabel(payment.status)}
                            </span>
                        </td>
                        <td>
                            <div class="card-actions">
                                <button class="icon-btn" onclick="UI.editPayment('${payment.id}')" title="Düzenle">
                                    <span class="material-icons">edit</span>
                                </button>
                                <button class="icon-btn" onclick="UI.deletePayment('${payment.id}')" title="Sil">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).join('');

        // Update totals
        const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        document.getElementById('totalPaymentsDisplay').textContent = payments.length;
        document.getElementById('totalAmountDisplay').textContent = Utils.formatCurrency(totalAmount);
    },

    showPaymentModal(payment = null) {
        const modal = document.getElementById('paymentModal');
        const title = document.getElementById('paymentModalTitle');
        const form = document.getElementById('paymentForm');

        // Populate dropdowns
        this.populatePaymentModalDropdowns();

        if (payment) {
            // Edit mode
            title.textContent = 'Ödemeyi Düzenle';
            document.getElementById('paymentId').value = payment.id;
            document.getElementById('paymentProject').value = payment.projectId;
            document.getElementById('paymentRecipient').value = payment.recipientId;
            document.getElementById('paymentCategory').value = payment.categoryId;
            document.getElementById('paymentAmount').value = payment.amount;
            document.getElementById('paymentMethod').value = payment.paymentMethod;
            document.getElementById('paymentDate').value = payment.paymentDate;
            document.getElementById('paymentDueDate').value = payment.dueDate || '';
            document.getElementById('paymentStatus').value = payment.status;
            document.getElementById('paymentDescription').value = payment.description || '';
            this.currentDocuments = payment.documents || [];
            this.renderDocumentPreviews();
            // Toggle due date field based on payment method
            CheckModule.toggleDueDateField();
        } else {
            // Add mode
            title.textContent = 'Yeni Ödeme';
            form.reset();
            document.getElementById('paymentId').value = '';
            document.getElementById('paymentDate').value = Utils.getTodayDate();
            this.currentDocuments = [];
            this.renderDocumentPreviews();
            // Hide due date field by default
            document.getElementById('dueDateGroup').style.display = 'none';
        }

        modal.classList.add('active');
    },

    populatePaymentModalDropdowns() {
        // Projects
        const projects = Storage.getProjects().filter(p => p.isActive !== false);
        const projectSelect = document.getElementById('paymentProject');
        projectSelect.innerHTML = '<option value="">Proje Seçin</option>' +
            projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        // Recipients
        const recipients = Storage.getRecipients();
        const recipientSelect = document.getElementById('paymentRecipient');
        recipientSelect.innerHTML = '<option value="">Firma Seçin (Opsiyonel)</option>' +
            recipients.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

        // Categories
        const categories = Storage.getCategories();
        const categorySelect = document.getElementById('paymentCategory');
        categorySelect.innerHTML = '<option value="">Kategori Seçin</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    },

    async savePayment() {
        const id = document.getElementById('paymentId').value;
        const data = {
            projectId: document.getElementById('paymentProject').value,
            recipientId: document.getElementById('paymentRecipient').value,
            categoryId: document.getElementById('paymentCategory').value,
            amount: parseFloat(document.getElementById('paymentAmount').value),
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentDate: document.getElementById('paymentDate').value,
            dueDate: document.getElementById('paymentDueDate').value || null,
            status: document.getElementById('paymentStatus').value,
            description: document.getElementById('paymentDescription').value,
            documents: this.currentDocuments
        };

        if (id) {
            Storage.updatePayment(id, data);
            Utils.showToast('Ödeme güncellendi!', 'success');
        } else {
            Storage.addPayment(data);
            Utils.showToast('Ödeme eklendi!', 'success');
        }

        this.closeModal('paymentModal');
        this.loadDashboard();
        if (app.currentPage === 'payments') {
            this.renderPayments();
        }
    },

    editPayment(id) {
        const payment = Storage.getPayment(id);
        if (payment) {
            this.showPaymentModal(payment);
        }
    },

    deletePayment(id) {
        if (Utils.confirm('Bu ödemeyi silmek istediğinizden emin misiniz?')) {
            Storage.deletePayment(id);
            Utils.showToast('Ödeme silindi!', 'success');
            this.loadDashboard();
            if (app.currentPage === 'payments') {
                this.renderPayments();
            }
        }
    },

    async handleDocumentUpload(e) {
        const inputId = e.target.id;
        let previewContainerId = 'documentPreviews';
        if (inputId === 'contractDocuments') {
            previewContainerId = 'contractDocumentPreviews';
        } else if (inputId === 'materialDocuments') {
            previewContainerId = 'materialDocumentPreviews';
        }
        const files = Array.from(e.target.files);

        for (const file of files) {
            try {
                const base64 = await Utils.fileToBase64(file);
                this.currentDocuments.push(base64);
            } catch (error) {
                console.error('File upload error:', error);
                Utils.showToast('Dosya yüklenemedi!', 'error');
            }
        }

        this.renderDocumentPreviews(previewContainerId);
        e.target.value = ''; // Reset input
    },

    renderDocumentPreviews(containerId = 'documentPreviews') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.currentDocuments.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.currentDocuments.map((doc, index) => `
            <div class="document-preview" onclick="UI.showLightbox('${doc}')">
                <img src="${doc}" alt="Belge ${index + 1}">
                <button type="button" class="document-preview-remove" onclick="event.stopPropagation(); UI.removeDocument(${index})">
                    <span class="material-icons" style="font-size: 16px;">close</span>
                </button>
            </div>
        `).join('');
    },

    removeDocument(index) {
        this.currentDocuments.splice(index, 1);

        // Determine which container to refresh based on active modal
        if (document.getElementById('contractModal').classList.contains('active')) {
            this.renderDocumentPreviews('contractDocumentPreviews');
        } else if (document.getElementById('materialModal').classList.contains('active')) {
            this.renderDocumentPreviews('materialDocumentPreviews');
        } else {
            this.renderDocumentPreviews('documentPreviews');
        }
    },

    showLightbox(src) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImage');
        img.src = src;
        lightbox.classList.add('active');
    },

    closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
    },

    // ============================================
    // RECIPIENTS
    // ============================================
    loadRecipientsPage() {
        this.renderRecipients();
    },

    filterRecipients(type) {
        this.currentRecipientType = type;

        // Update active tab - Scoped to recipients page
        const container = document.querySelector('#recipients-page .filter-tabs');
        if (container) {
            container.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.type === type) {
                    tab.classList.add('active');
                }
            });
        }

        this.renderRecipients();
    },

    renderRecipients() {
        let recipients = Storage.getRecipients();

        // Apply type filter
        if (this.currentRecipientType) {
            recipients = recipients.filter(r => r.type === this.currentRecipientType);
        }

        // Apply search
        const searchTerm = document.getElementById('searchRecipients').value;
        if (searchTerm) {
            recipients = Utils.filterBySearch(recipients, searchTerm, ['name', 'phone', 'email']);
        }

        const container = document.getElementById('recipientsGrid');

        if (recipients.length === 0) {
            container.innerHTML = this.getEmptyStateHTML(
                'Firma bulunamadı',
                'people',
                'Henüz kayıtlı firma yok. Yeni bir firma ekleyerek başlayın.',
                `<button class="btn btn-primary" onclick="UI.showRecipientModal()">
                    <span class="material-icons">add</span>
                    Yeni Firma Ekle
                </button>`
            );
            return;
        }

        container.innerHTML = recipients.map(recipient => {
            const payments = Storage.getPaymentsByRecipient(recipient.id);
            const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            return `
                <div class="recipient-card" onclick="app.showRecipientDetail('${recipient.id}')">
                    <div class="recipient-header">
                        <div class="recipient-info">
                            <h3>${recipient.name}</h3>
                            <span class="recipient-type ${recipient.type}">${Utils.getRecipientTypeLabel(recipient.type)}</span>
                        </div>
                        <div class="card-actions">
                            <button class="icon-btn" onclick="event.stopPropagation(); UI.editRecipient('${recipient.id}')">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="icon-btn" onclick="event.stopPropagation(); UI.deleteRecipient('${recipient.id}')">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                    <div class="recipient-details">
                        ${recipient.phone ? `
                            <div class="detail-item">
                                <span class="material-icons">phone</span>
                                <span>${recipient.phone}</span>
                            </div>
                        ` : ''}
                        ${recipient.email ? `
                            <div class="detail-item">
                                <span class="material-icons">email</span>
                                <span>${recipient.email}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="recipient-stats">
                        <div class="stat">
                            <span class="stat-label">Toplam Ödeme</span>
                            <span class="stat-value">${Utils.formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showRecipientModal(recipient = null) {
        const modal = document.getElementById('recipientModal');
        const title = document.getElementById('recipientModalTitle');
        const form = document.getElementById('recipientForm');

        if (recipient) {
            // Edit mode
            title.textContent = 'Firmayı Düzenle';
            document.getElementById('recipientId').value = recipient.id;
            document.getElementById('recipientName').value = recipient.name;
            document.getElementById('recipientType').value = recipient.type;
            document.getElementById('recipientPhone').value = recipient.phone || '';
            document.getElementById('recipientEmail').value = recipient.email || '';
            document.getElementById('recipientAddress').value = recipient.address || '';
            document.getElementById('recipientIsActive').checked = recipient.isActive !== false;
        } else {
            // Add mode
            title.textContent = 'Yeni Firma';
            form.reset();
            document.getElementById('recipientId').value = '';
            document.getElementById('recipientIsActive').checked = true;
        }

        modal.classList.add('active');
    },

    saveRecipient() {
        const id = document.getElementById('recipientId').value;
        const data = {
            name: document.getElementById('recipientName').value,
            type: document.getElementById('recipientType').value,
            phone: document.getElementById('recipientPhone').value,
            email: document.getElementById('recipientEmail').value,
            address: document.getElementById('recipientAddress').value,
            isActive: document.getElementById('recipientIsActive').checked
        };

        if (id) {
            Storage.updateRecipient(id, data);
            Utils.showToast('Firma güncellendi!', 'success');
        } else {
            Storage.addRecipient(data);
            Utils.showToast('Firma eklendi!', 'success');
        }

        this.closeModal('recipientModal');
        this.renderRecipients();
    },

    editRecipient(id) {
        const recipient = Storage.getRecipient(id);
        if (recipient) {
            this.showRecipientModal(recipient);
        }
    },

    deleteRecipient(id) {
        if (Utils.confirm('Bu firmayı silmek istediğinizden emin misiniz?')) {
            Storage.deleteRecipient(id);
            Utils.showToast('Firma silindi!', 'success');
            this.renderRecipients();
        }
    },

    // ============================================
    // PROJECTS
    // ============================================
    loadProjectsPage() {
        this.renderProjects();
    },

    filterProjects(status) {
        this.currentProjectStatus = status;

        // Update active tab - Scoped to projects page
        const container = document.querySelector('#projects-page .filter-tabs');
        if (container) {
            container.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.status === status) {
                    tab.classList.add('active');
                }
            });
        }

        this.renderProjects();
    },

    renderProjects() {
        let projects = Storage.getProjects();

        // Apply status filter
        if (this.currentProjectStatus) {
            projects = projects.filter(p => p.status === this.currentProjectStatus);
        }

        const container = document.getElementById('projectsGrid');

        if (projects.length === 0) {
            container.innerHTML = this.getEmptyStateHTML(
                'Proje bulunamadı',
                'construction',
                'Henüz kayıtlı proje yok. Yeni bir proje ekleyerek başlayın.',
                `<button class="btn btn-primary" onclick="UI.showProjectModal()">
                    <span class="material-icons">add</span>
                    Yeni Proje Ekle
                </button>`
            );
            return;
        }

        container.innerHTML = projects.map(project => {
            const payments = Storage.getPaymentsByProject(project.id);
            const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

            let statusIcon = {
                'active': 'play_circle_filled',
                'completed': 'check_circle',
                'paused': 'pause_circle_filled'
            }[project.status];

            let statusLabel = Utils.getStatusLabel(project.status);
            let statusClass = project.status;
            let cardClass = 'project-card';

            // Override if inactive
            if (project.isActive === false) {
                statusIcon = 'archive';
                statusLabel = 'Pasif';
                statusClass = 'passive';
                cardClass += ' passive';
            }

            return `
                <div class="${cardClass}" onclick="app.showProjectDetail('${project.id}')">
                    <div class="project-header">
                        <div class="project-info">
                            <h3>${project.name}</h3>
                            <span class="status-badge ${statusClass}">
                                <span class="material-icons">${statusIcon}</span>
                                ${statusLabel}
                            </span>
                        </div>
                        <div class="card-actions">
                            <button class="icon-btn" onclick="event.stopPropagation(); UI.editProject('${project.id}')">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="icon-btn" onclick="event.stopPropagation(); UI.deleteProject('${project.id}')">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                    ${project.location ? `
                        <div class="project-location">
                            <span class="material-icons">location_on</span>
                            <span>${project.location}</span>
                        </div>
                    ` : ''}
                    <div class="project-stats">
                        <div class="stat start-date" style="font-size:0.7rem;">
                            <span class="stat-label">Başlangıç</span>
                            <span class="stat-value">${Utils.formatDateShort(project.startDate)}</span>
                        </div>
                        <div class="stat total-spent">
                            <span class="stat-label">Toplam Harcama</span>
                            <span class="stat-value">${Utils.formatCurrency(totalSpent)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showProjectModal(project = null) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const form = document.getElementById('projectForm');

        if (project) {
            // Edit mode
            title.textContent = 'Projeyi Düzenle';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectLocation').value = project.location || '';
            document.getElementById('projectStartDate').value = project.startDate;
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectIsActive').checked = project.isActive !== false;
        } else {
            // Add mode
            title.textContent = 'Yeni Proje';
            form.reset();
            document.getElementById('projectId').value = '';
            document.getElementById('projectStartDate').value = Utils.getTodayDate();
            document.getElementById('projectIsActive').checked = true;
        }

        modal.classList.add('active');
    },

    saveProject() {
        const id = document.getElementById('projectId').value;
        const data = {
            name: document.getElementById('projectName').value,
            location: document.getElementById('projectLocation').value,
            startDate: document.getElementById('projectStartDate').value,
            status: document.getElementById('projectStatus').value,
            isActive: document.getElementById('projectIsActive').checked
        };

        if (id) {
            Storage.updateProject(id, data);
            Utils.showToast('Proje güncellendi!', 'success');
        } else {
            Storage.addProject(data);
            Utils.showToast('Proje eklendi!', 'success');
        }

        this.closeModal('projectModal');
        this.loadDashboard();
        if (app.currentPage === 'projects') {
            this.renderProjects();
        }
    },

    editProject(id) {
        const project = Storage.getProject(id);
        if (project) {
            this.showProjectModal(project);
        }
    },

    deleteProject(id) {
        if (Utils.confirm('Bu projeyi silmek istediğinizden emin misiniz? İlgili tüm ödemeler de silinecek!')) {
            Storage.deleteProject(id);
            Utils.showToast('Proje silindi!', 'success');
            this.loadDashboard();
            if (app.currentPage === 'projects') {
                this.renderProjects();
            }
        }
    },

    // ============================================
    // CATEGORIES
    // ============================================
    loadSettingsPage() {
        this.renderCategories();
        this.renderMaterialCategories();
    },

    renderCategories() {
        const categories = Storage.getCategories();
        const container = document.getElementById('categoriesGrid');

        container.innerHTML = categories.map(category => `
            <div class="category-item" style="border-color: ${category.color};">
                <div class="category-content">
                    <span class="material-icons" style="color: ${category.color};">${category.icon || 'label'}</span>
                    <span>${category.name}</span>
                </div>
                <div class="card-actions">
                    <button class="icon-btn" onclick="UI.editCategory('${category.id}')">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="icon-btn" onclick="UI.deleteCategory('${category.id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showCategoryModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        if (category) {
            // Edit mode
            title.textContent = 'Kategoriyi Düzenle';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryColor').value = category.color;
            document.getElementById('categoryIcon').value = category.icon || '';
        } else {
            // Add mode
            title.textContent = 'Yeni Kategori';
            form.reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryColor').value = '#3b82f6';
        }

        modal.classList.add('active');
    },

    saveCategory() {
        const id = document.getElementById('categoryId').value;
        const data = {
            name: document.getElementById('categoryName').value,
            color: document.getElementById('categoryColor').value,
            icon: document.getElementById('categoryIcon').value || 'label'
        };

        if (id) {
            Storage.updateCategory(id, data);
            Utils.showToast('Kategori güncellendi!', 'success');
        } else {
            Storage.addCategory(data);
            Utils.showToast('Kategori eklendi!', 'success');
        }

        this.closeModal('categoryModal');
        this.renderCategories();
    },

    editCategory(id) {
        const category = Storage.getCategory(id);
        if (category) {
            this.showCategoryModal(category);
        }
    },

    deleteCategory(id) {
        if (Utils.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            Storage.deleteCategory(id);
            Utils.showToast('Kategori silindi!', 'success');
            this.renderCategories();
        }
    },

    // Material Categories Logic
    renderMaterialCategories() {
        const categories = Storage.getMaterialCategories();
        const container = document.getElementById('materialCategoriesGrid');
        if (!container) return; // Guard clause

        container.innerHTML = categories.map(category => `
            <div class="category-item" style="border-color: ${category.color};">
                <div class="category-content">
                    <span class="material-icons" style="color: ${category.color};">${category.icon || 'label'}</span>
                    <span>${category.name}</span>
                </div>
                <div class="card-actions">
                    <button class="icon-btn" onclick="UI.editMaterialCategory('${category.id}')">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="icon-btn" onclick="UI.deleteMaterialCategory('${category.id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showMaterialCategoryModal(category = null) {
        const modal = document.getElementById('materialCategoryModal');
        const title = document.getElementById('materialCategoryModalTitle');
        const form = document.getElementById('materialCategoryForm');

        if (category) {
            // Edit mode
            title.textContent = 'Malzeme Kategorisini Düzenle';
            document.getElementById('materialCategoryId').value = category.id;
            document.getElementById('materialCategoryName').value = category.name;
            document.getElementById('materialCategoryColor').value = category.color;
            document.getElementById('materialCategoryIcon').value = category.icon || '';
        } else {
            // Add mode
            title.textContent = 'Yeni Malzeme Kategorisi';
            form.reset();
            document.getElementById('materialCategoryId').value = '';
            document.getElementById('materialCategoryColor').value = '#607d8b';
        }

        modal.classList.add('active');
    },

    saveMaterialCategory() {
        const id = document.getElementById('materialCategoryId').value;
        const data = {
            name: document.getElementById('materialCategoryName').value,
            color: document.getElementById('materialCategoryColor').value,
            icon: document.getElementById('materialCategoryIcon').value || 'label'
        };

        if (id) {
            Storage.updateMaterialCategory(id, data);
            Utils.showToast('Malzeme kategorisi güncellendi!', 'success');
        } else {
            Storage.addMaterialCategory(data);
            Utils.showToast('Malzeme kategorisi eklendi!', 'success');
        }

        this.closeModal('materialCategoryModal');
        this.renderMaterialCategories();
        // Also refresh dropdowns if we are on materials page
        if (app.currentPage === 'materials') {
            this.populateMaterialFilters();
        }
    },

    editMaterialCategory(id) {
        const category = Storage.getMaterialCategory(id);
        if (category) {
            this.showMaterialCategoryModal(category);
        }
    },

    deleteMaterialCategory(id) {
        if (Utils.confirm('Bu malzeme kategorisini silmek istediğinizden emin misiniz?')) {
            Storage.deleteMaterialCategory(id);
            Utils.showToast('Malzeme kategorisi silindi!', 'success');
            this.renderMaterialCategories();
        }
    },

    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    // ============================================
    // CHECK PAYMENTS HELPER
    // ============================================
    // ============================================
    // CONTRACTS
    // ============================================
    showContractModal(contract = null) {
        const modal = document.getElementById('contractModal');
        const title = document.getElementById('contractModalTitle');
        const form = document.getElementById('contractForm');

        // Get current recipient ID from the detail page header or stored state
        // We need a way to know which recipient we are adding a contract for.
        // Let's assume app.currentRecipientId is set when viewing detail page.
        // Or we can get it from the DOM if we are on the detail page.

        // For now, let's look at app.js to see how we can access the current recipient ID.
        // Since we don't have easy access to app state here, we'll rely on a hidden input or global variable if needed.
        // But wait, showRecipientDetail in app.js sets the view. We should store the ID somewhere.

        if (contract) {
            // Edit mode
            title.textContent = 'Sözleşmeyi Düzenle';
            document.getElementById('contractId').value = contract.id;
            document.getElementById('contractRecipientId').value = contract.recipientId;
            document.getElementById('contractName').value = contract.name;
            document.getElementById('contractAmount').value = contract.amount;
            document.getElementById('contractDate').value = contract.date;
            document.getElementById('contractStatus').value = contract.status;
            document.getElementById('contractNotes').value = contract.notes || '';
        } else {
            // Add mode
            title.textContent = 'Yeni Sözleşme';
            form.reset();
            document.getElementById('contractId').value = '';
            document.getElementById('contractDate').value = Utils.getTodayDate();

            // Try to get recipient ID from the detail page if we are there
            // This is a bit of a hack, ideally we should pass it in
            // But since the button is on the detail page...
            // Let's assume the user is on the recipient detail page.
            // We need to pass the recipient ID to this function or store it.
        }

        modal.classList.add('active');
    },

    saveContract() {
        const id = document.getElementById('contractId').value;
        const recipientId = document.getElementById('contractRecipientId').value;

        const data = {
            recipientId: recipientId,
            name: document.getElementById('contractName').value,
            amount: parseFloat(document.getElementById('contractAmount').value),
            date: document.getElementById('contractDate').value,
            status: document.getElementById('contractStatus').value,
            notes: document.getElementById('contractNotes').value
        };

        if (id) {
            Storage.updateContract(id, data);
            Utils.showToast('Sözleşme güncellendi!', 'success');
        } else {
            Storage.addContract(data);
            Utils.showToast('Sözleşme eklendi!', 'success');
        }

        this.closeModal('contractModal');

        // Refresh detail page
        if (app.currentPage === 'recipients' || document.getElementById('recipient-detail-page').classList.contains('active')) {
            app.showRecipientDetail(recipientId);
        }
    },

    editContract(id) {
        const contract = Storage.getContract(id);
        if (contract) {
            this.showContractModal(contract);
        }
    },

    deleteContract(id) {
        if (Utils.confirm('Bu sözleşmeyi silmek istediğinizden emin misiniz?')) {
            const contract = Storage.getContract(id);
            const recipientId = contract.recipientId;
            Storage.deleteContract(id);
            Utils.showToast('Sözleşme silindi!', 'success');

            // Refresh detail page
            app.showRecipientDetail(recipientId);
        }
    },

    getNextDueCheck() {
        return CheckModule.getNextDueCheck();
    },

    // ============================================
    // CONTRACTS
    // ============================================
    populateContractModalDropdowns() {
        // Projects
        const projects = Storage.getProjects().filter(p => p.isActive !== false);
        const projectSelect = document.getElementById('contractProject');
        projectSelect.innerHTML = '<option value="">Proje Seçin</option>' +
            projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    showContractModal() {
        const modal = document.getElementById('contractModal');
        const title = document.getElementById('contractModalTitle');
        const form = document.getElementById('contractForm');

        this.populateContractModalDropdowns();

        // Add mode
        title.textContent = 'Yeni Sözleşme';
        form.reset();
        document.getElementById('contractId').value = '';

        document.getElementById('contractStartDate').value = Utils.getTodayDate();
        document.getElementById('contractEndDate').value = '';

        // Reset Unit Price fields
        document.getElementById('isUnitPriceContract').checked = false;
        this.toggleContractType();
        document.getElementById('unitItemsList').innerHTML = '';

        this.currentDocuments = [];
        this.renderDocumentPreviews('contractDocumentPreviews');

        modal.classList.add('active');
    },

    toggleContractType() {
        const isUnitPrice = document.getElementById('isUnitPriceContract').checked;
        const container = document.getElementById('unitPriceItemsContainer');
        const amountInput = document.getElementById('contractAmount');
        const amountHelp = document.getElementById('contractAmountHelp');

        if (isUnitPrice) {
            container.style.display = 'block';
            amountInput.readOnly = true;
            amountInput.classList.add('read-only');
            amountHelp.style.display = 'block';
            // Add first row if empty
            if (document.getElementById('unitItemsList').children.length === 0) {
                this.addContractUnitItem();
            }
            this.calculateContractTotal();
        } else {
            container.style.display = 'none';
            amountInput.readOnly = false;
            amountInput.classList.remove('read-only');
            amountHelp.style.display = 'none';
        }
    },

    addContractUnitItem(item = null) {
        const container = document.getElementById('unitItemsList');
        const rowId = 'item-' + Date.now();

        const div = document.createElement('div');
        div.className = 'unit-item-row form-row';
        div.id = rowId;
        div.style.alignItems = 'flex-end';
        div.style.marginBottom = '0.5rem';

        div.innerHTML = `
            <div class="form-group" style="flex: 3;">
                <label style="font-size: 0.8rem;">İş Kalemi</label>
                <input type="text" class="form-input item-name" placeholder="Örn: Parke Döşeme" value="${item ? item.name : ''}" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label style="font-size: 0.8rem;">Miktar</label>
                <input type="number" class="form-input item-quantity" step="0.01" min="0" value="${item ? item.quantity : 0}" oninput="UI.calculateContractTotal()" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label style="font-size: 0.8rem;">Birim</label>
                <select class="form-select item-unit" style="padding: 0.6rem;">
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="m">m</option>
                    <option value="Adet">Adet</option>
                    <option value="kg">kg</option>
                    <option value="Ton">Ton</option>
                </select>
            </div>
            <div class="form-group" style="flex: 1;">
                <label style="font-size: 0.8rem;">Birim Fiyat</label>
                <input type="number" class="form-input item-price" step="0.01" min="0" value="${item ? item.unitPrice : 0}" oninput="UI.calculateContractTotal()" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label style="font-size: 0.8rem;">Tutar</label>
                <input type="number" class="form-input item-total read-only" value="${item ? item.total : 0}" readonly disabled>
            </div>
            <button type="button" class="icon-btn" onclick="UI.removeContractUnitItem('${rowId}')" style="margin-bottom: 0.5rem; color: var(--danger-color);">
                <span class="material-icons">delete</span>
            </button>
        `;

        if (item) {
            div.querySelector('.item-unit').value = item.unit;
        }

        container.appendChild(div);
    },

    removeContractUnitItem(rowId) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
            this.calculateContractTotal();
        }
    },

    calculateContractTotal() {
        if (!document.getElementById('isUnitPriceContract').checked) return;

        let total = 0;
        const rows = document.querySelectorAll('.unit-item-row');

        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const itemTotal = quantity * price;

            row.querySelector('.item-total').value = itemTotal.toFixed(2);
            total += itemTotal;
        });

        document.getElementById('contractAmount').value = total.toFixed(2);
    },

    saveContract() {
        const id = document.getElementById('contractId').value;
        const isUnitPrice = document.getElementById('isUnitPriceContract').checked;

        let unitItems = [];
        if (isUnitPrice) {
            const rows = document.querySelectorAll('.unit-item-row');
            rows.forEach(row => {
                unitItems.push({
                    name: row.querySelector('.item-name').value,
                    quantity: parseFloat(row.querySelector('.item-quantity').value) || 0,
                    unit: row.querySelector('.item-unit').value,
                    unitPrice: parseFloat(row.querySelector('.item-price').value) || 0,
                    total: parseFloat(row.querySelector('.item-total').value) || 0
                });
            });
        }

        const data = {
            recipientId: document.getElementById('contractRecipientId').value,
            projectId: document.getElementById('contractProject').value,
            name: document.getElementById('contractName').value,
            amount: parseFloat(document.getElementById('contractAmount').value),
            startDate: document.getElementById('contractStartDate').value,
            endDate: document.getElementById('contractEndDate').value,
            status: document.getElementById('contractStatus').value,
            notes: document.getElementById('contractNotes').value,
            documents: this.currentDocuments,
            isUnitPrice: isUnitPrice,
            unitItems: isUnitPrice ? unitItems : []
        };

        if (id) {
            Storage.updateContract(id, data);
            Utils.showToast('Sözleşme güncellendi!', 'success');
        } else {
            Storage.addContract(data);
            Utils.showToast('Sözleşme eklendi!', 'success');
        }

        this.closeModal('contractModal');

        // Refresh recipient details if open
        const recipientId = data.recipientId;

        // We need to check if we are on the recipient detail page AND if it is for the correct recipient
        const isOnRecipientPage = app.currentPage === 'recipients' || document.getElementById('recipient-detail-page').classList.contains('active');

        // If we are on the page, simply re-calling showRecipientDetail with the ID should refresh content.
        if (isOnRecipientPage) {
            app.showRecipientDetail(recipientId);
        }
    },

    editContract(id) {
        const contract = Storage.getContract(id);
        if (contract) {
            const modal = document.getElementById('contractModal');
            const title = document.getElementById('contractModalTitle');

            this.populateContractModalDropdowns();

            title.textContent = 'Sözleşmeyi Düzenle';
            document.getElementById('contractId').value = contract.id;
            document.getElementById('contractRecipientId').value = contract.recipientId;
            document.getElementById('contractProject').value = contract.projectId || '';
            document.getElementById('contractName').value = contract.name;
            document.getElementById('contractAmount').value = contract.amount;
            document.getElementById('contractStartDate').value = contract.startDate || contract.date;
            document.getElementById('contractEndDate').value = contract.endDate || '';
            document.getElementById('contractStatus').value = contract.status;
            document.getElementById('contractNotes').value = contract.notes || '';

            // Handle Unit Price Contract
            const isUnitPrice = contract.isUnitPrice || false;
            document.getElementById('isUnitPriceContract').checked = isUnitPrice;
            this.toggleContractType();

            if (isUnitPrice && contract.unitItems) {
                contract.unitItems.forEach(item => this.addContractUnitItem(item));
                this.calculateContractTotal();
            }

            this.currentDocuments = contract.documents || [];
            this.renderDocumentPreviews('contractDocumentPreviews');

            modal.classList.add('active');
        }
    },

    deleteContract(id) {
        if (Utils.confirm('Bu sözleşmeyi silmek istediğinizden emin misiniz?')) {
            const contract = Storage.getContract(id);
            Storage.deleteContract(id);
            Utils.showToast('Sözleşme silindi!', 'success');

            if (contract && app.currentPage === 'recipient-detail' && app.currentDetailId === contract.recipientId) {
                app.showRecipientDetail(contract.recipientId);
            }
        }
    },

    // ============================================
    // MATERIALS
    // ============================================
    loadMaterialsPage() {
        this.populateMaterialFilters();
        this.renderMaterialsTable();
    },

    populateMaterialFilters() {
        // Projects
        const projects = Storage.getProjects();
        const projectSelect = document.getElementById('filterMaterialProject');
        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">Tümü</option>' +
                projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }

        // Suppliers (Recipients of type 'tedarikci')
        const suppliers = Storage.getRecipients().filter(r => r.type === 'tedarikci');
        const supplierSelect = document.getElementById('filterMaterialSupplier');
        if (supplierSelect) {
            supplierSelect.innerHTML = '<option value="">Tümü</option>' +
                suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }

        // Categories
        const categories = Storage.getMaterialCategories();
        const categorySelect = document.getElementById('filterMaterialCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Tümü</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    },

    applyMaterialFilters() {
        this.currentMaterialFilters = {
            project: document.getElementById('filterMaterialProject').value,
            supplier: document.getElementById('filterMaterialSupplier').value,
            category: document.getElementById('filterMaterialCategory').value,
            startDate: document.getElementById('filterMaterialStartDate').value,
            endDate: document.getElementById('filterMaterialEndDate').value,
            search: document.getElementById('searchMaterials').value
        };
        this.renderMaterialsTable();
    },

    renderMaterialsTable() {
        let materials = Storage.getMaterials();

        // Apply filters
        if (this.currentMaterialFilters.project) {
            materials = materials.filter(m => m.projectId === this.currentMaterialFilters.project);
        }
        if (this.currentMaterialFilters.supplier) {
            materials = materials.filter(m => m.supplierId === this.currentMaterialFilters.supplier);
        }
        if (this.currentMaterialFilters.category) {
            materials = materials.filter(m => m.categoryId === this.currentMaterialFilters.category);
        }
        if (this.currentMaterialFilters.startDate) {
            materials = materials.filter(m => m.date >= this.currentMaterialFilters.startDate);
        }
        if (this.currentMaterialFilters.endDate) {
            materials = materials.filter(m => m.date <= this.currentMaterialFilters.endDate);
        }
        if (this.currentMaterialFilters.search) {
            const searchLower = this.currentMaterialFilters.search.toLowerCase();
            materials = materials.filter(m =>
                m.name.toLowerCase().includes(searchLower) ||
                (m.notes && m.notes.toLowerCase().includes(searchLower))
            );
        }

        // Sort by date desc
        materials.sort((a, b) => new Date(b.date) - new Date(a.date));

        const container = document.getElementById('materialsTableBody');

        if (materials.length === 0) {
            const emptyStateHtml = this.getEmptyStateHTML(
                'Malzeme kaydı bulunamadı',
                'inventory_2',
                'Bu filtrelerle eşleşen malzeme kaydı yok.',
                `<button class="btn btn-primary btn-sm" onclick="UI.showMaterialModal()">
                    <span class="material-icons">add</span>
                    Yeni Malzeme
                </button>`
            );

            container.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state-cell">
                        ${emptyStateHtml}
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = materials.map(material => {
            const supplier = Storage.getRecipient(material.supplierId);
            const category = Storage.getMaterialCategory(material.categoryId);
            const project = Storage.getProject(material.projectId);

            return `
                <tr>
                    <td>${Utils.formatDateShort(material.date)}</td>
                    <td>${project ? project.name : '-'}</td>
                    <td>${supplier ? supplier.name : '-'}</td>
                    <td><div style="font-weight: 500;">${material.name}</div></td>
                    <td><strong>${material.quantity}</strong></td>
                    <td><span style="color: var(--text-secondary); font-size: 0.9rem;">${material.unit}</span></td>
                    <td>
                        <span class="category-badge" style="background: ${category?.color}22; color: ${category?.color};">
                            <span class="material-icons" style="font-size: 1rem;">${category?.icon || 'label'}</span>
                            ${category?.name || '-'}
                        </span>
                    </td>
                    <td>${material.notes || '-'}</td>
                    <td>
                        <div class="card-actions">
                            <button class="icon-btn" onclick="UI.editMaterial('${material.id}')" title="Düzenle">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="icon-btn" onclick="UI.deleteMaterial('${material.id}')" title="Sil">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Update totals
        const totalCountEl = document.getElementById('totalMaterialsDisplay');
        if (totalCountEl) {
            totalCountEl.textContent = materials.length;
        }
    },

    showMaterialModal(material = null) {
        const modal = document.getElementById('materialModal');
        const title = document.getElementById('materialModalTitle');
        const form = document.getElementById('materialForm');

        // Populate dropdowns
        this.populateMaterialModalDropdowns();

        if (material) {
            // Edit mode
            title.textContent = 'Malzemeyi Düzenle';
            document.getElementById('materialId').value = material.id;
            document.getElementById('materialProject').value = material.projectId;
            document.getElementById('materialSupplier').value = material.supplierId;
            document.getElementById('materialName').value = material.name;
            document.getElementById('materialQuantity').value = material.quantity;
            document.getElementById('materialUnit').value = material.unit;
            document.getElementById('materialDate').value = material.date;
            document.getElementById('materialCategory').value = material.categoryId;
            document.getElementById('materialNotes').value = material.notes || '';

            this.currentDocuments = material.documents || [];
            this.renderMaterialDocumentPreviews();
        } else {
            // Add mode
            title.textContent = 'Yeni Malzeme';
            form.reset();
            document.getElementById('materialId').value = '';
            document.getElementById('materialDate').value = Utils.getTodayDate();
            this.currentDocuments = [];
            this.renderMaterialDocumentPreviews();
        }

        modal.classList.add('active');
    },

    populateMaterialModalDropdowns() {
        // Projects
        const projects = Storage.getProjects().filter(p => p.isActive !== false);
        const projectSelect = document.getElementById('materialProject');
        projectSelect.innerHTML = '<option value="">Proje Seçin</option>' +
            projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        // Suppliers (only recipients with type 'tedarikci')
        const suppliers = Storage.getRecipients().filter(r => r.type === 'tedarikci');
        const supplierSelect = document.getElementById('materialSupplier');
        supplierSelect.innerHTML = '<option value="">Tedarikçi Seçin</option>' +
            suppliers.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

        // Categories
        const categories = Storage.getMaterialCategories();
        const categorySelect = document.getElementById('materialCategory');
        categorySelect.innerHTML = '<option value="">Kategori Seçin</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    },

    saveMaterial() {
        const id = document.getElementById('materialId').value;
        const data = {
            projectId: document.getElementById('materialProject').value,
            supplierId: document.getElementById('materialSupplier').value,
            name: document.getElementById('materialName').value,
            quantity: parseFloat(document.getElementById('materialQuantity').value),
            unit: document.getElementById('materialUnit').value,
            date: document.getElementById('materialDate').value,
            categoryId: document.getElementById('materialCategory').value,
            notes: document.getElementById('materialNotes').value,
            documents: this.currentDocuments
        };

        if (id) {
            Storage.updateMaterial(id, data);
            Utils.showToast('Malzeme güncellendi!', 'success');
        } else {
            Storage.addMaterial(data);
            Utils.showToast('Malzeme eklendi!', 'success');
        }

        this.closeModal('materialModal');
        this.loadMaterialsPage();
    },

    editMaterial(id) {
        const material = Storage.getMaterials().find(m => m.id === id);
        if (material) {
            this.showMaterialModal(material);
        }
    },

    deleteMaterial(id) {
        if (Utils.confirm('Bu malzeme kaydını silmek istediğinizden emin misiniz?')) {
            Storage.deleteMaterial(id);
            Utils.showToast('Malzeme silindi!', 'success');
            this.loadMaterialsPage();
        }
    },

    renderMaterialDocumentPreviews() {
        // Re-use logic or create similar to payment docs
        const container = document.getElementById('materialDocumentPreviews');
        if (this.currentDocuments.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.currentDocuments.map((doc, index) => `
            <div class="document-preview" onclick="UI.showLightbox('${doc}')">
                <img src="${doc}" alt="Belge ${index + 1}">
                <button type="button" class="document-preview-remove" onclick="event.stopPropagation(); UI.removeDocument(${index})">
                    <span class="material-icons" style="font-size: 16px;">close</span>
                </button>
            </div>
        `).join('');
    }
};
