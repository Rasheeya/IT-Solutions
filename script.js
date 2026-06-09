// ===== PREMIUM MOCK DATABASE INITIALIZATION =====
const DEFAULT_CLIENTS = [
    { id: 1, name: "John Doe", company: "Tech Corp", email: "client@techcorp.com", phone: "+1 (555) 019-2834", services: ["Cloud Hosting", "Security Solutions"], status: "Active", joined: "2026-03-12", spent: 15400 },
    { id: 2, name: "Jane Smith", company: "Digital Solutions", email: "jane@digital.com", phone: "+1 (555) 014-9922", services: ["Database Management", "API Integration"], status: "Active", joined: "2026-04-05", spent: 9800 },
    { id: 3, name: "Mike Johnson", company: "Cloud Systems", email: "mike@cloud.com", phone: "+1 (555) 017-8811", services: ["Cloud Hosting"], status: "Pending", joined: "2026-05-20", spent: 4500 },
    { id: 4, name: "Sarah Wilson", company: "Enterprise Inc", email: "sarah@enterprise.com", phone: "+1 (555) 012-3456", services: ["Security Solutions", "Analytics Suite", "Support Package"], status: "Active", joined: "2026-01-15", spent: 28900 }
];

const DEFAULT_TICKETS = [
    { id: "TK-101", clientName: "John Doe", clientEmail: "client@techcorp.com", subject: "Database Connection Issue", category: "Technical Support", priority: "High", status: "In Progress", created: "2026-06-05", description: "Getting occasional connection dropouts on the secondary SQL replica during traffic spikes." },
    { id: "TK-102", clientName: "Jane Smith", clientEmail: "jane@digital.com", subject: "API Response Timeout", category: "Technical Support", priority: "Low", status: "Resolved", created: "2026-06-03", description: "V3 API endpoint is taking > 5 seconds to respond for batch queries." },
    { id: "TK-103", clientName: "Mike Johnson", clientEmail: "mike@cloud.com", subject: "SSL Certificate Update", category: "Security", priority: "Medium", status: "Open", created: "2026-06-01", description: "Need to deploy the wildcard SSL certificate to our dev hosting container." }
];

const DEFAULT_INVOICES = [
    { id: "INV-2026-001", clientName: "Tech Corp", amount: 2500, date: "2026-06-01", status: "Paid" },
    { id: "INV-2026-002", clientName: "Digital Solutions", amount: 1800, date: "2026-06-02", status: "Paid" },
    { id: "INV-2026-003", clientName: "Cloud Systems", amount: 1400, date: "2026-06-05", status: "Pending" },
    { id: "INV-2026-004", clientName: "Enterprise Inc", amount: 4800, date: "2026-05-15", status: "Paid" },
    { id: "INV-2026-005", clientName: "Tech Corp", amount: 2500, date: "2026-06-08", status: "Overdue" }
];

// Initialize DB if not present in localStorage
function initDatabase() {
    if (!localStorage.getItem("it_clients")) {
        localStorage.setItem("it_clients", JSON.stringify(DEFAULT_CLIENTS));
    } else {
        // Migration and cleanup for john@techcorp.com -> client@techcorp.com
        try {
            let clients = JSON.parse(localStorage.getItem("it_clients"));
            if (Array.isArray(clients)) {
                let changed = false;
                
                // Remove any dynamically created dummy record for client@techcorp.com that is not the official one (id !== 1)
                const initialLength = clients.length;
                clients = clients.filter(c => !(c.email.toLowerCase() === 'client@techcorp.com' && c.id !== 1));
                if (clients.length !== initialLength) {
                    changed = true;
                }

                clients.forEach(c => {
                    if (c.email.toLowerCase() === "john@techcorp.com") {
                        c.email = "client@techcorp.com";
                        c.name = "John Doe";
                        changed = true;
                    }
                });

                if (changed) {
                    localStorage.setItem("it_clients", JSON.stringify(clients));
                }
            }
        } catch (e) {
            console.error("Migration failed:", e);
        }
    }

    if (!localStorage.getItem("it_tickets")) {
        localStorage.setItem("it_tickets", JSON.stringify(DEFAULT_TICKETS));
    } else {
        try {
            let tickets = JSON.parse(localStorage.getItem("it_tickets"));
            if (Array.isArray(tickets)) {
                let changed = false;
                tickets.forEach(t => {
                    if (t.clientEmail.toLowerCase() === "john@techcorp.com") {
                        t.clientEmail = "client@techcorp.com";
                        changed = true;
                    }
                });
                if (changed) {
                    localStorage.setItem("it_tickets", JSON.stringify(tickets));
                }
            }
        } catch (e) {
            console.error("Tickets migration failed:", e);
        }
    }

    if (!localStorage.getItem("it_invoices")) {
        localStorage.setItem("it_invoices", JSON.stringify(DEFAULT_INVOICES));
    }
}

initDatabase();

// Helper to get items
function getClients() { return JSON.parse(localStorage.getItem("it_clients")); }
function getTickets() { return JSON.parse(localStorage.getItem("it_tickets")); }
function getInvoices() { return JSON.parse(localStorage.getItem("it_invoices")); }

// Helper to save items
function saveClients(clients) { localStorage.setItem("it_clients", JSON.stringify(clients)); }
function saveTickets(tickets) { localStorage.setItem("it_tickets", JSON.stringify(tickets)); }
function saveInvoices(invoices) { localStorage.setItem("it_invoices", JSON.stringify(invoices)); }

// ===== DYNAMIC TOAST NOTIFICATIONS =====
function showToast(message, type = "success") {
    // Check or create container
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconClass = "fa-circle-check";
    if (type === "danger") iconClass = "fa-triangle-exclamation";
    if (type === "warning") iconClass = "fa-circle-exclamation";
    if (type === "info") iconClass = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    // Auto-remove after 4s
    setTimeout(() => {
        toast.style.animation = "fadeInRight 0.3s ease reverse forwards";
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 4000);
}

// ===== THEME MANAGEMENT (DARK / LIGHT MODE) =====
function initTheme() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    const body = document.body;
    const toggles = document.querySelectorAll(".theme-toggle-btn");

    if (isDarkMode) {
        body.classList.add("dark-mode");
    } else {
        body.classList.remove("dark-mode");
    }

    toggles.forEach(toggle => {
        const icon = toggle.querySelector("i");
        if (icon) {
            if (isDarkMode) {
                icon.className = "fa-solid fa-sun";
            } else {
                icon.className = "fa-solid fa-moon";
            }
        }
    });
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDark ? "true" : "false");
    
    // Update all toggle buttons on page
    const toggles = document.querySelectorAll(".theme-toggle-btn");
    toggles.forEach(toggle => {
        const icon = toggle.querySelector("i");
        if (icon) {
            icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    });

    showToast(`${isDark ? "Dark" : "Light"} mode enabled!`, "info");
}

// ===== ANIMATE COUNTERS =====
function initAnimatedCounters() {
    const counters = document.querySelectorAll(".stat-value[data-target]");
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute("data-target"));
        const suffix = counter.getAttribute("data-suffix") || "";
        const prefix = counter.getAttribute("data-prefix") || "";
        const isFloat = counter.getAttribute("data-float") === "true";
        const duration = 1200; // ms
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            const currentVal = easeProgress * target;

            if (isFloat) {
                counter.textContent = prefix + currentVal.toFixed(1) + suffix;
            } else {
                counter.textContent = prefix + Math.floor(currentVal).toLocaleString() + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                if (isFloat) {
                    counter.textContent = prefix + target.toFixed(1) + suffix;
                } else {
                    counter.textContent = prefix + target.toLocaleString() + suffix;
                }
            }
        };

        requestAnimationFrame(updateCount);
    });
}

// ===== TAB LOGIC =====
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll(".dashboard-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    // Remove active state from sidebar items
    document.querySelectorAll(".dashboard-nav-item").forEach(item => {
        item.classList.remove("active");
    });

    // Show target tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add("active");
        
        // Staggered load for tab elements
        const cards = targetTab.querySelectorAll(".card, .stat-card, .table-responsive");
        cards.forEach((card, index) => {
            card.style.animation = "none";
            // trigger reflow
            void card.offsetWidth;
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.08}s backwards`;
        });
    }

    // Set active class on navbar/sidebar link
    // Support elements matching href="#" onclick="switchTab('tab')"
    const activeItem = document.querySelector(`.dashboard-nav-item[onclick*="'${tabName}'"]`) || 
                       document.querySelector(`.navbar-links a[onclick*="'${tabName}'"]`);
    if (activeItem) {
        activeItem.classList.add("active");
    }

    // Re-trigger chart animations when returning to overview
    if (tabName === 'overview') {
        if (typeof loadClientDashboard === 'function') {
            loadClientDashboard();
        }
        if (typeof initCharts === 'function') {
            initCharts();
        }
    }

    // Close mobile drawer on tab click
    closeMobileSidebar();
}

// ===== MOBILE DRAWER SIDEBAR CONTROLLER =====
function toggleMobileSidebar() {
    const sidebar = document.querySelector(".dashboard-sidebar");
    
    // Create backdrop if not exists
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "sidebar-backdrop";
        document.body.appendChild(backdrop);
        backdrop.addEventListener("click", toggleMobileSidebar);
    }

    if (sidebar) {
        const isOpen = sidebar.classList.toggle("sidebar-open");
        backdrop.classList.toggle("active", isOpen);
        
        const toggleBtnIcon = document.querySelector("#menuToggle i");
        if (toggleBtnIcon) {
            toggleBtnIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
        }
    }
}

function closeMobileSidebar() {
    const sidebar = document.querySelector(".dashboard-sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");
    const toggleBtnIcon = document.querySelector("#menuToggle i");

    if (sidebar && sidebar.classList.contains("sidebar-open")) {
        sidebar.classList.remove("sidebar-open");
    }
    if (backdrop && backdrop.classList.contains("active")) {
        backdrop.classList.remove("active");
    }
    if (toggleBtnIcon) {
        toggleBtnIcon.className = "fa-solid fa-bars";
    }
}

// ===== MODAL UTILITIES =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        
        // Add backdrop if it doesn't exist inside the modal container
        let backdrop = modal.querySelector(".modal-backdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.className = "modal-backdrop";
            modal.insertBefore(backdrop, modal.firstChild);
            backdrop.addEventListener("click", () => closeModal(modalId));
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}

// ===== SESSION MANAGEMENT =====
function checkSession(allowedRole) {
    const email = sessionStorage.getItem("userEmail");
    const role = sessionStorage.getItem("userRole");

    if (!email || !role) {
        window.location.href = "index.html";
        return null;
    }

    if (allowedRole && role !== allowedRole) {
        // Redirect to their respective dashboards
        window.location.href = role === "admin" ? "admin.html" : "client.html";
        return null;
    }

    return { email, role };
}

function handleLogout() {
    sessionStorage.clear();
    showToast("Logged out successfully! Redirecting...", "info");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// ===== EXPORT & PRINT UTILITIES =====
function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;
    const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function printContent(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print - IT Solutions</title>
                <link rel="stylesheet" href="style.css">
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 20px; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>${element.innerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ===== COMMON HELPERS =====
function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// ===== SIGNUP FORM HANDLING =====
function handleSignup(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname')?.value.trim() || '';
    const email = document.getElementById('signup-email')?.value.trim() || '';
    const password = document.getElementById('signup-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';
    const company = document.getElementById('company')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const agreeTerms = document.getElementById('agree')?.checked || document.getElementById('agree-terms')?.checked || false;

    const signupAlert = document.getElementById('signupAlert');
    if (signupAlert) signupAlert.innerHTML = '';

    let hasErrors = false;

    // Validation
    if (!fullname) {
        showToast('Full name is required', 'danger');
        hasErrors = true;
    }
    if (!email || !isValidEmail(email)) {
        showToast('Valid email is required', 'danger');
        hasErrors = true;
    }
    if (!password || password.length < 6) {
        showToast('Password must be at least 6 characters', 'danger');
        hasErrors = true;
    }
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'danger');
        hasErrors = true;
    }
    if (!company) {
        showToast('Company name is required', 'danger');
        hasErrors = true;
    }
    if (!agreeTerms) {
        showToast('Please agree to terms and conditions', 'danger');
        hasErrors = true;
    }

    if (hasErrors) return;

    // Store user in localStorage
    const users = JSON.parse(localStorage.getItem('it_users')) || [];
    
    if (users.find(u => u.email === email)) {
        showToast('Email already registered', 'warning');
        return;
    }

    users.push({
        id: Date.now(),
        fullname,
        email,
        password,
        company,
        phone,
        role: 'client',
        joined: new Date().toISOString()
    });

    localStorage.setItem('it_users', JSON.stringify(users));
    
    showToast('Account created successfully! Redirecting to login...', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== ADMIN DASHBOARD FUNCTIONS =====
function loadAdminDashboard() {
    const user = checkSession('admin');
    if (!user) return;

    document.getElementById('adminNameDisplay').textContent = sessionStorage.getItem('userName') || 'Administrator';
    document.getElementById('adminEmailDisplay').textContent = user.email;
    
    const avatarLetter = user.email.charAt(0).toUpperCase();
    document.getElementById('avatarLetter').textContent = avatarLetter;

    renderAdminStats();
    renderClientsTable();
    renderTicketsTable();
    renderInvoicesTable();
    initAnimatedCounters();
}

function renderAdminStats() {
    const clients = getClients();
    const tickets = getTickets();
    const invoices = getInvoices();
    
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

    document.getElementById('statClientsCount').textContent = clients.length;
    document.getElementById('statTickets').textContent = openTickets;
    document.getElementById('statRevenue').textContent = '$' + totalRevenue.toLocaleString();
    
    // Render recent clients in overview
    const recentClientsBody = document.getElementById('recentClientsTable');
    if (recentClientsBody) {
        recentClientsBody.innerHTML = clients.slice(0, 5).map(client => `
            <tr>
                <td><strong>${client.name}</strong></td>
                <td>${client.company}</td>
                <td><span class="status-badge status-${client.status.toLowerCase()}">${client.status}</span></td>
                <td>${formatDate(client.joined)}</td>
                <td>
                    <button class="action-btn" onclick="editClient(${client.id})" title="View"><i class="fa-solid fa-arrow-right"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

function renderClientsTable() {
    const clients = getClients();
    const tbody = document.querySelector('#clientsTableBody');
    if (!tbody) return;

    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.name}</td>
            <td>${client.company}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td><span class="status-badge status-${client.status.toLowerCase()}">${client.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="editClient(${client.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn" onclick="deleteClient(${client.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderTicketsTable() {
    const tickets = getTickets();
    const tbody = document.querySelector('#ticketsTableBody');
    if (!tbody) return;

    tbody.innerHTML = tickets.map(ticket => `
        <tr>
            <td>${ticket.id}</td>
            <td>${ticket.clientName}</td>
            <td>${ticket.subject}</td>
            <td><span class="priority-badge priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
            <td><span class="status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
            <td>${formatDate(ticket.created)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewTicket(${ticket.id})" title="View"><i class="fa-solid fa-eye"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderInvoicesTable() {
    const invoices = getInvoices();
    const tbody = document.querySelector('#invoicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td>${invoice.id}</td>
            <td>${invoice.clientName}</td>
            <td>$${invoice.amount.toLocaleString()}</td>
            <td>${formatDate(invoice.date)}</td>
            <td><span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span></td>
        </tr>
    `).join('');
    
    // Update billing counts
    const paidCount = invoices.filter(i => i.status === 'Paid').length;
    const pendingCount = invoices.filter(i => i.status === 'Pending').length;
    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
    
    const paidEl = document.getElementById('billPaidCount');
    const pendingEl = document.getElementById('billPendingCount');
    const overdueEl = document.getElementById('billOverdueCount');
    
    if (paidEl) paidEl.textContent = paidCount;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (overdueEl) overdueEl.textContent = overdueCount;
}

function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        let clients = getClients();
        clients = clients.filter(c => c.id !== id);
        saveClients(clients);
        renderClientsTable();
        showToast('Client deleted successfully', 'success');
    }
}

function editClient(id) {
    const clients = getClients();
    const client = clients.find(c => c.id === id);
    if (client) {
        showToast(`Editing ${client.name}`, 'info');
        openModal('clientModal');
    }
}

function viewTicket(id) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        showToast(`Viewing ticket ${ticket.id}`, 'info');
        // You could open a modal with ticket details
    }
}

function submitAddClient(event) {
    event.preventDefault();
    showToast('Client added successfully', 'success');
    closeModal('clientModal');
    // Reload clients table
    renderClientsTable();
}

function exportBillingData() {
    const invoices = getInvoices();
    exportToCSV(invoices, 'billing-report.csv');
    showToast('Billing data exported as CSV', 'success');
}

function printBillingReport() {
    printContent('printArea');
    showToast('Printing billing report...', 'info');
}

function saveSystemSettings(event) {
    event.preventDefault();
    showToast('System settings saved successfully', 'success');
}

// ===== CLIENT DASHBOARD FUNCTIONS =====
function loadClientDashboard() {
    const user = checkSession('client');
    if (!user) return;

    document.getElementById('clientNameDisplay').textContent = sessionStorage.getItem('userName') || 'Client';
    document.getElementById('clientEmailDisplay').textContent = user.email;
    document.getElementById('welcomeBackMessage').textContent = `Welcome back, ${sessionStorage.getItem('userName')}!`;
    
    const avatarLetter = user.email.charAt(0).toUpperCase();
    document.getElementById('clientAvatarLetter').textContent = avatarLetter;

    renderClientDashboard();
}

function renderClientDashboard() {
    // Get mock data for demonstration
    const userEmail = sessionStorage.getItem('userEmail');
    const clients = getClients();
    const currentClient = clients[0]; // Assume first client for demo
    const tickets = getTickets();
    const invoices = getInvoices();

    if (currentClient) {
        document.getElementById('statClientServices').textContent = currentClient.services.length;
        document.getElementById('statClientSpent').textContent = '$' + currentClient.spent.toLocaleString();
    }
    
    document.getElementById('statClientTickets').textContent = tickets.length;
    
    const pendingInvoices = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
    document.getElementById('statClientInvoices').textContent = '$' + pendingInvoices.toLocaleString();

    renderClientServices();
    renderClientServicesTable();
    renderClientTickets();
    renderClientInvoices();
    initAnimatedCounters();
}

function renderClientServicesTable() {
    const services = [
        { name: 'Cloud Hosting - Production', uptime: '99.95%', status: 'Active' },
        { name: 'Database Management Suite', uptime: '99.98%', status: 'Active' },
        { name: 'Security Solutions Pack', uptime: '99.92%', status: 'Active' }
    ];
    
    const tbody = document.querySelector('#clientServicesTable');
    if (!tbody) return;
    
    tbody.innerHTML = services.map(service => `
        <tr>
            <td>${service.name}</td>
            <td><span style="color: var(--success); font-weight: 700;">${service.uptime}</span></td>
            <td><span class="status-badge status-active">${service.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="manageService('${service.name}')" title="Manage"><i class="fa-solid fa-sliders"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function manageService(serviceName) {
    showToast(`Managing ${serviceName}`, 'info');
}

function requestService(serviceName, price) {
    showToast(`${serviceName} ($${price}/mo) added to cart!`, 'success');
}

function renderClientServices() {
    const servicesContainer = document.getElementById('clientServices');
    if (!servicesContainer) return;

    const services = [
        { name: 'Cloud Hosting', price: '$299/mo', icon: 'fa-server', status: 'Active' },
        { name: 'Database Management', price: '$149/mo', icon: 'fa-database', status: 'Active' },
        { name: 'Security Solutions', price: '$199/mo', icon: 'fa-shield', status: 'Active' },
        { name: 'API Integration', price: '$99/mo', icon: 'fa-code', status: 'Pending' }
    ];

    servicesContainer.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="service-badge">${service.status}</div>
            <div class="service-card-header">
                <div class="service-card-icon">
                    <i class="fa-solid ${service.icon}"></i>
                </div>
                <div class="service-title">
                    <h3>${service.name}</h3>
                </div>
            </div>
            <div class="service-desc">Premium managed service with 24/7 support and advanced monitoring.</div>
            <div class="service-footer">
                <div class="service-price">${service.price}</div>
            </div>
        </div>
    `).join('');
}

function renderClientTickets() {
    const tickets = getTickets();
    const tbody = document.querySelector('#clientTicketsTableBody');
    if (!tbody) return;

    tbody.innerHTML = tickets.slice(0, 3).map(ticket => `
        <tr>
            <td>${ticket.id}</td>
            <td>${ticket.subject}</td>
            <td><span class="priority-badge priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
            <td><span class="status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
            <td>${formatDate(ticket.created)}</td>
        </tr>
    `).join('');
}

function renderClientInvoices() {
    const invoices = getInvoices();
    const tbody = document.querySelector('#clientInvoicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = invoices.slice(0, 3).map(invoice => `
        <tr>
            <td>${invoice.id}</td>
            <td>$${invoice.amount.toLocaleString()}</td>
            <td>${formatDate(invoice.date)}</td>
            <td><span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span></td>
        </tr>
    `).join('');
}

// ===== INITIALIZE COMMON ACTIONS ON DOM LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    // Loading overlay fade-out
    const loader = document.createElement("div");
    loader.className = "page-loader";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);

    setTimeout(() => {
        loader.classList.add("fade-out");
        setTimeout(() => loader.remove(), 500);
    }, 400);

    // Load Theme
    initTheme();

    // Hook theme toggles
    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
        btn.addEventListener("click", toggleTheme);
    });

    // Hook mobile menu button
    const menuToggleBtn = document.getElementById("menuToggle");
    if (menuToggleBtn) {
        menuToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuToggleBtn.addEventListener("click", toggleMobileSidebar);
    }

    // Close modals on backdrop click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    });

    // Load dashboard functions if on dashboard page
    if (window.location.pathname.includes('admin.html')) {
        loadAdminDashboard();
    } else if (window.location.pathname.includes('client.html')) {
        loadClientDashboard();
    }
});


