const API_BASE_URL = 'http://localhost:8080';

// Centralized Navigation Helper
const Navigation = {
    navigateToLogin: () => {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    },
    navigateToDashboard: (role) => {
        const path = window.location.pathname;
        const prefix = path.includes('/pages/') ? '' : 'pages/';
        if (role === 'ADMIN') {
            window.location.href = prefix + 'admin-dashboard.html';
        } else if (role === 'DOCTOR') {
            window.location.href = prefix + 'doctor-dashboard.html';
        } else if (role === 'PATIENT') {
            window.location.href = prefix + 'patient-dashboard.html';
        } else if (role === 'RECEPTIONIST') {
            window.location.href = prefix + 'receptionist-dashboard.html';
        } else {
            APIHelper.clearSession();
            Navigation.navigateToLogin();
        }
    }
};

// Global API Helper object
const APIHelper = {
    // Session states
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    getUserRole: () => localStorage.getItem('role'),
    getUserEmail: () => localStorage.getItem('email'),

    saveSession: (data) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
    },

    clearSession: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
    },

    // Decode JWT token payload
    parseJwt: (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    },

    // Check if token will expire soon (within 5 minutes)
    isTokenExpiringSoon: (token) => {
        if (!token) return true;
        const decoded = APIHelper.parseJwt(token);
        if (!decoded || !decoded.exp) return true;
        const currentTime = Math.floor(Date.now() / 1000);
        return (decoded.exp - currentTime) < 300; // Less than 5 minutes left
    },

    // Flag to prevent recursive loop during refresh calls
    isRefreshing: false,
    refreshQueue: [],

    // Core AJAX request wrapper with JWT management and retry interceptors
    request: async function(options) {
        let token = APIHelper.getAccessToken();

        // Auto refresh before expiry
        if (token && !options.skipRefreshCheck && APIHelper.isTokenExpiringSoon(token)) {
            const refresh = APIHelper.getRefreshToken();
            if (refresh) {
                try {
                    await APIHelper.refreshToken();
                    token = APIHelper.getAccessToken();
                } catch (err) {
                    console.error("Session refresh failed prior to request: ", err);
                }
            }
        }

        return new Promise((resolve, reject) => {
            const headers = options.headers || {};
            if (token && !options.noAuth) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            $.ajax({
                url: `${API_BASE_URL}${options.url}`,
                type: options.type || 'GET',
                contentType: options.contentType || 'application/json',
                data: options.data ? (options.contentType === false ? options.data : JSON.stringify(options.data)) : null,
                processData: options.processData !== undefined ? options.processData : true,
                headers: headers,
                success: (res) => resolve(res),
                error: async (xhr) => {
                    // Retry once on 401
                    if (xhr.status === 401 && !options.isRetry && !options.noAuth) {
                        const refresh = APIHelper.getRefreshToken();
                        if (refresh) {
                            try {
                                await APIHelper.refreshToken();
                                options.isRetry = true;
                                const result = await APIHelper.request(options);
                                resolve(result);
                                return;
                            } catch (refreshErr) {
                                APIHelper.logoutRedirect();
                                reject(refreshErr);
                                return;
                            }
                        } else {
                            APIHelper.logoutRedirect();
                        }
                    }
                    reject(xhr.responseJSON || { error: xhr.responseText || 'An error occurred' });
                }
            });
        });
    },

    // Auth APIs
    signup: (name, email, password, role) => {
        return APIHelper.request({
            url: '/auth/signup',
            type: 'POST',
            noAuth: true,
            data: { name, email, password, role }
        });
    },

    login: (email, password) => {
        return APIHelper.request({
            url: '/auth/login',
            type: 'POST',
            noAuth: true,
            data: { email, password }
        }).then(res => {
            APIHelper.saveSession(res);
            return res;
        });
    },

    refreshToken: () => {
        if (APIHelper.isRefreshing) {
            return new Promise((resolve) => {
                APIHelper.refreshQueue.push(resolve);
            });
        }

        APIHelper.isRefreshing = true;
        const refreshToken = APIHelper.getRefreshToken();

        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${API_BASE_URL}/auth/refresh`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ refreshToken }),
                success: (res) => {
                    APIHelper.saveSession(res);
                    APIHelper.isRefreshing = false;
                    resolve(res);
                    // Resolve waiting queue
                    APIHelper.refreshQueue.forEach(cb => cb(res));
                    APIHelper.refreshQueue = [];
                },
                error: (xhr) => {
                    APIHelper.isRefreshing = false;
                    APIHelper.clearSession();
                    reject(xhr);
                }
            });
        });
    },

    logout: () => {
        return APIHelper.request({
            url: '/auth/logout',
            type: 'POST',
            skipRefreshCheck: true
        }).always(() => {
            APIHelper.clearSession();
            Navigation.navigateToLogin();
        });
    },

    logoutRedirect: () => {
        APIHelper.clearSession();
        Navigation.navigateToLogin();
    },

    getProfile: () => {
        return APIHelper.request({
            url: '/auth/me',
            type: 'GET'
        });
    },

    // Department APIs
    getDepartments: () => {
        return APIHelper.request({ url: '/api/departments', type: 'GET' });
    },

    getActiveDepartments: () => {
        return APIHelper.request({ url: '/api/departments/active/list', type: 'GET' });
    },

    getDepartment: (id) => {
        return APIHelper.request({ url: `/api/departments/${id}`, type: 'GET' });
    },

    createDepartment: (department) => {
        return APIHelper.request({
            url: '/api/departments',
            type: 'POST',
            data: department
        });
    },

    updateDepartment: (id, department) => {
        return APIHelper.request({
            url: `/api/departments/${id}`,
            type: 'PUT',
            data: department
        });
    },

    deleteDepartment: (id) => {
        return APIHelper.request({
            url: `/api/departments/${id}`,
            type: 'DELETE'
        });
    },

    // Appointment APIs
    getAppointments: () => {
        return APIHelper.request({ url: '/api/appointments', type: 'GET' });
    },

    getAppointment: (id) => {
        return APIHelper.request({ url: `/api/appointments/${id}`, type: 'GET' });
    },

    createAppointment: (appointment) => {
        return APIHelper.request({
            url: '/api/appointments',
            type: 'POST',
            data: appointment
        });
    },

    updateAppointment: (id, appointment) => {
        return APIHelper.request({
            url: `/api/appointments/${id}`,
            type: 'PUT',
            data: appointment
        });
    },

    deleteAppointment: (id) => {
        return APIHelper.request({
            url: `/api/appointments/${id}`,
            type: 'DELETE'
        });
    },

    getPatientAppointments: (patientId) => {
        return APIHelper.request({ url: `/api/appointments/patient/${patientId}`, type: 'GET' });
    },

    getDoctorAppointments: (doctorId) => {
        return APIHelper.request({ url: `/api/appointments/doctor/${doctorId}`, type: 'GET' });
    },

    getAppointmentsByStatus: (status) => {
        return APIHelper.request({ url: `/api/appointments/status/${status}`, type: 'GET' });
    },

    // Medical Records APIs
    getMedicalRecords: () => {
        return APIHelper.request({ url: '/api/medical-records', type: 'GET' });
    },

    getMedicalRecord: (id) => {
        return APIHelper.request({ url: `/api/medical-records/${id}`, type: 'GET' });
    },

    createMedicalRecord: (record) => {
        return APIHelper.request({
            url: '/api/medical-records',
            type: 'POST',
            data: record
        });
    },

    updateMedicalRecord: (id, record) => {
        return APIHelper.request({
            url: `/api/medical-records/${id}`,
            type: 'PUT',
            data: record
        });
    },

    deleteMedicalRecord: (id) => {
        return APIHelper.request({
            url: `/api/medical-records/${id}`,
            type: 'DELETE'
        });
    },

    getPatientMedicalRecords: (patientId) => {
        return APIHelper.request({ url: `/api/medical-records/patient/${patientId}`, type: 'GET' });
    },

    getDoctorMedicalRecords: (doctorId) => {
        return APIHelper.request({ url: `/api/medical-records/doctor/${doctorId}`, type: 'GET' });
    },

    // Prescriptions APIs
    getPrescriptions: () => {
        return APIHelper.request({ url: '/api/prescriptions', type: 'GET' });
    },

    getPrescription: (id) => {
        return APIHelper.request({ url: `/api/prescriptions/${id}`, type: 'GET' });
    },

    createPrescription: (prescription) => {
        return APIHelper.request({
            url: '/api/prescriptions',
            type: 'POST',
            data: prescription
        });
    },

    updatePrescription: (id, prescription) => {
        return APIHelper.request({
            url: `/api/prescriptions/${id}`,
            type: 'PUT',
            data: prescription
        });
    },

    deletePrescription: (id) => {
        return APIHelper.request({
            url: `/api/prescriptions/${id}`,
            type: 'DELETE'
        });
    },

    getPatientPrescriptions: (patientId) => {
        return APIHelper.request({ url: `/api/prescriptions/patient/${patientId}`, type: 'GET' });
    },

    getDoctorPrescriptions: (doctorId) => {
        return APIHelper.request({ url: `/api/prescriptions/doctor/${doctorId}`, type: 'GET' });
    },

    getPrescriptionsByStatus: (status) => {
        return APIHelper.request({ url: `/api/prescriptions/status/${status}`, type: 'GET' });
    },

    // Bills APIs
    getBills: () => {
        return APIHelper.request({ url: '/api/bills', type: 'GET' });
    },

    getBill: (id) => {
        return APIHelper.request({ url: `/api/bills/${id}`, type: 'GET' });
    },

    createBill: (bill) => {
        return APIHelper.request({
            url: '/api/bills',
            type: 'POST',
            data: bill
        });
    },

    updateBill: (id, bill) => {
        return APIHelper.request({
            url: `/api/bills/${id}`,
            type: 'PUT',
            data: bill
        });
    },

    deleteBill: (id) => {
        return APIHelper.request({
            url: `/api/bills/${id}`,
            type: 'DELETE'
        });
    },

    getPatientBills: (patientId) => {
        return APIHelper.request({ url: `/api/bills/patient/${patientId}`, type: 'GET' });
    },

    getBillsByStatus: (status) => {
        return APIHelper.request({ url: `/api/bills/status/${status}`, type: 'GET' });
    },

    updateBillStatus: (id, status) => {
        return APIHelper.request({
            url: `/api/bills/${id}/status/${status}`,
            type: 'PATCH'
        });
    },

    // Payments APIs
    getPayments: () => {
        return APIHelper.request({ url: '/api/payments', type: 'GET' });
    },

    getPayment: (id) => {
        return APIHelper.request({ url: `/api/payments/${id}`, type: 'GET' });
    },

    createPayment: (payment) => {
        return APIHelper.request({
            url: '/api/payments',
            type: 'POST',
            data: payment
        });
    },

    deletePayment: (id) => {
        return APIHelper.request({
            url: `/api/payments/${id}`,
            type: 'DELETE'
        });
    },

    getBillPayments: (billId) => {
        return APIHelper.request({ url: `/api/payments/bill/${billId}`, type: 'GET' });
    },

    getPaymentsByStatus: (status) => {
        return APIHelper.request({ url: `/api/payments/status/${status}`, type: 'GET' });
    },

    // Notifications APIs
    getNotifications: () => {
        return APIHelper.request({ url: '/api/notifications', type: 'GET' });
    },

    getNotification: (id) => {
        return APIHelper.request({ url: `/api/notifications/${id}`, type: 'GET' });
    },

    sendNotification: (notification) => {
        return APIHelper.request({
            url: '/api/notifications',
            type: 'POST',
            data: notification
        });
    },

    deleteNotification: (id) => {
        return APIHelper.request({
            url: `/api/notifications/${id}`,
            type: 'DELETE'
        });
    },

    getUserNotifications: (userId) => {
        return APIHelper.request({ url: `/api/notifications/user/${userId}`, type: 'GET' });
    },

    getNotificationsByStatus: (status) => {
        return APIHelper.request({ url: `/api/notifications/status/${status}`, type: 'GET' });
    },

    getNotificationsByType: (type) => {
        return APIHelper.request({ url: `/api/notifications/type/${type}`, type: 'GET' });
    },

    // Doctor Profile APIs
    createDoctorProfile: (profile) => {
        return APIHelper.request({
            url: '/doctor/add',
            type: 'POST',
            data: profile
        });
    },

    getDoctorProfile: (id) => {
        return APIHelper.request({ url: `/doctor/${id}`, type: 'GET' });
    },

    getAllDoctors: () => {
        return APIHelper.request({ url: '/doctor/all', type: 'GET' });
    },

    deleteDoctorProfile: (id) => {
        return APIHelper.request({
            url: `/doctor/delete/${id}`,
            type: 'DELETE'
        });
    },

    // Patient Profile APIs
    createPatientProfile: (profile) => {
        return APIHelper.request({
            url: '/patient/add',
            type: 'POST',
            data: profile
        });
    },

    getPatientProfile: (id) => {
        return APIHelper.request({ url: `/patient/${id}`, type: 'GET' });
    },

    getAllPatients: () => {
        return APIHelper.request({ url: '/patient/all', type: 'GET' });
    },

    deletePatientProfile: (id) => {
        return APIHelper.request({
            url: `/patient/delete/${id}`,
            type: 'DELETE'
        });
    },

    // Receptionist Profile APIs
    createReceptionistProfile: (profile) => {
        return APIHelper.request({
            url: '/receptionist/add',
            type: 'POST',
            data: profile
        });
    },

    getReceptionistProfile: (id) => {
        return APIHelper.request({ url: `/receptionist/${id}`, type: 'GET' });
    },

    getAllReceptionists: () => {
        return APIHelper.request({ url: '/receptionist/all', type: 'GET' });
    },

    deleteReceptionistProfile: (id) => {
        return APIHelper.request({
            url: `/receptionist/delete/${id}`,
            type: 'DELETE'
        });
    },

    getDoctorMe: () => {
        return APIHelper.request({ url: '/doctor/me', type: 'GET' });
    },

    getPatientMe: () => {
        return APIHelper.request({ url: '/patient/me', type: 'GET' });
    }
};

const ProfileManager = {
    initializeDoctorProfile: async () => {
        const email = APIHelper.getUserEmail();
        const role = APIHelper.getUserRole();
        
        console.log("Email:", email);
        console.log("Role:", role);

        if (role !== 'DOCTOR') {
            console.log("Role is not DOCTOR. Skipping doctor profile initialization.");
            return null;
        }

        try {
            console.log("Calling GET /doctor/me to fetch doctor profile...");
            const doctor = await APIHelper.getDoctorMe();
            console.log("Doctor Profile:", doctor);
            
            if (doctor && doctor.id) {
                localStorage.setItem('profileId', doctor.id);
                console.log("Profile ID:", doctor.id);
                return doctor;
            } else {
                console.error("Doctor profile not found or ID missing from /doctor/me response");
                return null;
            }
        } catch (err) {
            console.error("Error in initializeDoctorProfile:", err);
            return null;
        }
    },

    initializePatientProfile: async () => {
        const email = APIHelper.getUserEmail();
        const role = APIHelper.getUserRole();
        
        console.log("Email:", email);
        console.log("Role:", role);

        if (role !== 'PATIENT') {
            console.log("Role is not PATIENT. Skipping patient profile initialization.");
            return null;
        }

        try {
            console.log("Calling GET /patient/me to fetch patient profile...");
            const patient = await APIHelper.getPatientMe();
            console.log("Patient Profile:", patient);
            
            if (patient && patient.id) {
                localStorage.setItem('profileId', patient.id);
                console.log("Profile ID (Patient):", patient.id);
                return patient;
            } else {
                console.error("Patient profile not found or ID missing from /patient/me response");
                return null;
            }
        } catch (err) {
            console.error("Error in initializePatientProfile:", err);
            return null;
        }
    }
};
