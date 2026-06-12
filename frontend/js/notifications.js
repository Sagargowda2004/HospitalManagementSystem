// Notifications Management Controller Script
const Notifications = {
    list: [],
    patients: [],

    init: () => {
        // Change form inputs based on delivery channel selected
        $('#notify-type').on('change', function() {
            const channel = $(this).val();
            if (channel === 'EMAIL') {
                $('#notify-subject-group').show();
                $('#notify-subject').prop('required', true);
            } else {
                $('#notify-subject-group').hide();
                $('#notify-subject').prop('required', false);
            }
        });

        // Trigger fill of recipient email/phone when patient selected
        $('#notify-user-select').on('change', function() {
            const patId = $(this).val();
            const pat = Notifications.patients.find(p => p.id == patId);
            if (pat) {
                $('#notify-email-override').val(pat.user ? pat.user.email : '');
                $('#notify-phone-override').val(pat.phone || '');
            }
        });

        // Form submit
        $('#notification-compose-form').on('submit', function(e) {
            e.preventDefault();
            Notifications.sendBroadcast();
        });

        // Log filter
        $('#log-status-filter').on('change', () => {
            Notifications.applyFilters();
        });

        // Load lists
        Notifications.loadReferences().then(() => {
            Notifications.loadNotificationsLogs();
        });
    },

    loadReferences: () => {
        return APIHelper.getAllPatients().then(pats => {
            Notifications.patients = pats;
            let html = '<option value="" disabled selected>Select Recipient</option>';
            pats.forEach(p => {
                html += `<option value="${p.id}">${p.user ? p.user.name : 'Unknown'} (ID: ${p.id})</option>`;
            });
            $('#notify-user-select').html(html);
        }).catch(err => {
            console.error("Failed to load patient targets: ", err);
        });
    },

    loadNotificationsLogs: () => {
        $('#notifications-table-body').html(`<tr><td colspan="4" class="text-center"><div class="spinner" style="margin:20px auto;"></div></td></tr>`);
        
        const role = APIHelper.getUserRole();
        const profileId = localStorage.getItem('profileId');
        let loadPromise;

        if (role === 'ADMIN') {
            loadPromise = APIHelper.getNotifications();
        } else if (role === 'DOCTOR') {
            loadPromise = APIHelper.getNotifications(); // Doctors view all notification history
        } else if (role === 'PATIENT') {
            // Patient user details stored on me
            loadPromise = APIHelper.getProfile().then(user => {
                return APIHelper.getUserNotifications(user.id);
            });
        } else {
            loadPromise = APIHelper.getNotifications();
        }

        loadPromise.then(res => {
            Notifications.list = res;
            Notifications.renderTable(res);
        }).catch(err => {
            showToast('Failed to load logs', 'danger');
        });
    },

    renderTable: (items) => {
        let html = '';
        if (items.length === 0) {
            html = `<tr><td colspan="4" class="text-center">No alert communications recorded.</td></tr>`;
        } else {
            items.reverse().forEach(log => {
                const typeClass = log.type === 'EMAIL' ? 'badge-primary' : (log.type === 'SMS' ? 'badge-warning' : 'badge-success');
                const statusClass = log.status === 'SENT' ? 'badge-success' : (log.status === 'FAILED' ? 'badge-danger' : 'badge-warning');
                
                const recInfo = `
                    <strong>${log.userName || `User #${log.userId}`}</strong><br>
                    <small style="color:var(--text-muted);">${log.recipientEmail || log.recipientPhone || 'N/A'}</small>
                `;

                const msgInfo = `
                    <strong>${log.subject || '(No Subject)'}</strong><br>
                    <p style="margin-top:2px;">${log.message}</p>
                    ${log.errorMessage ? `<small style="color:var(--danger-color); font-weight:600;"><i class="fas fa-exclamation-triangle"></i> Error: ${log.errorMessage}</small>` : ''}
                `;

                html += `
                    <tr>
                        <td><span class="badge ${typeClass}">${log.type}</span></td>
                        <td>${recInfo}</td>
                        <td>${msgInfo}</td>
                        <td>
                            <span class="badge ${statusClass}">${log.status}</span>
                            <br><small style="color:var(--text-muted);">${new Date(log.createdAt || Date.now()).toLocaleDateString()}</small>
                        </td>
                    </tr>
                `;
            });
        }
        $('#notifications-table-body').html(html);
    },

    applyFilters: () => {
        const status = $('#log-status-filter').val();
        let filtered = Notifications.list;

        if (status) {
            filtered = Notifications.list.filter(log => log.status === status);
        }

        Notifications.renderTable(filtered);
    },

    sendBroadcast: () => {
        const patientId = $('#notify-user-select').val();
        const pat = Notifications.patients.find(p => p.id == patientId);
        
        // Target userId is linked to the User object inside the PatientProfile
        const targetUserId = pat && pat.user ? pat.user.id : null;
        
        const type = $('#notify-type').val();
        const subject = $('#notify-subject').val() ? $('#notify-subject').val().trim() : '';
        const message = $('#notify-message').val().trim();
        const email = $('#notify-email-override').val();
        const phone = $('#notify-phone-override').val();

        if (!targetUserId || !type || !message) {
            showToast('Please specify all target details', 'danger');
            return;
        }

        const data = {
            userId: parseInt(targetUserId),
            type: type,
            subject: subject,
            message: message,
            recipientEmail: email,
            recipientPhone: phone
        };

        showLoader($('#notification-compose-form'));

        APIHelper.sendNotification(data).then(() => {
            showToast('Notification alert sent successfully!', 'success');
            $('#notify-message').val('');
            Notifications.loadNotificationsLogs();
        }).catch(err => {
            showToast(err.error || 'Failed to send notification', 'danger');
        }).finally(() => {
            hideLoader($('#notification-compose-form'));
        });
    }
};

$(document).ready(function() {
    if ($('#notifications-table-body').length) {
        Notifications.init();
    }
});
