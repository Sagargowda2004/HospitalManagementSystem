function requireAuth() {
    return AuthGuard.check();
}
// Bills & Payments Controller
const Bills = {
    list: [],
    patients: [],

    init: () => {
        const role = APIHelper.getUserRole();

        // Show/hide admin options
        if (role === 'ADMIN' || role === 'RECEPTIONIST') {
            $('#admin-create-bill-btn').show();
            APIHelper.getAllPatients().then(pats => {
                Bills.patients = pats;
                let html = '<option value="" disabled selected>Select Patient</option>';
                pats.forEach(p => {
                    html += `<option value="${p.id}">${p.user ? p.user.name : 'Unknown'} (ID: ${p.id})</option>`;
                });
                $('#bill-patient-select').html(html);
            });
        }

        // Action bindings
        $('#admin-create-bill-btn').on('click', () => {
            Bills.openCreateModal();
        });

        $('#bill-form').on('submit', function(e) {
            e.preventDefault();
            Bills.saveBill();
        });

        $('#record-payment-form').on('submit', function(e) {
            e.preventDefault();
            Bills.submitPayment();
        });

        // Filter bindings
        $('#filter-bill-search, #filter-bill-status').on('input change', () => {
            Bills.applyFilters();
        });

        $('#btn-clear-bill-filters').on('click', () => {
            $('#filter-bill-search').val('');
            $('#filter-bill-status').val('');
            Bills.applyFilters();
        });

        Bills.loadBills();
    },

    loadBills: () => {
        $('#bills-table-body').html(`<tr><td colspan="8" class="text-center"><div class="spinner" style="margin:20px auto;"></div></td></tr>`);

        const role = APIHelper.getUserRole();
        const profileId = localStorage.getItem('profileId');
        let loadPromise;

        if (role === 'ADMIN' || role === 'RECEPTIONIST') {
            loadPromise = APIHelper.getBills();
        } else if (role === 'PATIENT') {
            loadPromise = APIHelper.getPatientBills(profileId);
        } else {
            loadPromise = APIHelper.getBills();
        }

        loadPromise.then(res => {
            Bills.list = res;
            Bills.renderTable(res);
        }).catch(err => {
            showToast('Failed to load billing invoices', 'danger');
            $('#bills-table-body').html(`<tr><td colspan="8" class="text-center text-danger">Failed to load billing invoices. Please contact administrator.</td></tr>`);
        });
    },

    renderTable: (items) => {
        const role = APIHelper.getUserRole();
        let html = '';
        if (items.length === 0) {
            html = `<tr><td colspan="8" class="text-center">No invoice records found.</td></tr>`;
        } else {
            items.reverse().forEach(bill => {
                const statusClass = bill.status === 'PAID' ? 'badge-success' : (bill.status === 'PARTIAL' ? 'badge-warning' : (bill.status === 'CANCELLED' ? 'badge-danger' : 'badge-danger'));
                
                // Formatted item values
                const breakdown = `
                    <small style="color:var(--text-muted); line-height:1.4;">
                        Consult: $${parseFloat(bill.consultationCharges).toFixed(2)}<br>
                        Meds: $${parseFloat(bill.medicineCharges).toFixed(2)}<br>
                        Lab: $${parseFloat(bill.testCharges).toFixed(2)}<br>
                        Ward: $${parseFloat(bill.otherCharges).toFixed(2)}
                    </small>
                `;

                // Actions cell
                let actionsHtml = `
                    <button class="btn btn-primary" onclick="Bills.openPaymentModal(${bill.id})" style="padding: 6px 12px; font-size: 0.8rem;">
                        <i class="fas fa-receipt"></i> Details / Pay
                    </button>
                `;

                if (role === 'ADMIN') {
                    actionsHtml += `
                        <button class="btn btn-secondary btn-icon" onclick="Bills.openEditModal(${bill.id})" title="Edit Bill"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-icon" onclick="Bills.deleteBill(${bill.id})" title="Delete Invoice"><i class="fas fa-trash-alt"></i></button>
                    `;
                }

                html += `
                    <tr>
                        <td><strong>${bill.billNumber || `BILL-${bill.id}`}</strong></td>
                        <td><strong>${bill.patientName || `Patient #${bill.patientId}`}</strong><br><small style="color:var(--text-muted);">ID: ${bill.patientId}</small></td>
                        <td>${breakdown}</td>
                        <td><strong>$${parseFloat(bill.totalAmount).toFixed(2)}</strong></td>
                        <td style="color:var(--success-color); font-weight:600;">$${parseFloat(bill.paidAmount || 0).toFixed(2)}</td>
                        <td style="color:var(--danger-color); font-weight:600;">$${parseFloat(bill.balanceAmount).toFixed(2)}</td>
                        <td><span class="badge ${statusClass}">${bill.status}</span></td>
                        <td><div style="display:flex; gap:8px;">${actionsHtml}</div></td>
                    </tr>
                `;
            });
        }
        $('#bills-table-body').html(html);
    },

    applyFilters: () => {
        const query = $('#filter-bill-search').val().toLowerCase().trim();
        const status = $('#filter-bill-status').val();

        let filtered = Bills.list.filter(bill => {
            const billNumber = (bill.billNumber || '').toLowerCase();
            const patientName = (bill.patientName || '').toLowerCase();
            const matchesQuery = !query || billNumber.includes(query) || patientName.includes(query);
            const matchesStatus = !status || bill.status === status;
            return matchesQuery && matchesStatus;
        });

        Bills.renderTable(filtered);
    },

    openCreateModal: () => {
        $('#bill-form').trigger('reset');
        $('#bill-edit-id').val('');
        $('#modal-bill-title').text('Create Invoice');
        openModal('bill-modal');
    },

    openEditModal: (id) => {
        $('#bill-form').trigger('reset');
        $('#bill-edit-id').val(id);
        $('#modal-bill-title').text(`Edit Invoice #${id}`);

        const bill = Bills.list.find(b => b.id === id);
        if (bill) {
            $('#bill-patient-select').val(bill.patientId);
            $('#bill-consult-charges').val(bill.consultationCharges);
            $('#bill-med-charges').val(bill.medicineCharges);
            $('#bill-test-charges').val(bill.testCharges);
            $('#bill-other-charges').val(bill.otherCharges);
            $('#bill-notes').val(bill.notes);
        }

        openModal('bill-modal');
    },

    saveBill: () => {
        const id = $('#bill-edit-id').val();
        const patientId = $('#bill-patient-select').val();
        const consult = $('#bill-consult-charges').val();
        const meds = $('#bill-med-charges').val();
        const test = $('#bill-test-charges').val();
        const other = $('#bill-other-charges').val();
        const notes = $('#bill-notes').val().trim();

        if (!patientId || consult === '' || meds === '' || test === '' || other === '') {
            showToast('Please fill out all required fields', 'danger');
            return;
        }

        const data = {
            patientId: parseInt(patientId),
            consultationCharges: parseFloat(consult),
            medicineCharges: parseFloat(meds),
            testCharges: parseFloat(test),
            otherCharges: parseFloat(other),
            notes: notes
        };

        showLoader($('#bill-form'));

        let savePromise;
        if (id) {
            data.id = parseInt(id);
            // Fetch first to preserve total and paid amount
            savePromise = APIHelper.getBill(id).then(orig => {
                data.billNumber = orig.billNumber;
                data.paidAmount = orig.paidAmount;
                data.status = orig.status;
                return APIHelper.updateBill(id, data);
            });
        } else {
            savePromise = APIHelper.createBill(data);
        }

        savePromise.then(() => {
            showToast('Invoice generated successfully!', 'success');
            closeModal('bill-modal');
            Bills.loadBills();
        }).catch(err => {
            showToast(err.error || 'Failed to generate invoice', 'danger');
        }).finally(() => {
            hideLoader($('#bill-form'));
        });
    },

    deleteBill: (id) => {
        buildConfirmModal('Delete Invoicing Record', 'Are you sure you want to permanently delete this billing invoice? Any payments linked to this bill will fail.', () => {
            APIHelper.deleteBill(id).then(() => {
                showToast('Invoice deleted successfully', 'success');
                Bills.loadBills();
            }).catch(err => {
                showToast(err.error || 'Failed to delete bill', 'danger');
            });
        });
    },

    // Detailed Invoice Payment view
    openPaymentModal: (id) => {
        $('#pay-bill-id').val(id);
        $('#record-payment-form').trigger('reset');

        $('#payment-invoice-summary-box').html(`<div class="spinner" style="margin:0 auto;"></div>`);
        $('#payment-history-body').html(`<tr><td colspan="4" class="text-center"><div class="spinner" style="margin:0 auto;"></div></td></tr>`);
        $('#payment-input-form-section').hide();

        openModal('payment-modal');

        // Fetch Bill & payments info
        Promise.all([
            APIHelper.getBill(id),
            APIHelper.getBillPayments(id).catch(() => [])
        ]).then(([bill, payments]) => {
            // Summary card details
            const summaryHtml = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-size:1.1rem; font-weight:700; color:var(--text-color);">${bill.billNumber || `BILL-${bill.id}`}</span>
                    <span class="badge ${bill.status === 'PAID' ? 'badge-success' : (bill.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger')}">${bill.status}</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.9rem;">
                    <div><strong>Patient:</strong> ${bill.patientName || `Patient #${bill.patientId}`}</div>
                    <div><strong>Invoice Date:</strong> ${new Date(bill.billDate || Date.now()).toLocaleDateString()}</div>
                    <div><strong>Total Invoice Cost:</strong> $${parseFloat(bill.totalAmount).toFixed(2)}</div>
                    <div><strong>Amount Cleared:</strong> $${parseFloat(bill.paidAmount || 0).toFixed(2)}</div>
                    <div style="grid-column: span 2; font-size:1rem; border-top:1px dashed var(--border-color); padding-top:8px; margin-top:8px; color:var(--danger-color); font-weight:700;">
                        Remaining Outstanding Balance: $${parseFloat(bill.balanceAmount).toFixed(2)}
                    </div>
                </div>
            `;
            $('#payment-invoice-summary-box').html(summaryHtml);

            // Populate remaining payment amount
            $('#pay-amount').val(parseFloat(bill.balanceAmount).toFixed(2));
            // Pre-fill transaction id randomly
            $('#pay-txn-id').val('TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase());

            // Transactions history list
            let historyHtml = '';
            if (payments.length === 0) {
                historyHtml = `<tr><td colspan="4" class="text-center">No transactions recorded for this invoice.</td></tr>`;
            } else {
                payments.forEach(pay => {
                    historyHtml += `
                        <tr>
                            <td>${new Date(pay.paymentDate).toLocaleDateString()}</td>
                            <td><span class="badge badge-primary">${pay.paymentMethod}</span></td>
                            <td>${pay.transactionId}</td>
                            <td><strong>$${parseFloat(pay.amount).toFixed(2)}</strong></td>
                        </tr>
                    `;
                });
            }
            $('#payment-history-body').html(historyHtml);

            // Show payment inputs only if balance remains
            if (parseFloat(bill.balanceAmount) > 0) {
                $('#payment-input-form-section').show();
            }

        }).catch(err => {
            showToast('Failed to load bill payments info', 'danger');
            closeModal('payment-modal');
        });
    },

    submitPayment: () => {
        const billId = $('#pay-bill-id').val();
        const amount = $('#pay-amount').val();
        const method = $('#pay-method').val();
        const txnId = $('#pay-txn-id').val().trim();
        const remarks = $('#pay-remarks').val().trim();

        if (!amount || !method || !txnId) {
            showToast('Please fill out all required transaction details', 'danger');
            return;
        }

        const data = {
            billId: parseInt(billId),
            amount: parseFloat(amount),
            paymentMethod: method,
            transactionId: txnId,
            remarks: remarks
        };

        showLoader($('#record-payment-form'));

        APIHelper.createPayment(data).then(() => {
            showToast('Transaction recorded successfully!', 'success');
            // Refresh detailed view & main bills table
            Bills.openPaymentModal(billId);
            Bills.loadBills();
        }).catch(err => {
            showToast(err.error || 'Failed to record transaction payment', 'danger');
        }).finally(() => {
            hideLoader($('#record-payment-form'));
        });
    }
};

$(document).ready(function() {
    if (!AuthGuard.check()) {
        return;
    }

    if ($('#bills-table-body').length) {
        Bills.init();
    }
});
