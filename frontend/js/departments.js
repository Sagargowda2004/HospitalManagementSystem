// Departments Controller Script
const Departments = {
    list: [],

    init: () => {
        const role = APIHelper.getUserRole();
        
        // Show role-specific buttons/columns if ADMIN
        if (role === 'ADMIN') {
            $('#admin-add-dept-btn').show();
            $('.dept-action-header').show();
        }

        // Action bindings
        $('#admin-add-dept-btn').on('click', () => {
            Departments.openAddModal();
        });

        $('#department-form').on('submit', function(e) {
            e.preventDefault();
            Departments.saveDepartment();
        });

        Departments.loadDepartments();
    },

    loadDepartments: () => {
        $('#departments-table-body').html(`<tr><td colspan="7" class="text-center"><div class="spinner" style="margin: 20px auto;"></div></td></tr>`);
        APIHelper.getDepartments().then(res => {
            Departments.list = res;
            Departments.renderTable(res);
        }).catch(err => {
            showToast('Failed to load departments', 'danger');
        });
    },

    renderTable: (items) => {
        const role = APIHelper.getUserRole();
        let html = '';
        if (items.length === 0) {
            html = `<tr><td colspan="7" class="text-center">No departments registered.</td></tr>`;
        } else {
            items.forEach(dept => {
                const statusClass = dept.isActive ? 'badge-success' : 'badge-danger';
                const statusText = dept.isActive ? 'Active' : 'Inactive';
                
                let actionsCell = '';
                if (role === 'ADMIN') {
                    actionsCell = `
                        <td>
                            <div style="display:flex; gap:8px;">
                                <button class="btn btn-secondary btn-icon" onclick="Departments.openEditModal(${dept.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger btn-icon" onclick="Departments.deleteDepartment(${dept.id})"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        </td>
                    `;
                }

                html += `
                    <tr>
                        <td><strong>DEPT-${dept.id}</strong></td>
                        <td><strong>${dept.name}</strong></td>
                        <td>${dept.description}</td>
                        <td>${dept.phoneNumber}</td>
                        <td>${dept.headName}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        ${actionsCell}
                    </tr>
                `;
            });
        }
        $('#departments-table-body').html(html);
    },

    openAddModal: () => {
        $('#department-form').trigger('reset');
        $('#dept-edit-id').val('');
        $('#modal-dept-title').text('Create Department');
        openModal('department-modal');
    },

    openEditModal: (id) => {
        $('#department-form').trigger('reset');
        $('#dept-edit-id').val(id);
        $('#modal-dept-title').text(`Edit Department #${id}`);

        const dept = Departments.list.find(d => d.id === id);
        if (dept) {
            $('#dept-name').val(dept.name);
            $('#dept-desc').val(dept.description);
            $('#dept-phone').val(dept.phoneNumber);
            $('#dept-head').val(dept.headName);
            $('#dept-active').val(dept.isActive ? 'true' : 'false');
        }

        openModal('department-modal');
    },

    saveDepartment: () => {
        const id = $('#dept-edit-id').val();
        const name = $('#dept-name').val().trim();
        const description = $('#dept-desc').val().trim();
        const phoneNumber = $('#dept-phone').val().trim();
        const headName = $('#dept-head').val().trim();
        const isActive = $('#dept-active').val() === 'true';

        if (!name || !description || !phoneNumber || !headName) {
            showToast('All fields are required', 'danger');
            return;
        }

        const data = {
            name: name,
            description: description,
            phoneNumber: phoneNumber,
            headName: headName,
            isActive: isActive
        };

        showLoader($('#department-form'));

        let savePromise;
        if (id) {
            data.id = parseInt(id);
            savePromise = APIHelper.updateDepartment(id, data);
        } else {
            savePromise = APIHelper.createDepartment(data);
        }

        savePromise.then(() => {
            showToast('Department saved successfully!', 'success');
            closeModal('department-modal');
            Departments.loadDepartments();
        }).catch(err => {
            showToast(err.error || 'Failed to save department', 'danger');
        }).finally(() => {
            hideLoader($('#department-form'));
        });
    },

    deleteDepartment: (id) => {
        buildConfirmModal('Delete Department', 'Are you sure you want to delete this department? Note: This may affect profiles linked to this department.', () => {
            APIHelper.deleteDepartment(id).then(() => {
                showToast('Department deleted successfully', 'success');
                Departments.loadDepartments();
            }).catch(err => {
                showToast(err.error || 'Failed to delete department', 'danger');
            });
        });
    }
};

$(document).ready(function() {
    if ($('#departments-table-body').length) {
        Departments.init();
    }
});
