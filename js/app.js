// ============================================
// MAIN APP MODULE - Application Controller
// ============================================

const app = {
    currentPage: 'dashboard',

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        // Initialize storage
        Storage.init();

        // Initialize UI
        UI.init();

        // Setup navigation
        this.setupNavigation();

        // Setup sidebar toggle
        this.setupSidebarToggle();

        // Setup theme toggle
        this.setupThemeToggle();

        // Load saved theme
        this.loadTheme();

        // Navigate to dashboard
        this.navigateTo('dashboard');

        console.log('İnşaat Ödemeler Takip uygulaması başlatıldı! 🚀');
    },

    // ============================================
    // NAVIGATION
    // ============================================
    setupNavigation() {
        // Nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });
    },

    navigateTo(page, addToHistory = true) {
        // Update current page
        this.currentPage = page;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show selected page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }

        // Load page data
        switch (page) {
            case 'dashboard':
                UI.loadDashboard();
                break;
            case 'payments':
                UI.loadPaymentsPage();
                break;
            case 'recipients':
                UI.loadRecipientsPage();
                break;
            case 'projects':
                UI.loadProjectsPage();
                break;
            case 'materials':
                UI.loadMaterialsPage();
                break;
            case 'reports':
                Reports.init();
                break;
            case 'settings':
                UI.loadSettingsPage();
                break;
        }

        // Add to browser history
        if (addToHistory) {
            history.pushState({ page }, '', `#${page}`);
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            document.getElementById('sidebar').classList.remove('active');
        }

        // Scroll to top
        window.scrollTo(0, 0);
    },

    // ============================================
    // DETAIL PAGES
    // ============================================
    showRecipientDetail(recipientId) {
        const recipient = Storage.getRecipient(recipientId);
        if (!recipient) {
            Utils.showToast('Firma bulunamadı!', 'error');
            return;
        }

        // Get payments for this recipient
        const payments = Storage.getPaymentsByRecipient(recipientId);
        const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Update page header
        document.getElementById('recipientDetailName').textContent = recipient.name;

        // Update recipient info
        const infoContainer = document.getElementById('recipientInfo');
        infoContainer.innerHTML = `
            <div class="info-row">
                <span class="info-label">Tip:</span>
                <span class="info-value">
                    <span class="recipient-type ${recipient.type}">
                        ${Utils.getRecipientTypeLabel(recipient.type)}
                    </span>
                </span>
            </div>
            ${recipient.phone ? `
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span class="info-value">${recipient.phone}</span>
                </div>
            ` : ''}
            ${recipient.email ? `
                <div class="info-row">
                    <span class="info-label">E-posta:</span>
                    <span class="info-value">${recipient.email}</span>
                </div>
            ` : ''}
            ${recipient.address ? `
                <div class="info-row">
                    <span class="info-label">Adres:</span>
                    <span class="info-value">${recipient.address}</span>
                </div>
            ` : ''}
        `;

        // Update stats
        document.getElementById('recipientTotalPayments').textContent = Utils.formatCurrency(totalAmount);
        document.getElementById('recipientPaymentCount').textContent = payments.length;

        // Set recipient ID for contract modal
        document.getElementById('contractRecipientId').value = recipientId;

        // Render contracts table
        const contracts = Storage.getContractsByRecipient(recipientId);
        const contractsBody = document.getElementById('recipientContractsTable');

        if (contracts.length === 0) {
            const emptyStateHtml = UI.getEmptyStateHTML(
                'Sözleşme bulunamadı',
                'description',
                'Bu firmaya ait henüz bir sözleşme yok.',
                `<button class="btn btn-sm btn-primary" onclick="UI.showContractModal()">
                    <span class="material-icons" style="font-size: 1rem;">add</span>
                    Sözleşme Ekle
                </button>`
            );
            contractsBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state-cell">
                        ${emptyStateHtml}
                    </td>
                </tr>
            `;
        } else {
            // Sort by date descending
            contracts.sort((a, b) => new Date(b.date) - new Date(a.date));

            contractsBody.innerHTML = contracts.map(contract => {
                const project = Storage.getProject(contract.projectId);
                const hasDocuments = contract.documents && contract.documents.length > 0;

                return `
                <tr>
                    <td>${project ? project.name : '-'}</td>
                    <td>
                        <div style="font-weight: 500;">${contract.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${contract.notes || ''}</div>
                    </td>
                    <td>
                        <div style="font-size: 0.85rem;">
                            ${Utils.formatDateShort(contract.startDate)} - ${contract.endDate ? Utils.formatDateShort(contract.endDate) : '...'}
                        </div>
                    </td>
                    <td><strong>${Utils.formatCurrency(contract.amount)}</strong></td>
                    <td>
                        <span class="status-badge ${contract.status === 'active' ? 'active' : (contract.status === 'completed' ? 'completed' : 'pending')}">
                            ${contract.status === 'active' ? 'Devam Ediyor' : (contract.status === 'completed' ? 'Tamamlandı' : 'İptal')}
                        </span>
                    </td>
                    <td>
                        ${hasDocuments ? `<span class="material-icons" style="color: var(--primary-color); font-size: 1.2rem;" title="Belge Var">description</span>` : ''}
                    </td>
                    <td>
                        <div class="card-actions">
                            <button class="icon-btn" onclick="UI.editContract('${contract.id}')" title="Düzenle">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="icon-btn" onclick="UI.deleteContract('${contract.id}')" title="Sil">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        // Render payments table
        const tbody = document.getElementById('recipientPaymentsTable');

        if (payments.length === 0) {
            const emptyStateHtml = UI.getEmptyStateHTML(
                'Ödeme bulunamadı',
                'receipt_long',
                'Bu firmaya ait henüz bir ödeme kaydı yok.'
            );
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state-cell">
                        ${emptyStateHtml}
                    </td>
                </tr>
            `;
        } else {
            // Sort by date descending
            payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

            tbody.innerHTML = payments.map(payment => {
                const project = Storage.getProject(payment.projectId);
                const category = Storage.getCategory(payment.categoryId);

                return `
                    <tr>
                        <td>${Utils.formatDateShort(payment.paymentDate)}</td>
                        <td>${project?.name || '-'}</td>
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
                    </tr>
                `;
            }).join('');
        }

        // Show detail page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('recipient-detail-page').classList.add('active');
    },

    showProjectDetail(projectId) {
        const project = Storage.getProject(projectId);
        if (!project) {
            Utils.showToast('Proje bulunamadı!', 'error');
            return;
        }

        // Get payments for this project
        const payments = Storage.getPaymentsByProject(projectId);
        const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Update page header
        document.getElementById('projectDetailName').textContent = project.name;

        // Update project info
        const infoContainer = document.getElementById('projectInfo');
        infoContainer.innerHTML = `
            <div class="info-row">
                <span class="info-label">Durum:</span>
                <span class="info-value">
                    <span class="status-badge ${project.status}">
                        ${Utils.getStatusLabel(project.status)}
                    </span>
                </span>
            </div>
            ${project.location ? `
                <div class="info-row">
                    <span class="info-label">Konum:</span>
                    <span class="info-value">${project.location}</span>
                </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Başlangıç:</span>
                <span class="info-value">${Utils.formatDate(project.startDate)}</span>
            </div>
        `;

        // Update stats summary
        const topCategory = this.getTopEntity(payments, 'categoryId', (id) => Storage.getCategory(id)?.name);
        const topRecipient = this.getTopEntity(payments, 'recipientId', (id) => Storage.getRecipient(id)?.name);

        // Calculate average payment
        const averagePayment = payments.length > 0 ? totalAmount / payments.length : 0;

        // Render Summary Stats
        document.getElementById('projectStatsSummary').innerHTML = `
            <div class="project-stat-item">
                <span class="label">Toplam Harcama</span>
                <span class="value">${Utils.formatCurrency(totalAmount)}</span>
                <span class="sub-value">${payments.length} adet ödeme</span>
            </div>
            <div class="project-stat-item">
                <span class="label">Ortalama Ödeme</span>
                <span class="value">${Utils.formatCurrency(averagePayment)}</span>
            </div>
             <div class="project-stat-item">
                <span class="label">En Çok Harcanan Kategori</span>
                <span class="value">${topCategory.name}</span>
                <span class="sub-value">${Utils.formatCurrency(topCategory.amount)}</span>
            </div>
            <div class="project-stat-item">
                <span class="label">En Çok Ödeme Yapılan</span>
                <span class="value">${topRecipient.name}</span>
                <span class="sub-value">${Utils.formatCurrency(topRecipient.amount)}</span>
            </div>
        `;

        // Render Charts
        this.renderProjectDetailCharts(payments);

        // ... (render payments table logic continues)
    },

    getTopEntity(payments, key, nameCallback) {
        if (payments.length === 0) return { name: '-', amount: 0 };

        const totals = {};
        payments.forEach(p => {
            totals[p[key]] = (totals[p[key]] || 0) + parseFloat(p.amount);
        });

        let topId = null;
        let maxAmount = 0;

        Object.entries(totals).forEach(([id, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount;
                topId = id;
            }
        });

        return {
            name: topId ? (nameCallback(topId) || 'Bilinmeyen') : '-',
            amount: maxAmount
        };
    },

    renderProjectDetailCharts(payments) {
        // 1. Category Chart
        const categoryCtx = document.getElementById('projectDetailCategoryChart');

        // Destroy existing chart if any (we need to store instances ideally, but for now let's check if we can reuse or just replace canvas parent content to be safe, or use Chart.getChart)
        const existingCategoryChart = Chart.getChart(categoryCtx);
        if (existingCategoryChart) existingCategoryChart.destroy();

        const categoryTotals = {};
        payments.forEach(p => {
            categoryTotals[p.categoryId] = (categoryTotals[p.categoryId] || 0) + parseFloat(p.amount);
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6); // Top 6 categories

        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: sortedCategories.map(([id]) => Storage.getCategory(id)?.name || 'Diğer'),
                datasets: [{
                    data: sortedCategories.map(([, amount]) => amount),
                    backgroundColor: sortedCategories.map(([id]) => Storage.getCategory(id)?.color || '#cbd5e1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });

        // 2. Monthly Trend Chart
        const monthlyCtx = document.getElementById('projectDetailMonthlyChart');
        const existingMonthlyChart = Chart.getChart(monthlyCtx);
        if (existingMonthlyChart) existingMonthlyChart.destroy();

        const monthlyTotals = {};
        const months = [];
        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyTotals[key] = 0;
            months.push(key);
        }

        payments.forEach(p => {
            const key = p.paymentDate.substring(0, 7); // YYYY-MM
            if (monthlyTotals[key] !== undefined) {
                monthlyTotals[key] += parseFloat(p.amount);
            }
        });

        new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: months.map(m => {
                    const [y, M] = m.split('-');
                    const date = new Date(y, parseInt(M) - 1);
                    return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
                }),
                datasets: [{
                    label: 'Harcama',
                    data: months.map(m => monthlyTotals[m]),
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
                        ticks: { callback: (val) => '₺' + val }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });

        // Render payments table
        const tbody = document.getElementById('projectPaymentsTable');

        if (payments.length === 0) {
            const emptyStateHtml = UI.getEmptyStateHTML(
                'Ödeme bulunamadı',
                'receipt_long',
                'Bu projeye ait henüz bir ödeme kaydı yok.'
            );
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state-cell">
                        ${emptyStateHtml}
                    </td>
                </tr>
            `;
        } else {
            // Sort by date descending
            payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

            tbody.innerHTML = payments.map(payment => {
                const recipient = Storage.getRecipient(payment.recipientId);
                const category = Storage.getCategory(payment.categoryId);

                return `
                    <tr>
                        <td>${Utils.formatDateShort(payment.paymentDate)}</td>
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
                    </tr>
                `;
            }).join('');
        }

        // Show detail page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('project-detail-page').classList.add('active');
    },

    // ============================================
    // SIDEBAR TOGGLE (Mobile)
    // ============================================
    setupSidebarToggle() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    },

    // ============================================
    // THEME TOGGLE
    // ============================================
    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');

        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update button
            const icon = toggle.querySelector('.material-icons');
            const text = toggle.querySelector('span:last-child');

            if (newTheme === 'dark') {
                icon.textContent = 'light_mode';
                text.textContent = 'Açık Mod';
            } else {
                icon.textContent = 'dark_mode';
                text.textContent = 'Koyu Mod';
            }
        });
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const toggle = document.getElementById('themeToggle');
        const icon = toggle.querySelector('.material-icons');
        const text = toggle.querySelector('span:last-child');

        if (savedTheme === 'dark') {
            icon.textContent = 'light_mode';
            text.textContent = 'Açık Mod';
        } else {
            icon.textContent = 'dark_mode';
            text.textContent = 'Koyu Mod';
        }
    }
};

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
