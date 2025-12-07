// ============================================
// STORAGE MODULE - LocalStorage Management
// ============================================

const Storage = {
    // Keys
    KEYS: {
        PROJECTS: 'insaat_projects',
        RECIPIENTS: 'insaat_recipients',
        CATEGORIES: 'insaat_categories',
        PAYMENTS: 'insaat_payments',
        MATERIALS: 'insaat_materials',
        CONTRACTS: 'insaat_contracts',
        MATERIAL_CATEGORIES: 'insaat_material_categories',
        SETTINGS: 'insaat_settings'
    },

    // Initialize default data
    init() {
        // Initialize categories if not exists
        if (!this.getCategories().length) {
            this.initializeDefaultCategories();
        }
        if (!this.getMaterialCategories().length) {
            this.initializeDefaultMaterialCategories();
        }
    },

    // Initialize default categories
    initializeDefaultCategories() {
        const defaultCategories = [
            { id: Utils.generateId(), name: 'Malzeme', color: '#3b82f6', icon: 'inventory_2' },
            { id: Utils.generateId(), name: 'İşçilik', color: '#10b981', icon: 'engineering' },
            { id: Utils.generateId(), name: 'Araç Kiralama', color: '#f59e0b', icon: 'local_shipping' },
            { id: Utils.generateId(), name: 'Ekipman', color: '#8b5cf6', icon: 'handyman' },
            { id: Utils.generateId(), name: 'Nakliye', color: '#ef4444', icon: 'airport_shuttle' },
            { id: Utils.generateId(), name: 'Harç ve Vergiler', color: '#ec4899', icon: 'receipt_long' },
            { id: Utils.generateId(), name: 'Diğer', color: '#6b7280', icon: 'more_horiz' }
        ];

        this.setData(this.KEYS.CATEGORIES, defaultCategories);
    },

    initializeDefaultMaterialCategories() {
        const defaultMaterialCategories = [
            { id: Utils.generateId(), name: 'Demir', color: '#607d8b', icon: 'build_circle' },
            { id: Utils.generateId(), name: 'Çimento', color: '#9e9e9e', icon: 'foundation' },
            { id: Utils.generateId(), name: 'Kum/Çakıl', color: '#d7ccc8', icon: 'landscape' },
            { id: Utils.generateId(), name: 'Tuğla/Briket', color: '#ff7043', icon: 'view_module' },
            { id: Utils.generateId(), name: 'Boya', color: '#29b6f6', icon: 'format_paint' },
            { id: Utils.generateId(), name: 'Hırdavat', color: '#fdd835', icon: 'handyman' },
            { id: Utils.generateId(), name: 'Elektrik', color: '#ffeb3b', icon: 'bolt' },
            { id: Utils.generateId(), name: 'Sıhhi Tesisat', color: '#42a5f5', icon: 'water_drop' },
            { id: Utils.generateId(), name: 'Diğer', color: '#78909c', icon: 'more' }
        ];

        this.setData(this.KEYS.MATERIAL_CATEGORIES, defaultMaterialCategories);
    },

    // Generic get data
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error getting data for ${key}:`, error);
            return [];
        }
    },

    // Generic set data
    setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error setting data for ${key}:`, error);
            Utils.showToast('Veri kaydedilemedi!', 'error');
            return false;
        }
    },

    // ============================================
    // PROJECTS
    // ============================================
    getProjects() {
        return this.getData(this.KEYS.PROJECTS);
    },

    getProject(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    },

    addProject(project) {
        const projects = this.getProjects();
        const newProject = {
            id: Utils.generateId(),
            ...project,
            createdAt: Date.now()
        };
        projects.push(newProject);
        this.setData(this.KEYS.PROJECTS, projects);
        return newProject;
    },

    updateProject(id, updates) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...updates, updatedAt: Date.now() };
            this.setData(this.KEYS.PROJECTS, projects);
            return projects[index];
        }
        return null;
    },

    deleteProject(id) {
        const projects = this.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        this.setData(this.KEYS.PROJECTS, filtered);

        // Also delete related payments
        const payments = this.getPayments();
        const filteredPayments = payments.filter(p => p.projectId !== id);
        this.setData(this.KEYS.PAYMENTS, filteredPayments);
    },

    // ============================================
    // RECIPIENTS
    // ============================================
    getRecipients() {
        return this.getData(this.KEYS.RECIPIENTS);
    },

    getRecipient(id) {
        const recipients = this.getRecipients();
        return recipients.find(r => r.id === id);
    },

    addRecipient(recipient) {
        const recipients = this.getRecipients();
        const newRecipient = {
            id: Utils.generateId(),
            ...recipient,
            createdAt: Date.now()
        };
        recipients.push(newRecipient);
        this.setData(this.KEYS.RECIPIENTS, recipients);
        return newRecipient;
    },

    updateRecipient(id, updates) {
        const recipients = this.getRecipients();
        const index = recipients.findIndex(r => r.id === id);
        if (index !== -1) {
            recipients[index] = { ...recipients[index], ...updates, updatedAt: Date.now() };
            this.setData(this.KEYS.RECIPIENTS, recipients);
            return recipients[index];
        }
        return null;
    },

    deleteRecipient(id) {
        const recipients = this.getRecipients();
        const filtered = recipients.filter(r => r.id !== id);
        this.setData(this.KEYS.RECIPIENTS, filtered);

        // Also delete related payments
        const payments = this.getPayments();
        const filteredPayments = payments.filter(p => p.recipientId !== id);
        this.setData(this.KEYS.PAYMENTS, filteredPayments);
    },

    // ============================================
    // CATEGORIES
    // ============================================
    getCategories() {
        return this.getData(this.KEYS.CATEGORIES);
    },

    getCategory(id) {
        const categories = this.getCategories();
        return categories.find(c => c.id === id);
    },

    addCategory(category) {
        const categories = this.getCategories();
        const newCategory = {
            id: Utils.generateId(),
            ...category
        };
        categories.push(newCategory);
        this.setData(this.KEYS.CATEGORIES, categories);
        return newCategory;
    },

    updateCategory(id, updates) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...updates };
            this.setData(this.KEYS.CATEGORIES, categories);
            return categories[index];
        }
        return null;
    },

    deleteCategory(id) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        this.setData(this.KEYS.CATEGORIES, filtered);
    },

    // ============================================
    // MATERIAL CATEGORIES
    // ============================================
    getMaterialCategories() {
        return this.getData(this.KEYS.MATERIAL_CATEGORIES);
    },

    getMaterialCategory(id) {
        const categories = this.getMaterialCategories();
        return categories.find(c => c.id === id);
    },

    addMaterialCategory(category) {
        const categories = this.getMaterialCategories();
        const newCategory = {
            id: Utils.generateId(),
            ...category
        };
        categories.push(newCategory);
        this.setData(this.KEYS.MATERIAL_CATEGORIES, categories);
        return newCategory;
    },

    updateMaterialCategory(id, updates) {
        const categories = this.getMaterialCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...updates };
            this.setData(this.KEYS.MATERIAL_CATEGORIES, categories);
            return categories[index];
        }
        return null;
    },

    deleteMaterialCategory(id) {
        const categories = this.getMaterialCategories();
        const filtered = categories.filter(c => c.id !== id);
        this.setData(this.KEYS.MATERIAL_CATEGORIES, filtered);
    },

    // ============================================
    // PAYMENTS
    // ============================================
    getPayments() {
        return this.getData(this.KEYS.PAYMENTS);
    },

    // ============================================
    // MATERIALS
    // ============================================
    getMaterials() {
        return this.getData(this.KEYS.MATERIALS);
    },

    addMaterial(material) {
        const materials = this.getMaterials();
        const newMaterial = {
            id: Utils.generateId(),
            ...material,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        materials.push(newMaterial);
        this.setData(this.KEYS.MATERIALS, materials);
        return newMaterial;
    },

    updateMaterial(id, updates) {
        const materials = this.getMaterials();
        const index = materials.findIndex(m => m.id === id);
        if (index !== -1) {
            materials[index] = { ...materials[index], ...updates, updatedAt: Date.now() };
            this.setData(this.KEYS.MATERIALS, materials);
            return materials[index];
        }
        return null;
    },

    deleteMaterial(id) {
        const materials = this.getMaterials();
        const filtered = materials.filter(m => m.id !== id);
        this.setData(this.KEYS.MATERIALS, filtered);
    },

    // Existing payment functions continue below
    getPayments() {
        return this.getData(this.KEYS.PAYMENTS);
    },

    getPayment(id) {
        const payments = this.getPayments();
        return payments.find(p => p.id === id);
    },

    addPayment(payment) {
        const payments = this.getPayments();
        const newPayment = {
            id: Utils.generateId(),
            ...payment,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        payments.push(newPayment);
        this.setData(this.KEYS.PAYMENTS, payments);
        return newPayment;
    },

    updatePayment(id, updates) {
        const payments = this.getPayments();
        const index = payments.findIndex(p => p.id === id);
        if (index !== -1) {
            payments[index] = { ...payments[index], ...updates, updatedAt: Date.now() };
            this.setData(this.KEYS.PAYMENTS, payments);
            return payments[index];
        }
        return null;
    },

    deletePayment(id) {
        const payments = this.getPayments();
        const filtered = payments.filter(p => p.id !== id);
        this.setData(this.KEYS.PAYMENTS, filtered);
    },

    // Get payments by project
    getPaymentsByProject(projectId) {
        const payments = this.getPayments();
        return payments.filter(p => p.projectId === projectId);
    },

    // Get payments by recipient
    getPaymentsByRecipient(recipientId) {
        const payments = this.getPayments();
        return payments.filter(p => p.recipientId === recipientId);
    },

    // Get payments by date range
    getPaymentsByDateRange(startDate, endDate) {
        const payments = this.getPayments();
        return payments.filter(p => {
            const paymentDate = new Date(p.paymentDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return paymentDate >= start && paymentDate <= end;
        });
    },

    // Get pending payments
    getPendingPayments() {
        const payments = this.getPayments();
        return payments.filter(p => p.status === 'pending');
    },

    // ============================================
    // CONTRACTS
    // ============================================
    getContracts() {
        return this.getData(this.KEYS.CONTRACTS);
    },

    getContract(id) {
        const contracts = this.getContracts();
        return contracts.find(c => c.id === id);
    },

    addContract(contract) {
        const contracts = this.getContracts();
        const newContract = {
            id: Utils.generateId(),
            ...contract,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        contracts.push(newContract);
        this.setData(this.KEYS.CONTRACTS, contracts);
        return newContract;
    },

    updateContract(id, updates) {
        const contracts = this.getContracts();
        const index = contracts.findIndex(c => c.id === id);
        if (index !== -1) {
            contracts[index] = { ...contracts[index], ...updates, updatedAt: Date.now() };
            this.setData(this.KEYS.CONTRACTS, contracts);
            return contracts[index];
        }
        return null;
    },

    deleteContract(id) {
        const contracts = this.getContracts();
        const filtered = contracts.filter(c => c.id !== id);
        this.setData(this.KEYS.CONTRACTS, filtered);
    },

    getContractsByRecipient(recipientId) {
        const contracts = this.getContracts();
        return contracts.filter(c => c.recipientId === recipientId);
    },

    // ============================================
    // STATISTICS
    // ============================================
    getStats() {
        const projects = this.getProjects();
        const payments = this.getPayments();
        const recipients = this.getRecipients();
        const categories = this.getCategories();

        // Active projects
        const activeProjects = projects.filter(p => p.status === 'active').length;

        // Pending payments
        const pendingPayments = payments.filter(p => p.status === 'pending').length;

        // This month's total
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyPayments = payments.filter(p => {
            const date = new Date(p.paymentDate);
            return date >= firstDay && date <= lastDay;
        });

        const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Last month's total for comparison
        const lastMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthLast = new Date(now.getFullYear(), now.getMonth(), 0);

        const lastMonthPayments = payments.filter(p => {
            const date = new Date(p.paymentDate);
            return date >= lastMonthFirst && date <= lastMonthLast;
        });

        const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        const monthlyChange = lastMonthTotal > 0
            ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
            : 0;

        // Top category
        const categoryTotals = {};
        payments.forEach(p => {
            if (!categoryTotals[p.categoryId]) {
                categoryTotals[p.categoryId] = 0;
            }
            categoryTotals[p.categoryId] += parseFloat(p.amount);
        });

        let topCategoryId = null;
        let maxAmount = 0;
        Object.entries(categoryTotals).forEach(([catId, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount;
                topCategoryId = catId;
            }
        });

        const topCategory = topCategoryId ? this.getCategory(topCategoryId) : null;

        return {
            activeProjects,
            pendingPayments,
            monthlyTotal,
            monthlyChange,
            topCategory: topCategory ? topCategory.name : '-',
            totalPayments: payments.length,
            totalRecipients: recipients.length
        };
    },

    // ============================================
    // DATA MANAGEMENT
    // ============================================
    exportData() {
        const data = {
            projects: this.getProjects(),
            recipients: this.getRecipients(),
            categories: this.getCategories(),
            materialCategories: this.getMaterialCategories(),
            payments: this.getPayments(),
            materials: this.getMaterials(),
            exportDate: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const filename = `insaat-odemeler-yedek-${new Date().toISOString().split('T')[0]}.json`;

        Utils.downloadFile(json, filename);
        Utils.showToast('Veri başarıyla yedeklendi!', 'success');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!Utils.confirm('Mevcut tüm veriler silinecek ve yedek dosyası yüklenecek. Emin misiniz?')) {
                    return;
                }

                // Import data
                if (data.projects) this.setData(this.KEYS.PROJECTS, data.projects);
                if (data.recipients) this.setData(this.KEYS.RECIPIENTS, data.recipients);
                if (data.categories) this.setData(this.KEYS.CATEGORIES, data.categories);
                if (data.materialCategories) this.setData(this.KEYS.MATERIAL_CATEGORIES, data.materialCategories);
                if (data.payments) this.setData(this.KEYS.PAYMENTS, data.payments);
                if (data.materials) this.setData(this.KEYS.MATERIALS, data.materials);

                Utils.showToast('Veri başarıyla geri yüklendi!', 'success');

                // Reload page to reflect changes
                setTimeout(() => location.reload(), 1000);
            } catch (error) {
                console.error('Import error:', error);
                Utils.showToast('Veri geri yükleme başarısız!', 'error');
            }
        };

        input.click();
    },

    clearAllData() {
        if (!Utils.confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Emin misiniz?')) {
            return;
        }

        if (!Utils.confirm('Son kez soruyoruz: Tüm verileri silmek istediğinizden emin misiniz?')) {
            return;
        }

        // Clear all data
        localStorage.removeItem(this.KEYS.PROJECTS);
        localStorage.removeItem(this.KEYS.RECIPIENTS);
        localStorage.removeItem(this.KEYS.CATEGORIES);
        localStorage.removeItem(this.KEYS.MATERIAL_CATEGORIES);
        localStorage.removeItem(this.KEYS.PAYMENTS);
        localStorage.removeItem(this.KEYS.MATERIALS);
        localStorage.removeItem(this.KEYS.SETTINGS);

        Utils.showToast('Tüm veriler silindi!', 'success');

        // Reload page
        setTimeout(() => location.reload(), 1000);
    }
};
