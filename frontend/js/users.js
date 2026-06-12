// Users & Profiles Management Script
const UsersManager = {
    currentTab: 'DOCTOR', // DOCTOR, PATIENT, RECEPTIONIST
    doctorsList: [],
    patientsList: [],
    receptionistsList: [],

    init: () => {
        const role = APIHelper.getUserRole();
        
        // Tab switching events
        $('.tab-btn').on('click', function() {
            $('.tab-btn').removeClass('active');
            $(this).addClass('active');
            
            const targetPane = $(this).attr('data-tab');
            $('.tab-pane').removeClass('active');
            $(`#${targetPane}`).addClass('active');

            if (targetPane === 'doctors-pane') {
                UsersManager.currentTab = 'DOCTOR';
                UsersManager.loadDoctors();
            } else if (targetPane === 'patients-pane') {
                UsersManager.currentTab = 'PATIENT';
                UsersManager.loadPatients();
            } else if (targetPane === 'receptionists-pane') {
                UsersManager.currentTab = 'RECEPTIONIST';
                UsersManager.loadReceptionists();
            }
        });

        // Add profile click trigger
        $('#btn-add-profile').on('click', () => {
            UsersManager.openAddModal();
        });

        // Form submit
        $('#profile-edit-form').on('submit', function(e) {
            e.preventDefault();
            UsersManager.saveProfile();
        });

        // Dropdown dynamic form inputs selector
        $('#profile-role-select').on('change', function() {
            UsersManager.toggleFormFields($(this).val());
        });

        // Set default visible view based on role
        if (role === 'RECEPTIONIST') {
            // Receptionists only manage patients
            $('#tab-btn-doctors').hide();
            $('#tab-btn-receptionists').hide();
            $('#tab-btn-patients').click();
            $('#profile-role-select').val('PATIENT').prop('disabled', true);
            UsersManager.toggleFormFields('PATIENT');
        } else {
            // Admin default
            $('#tab-btn-doctors').click();
        }
    },

    toggleFormFields: (role) => {
        $('#doctor-fields').hide();
        $('#patient-fields').hide();
        $('#receptionist-fields').hide();

        if (role === 'DOCTOR') {
            $('#doctor-fields').show();
        } else if (role === 'PATIENT') {
            $('#patient-fields').show();
            // Load doctors dropdown for assignment
            UsersManager.populateDoctorsDropdown();
        } else if (role === 'RECEPTIONIST') {
            $('#receptionist-fields').show();
        }
    },

    populateDoctorsDropdown: () => {
        APIHelper.getAllDoctors().then(docs => {
            let options = '<option value="">No Doctor Assigned</option>';
            docs.forEach(doc => {
                options += `<option value="${doc.id}">Dr. ${doc.user.name} (${doc.specialization})</option>`;
            });
            $('#pat-doc').html(options);
        }).catch(err => console.error("Doctors dropdown failed: ", err));
    },

    // Doctors APIs
    loadDoctors: () => {
        $('#doctors-table-body').html(`<tr><td colspan="7" class="text-center"><div class="spinner" style="margin: 20px auto;"></div></td></tr>`);
        APIHelper.getAllDoctors().then(docs => {
            UsersManager.doctorsList = docs;
            let html = '';
            if (docs.length === 0) {
                html = `<tr><td colspan="7" class="text-center">No doctor profiles found.</td></tr>`;
            } else {
                docs.forEach(doc => {
                    const u = doc.user || { name: 'Unknown', email: 'N/A' };
                    html += `
                        <tr>
                            <td><strong>DOC-${doc.id}</strong></td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td><span class="badge badge-primary">${doc.specialization}</span></td>
                            <td>${doc.experience} Years</td>
                            <td>${doc.availability}</td>
                            <td>
                                <button class="btn btn-secondary btn-icon" onclick="UsersManager.openEditModal('DOCTOR', ${doc.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger btn-icon" onclick="UsersManager.deleteProfile('DOCTOR', ${doc.id})"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }
            $('#doctors-table-body').html(html);
        }).catch(err => {
            showToast('Failed to load doctors list', 'danger');
        });
    },

    // Patients APIs
    loadPatients: () => {
        $('#patients-table-body').html(`<tr><td colspan="7" class="text-center"><div class="spinner" style="margin: 20px auto;"></div></td></tr>`);
        APIHelper.getAllPatients().then(pats => {
            UsersManager.patientsList = pats;
            let html = '';
            if (pats.length === 0) {
                html = `<tr><td colspan="7" class="text-center">No patients found.</td></tr>`;
            } else {
                pats.forEach(pat => {
                    const u = pat.user || { name: 'Unknown', email: 'N/A' };
                    const docName = pat.assignedDoctor && pat.assignedDoctor.user ? `Dr. ${pat.assignedDoctor.user.name}` : 'None';
                    html += `
                        <tr>
                            <td><strong>PAT-${pat.id}</strong></td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>${pat.age} / ${pat.gender}</td>
                            <td>${pat.phone}<br><small style="color:var(--text-muted);">${pat.address}</small></td>
                            <td><span class="badge badge-success">${docName}</span></td>
                            <td>
                                <button class="btn btn-secondary btn-icon" onclick="UsersManager.openEditModal('PATIENT', ${pat.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger btn-icon" onclick="UsersManager.deleteProfile('PATIENT', ${pat.id})"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }
            $('#patients-table-body').html(html);
        }).catch(err => {
            showToast('Failed to load patients list', 'danger');
        });
    },

    // Receptionists APIs
    loadReceptionists: () => {
        $('#receptionists-table-body').html(`<tr><td colspan="5" class="text-center"><div class="spinner" style="margin: 20px auto;"></div></td></tr>`);
        APIHelper.getAllReceptionists().then(reps => {
            UsersManager.receptionistsList = reps;
            let html = '';
            if (reps.length === 0) {
                html = `<tr><td colspan="5" class="text-center">No receptionist profiles found.</td></tr>`;
            } else {
                reps.forEach(rep => {
                    const u = rep.user || { name: 'Unknown', email: 'N/A' };
                    html += `
                        <tr>
                            <td><strong>REP-${rep.id}</strong></td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td><span class="badge badge-warning">${rep.shift}</span></td>
                            <td>
                                <button class="btn btn-secondary btn-icon" onclick="UsersManager.openEditModal('RECEPTIONIST', ${rep.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger btn-icon" onclick="UsersManager.deleteProfile('RECEPTIONIST', ${rep.id})"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }
            $('#receptionists-table-body').html(html);
        }).catch(err => {
            showToast('Failed to load receptionists list', 'danger');
        });
    },

    openAddModal: () => {
        $('#profile-edit-form').trigger('reset');
        $('#edit-profile-id').val('');
        $('#modal-profile-title').text('Register & Create Profile');
        
        // Show user login registration inputs (needed for new signups)
        $('#user-info-section').show();
        $('#user-password-section').show();
        $('#profile-role-select-group').show();
        
        // Requirements flags
        $('#profile-user-name').prop('required', true);
        $('#profile-user-email').prop('required', true);
        $('#profile-user-password').prop('required', true);
        
        const currentRole = $('#profile-role-select').val();
        UsersManager.toggleFormFields(currentRole);
        
        openModal('profile-edit-modal');
    },

    openEditModal: (role, id) => {
        $('#profile-edit-form').trigger('reset');
        $('#edit-profile-id').val(id);
        $('#modal-profile-title').text(`Edit ${role.toLowerCase()} profile #${id}`);

        // Hide user signup credentials inputs (cannot change login details from here)
        $('#user-info-section').hide();
        $('#user-password-section').hide();
        $('#profile-role-select-group').hide();

        // Turn off requirements flags
        $('#profile-user-name').prop('required', false);
        $('#profile-user-email').prop('required', false);
        $('#profile-user-password').prop('required', false);

        UsersManager.toggleFormFields(role);

        if (role === 'DOCTOR') {
            const doc = UsersManager.doctorsList.find(d => d.id === id);
            if (doc) {
                $('#doc-spec').val(doc.specialization);
                $('#doc-exp').val(doc.experience);
                $('#doc-avail').val(doc.availability);
            }
        } else if (role === 'PATIENT') {
            const pat = UsersManager.patientsList.find(p => p.id === id);
            if (pat) {
                $('#pat-age').val(pat.age);
                $('#pat-gender').val(pat.gender);
                $('#pat-phone').val(pat.phone);
                $('#pat-address').val(pat.address);
                setTimeout(() => {
                    $('#pat-doc').val(pat.assignedDoctor ? pat.assignedDoctor.id : '');
                }, 200);
            }
        } else if (role === 'RECEPTIONIST') {
            const rep = UsersManager.receptionistsList.find(r => r.id === id);
            if (rep) {
                $('#rep-shift').val(rep.shift);
            }
        }

        openModal('profile-edit-modal');
    },

    saveProfile: () => {
        const id = $('#edit-profile-id').val();
        const role = $('#profile-role-select').val();

        showLoader($('#profile-edit-form'));

        if (id) {
            // Edit existing profile logic
            let updatePromise;
            if (role === 'DOCTOR') {
                const doc = UsersManager.doctorsList.find(d => d.id == id);
                doc.specialization = $('#doc-spec').val();
                doc.experience = $('#doc-exp').val();
                doc.availability = $('#doc-avail').val();
                updatePromise = APIHelper.createDoctorProfile(doc); // Uses post since backend add updates if ID matches
            } else if (role === 'PATIENT') {
                const pat = UsersManager.patientsList.find(p => p.id == id);
                pat.age = $('#pat-age').val();
                pat.gender = $('#pat-gender').val();
                pat.phone = $('#pat-phone').val();
                pat.address = $('#pat-address').val();
                const docId = $('#pat-doc').val();
                pat.assignedDoctor = docId ? { id: docId } : null;
                updatePromise = APIHelper.createPatientProfile(pat);
            } else if (role === 'RECEPTIONIST') {
                const rep = UsersManager.receptionistsList.find(r => r.id == id);
                rep.shift = $('#rep-shift').val();
                updatePromise = APIHelper.createReceptionistProfile(rep);
            }

            updatePromise.then(() => {
                showToast('Profile updated successfully!', 'success');
                closeModal('profile-edit-modal');
                UsersManager.reloadCurrentTab();
            }).catch(err => {
                showToast(err.error || 'Failed to update profile', 'danger');
            }).finally(() => {
                hideLoader($('#profile-edit-form'));
            });

        } else {
            // Create user login first
            const name = $('#profile-user-name').val();
            const email = $('#profile-user-email').val();
            const password = $('#profile-user-password').val();
            const confirm = $('#profile-user-confirm').val();

            if (password !== confirm) {
                showToast('Passwords do not match', 'danger');
                hideLoader($('#profile-edit-form'));
                return;
            }

            APIHelper.signup(name, email, password, role)
                .then(() => {
                    // Signed up successfully! Since user list has no lookup, we must ask the newly created user to log in to auto-initialize, 
                    // or as Admin we can search by fetching the profiles to see if the user object is linked.
                    // Actually, if we login as this user we can get it, but let's notify.
                    showToast('User account created. Please note: Profile will initialize on first user sign-in.', 'warning');
                    closeModal('profile-edit-modal');
                    UsersManager.reloadCurrentTab();
                })
                .catch(err => {
                    showToast(err.error || 'Signup failed', 'danger');
                })
                .finally(() => {
                    hideLoader($('#profile-edit-form'));
                });
        }
    },

    deleteProfile: (role, id) => {
        buildConfirmModal('Delete Profile Card', `Are you sure you want to delete this ${role.toLowerCase()} profile registry?`, () => {
            let deletePromise;
            if (role === 'DOCTOR') deletePromise = APIHelper.deleteDoctorProfile(id);
            else if (role === 'PATIENT') deletePromise = APIHelper.deletePatientProfile(id);
            else if (role === 'RECEPTIONIST') deletePromise = APIHelper.deleteReceptionistProfile(id);

            deletePromise.then(() => {
                showToast('Profile deleted successfully', 'success');
                UsersManager.reloadCurrentTab();
            }).catch(err => {
                showToast(err.error || 'Delete request failed', 'danger');
            });
        });
    },

    reloadCurrentTab: () => {
        if (UsersManager.currentTab === 'DOCTOR') UsersManager.loadDoctors();
        else if (UsersManager.currentTab === 'PATIENT') UsersManager.loadPatients();
        else if (UsersManager.currentTab === 'RECEPTIONIST') UsersManager.loadReceptionists();
    }
};

// Auto profile initializer on login
function autoInitializeProfile(user) {
    if (localStorage.getItem('profileInitialized') === 'true') return;

    const role = user.role;
    if (role === 'ADMIN') return;

    if (role === 'DOCTOR') {
        APIHelper.getAllDoctors().then(docs => {
            const hasProfile = docs.some(d => d.user && d.user.id === user.id);
            if (!hasProfile) {
                APIHelper.createDoctorProfile({
                    user: { id: user.id },
                    specialization: 'General Practitioner',
                    experience: 1,
                    availability: '9 AM - 5 PM'
                }).then(() => {
                    localStorage.setItem('profileInitialized', 'true');
                    console.log("Doctor Profile Initialized");
                });
            } else {
                localStorage.setItem('profileInitialized', 'true');
            }
        });
    } else if (role === 'PATIENT') {
        APIHelper.getAllPatients().then(pats => {
            const hasProfile = pats.some(p => p.user && p.user.id === user.id);
            if (!hasProfile) {
                APIHelper.createPatientProfile({
                    user: { id: user.id },
                    age: 25,
                    gender: 'Male',
                    phone: '+1-000-000-0000',
                    address: 'Enter Home Address'
                }).then(() => {
                    localStorage.setItem('profileInitialized', 'true');
                    console.log("Patient Profile Initialized");
                });
            } else {
                localStorage.setItem('profileInitialized', 'true');
            }
        });
    } else if (role === 'RECEPTIONIST') {
        APIHelper.getAllReceptionists().then(reps => {
            const hasProfile = reps.some(r => r.user && r.user.id === user.id);
            if (!hasProfile) {
                APIHelper.createReceptionistProfile({
                    user: { id: user.id },
                    shift: 'morning'
                }).then(() => {
                    localStorage.setItem('profileInitialized', 'true');
                    console.log("Receptionist Profile Initialized");
                });
            } else {
                localStorage.setItem('profileInitialized', 'true');
            }
        });
    }
}

$(document).ready(function() {
    if ($('#doctors-table-body').length) {
        UsersManager.init();
    }
    
    // Perform self initialization check if logged in
    const token = APIHelper.getAccessToken();
    if (token) {
        APIHelper.getProfile().then(user => {
            autoInitializeProfile(user);
        }).catch(err => console.error("Self check failed: ", err));
    }
});
