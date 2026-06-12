// Auth helper script
const Auth = {
    requireAuth: () => {
        return AuthGuard.check();
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
    },

    initForgot: () => {
        const form = $('#forgot-form');
        if (!form.length) return;

        form.on('submit', function(e) {
            e.preventDefault();
            const email = $('#forgot-email').val().trim();
            const password = $('#forgot-password').val();
            const confirmPass = $('#forgot-confirm-password').val();

            if (!email || !password || !confirmPass) {
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

            APIHelper.forgotPassword(email, password)
                .then(() => {
                    showToast('Password updated successfully! Please login.', 'success');
                    setTimeout(() => {
                        $('.auth-card').removeClass('signup-mode forgot-mode');
                        hideLoader(form);
                        form.trigger('reset');
                    }, 1500);
                })
                .catch(err => {
                    hideLoader(form);
                    showToast(typeof err === 'string' ? err : (err.error || 'Password reset failed'), 'danger');
                });
        });
    }
};

$(document).ready(async function() {
    const role = APIHelper.getUserRole();
    const email = APIHelper.getUserEmail();
    const profileId = localStorage.getItem('profileId');
    const token = APIHelper.getAccessToken();

    console.log("Role:", role);
    console.log("Email:", email);
    console.log("Profile ID:", profileId);
    console.log("Page:", window.location.pathname);

    Auth.checkAccess();
    Auth.initLogin();
    Auth.initSignup();
    Auth.initForgot();

    // Centralized Auto-Recovery Logic
    if (token && role) {
        if (!profileId || profileId === 'null' || profileId === 'undefined') {
            console.log(`[Auto-Recovery] profileId is missing for role ${role}. Fetching...`);
            if (role === 'DOCTOR') {
                await ProfileManager.initializeDoctorProfile();
            } else if (role === 'PATIENT') {
                await ProfileManager.initializePatientProfile();
            } else if (role === 'RECEPTIONIST') {
                await ProfileManager.initializeReceptionistProfile();
            }
        }
        
        let userId = localStorage.getItem('userId');
        if (!userId || userId === 'null' || userId === 'undefined') {
            try {
                const user = await APIHelper.getProfile();
                if (user && user.id) {
                    localStorage.setItem('userId', user.id);
                }
            } catch (err) {
                console.error("[Auto-Recovery] Failed to fetch user profile for userId:", err);
            }
        }
    }
});

const AuthGuard = {
    check: () => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        const email = localStorage.getItem('email');

        if (!token || !role || !email) {
            localStorage.clear();
            window.location.replace('../index.html');
            return false;
        }

        return true;
    }
};

window.addEventListener('pageshow', function() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);

    if (filename !== 'index.html' && path !== '/' && !path.endsWith('/') && filename !== '') {
        if (!localStorage.getItem('accessToken')) {
            window.location.replace('../index.html');
        }
    }
});
