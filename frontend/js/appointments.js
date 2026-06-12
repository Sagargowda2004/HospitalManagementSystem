function requireAuth() {
    return AuthGuard.check();
}

// Appointments Controller Script
const Appointments = {
    list: [],
    doctors: [],
    departments: [],
    patients: [],

    init: () => {
         if (!requireAuth()) {
                return;
            }
        const role = APIHelper.getUserRole();
        const profileId = localStorage.getItem('profileId');

        // Hide patient selector modal block if current user is a PATIENT
        if (role === 'PATIENT') {
            $('#app-patient-group').hide();
            $('#app-patient-select').prop('required', false);
        } else {
            $('#app-patient-group').show();
            $('#app-patient-select').prop('required', true);
        }

        // Action bindings
        $('#btn-open-book-modal').on('click', () => {
            Appointments.openBookModal();
        });

        $('#appointment-form').on('submit', function(e) {
            e.preventDefault();
            Appointments.saveAppointment();
        });

        // Filter triggers
        $('#filter-search-name, #filter-status-select').on('input change', () => {
            Appointments.applyFilters();
        });

        $('#btn-clear-filters').on('click', () => {
            $('#filter-search-name').val('');
            $('#filter-status-select').val('');
            Appointments.applyFilters();
        });

        // Load reference lists and tables
        Appointments.loadReferences().then(() => {
            Appointments.loadAppointmentsTable();
        });
    },

 loadReferences: () => {
     const role = APIHelper.getUserRole();

     const promises = [
         APIHelper.getActiveDepartments().then(depts => {
             Appointments.departments = depts;
         }).catch(() => {
             Appointments.departments = [];
         })
     ];

     // Only ADMIN and RECEPTIONIST need all doctors/patients
     if (role === 'ADMIN' || role === 'RECEPTIONIST') {

         promises.push(
             APIHelper.getAllDoctors().then(docs => {
                 Appointments.doctors = docs;
             }).catch(() => {
                 Appointments.doctors = [];
             })
         );

         promises.push(
             APIHelper.getAllPatients().then(pats => {
                 Appointments.patients = pats;
             }).catch(() => {
                 Appointments.patients = [];
             })
         );
     } else {
         // DOCTOR / PATIENT
         Appointments.doctors = [];
         Appointments.patients = [];
     }

     return Promise.all(promises).then(() => {

         // Department dropdown
         let deptHtml =
             '<option value="" disabled selected>Select Department</option>';

         Appointments.departments.forEach(d => {
             deptHtml += `
                 <option value="${d.id}">
                     ${d.name}
                 </option>
             `;
         });

         $('#app-dept-select').html(deptHtml);

         // Doctor dropdown (only ADMIN / RECEPTIONIST)
         if (role === 'ADMIN' || role === 'RECEPTIONIST') {

             let docHtml =
                 '<option value="" disabled selected>Select Practitioner</option>';

             Appointments.doctors.forEach(d => {
                 const name = d.user
                     ? d.user.name
                     : 'Unknown Doctor';

                 docHtml += `
                     <option value="${d.id}">
                         Dr. ${name} (${d.specialization || 'General'})
                     </option>
                 `;
             });

             $('#app-doc-select').html(docHtml);

             let patHtml =
                 '<option value="" disabled selected>Select Patient</option>';

             Appointments.patients.forEach(p => {
                 const name = p.user
                     ? p.user.name
                     : 'Unknown Patient';

                 patHtml += `
                     <option value="${p.id}">
                         ${name} (ID: ${p.id})
                     </option>
                 `;
             });

             $('#app-patient-select').html(patHtml);
         }

     }).catch(err => {
         console.error('Failed to load appointment references:', err);
     });
 },

    loadAppointmentsTable: async () => {
        $('#appointments-table-body').html(`<tr><td colspan="7" class="text-center"><div class="spinner" style="margin: 20px auto;"></div></td></tr>`);
        
        const role = APIHelper.getUserRole();
        let profileId = localStorage.getItem('profileId');
        
        console.log("Email:", APIHelper.getUserEmail());
        console.log("Role:", role);

        if (role === 'DOCTOR' && (!profileId || profileId === 'null' || profileId === 'undefined')) {
            console.log("Profile ID missing for Doctor in appointments list. Initializing...");
            const doc = await ProfileManager.initializeDoctorProfile();
            if (doc) {
                profileId = doc.id;
            }
        } else if (role === 'PATIENT' && (!profileId || profileId === 'null' || profileId === 'undefined')) {
            console.log("Profile ID missing for Patient in appointments list. Initializing...");
            const patient = await ProfileManager.initializePatientProfile();
            if (patient) {
                profileId = patient.id;
            }
        }

        console.log("Profile ID:", profileId);

        let loadPromise;

        if (role === 'ADMIN') {
            loadPromise = APIHelper.getAppointments();
        } else if (role === 'DOCTOR') {
            if (!profileId || profileId === 'null' || profileId === 'undefined') {
                showToast("Doctor profile not found", "danger");
                $('#appointments-table-body').html(`<tr><td colspan="7" class="text-center text-danger">Doctor profile not found. Please contact administrator.</td></tr>`);
                return;
            }
            loadPromise = APIHelper.getDoctorAppointments(profileId);
        } else if (role === 'PATIENT') {
            if (!profileId || profileId === 'null' || profileId === 'undefined') {
                showToast("Patient profile not found", "danger");
                $('#appointments-table-body').html(`<tr><td colspan="7" class="text-center text-danger">Patient profile not found. Please contact receptionist.</td></tr>`);
                return;
            }
            loadPromise = APIHelper.getPatientAppointments(profileId);
        } else if (role === 'RECEPTIONIST') {
            loadPromise = APIHelper.getAppointments(); // Receptionists view all appointments
        }

        loadPromise.then(res => {
            Appointments.list = res;
            Appointments.renderTable(res);
        }).catch(err => {
            showToast('Failed to load appointments', 'danger');
            $('#appointments-table-body').html(`<tr><td colspan="7" class="text-center text-danger">Failed to load appointments. Please contact administrator.</td></tr>`);
        });
    },

    renderTable: (items) => {
        const role = APIHelper.getUserRole();
        let html = '';
        if (items.length === 0) {
            html = `<tr><td colspan="7" class="text-center">No appointments found.</td></tr>`;
        } else {
            items.reverse().forEach(app => {
                const statusClass = app.status === 'COMPLETED' ? 'badge-success' : (app.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
                const formattedDate = new Date(app.appointmentDate).toLocaleString();
                
                // Construct contextual actions based on role
                let actions = '';
                if (role === 'ADMIN' || role === 'RECEPTIONIST' || role === 'DOCTOR') {
                    actions += `
                        <button class="btn btn-secondary btn-icon" onclick="Appointments.openEditModal(${app.id})" title="Edit appointment"><i class="fas fa-edit"></i></button>
                    `;
                }
                
                // Allow doctors or admin to delete slot
                if (role === 'ADMIN' || role === 'DOCTOR') {
                    actions += `
                        <button class="btn btn-danger btn-icon" onclick="Appointments.deleteAppointment(${app.id})" title="Delete Slot"><i class="fas fa-trash-alt"></i></button>
                    `;
                }

                html += `
                    <tr data-id="${app.id}">
                        <td><strong>APP-${app.id}</strong></td>
                        <td>
                            <strong>${app.patientName || `Patient #${app.patientId}`}</strong>
                            <br><small style="color: var(--text-muted)">ID: ${app.patientId}</small>
                        </td>
                        <td>
                            <strong>Dr. ${app.doctorName || `Doctor #${app.doctorId}`}</strong>
                            <br><small style="color: var(--text-muted)">${app.departmentName || `Dept #${app.departmentId}`}</small>
                        </td>
                        <td>${formattedDate}</td>
                        <td>${app.reason}</td>
                        <td><span class="badge ${statusClass}">${app.status}</span></td>
                        <td><div style="display:flex; gap:8px;">${actions}</div></td>
                    </tr>
                `;
            });
        }
        $('#appointments-table-body').html(html);
    },

    applyFilters: () => {
        const query = $('#filter-search-name').val().toLowerCase().trim();
        const status = $('#filter-status-select').val();

        let filtered = Appointments.list.filter(app => {
            const patientName = (app.patientName || '').toLowerCase();
            const doctorName = (app.doctorName || '').toLowerCase();
            const deptName = (app.departmentName || '').toLowerCase();
            const reason = (app.reason || '').toLowerCase();

            const matchesQuery = !query || 
                patientName.includes(query) || 
                doctorName.includes(query) || 
                deptName.includes(query) || 
                reason.includes(query);

            const matchesStatus = !status || app.status === status;

            return matchesQuery && matchesStatus;
        });

        Appointments.renderTable(filtered);
    },

    openBookModal: () => {
        $('#appointment-form').trigger('reset');
        $('#app-edit-id').val('');
        $('#modal-appointment-title').text('Book Appointment');
        openModal('appointment-modal');
    },

    openEditModal: (id) => {
        $('#appointment-form').trigger('reset');
        $('#app-edit-id').val(id);
        $('#modal-appointment-title').text(`Edit Appointment Slot #${id}`);

        const app = Appointments.list.find(a => a.id === id);
        if (app) {
            $('#app-patient-select').val(app.patientId);
            $('#app-dept-select').val(app.departmentId);
            $('#app-doc-select').val(app.doctorId);
            
            // Format datetime for local datetime input
            if (app.appointmentDate) {
                const date = new Date(app.appointmentDate);
                const localISODate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString().slice(0, 16);
                $('#app-date').val(localISODate);
            }

            $('#app-reason').val(app.reason);
            $('#app-notes').val(app.notes);
        }

        openModal('appointment-modal');
    },

    saveAppointment: () => {
        const id = $('#app-edit-id').val();
        const role = APIHelper.getUserRole();
        
        let patientId;
        if (role === 'PATIENT') {
            patientId = localStorage.getItem('profileId');
        } else {
            patientId = $('#app-patient-select').val();
        }

        const deptId = $('#app-dept-select').val();
        const docId = $('#app-doc-select').val();
        const dateTimeVal = $('#app-date').val(); // HTML local datetime outputs YYYY-MM-DDTHH:MM
        
        // Ensure date time includes seconds to match backend expects
        const appointmentDate = dateTimeVal ? `${dateTimeVal}:00` : null;

        const reason = $('#app-reason').val().trim();
        const notes = $('#app-notes').val().trim();

        if (!patientId || patientId === 'null' || patientId === 'undefined' || !deptId || !docId || !appointmentDate || !reason) {
            showToast('Please fill out all required fields', 'danger');
            return;
        }

        const data = {
            patientId: parseInt(patientId),
            departmentId: parseInt(deptId),
            doctorId: parseInt(docId),
            appointmentDate: appointmentDate,
            reason: reason,
            notes: notes
        };

        showLoader($('#appointment-form'));

        let savePromise;
        if (id) {
            // Updates slot
            data.id = parseInt(id);
            // Re-fetch appointment first to preserve status if not doctor/admin edit
            savePromise = APIHelper.getAppointment(id).then(orig => {
                data.status = orig.status; // preserves status
                return APIHelper.updateAppointment(id, data);
            });
        } else {
            // Adds slot
            savePromise = APIHelper.createAppointment(data);
        }

        savePromise.then(() => {
            showToast('Appointment slot saved successfully!', 'success');
            closeModal('appointment-modal');
            Appointments.loadAppointmentsTable();
        }).catch(err => {
            showToast(err.error || 'Failed to save appointment', 'danger');
        }).finally(() => {
            hideLoader($('#appointment-form'));
        });
    },

    deleteAppointment: (id) => {
        buildConfirmModal('Cancel/Delete Appointment', 'Are you sure you want to permanently delete this scheduled appointment slot?', () => {
            APIHelper.deleteAppointment(id).then(() => {
                showToast('Appointment deleted successfully', 'success');
                Appointments.loadAppointmentsTable();
            }).catch(err => {
                showToast(err.error || 'Failed to delete appointment', 'danger');
            });
        });
    }
};

$(document).ready(function() {
    if (!AuthGuard.check()) {
        return;
    }

    if ($('#appointments-table-body').length) {
        Appointments.init();
    }
});
