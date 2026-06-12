// Auth helper script
const Auth = {
    requireAuth: () => {
        const token = APIHelper.getAccessToken();
        const role = APIHelper.getUserRole();
        if (!token || !role) {
            APIHelper.clearSession();
            Navigation.navigateToLogin();
            return false;
        }
        return true;
    },

    requireRole: (allowedRoles) => {
        if (!Auth.requireAuth()) return false;
        const role = APIHelper.getUserRole();
        
        // ADMIN has access to everything
        if (role === 'ADMIN') return true;

        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!rolesArray.includes(role)) {
            Navigation.navigateToDashboard(role);
            return false;
        }
        return true;
    },

    // Route guards
    checkAccess: () => {
        const token = APIHelper.getAccessToken();
        const role = APIHelper.getUserRole();
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);

        // If on login/signup page and authenticated, redirect to appropriate dashboard
        if (filename === 'index.html' || path === '/' || path.endsWith('/') || filename === '') {
            if (token && role) {
                Navigation.navigateToDashboard(role);
            }
            return;
        }

        // Inside protected page
        if (!Auth.requireAuth()) return;

        // Role-based route restrictions
        if (filename === 'admin-dashboard.html' || filename === 'departments.html') {
            Auth.requireRole('ADMIN');
        } else if (filename === 'doctor-dashboard.html') {
            Auth.requireRole('DOCTOR');
        } else if (filename === 'patient-dashboard.html') {
            Auth.requireRole('PATIENT');
        } else if (filename === 'receptionist-dashboard.html') {
            Auth.requireRole('RECEPTIONIST');
        } else if (filename === 'users.html') {
            Auth.requireRole(['ADMIN', 'RECEPTIONIST']);
        } else if (filename === 'medical-records.html' || filename === 'prescriptions.html') {
            Auth.requireRole(['ADMIN', 'DOCTOR', 'PATIENT']);
        } else if (filename === 'appointments.html') {
            Auth.requireRole(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST']);
        } else if (filename === 'bills.html') {
            Auth.requireRole(['ADMIN', 'PATIENT', 'RECEPTIONIST']);
        } else if (filename === 'notifications.html') {
            Auth.requireRole(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST']);
        }
    },

    redirectToDashboard: (role) => {
        Navigation.navigateToDashboard(role);
    },

    initLogin: () => {
        const form = $('#login-form');
        if (!form.length) return;

        form.on('submit', function(e) {
            e.preventDefault();
            const email = $('#login-email').val().trim();
            const password = $('#login-password').val();

            if (!email || !password) {
                showToast('Email and password are required', 'danger');
                return;
            }

            showLoader(form);

            APIHelper.login(email, password)
                .then(async res => {
                    showToast('Login successful!', 'success');
                    
                    try {
                        if (res.role === 'DOCTOR') {
                            await ProfileManager.initializeDoctorProfile();
                        } else if (res.role === 'PATIENT') {
                            await ProfileManager.initializePatientProfile();
                        }
                    } catch (profileErr) {
                        console.error("Profile initialization failed during login:", profileErr);
                    }

                    setTimeout(() => {
                        Navigation.navigateToDashboard(res.role);
                    }, 1000);
                })
                .catch(err => {
                    hideLoader(form);
                    showToast(err.error || 'Invalid email or password', 'danger');
                });
        });
    },

    initSignup: () => {
        const form = $('#signup-form');
        if (!form.length) return;

        form.on('submit', function(e) {
            e.preventDefault();
            const name = $('#signup-name').val().trim();
            const email = $('#signup-email').val().trim();
            const password = $('#signup-password').val();
            const confirmPass = $('#signup-confirm-password').val();
            const role = $('#signup-role').val();

            if (!name || !email || !password || !role) {
                showToast('All fields are required', 'danger');
                return;
            }

            if (password !== confirmPass) {
                showToast('Passwords do not match', 'danger');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters long', 'danger');
                return;
            }

            showLoader(form);

            APIHelper.signup(name, email, password, role)
                .then(() => {
                    showToast('Signup successful! Please login.', 'success');
                    setTimeout(() => {
                        // Toggle forms
                        $('.auth-card').removeClass('signup-mode');
                        hideLoader(form);
                        form.trigger('reset');
                    }, 1500);
                })
                .catch(err => {
                    hideLoader(form);
                    showToast(typeof err === 'string' ? err : (err.error || 'Registration failed'), 'danger');
                });
        });
    }
};

$(document).ready(function() {
    // Debug logging during startup
    console.log('Current role:', APIHelper.getUserRole());
    console.log('Current email:', APIHelper.getUserEmail());
    console.log('Current path:', window.location.pathname);

    Auth.checkAccess();
    Auth.initLogin();
    Auth.initSignup();
});
