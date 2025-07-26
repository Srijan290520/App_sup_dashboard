// Billing Corrections logic
document.addEventListener('DOMContentLoaded', function() {
    const billingList = document.getElementById('billing-list');
    const addBillingBtn = document.getElementById('add-billing');

    async function renderBilling() {
        // Show loading state
        billingList.innerHTML = '<tr><td colspan="7">Loading billing corrections...</td></tr>';
        
        try {
            const billing = await fetchBilling();
            
            billingList.innerHTML = billing.map((item, idx) => {
                const date = item.billDate || new Date().toLocaleDateString();
                const customer = item.patientName || '';
                const invoice = item.billNo || '';
                const amount = item.type === 'Discount' ? item.discountAmount :
                             item.type === 'Price Change' ? `${item.changeFrom} → ${item.changeTo}` :
                             item.type === 'Refund' ? item.refundAmount : '';
                const reason = item.type === 'Discount' ? item.reasonForDiscount :
                             item.type === 'Price Change' ? 'Price Adjustment' :
                             item.type === 'Refund' ? item.refundApprovedBy : '';
                const resolveTime = item.resolveTime ? 
                    Math.round((new Date(item.resolveTime) - new Date(item.createdAt)) / (1000 * 60)) : '-';
                const resolved = item.status && item.status.toLowerCase() === 'resolved';
                return `<tr class="${item.status ? item.status.toLowerCase() : ''}">
                    <td>${date}</td>
                    <td>${customer}</td>
                    <td>${invoice}</td>
                    <td>${amount}</td>
                    <td>${reason}</td>
                    <td>${item.status || 'Pending'}
                        ${!resolved ? `<button class='resolve-billing-btn' data-idx='${idx}'>Mark as Resolved</button>` : ''}
                    </td>
                    <td>${resolveTime !== '-' ? resolveTime + 'min' : '-'}
                    </td>
                </tr>`;
            }).join('');
        } catch (error) {
            console.error("Error rendering billing:", error);
            billingList.innerHTML = '<tr><td colspan="7">Error loading billing corrections. Please refresh the page.</td></tr>';
        }
    }

    function showBillingForm() {
        const form = document.createElement('div');
        form.className = 'form-popup';
        form.innerHTML = `
            <h3>Add Billing Correction</h3>
            <label>Correction Type:</label>
            <select id="billing-type">
                <option value="Discount">Discount</option>
                <option value="Price Change">Price Change</option>
                <option value="Refund">Refund</option>
            </select>
            <div id="billing-fields"></div>
            <button id="save-billing">Save</button>
            <button class="close-btn">Close</button>
        `;
        document.body.appendChild(form);
        form.style.display = 'block';

        function renderFields(type) {
            const fieldsDiv = form.querySelector('#billing-fields');
            if (type === 'Discount') {
                fieldsDiv.innerHTML = `
                    <label>Location:</label><input id="discount-location" type="text">
                    <label>Bill No:</label><input id="discount-billno" type="text">
                    <label>Patient ID:</label><input id="discount-patientid" type="text">
                    <label>Patient Name:</label><input id="discount-patientname" type="text">
                    <label>Patient Ph.No:</label><input id="discount-patientph" type="text">
                    <label>Doctor:</label><input id="discount-doctor" type="text">
                    <label>Service:</label><input id="discount-service" type="text">
                    <label>Bill Date:</label><input id="discount-billdate" type="date">
                    <label>Discount Requested By:</label><input id="discount-requestedby" type="text">
                    <label>Reason for Discount:</label><input id="discount-reason" type="text">
                    <label>Discount Amount:</label><input id="discount-amount" type="number">
                    <label>Discount %:</label><input id="discount-percent" type="number">
                    <label>Month:</label><input id="discount-month" type="text">
                `;
            } else if (type === 'Price Change') {
                fieldsDiv.innerHTML = `
                    <label>Location:</label><input id="price-location" type="text">
                    <label>Bill No:</label><input id="price-billno" type="text">
                    <label>Patient ID:</label><input id="price-patientid" type="text">
                    <label>Change From:</label><input id="price-changefrom" type="text">
                    <label>Change To:</label><input id="price-changeto" type="text">
                `;
            } else if (type === 'Refund') {
                fieldsDiv.innerHTML = `
                    <label>Location:</label><input id="refund-location" type="text">
                    <label>Bill No:</label><input id="refund-billno" type="text">
                    <label>Patient ID:</label><input id="refund-patientid" type="text">
                    <label>Patient Name:</label><input id="refund-patientname" type="text">
                    <label>Patient Ph.No:</label><input id="refund-patientph" type="text">
                    <label>Doctor:</label><input id="refund-doctor" type="text">
                    <label>Service:</label><input id="refund-service" type="text">
                    <label>Bill Date:</label><input id="refund-billdate" type="date">
                    <label>Refund Requested By:</label><input id="refund-requestedby" type="text">
                    <label>Refund Approved By/Reason:</label><input id="refund-approvedby" type="text">
                    <label>Refund Amount:</label><input id="refund-amount" type="number">
                `;
            }
        }

        // Initial render
        renderFields('Discount');
        form.querySelector('#billing-type').onchange = function(e) {
            renderFields(e.target.value);
        };

        form.querySelector('.close-btn').onclick = () => { form.remove(); };
        form.querySelector('#save-billing').onclick = async () => {
            // Show saving indicator
            const saveButton = form.querySelector('#save-billing');
            const originalText = saveButton.textContent;
            saveButton.textContent = "Saving...";
            saveButton.disabled = true;
            
            try {
                const type = form.querySelector('#billing-type').value;
                let entry = { type, createdAt: new Date().toISOString() };
                
                if (type === 'Discount') {
                    entry = {
                        type,
                        createdAt: new Date().toISOString(),
                        location: form.querySelector('#discount-location').value,
                        billNo: form.querySelector('#discount-billno').value,
                        patientId: form.querySelector('#discount-patientid').value,
                        patientName: form.querySelector('#discount-patientname').value,
                        patientPh: form.querySelector('#discount-patientph').value,
                        doctor: form.querySelector('#discount-doctor').value,
                        service: form.querySelector('#discount-service').value,
                        billDate: form.querySelector('#discount-billdate').value,
                        discountRequestedBy: form.querySelector('#discount-requestedby').value,
                        reasonForDiscount: form.querySelector('#discount-reason').value,
                        discountAmount: form.querySelector('#discount-amount').value,
                        discountPercent: form.querySelector('#discount-percent').value,
                        month: form.querySelector('#discount-month').value
                    };
                } else if (type === 'Price Change') {
                    entry = {
                        type,
                        createdAt: new Date().toISOString(),
                        location: form.querySelector('#price-location').value,
                        billNo: form.querySelector('#price-billno').value,
                        patientId: form.querySelector('#price-patientid').value,
                        changeFrom: form.querySelector('#price-changefrom').value,
                        changeTo: form.querySelector('#price-changeto').value
                    };
                } else if (type === 'Refund') {
                    entry = {
                        type,
                        createdAt: new Date().toISOString(),
                        location: form.querySelector('#refund-location').value,
                        billNo: form.querySelector('#refund-billno').value,
                        patientId: form.querySelector('#refund-patientid').value,
                        patientName: form.querySelector('#refund-patientname').value,
                        patientPh: form.querySelector('#refund-patientph').value,
                        doctor: form.querySelector('#refund-doctor').value,
                        service: form.querySelector('#refund-service').value,
                        billDate: form.querySelector('#refund-billdate').value,
                        refundRequestedBy: form.querySelector('#refund-requestedby').value,
                        refundApprovedBy: form.querySelector('#refund-approvedby').value,
                        refundAmount: form.querySelector('#refund-amount').value
                    };
                }
                
                // Save to Google Sheets
                await addBilling(entry);
                
                // Update UI
                await renderBilling();
                document.dispatchEvent(new Event('billingUpdated'));
                
                // Update counters to reflect the new billing entry
                if (typeof updateCounters === 'function') {
                    updateCounters();
                }
                form.remove();
            } catch (error) {
                console.error("Error saving billing correction:", error);
                alert("Failed to save billing correction. Please try again.");
                saveButton.textContent = originalText;
                saveButton.disabled = false;
            }
        };
    }

    addBillingBtn.onclick = showBillingForm;
    billingList.addEventListener('click', async function(e) {
        if (e.target.classList.contains('resolve-billing-btn')) {
            // Disable button to prevent double-clicks
            e.target.disabled = true;
            e.target.textContent = "Updating...";
            
            try {
                const idx = e.target.getAttribute('data-idx');
                
                // Get the latest data
                const billing = await fetchBilling();
                
                if (billing[idx]) {
                    // Update the billing item
                    billing[idx].status = 'Resolved';
                    billing[idx].resolveTime = new Date().toISOString();
                    
                    // Save to Google Sheets
                    await updateBilling(parseInt(idx), billing[idx]);
                    
                    // Update UI
                    await renderBilling();
                    document.dispatchEvent(new Event('billingUpdated'));
                    
                    // Update counters to reflect the status change
                    if (typeof updateCounters === 'function') {
                        updateCounters();
                    }
                }
            } catch (error) {
                console.error("Error resolving billing correction:", error);
                alert("Failed to mark billing as resolved. Please try again.");
                e.target.disabled = false;
                e.target.textContent = "Mark as Resolved";
            }
        }
    });
    
    // Initial render and update metrics
    renderBilling();
    
    // Ensure metrics are updated
    if (typeof updateCounters === 'function') {
        updateCounters().then(() => {
            console.log('Billing metrics updated on page load');
        }).catch(error => {
            console.error('Error updating billing metrics:', error);
        });
    }
});