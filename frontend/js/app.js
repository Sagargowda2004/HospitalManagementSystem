// Global Shared Layout and UI script
const App = {
    // Generate and inject layout
    initLayout: () => {
        const root = $('#app-layout-root');
        if (!root.length) return;

        const role = APIHelper.getUserRole();
        const email = APIHelper.getUserEmail();
        const initial = email ? email.substring(0, 2).toUpperCase() : 'U';
        
        // Define sidebar menus
        const menuItems = App.getMenuForRole(role);
        const currentPath = window.location.pathname;
        const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);

        // Render Sidebar
        let menuHtml = '';
        menuItems.forEach(item => {
            const isActive = currentFile === item.link ? 'active' : '';
            menuHtml += `
                <li class="sidebar-item">
                    <a href="${item.link}" class="sidebar-link ${isActive}">
                        <i class="${item.icon}"></i>
                        <span>${item.title}</span>
                    </a>
                </li>
            `;
        });

        const sidebarHtml = `
            <aside class="sidebar" id="app-sidebar">
                <div class="sidebar-brand">
                    <i class="fas fa-heartbeat"></i>
                    <span>HMS Healthcare</span>
                </div>
                <ul class="sidebar-menu">
                    ${menuHtml}
                </ul>
                <div class="sidebar-footer">
                    <button class="btn btn-secondary w-100" id="btn-logout-sidebar">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </aside>
        `;

        // Render Header
        const headerHtml = `
            <header class="header">
                <button class="menu-toggle" id="sidebar-toggle-btn">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="header-search">
                    <i class="fas fa-search text-muted"></i>
                    <input type="text" placeholder="Search anything...">
                </div>
                <div class="header-actions">
                    <div class="user-profile" id="user-profile-trigger">
                        <div class="user-avatar">${initial}</div>
                        <div class="user-info">
                            <span class="user-name">${email}</span>
                            <span class="user-role">${role}</span>
                        </div>
                        <i class="fas fa-chevron-down text-muted" style="font-size: 0.8rem;"></i>
                        <div class="profile-dropdown" id="user-profile-menu">
                            <a href="#" id="btn-profile-me"><i class="fas fa-user-circle"></i> My Profile</a>
                            <a href="#" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Wrap layout
        const innerContent = root.html();
        root.html(`
            <div class="app-container">
                ${sidebarHtml}
                <main class="main-content">
                    ${headerHtml}
                    <div class="view-container">
                        ${innerContent}
                    </div>
                </main>
            </div>
            <!-- Global Toast Container -->
            <div class="toast-container" id="toast-container"></div>
            <!-- Global Profile Modal -->
            <div class="modal-overlay" id="profile-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>My Profile</h2>
                        <button class="modal-close" onclick="closeModal('profile-modal')">&times;</button>
                    </div>
                    <div class="modal-body" id="profile-modal-body">
                        <div class="spinner" style="margin: 20px auto;"></div>
                    </div>
                </div>
            </div>
        `);

        // Event bindings
        $('#sidebar-toggle-btn').on('click', () => {
            $('#app-sidebar').toggleClass('active');
        });

        $('#user-profile-trigger').on('click', function(e) {
            e.stopPropagation();
            $('#user-profile-menu').toggle();
        });

        $(document).on('click', () => {
            $('#user-profile-menu').hide();
        });

        $('#btn-logout, #btn-logout-sidebar').on('click', function(e) {
            e.preventDefault();
            APIHelper.logout();
        });

        $('#btn-profile-me').on('click', function(e) {
            e.preventDefault();
            openModal('profile-modal');
            APIHelper.getProfile()
                .then(user => {
                    $('#profile-modal-body').html(`
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div><strong>Name:</strong> ${user.name}</div>
                            <div><strong>Email:</strong> ${user.email}</div>
                            <div><strong>Role:</strong> ${user.role}</div>
                            <div><strong>User ID:</strong> ${user.id}</div>
                        </div>
                    `);
                })
                .catch(err => {
                    $('#profile-modal-body').html(`<p class="text-danger">Failed to fetch profile details.</p>`);
                });
        });
    },

    getMenuForRole: (role) => {
        if (role === 'ADMIN') {
            return [
                { title: 'Dashboard', link: 'admin-dashboard.html', icon: 'fas fa-chart-pie' },
                { title: 'Users Management', link: 'users.html', icon: 'fas fa-users' },
                { title: 'Departments', link: 'departments.html', icon: 'fas fa-hospital' },
                { title: 'Appointments', link: 'appointments.html', icon: 'fas fa-calendar-check' },
                { title: 'Medical Records', link: 'medical-records.html', icon: 'fas fa-notes-medical' },
                { title: 'Prescriptions', link: 'prescriptions.html', icon: 'fas fa-prescription-bottle-alt' },
                { title: 'Bills & Payments', link: 'bills.html', icon: 'fas fa-file-invoice-dollar' },
                { title: 'Notifications', link: 'notifications.html', icon: 'fas fa-bell' }
            ];
        }
        if (role === 'DOCTOR') {
            return [
                { title: 'Dashboard', link: 'doctor-dashboard.html', icon: 'fas fa-chart-pie' },
                { title: 'Appointments', link: 'appointments.html', icon: 'fas fa-calendar-check' },
                { title: 'Medical Records', link: 'medical-records.html', icon: 'fas fa-notes-medical' },
                { title: 'Prescriptions', link: 'prescriptions.html', icon: 'fas fa-prescription-bottle-alt' },
                { title: 'Notifications', link: 'notifications.html', icon: 'fas fa-bell' }
            ];
        }
        if (role === 'PATIENT') {
            return [
                { title: 'Dashboard', link: 'patient-dashboard.html', icon: 'fas fa-chart-pie' },
                { title: 'Appointments', link: 'appointments.html', icon: 'fas fa-calendar-check' },
                { title: 'Medical Records', link: 'medical-records.html', icon: 'fas fa-notes-medical' },
                { title: 'Prescriptions', link: 'prescriptions.html', icon: 'fas fa-prescription-bottle-alt' },
                { title: 'Bills & Invoices', link: 'bills.html', icon: 'fas fa-file-invoice-dollar' }
            ];
        }
        if (role === 'RECEPTIONIST') {
            return [
                { title: 'Dashboard', link: 'receptionist-dashboard.html', icon: 'fas fa-chart-pie' },
                { title: 'Patients Profiles', link: 'users.html', icon: 'fas fa-users' },
                { title: 'Appointments', link: 'appointments.html', icon: 'fas fa-calendar-check' },
                { title: 'Billing & Payments', link: 'bills.html', icon: 'fas fa-file-invoice-dollar' },
                { title: 'Notifications', link: 'notifications.html', icon: 'fas fa-bell' }
            ];
        }
        return [];
    }
};

// Global feedback helpers
function showToast(message, type = 'primary') {
    const container = $('#toast-container');
    if (!container.length) return;

    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle');

    const toastHtml = `
        <div class="toast ${type}" id="${id}">
            <i class="fas ${icon}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="$(this).parent().removeClass('show').delay(400).queue(function(){$(this).remove();})">&times;</button>
        </div>
    `;

    container.append(toastHtml);
    setTimeout(() => {
        $(`#${id}`).addClass('show');
    }, 50);

    setTimeout(() => {
        $(`#${id}`).removeClass('show');
        setTimeout(() => { $(`#${id}`).remove(); }, 400);
    }, 4000);
}

function showLoader(element) {
    let overlay = element.find('.loading-overlay');
    if (!overlay.length) {
        element.append('<div class="loading-overlay"><div class="spinner"></div></div>');
        overlay = element.find('.loading-overlay');
    }
    overlay.css('display', 'flex');
}

function hideLoader(element) {
    element.find('.loading-overlay').hide();
}

function openModal(id) {
    $(`#${id}`).addClass('active');
}

function closeModal(id) {
    $(`#${id}`).removeClass('active');
}

// Global modal builder utility
function buildConfirmModal(title, text, confirmCallback) {
    let modal = $('#confirm-modal');
    if (modal.length) modal.remove();

    const html = `
        <div class="modal-overlay" id="confirm-modal">
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="closeModal('confirm-modal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${text}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('confirm-modal')">Cancel</button>
                    <button class="btn btn-danger" id="confirm-modal-ok-btn">Confirm</button>
                </div>
            </div>
        </div>
    `;

    $('body').append(html);
    openModal('confirm-modal');
    
    $('#confirm-modal-ok-btn').off('click').on('click', () => {
        closeModal('confirm-modal');
        confirmCallback();
    });
}

$(document).ready(function() {
    App.initLayout();
});
