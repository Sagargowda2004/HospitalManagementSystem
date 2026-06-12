// Dashboard dynamic data loader
const Dashboard = {
    init: () => {
        const role = APIHelper.getUserRole();
        const email = APIHelper.getUserEmail();

        if (role === 'ADMIN') {
            Dashboard.loadAdminStats();
        } else if (role === 'DOCTOR') {
            Dashboard.loadDoctorDashboard(email);
        } else if (role === 'PATIENT') {
            Dashboard.loadPatientDashboard(email);
        } else if (role === 'RECEPTIONIST') {
            Dashboard.loadReceptionistDashboard();
        }
    },

    // Admin Dashboard loading
    loadAdminStats: () => {
        // Fetch all data in parallel
        Promise.all([
            APIHelper.getAppointments().catch(() => []),
            APIHelper.getActiveDepartments().catch(() => []),
            APIHelper.getAllDoctors().catch(() => []),
            APIHelper.getBills().catch(() => [])
        ]).then(([appointments, depts, doctors, bills]) => {
            // Stats updates
            $('#stat-total-appointments').text(appointments.length);
            $('#stat-active-departments').text(depts.length);
            $('#stat-total-doctors').text(doctors.length);

            let totalRevenue = 0;
            bills.forEach(bill => {
                if (bill.paidAmount) {
                    totalRevenue += parseFloat(bill.paidAmount);
                }
            });
            $('#stat-total-revenue').text(`$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);

            // Render recent appointments
            const recent = appointments.slice(-5).reverse();
            let html = '';
            if (recent.length === 0) {
                html = `<tr><td colspan="4" class="text-center">No appointments scheduled</td></tr>`;
            } else {
                recent.forEach(app => {
                    const statusClass = app.status === 'COMPLETED' ? 'badge-success' : (app.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
                    const formattedDate = new Date(app.appointmentDate).toLocaleString();
                    html += `
                        <tr>
                            <td><strong>${app.patientName || `Patient #${app.patientId}`}</strong></td>
                            <td>${app.doctorName || `Doctor #${app.doctorId}`}</td>
                            <td>${formattedDate}</td>
                            <td><span class="badge ${statusClass}">${app.status}</span></td>
                        </tr>
                    `;
                });
            }
            $('#admin-recent-appointments-body').html(html);
        }).catch(err => {
            console.error("Admin stats failed to load: ", err);
            showToast('Error loading system stats', 'danger');
        });
    },

    // Doctor Dashboard loading
    loadDoctorDashboard: async (email) => {
        let profileId = localStorage.getItem('profileId');
        let currentDoc = null;

        console.log("Email:", email);
        console.log("Role: DOCTOR");

        if (!profileId || profileId === 'null') {
            console.log("Profile ID missing on load. Initializing doctor profile...");
            currentDoc = await ProfileManager.initializeDoctorProfile();
            if (currentDoc) {
                profileId = currentDoc.id;
            }
        }

        if (!profileId || profileId === 'null') {
            console.log("Profile ID still missing after initialization");
            $('#doctor-assigned-id-lbl').text('Warning: Profile mismatch').removeClass('badge-primary').addClass('badge-danger');
            $('#doctor-appointments-body').html(`<tr><td colspan="5" class="text-center">Doctor profile record not found. Please contact admin.</td></tr>`);
            return;
        }

        console.log("Profile ID:", profileId);

        // Fetch doctor info to update label
        try {
            if (!currentDoc) {
                currentDoc = await APIHelper.getDoctorProfile(profileId);
            }
            if (currentDoc && currentDoc.user) {
                $('#doctor-assigned-id-lbl').text(`Practitioner: ${currentDoc.user.name} | Spec: ${currentDoc.specialization}`);
            } else if (currentDoc) {
                $('#doctor-assigned-id-lbl').text(`Practitioner ID: ${currentDoc.id} | Spec: ${currentDoc.specialization}`);
            }
        } catch (err) {
            console.error("Failed to load doctor profile details for label:", err);
            $('#doctor-assigned-id-lbl').text(`Practitioner ID: ${profileId}`);
        }

        // Load appointments, records and prescriptions in parallel
        return Promise.all([
            APIHelper.getDoctorAppointments(profileId).catch(() => []),
            APIHelper.getMedicalRecords().catch(() => []),
            APIHelper.getPrescriptions().catch(() => [])
        ]).then(([appointments, records, prescriptions]) => {
            // Set stats counts
            $('#doctor-stat-appointments').text(appointments.length);
            
            const myRecordsCount = records.filter(r => r.doctorId === parseInt(profileId)).length;
            $('#doctor-stat-records').text(myRecordsCount);

            const myPrescriptionsCount = prescriptions.filter(p => p.doctorId === parseInt(profileId)).length;
            $('#doctor-stat-prescriptions').text(myPrescriptionsCount);

            // Render doctor's appointments
            let html = '';
            if (appointments.length === 0) {
                html = `<tr><td colspan="5" class="text-center">No appointments assigned</td></tr>`;
            } else {
                appointments.reverse().forEach(app => {
                    const statusClass = app.status === 'COMPLETED' ? 'badge-success' : (app.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
                    const formattedDate = new Date(app.appointmentDate).toLocaleString();
                    
                    // Action buttons based on status
                    let actionButtons = `
                        <button class="btn btn-secondary" onclick="Dashboard.openConsultModal(${app.id}, '${app.status}', '${app.notes || ''}')" style="padding: 6px 10px; font-size: 0.8rem;">
                            <i class="fas fa-edit"></i> Edit Status
                        </button>
                    `;

                    if (app.status !== 'CANCELLED' && app.status !== 'COMPLETED') {
                        actionButtons += `
                            <a href="medical-records.html?patientId=${app.patientId}&appId=${app.id}" class="btn btn-primary" style="padding: 6px 10px; font-size: 0.8rem;">
                                <i class="fas fa-notes-medical"></i> Diagnose
                            </a>
                            <a href="prescriptions.html?patientId=${app.patientId}&appId=${app.id}" class="btn btn-warning" style="padding: 6px 10px; font-size: 0.8rem; color: #ffffff;">
                                <i class="fas fa-prescription"></i> Rx
                            </a>
                        `;
                    }

                    html += `
                        <tr>
                            <td><strong>${app.patientName || `Patient #${app.patientId}`}</strong><br><small style="color: var(--text-muted)">ID: ${app.patientId}</small></td>
                            <td>${formattedDate}</td>
                            <td>${app.reason}</td>
                            <td><span class="badge ${statusClass}">${app.status}</span></td>
                            <td><div style="display: flex; gap: 8px;">${actionButtons}</div></td>
                        </tr>
                    `;
                });
            }
            $('#doctor-appointments-body').html(html);
        }).catch(err => {
            console.error(err);
            $('#doctor-appointments-body').html(`<tr><td colspan="5" class="text-center text-danger">Unable to load records. Please try again.</td></tr>`);
            showToast('Failed to load doctor dashboard stats', 'danger');
        });
    },

    openConsultModal: (appId, status, notes) => {
        $('#consult-app-id').val(appId);
        $('#consult-status').val(status);
        $('#consult-notes').val(notes === 'null' ? '' : notes);
        openModal('consultation-modal');
    },

    initConsultationSubmit: () => {
        $('#consultation-form').on('submit', function(e) {
            e.preventDefault();
            const appId = $('#consult-app-id').val();
            const status = $('#consult-status').val();
            const notes = $('#consult-notes').val();

            // Fetch appointment first to keep other fields intact
            APIHelper.getAppointment(appId).then(app => {
                app.status = status;
                app.notes = notes;
                return APIHelper.updateAppointment(appId, app);
            }).then(() => {
                showToast('Consultation status updated successfully!', 'success');
                closeModal('consultation-modal');
                const email = APIHelper.getUserEmail();
                Dashboard.loadDoctorDashboard(email);
            }).catch(err => {
                showToast(err.error || 'Failed to update consultation status', 'danger');
            });
        });
    },

    // Patient Dashboard loading
    loadPatientDashboard: async (email) => {
        let profileId = localStorage.getItem('profileId');
        let currentPatient = null;

        console.log("Email:", email);
        console.log("Role: PATIENT");

        if (!profileId || profileId === 'null') {
            console.log("Profile ID missing on load. Initializing patient profile...");
            currentPatient = await ProfileManager.initializePatientProfile();
            if (currentPatient) {
                profileId = currentPatient.id;
            }
        }

        if (!profileId || profileId === 'null') {
            console.log("Profile ID still missing after initialization");
            $('#patient-appointments-body').html(`<tr><td colspan="4" class="text-center text-danger">Patient profile matching login not found. Please contact receptionist.</td></tr>`);
            return;
        }

        console.log("Profile ID:", profileId);

        // Fetch patient files in parallel
        return Promise.all([
            APIHelper.getPatientAppointments(profileId).catch(() => []),
            APIHelper.getPatientPrescriptions(profileId).catch(() => []),
            APIHelper.getPatientBills(profileId).catch(() => [])
        ]).then(([appointments, prescriptions, bills]) => {
            // Count metrics
            $('#patient-stat-appointments').text(appointments.length);
            
            const activeRx = prescriptions.filter(p => p.status === 'ACTIVE').length;
            $('#patient-stat-prescriptions').text(activeRx);

            let balance = 0;
            bills.forEach(bill => {
                if (bill.balanceAmount) {
                    balance += parseFloat(bill.balanceAmount);
                }
            });
            $('#patient-stat-balance').text(`$${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);

            // Render appointments list
            let appHtml = '';
            if (appointments.length === 0) {
                appHtml = `<tr><td colspan="4" class="text-center">No appointments booked</td></tr>`;
            } else {
                appointments.reverse().slice(0, 5).forEach(app => {
                    const statusClass = app.status === 'COMPLETED' ? 'badge-success' : (app.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
                    const formattedDate = new Date(app.appointmentDate).toLocaleString();
                    appHtml += `
                        <tr>
                            <td><strong>${app.doctorName || `Doctor #${app.doctorId}`}</strong></td>
                            <td>${app.departmentName || `Department #${app.departmentId}`}</td>
                            <td>${formattedDate}</td>
                            <td><span class="badge ${statusClass}">${app.status}</span></td>
                        </tr>
                    `;
                });
            }
            $('#patient-appointments-body').html(appHtml);

            // Render outstanding bills list
            let billHtml = '';
            const pendingBills = bills.filter(b => b.status === 'PENDING' || b.status === 'PARTIAL');
            if (pendingBills.length === 0) {
                billHtml = `<tr><td colspan="4" class="text-center">No outstanding bills</td></tr>`;
            } else {
                pendingBills.reverse().slice(0, 5).forEach(b => {
                    const statusClass = b.status === 'PAID' ? 'badge-success' : (b.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger');
                    billHtml += `
                        <tr>
                            <td><strong>${b.billNumber}</strong></td>
                            <td>$${parseFloat(b.totalAmount).toFixed(2)}</td>
                            <td>$${parseFloat(b.balanceAmount).toFixed(2)}</td>
                            <td><span class="badge ${statusClass}">${b.status}</span></td>
                        </tr>
                    `;
                });
            }
            $('#patient-bills-body').html(billHtml);
        }).catch(err => {
            console.error(err);
            $('#patient-appointments-body').html(`<tr><td colspan="4" class="text-center text-danger">Unable to load records.</td></tr>`);
            showToast('Failed to load patient records', 'danger');
        });
    },

    // Receptionist Dashboard loading
    loadReceptionistDashboard: () => {
        Promise.all([
            APIHelper.getAppointments().catch(() => []),
            APIHelper.getAllPatients().catch(() => []),
            APIHelper.getBills().catch(() => [])
        ]).then(([appointments, patients, bills]) => {
            // Set statistics
            $('#receptionist-stat-appointments').text(appointments.length);
            $('#receptionist-stat-patients').text(patients.length);

            const pendingBills = bills.filter(b => b.status === 'PENDING' || b.status === 'PARTIAL').length;
            $('#receptionist-stat-bills').text(pendingBills);

            // Render recent checkins
            const recent = appointments.slice(-5).reverse();
            let html = '';
            if (recent.length === 0) {
                html = `<tr><td colspan="4" class="text-center">No appointments scheduled</td></tr>`;
            } else {
                recent.forEach(app => {
                    const statusClass = app.status === 'COMPLETED' ? 'badge-success' : (app.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
                    const formattedDate = new Date(app.appointmentDate).toLocaleString();
                    html += `
                        <tr>
                            <td><strong>${app.patientName || `Patient #${app.patientId}`}</strong></td>
                            <td>${app.doctorName || `Doctor #${app.doctorId}`}</td>
                            <td>${formattedDate}</td>
                            <td><span class="badge ${statusClass}">${app.status}</span></td>
                        </tr>
                    `;
                });
            }
            $('#receptionist-appointments-body').html(html);
        }).catch(err => {
            console.error("Receptionist stats failed to load: ", err);
            showToast('Error loading front desk stats', 'danger');
        });
    }
};

$(document).ready(function() {
    Dashboard.init();
    Dashboard.initConsultationSubmit();
});
