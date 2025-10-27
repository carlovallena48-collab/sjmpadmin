document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Dropdown functionality
    document.querySelectorAll('.nav-dropdown > a').forEach(function(dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });

    // CORRECTED: Use the funeral API endpoint instead of pamisa
    const baseURL = "https://sjmpadmin.onrender.com/api/funeral";
    const addRequestBtn = document.getElementById('addRequestBtn');
    const modal = document.getElementById('addRequestModal');
    const closeBtn = document.querySelector('.modal .close-btn');
    const addRequestForm = document.getElementById('addRequestForm');
    const requestsTableBody = document.querySelector('#requestsTable tbody');
    const emptyState = document.getElementById('emptyState');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    
    // UPDATED: Only keep the counts that are displayed in the new widget layout
    const totalRequestsCount = document.getElementById('totalRequests');
    const pendingCount = document.getElementById('pendingCount');
    const completedCount = document.getElementById('completedCount');
    const upcomingCount = document.getElementById('upcomingCount');
    
    // REMOVED: Remove references to counts that are no longer displayed
    // const inProcessCount = document.getElementById('inProcessCount');
    // const scheduledCount = document.getElementById('scheduledCount');
    // const approvedCount = document.getElementById('approvedCount');
    // const rejectedCount = document.getElementById('rejectedCount');
    // const cancelledCount = document.getElementById('cancelledCount');
    
    const headerSearchInput = document.getElementById('headerSearch');
    const tableSearchInput = document.getElementById('tableSearch');

    const detailsModal = document.getElementById('detailsModal');
    const closeDetails = document.getElementById('closeDetails');
    const detailsContent = document.getElementById('detailsContent');

    const reasonModal = document.getElementById('reasonModal');
    const closeReason = document.getElementById('closeReason');
    const reasonForm = document.getElementById('reasonForm');
    const reasonInput = document.getElementById('reason');
    const actionTypeSpan = document.getElementById('actionType');
    const reasonModalTitle = document.getElementById('reasonModalTitle');

    const paymentModal = document.getElementById('paymentModal');
    const closePayment = document.getElementById('closePayment');
    const paymentForm = document.getElementById('paymentForm');
    const paymentAmount = document.getElementById('paymentAmount');
    const paymentRequestId = document.getElementById('paymentRequestId');
    const paymentName = document.getElementById('paymentName');
    const paymentContact = document.getElementById('paymentContact');

    // Export functionality elements
    const exportBtn = document.getElementById('exportBtn');
    const exportModal = document.getElementById('exportModal');
    const startExportBtn = document.getElementById('startExportBtn');

    // Individual Export Modal elements
    const individualExportModal = document.getElementById('individualExportModal');
    const previewContent = document.getElementById('previewContent');
    const generateIndividualPDFBtn = document.getElementById('generateIndividualPDFBtn');
    let currentIndividualRequest = null;

    let requests = [];
    let currentAction = { id: null, type: null };
    let currentPaymentRequest = null;
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let currentExportData = [];

    // Define status workflow
    const statusWorkflow = {
        'pending': ['in-process', 'rejected', 'cancelled'],
        'in-process': ['scheduled', 'rejected', 'cancelled'],
        'scheduled': ['completed', 'cancelled'],
        'completed': ['approved', 'rejected'],
        'approved': [],
        'rejected': ['pending'],
        'cancelled': ['pending']
    };

    // Date formatting functions
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    function formatTime(timeString) {
        if (!timeString) return 'N/A';
        try {
            if (timeString.includes(':')) {
                const [hours, minutes] = timeString.split(':');
                const hour = parseInt(hours);
                const minute = parseInt(minutes);
                
                if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                }
            }
            return timeString;
        } catch (e) {
            return timeString;
        }
    }

    function getPaymentStatusClass(paymentStatus) {
        switch(paymentStatus) {
            case 'paid': return 'paid';
            case 'pending': return 'pending';
            case 'overdue': return 'overdue';
            default: return 'pending';
        }
    }

    // Function to display value or N/A if empty
    function displayValue(value) {
        if (!value || value === '' || value === '0' || value === 0) {
            return 'N/A';
        }
        return value;
    }

    // Transform funeral data to match frontend expectations
    function transformFuneralData(data) {
        return data.map(request => {
            return {
                _id: request._id || '',
                // Use actual database fields from funeral schema
                nameOfDeceased: request.nameOfDeceased || '',
                birthday: request.birthday || '',
                civilStatus: request.civilStatus || '',
                nameOfHusbandOrWife: request.nameOfHusbandOrWife || '',
                informant: request.informant || '',
                relationship: request.relationship || '',
                residence: request.residence || '',
                dateDied: request.dateDied || '',
                age: request.age || '',
                causeOfDeath: request.causeOfDeath || '',
                receivedLastSacrament: request.receivedLastSacrament || '',
                placeOfBurialCemetery: request.placeOfBurialCemetery || '',
                scheduleDate: request.scheduleDate || '',
                scheduleTime: request.scheduleTime || '',
                contactNumber: request.contactNumber || '',
                status: request.status || 'pending',
                submittedByEmail: request.submittedByEmail || '',
                requestNumber: request.requestNumber || '',
                createdAt: request.createdAt || '',
                lastUpdated: request.lastUpdated || '',
                
                // Payment fields
                paymentStatus: request.paymentStatus || 'pending',
                fee: request.fee || 1000,
                paymentDate: request.paymentDate || '',
                paymentMethod: request.paymentMethod || '',
                paymentReference: request.paymentReference || '',
                paymentNotes: request.paymentNotes || '',
                
                // REASON SYSTEM FIELDS
                cancellation_reason: request.cancellation_reason || '',
                rejection_reason: request.rejection_reason || '',
                cancelled_by: request.cancelled_by || '',
                rejected_by: request.rejected_by || '',
                cancelled_at: request.cancelled_at || '',
                rejected_at: request.rejected_at || ''
            };
        });
    }

    async function fetchRequests() {
        try {
            const res = await fetch(baseURL);
            const data = await res.json();
            requests = transformFuneralData(data);
            
            console.log("Fetched funeral requests:", requests);
            applyFiltersAndSearch();
        } catch (err) { 
            console.error("Failed to fetch requests:", err);
            showNotification('Failed to fetch requests from server.', 'error');
        }
    }

    async function addRequest(request) {
        try {
            const res = await fetch(baseURL, {
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify(request)
            });
            const result = await res.json();
            console.log("Added request:", result);
            showNotification('New pamisa sa patay request added successfully!');
            fetchRequests();
        } catch (err) {
            console.error("Failed to add request:", err);
            showNotification('Failed to add request.', 'error');
        }
    }

    // Complete reason system implementation
    async function updateRequestStatus(id, status, reason = null) {
        try {
            const updateData = { status };
            
            // Add reason data based on action type
            if (status === 'cancelled' && reason) {
                updateData.cancellation_reason = reason;
                updateData.cancelled_by = 'admin';
                updateData.cancelled_at = new Date();
            } else if (status === 'rejected' && reason) {
                updateData.rejection_reason = reason;
                updateData.rejected_by = 'admin';
                updateData.rejected_at = new Date();
            }
            
            console.log("Updating request with reason system:", updateData);
            const res = await fetch(`${baseURL}/${id}`, {
                method: 'PUT', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(updateData)
            });
            const result = await res.json();
            console.log("Update result:", result);
            showNotification(`Request status updated to ${status}!`);
            fetchRequests();
        } catch (err) {
            console.error("Failed to update request:", err);
            showNotification('Failed to update request.', 'error');
        }
    }

    async function updatePaymentStatus(id, paymentData) {
        try {
            console.log("Updating payment for:", id, paymentData);
            
            const res = await fetch(`${baseURL}/${id}/payment`, {
                method:'PUT', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify(paymentData)
            });
            
            const result = await res.json();
            console.log("Payment update result:", result);
            showNotification('Payment status updated successfully!');
            fetchRequests();
        } catch (err) {
            console.error("Failed to update payment:", err);
            showNotification('Failed to update payment.', 'error');
        }
    }

    function getAvailableActions(currentStatus) {
        return statusWorkflow[currentStatus] || [];
    }

    function applyFiltersAndSearch() {
        let filteredData = [...requests];
        
        // Apply status filter
        if (currentFilter !== 'all') {
            filteredData = filteredData.filter(r => r.status === currentFilter);
        }
        
        // Apply search term
        if (currentSearchTerm) {
            const term = currentSearchTerm.toLowerCase();
            filteredData = filteredData.filter(r => 
                r.nameOfDeceased.toLowerCase().includes(term) || 
                (r.informant && r.informant.toLowerCase().includes(term)) ||
                (r.contactNumber && r.contactNumber.toLowerCase().includes(term)) ||
                (r.status && r.status.toLowerCase().includes(term)) ||
                (r.requestNumber && r.requestNumber.toLowerCase().includes(term))
            );
        }
        
        renderTable(filteredData);
    }

    function renderTable(data) {
        requestsTableBody.innerHTML = '';
        if(data.length === 0){ 
            emptyState.style.display = 'block'; 
        } else {
            emptyState.style.display = 'none';
            data.forEach(request => {
                const row = document.createElement('tr');
                row.dataset.id = request._id;
                const availableActions = getAvailableActions(request.status);
                
                const paymentStatus = request.paymentStatus || 'pending';
                
                row.innerHTML = `
                    <td>${request.nameOfDeceased}</td>
                    <td>${formatDate(request.dateDied)}</td>
                    <td>${formatDate(request.scheduleDate)}</td>
                    <td>${formatTime(request.scheduleTime)}</td>
                    <td>${request.informant}</td>
                    <td><span class="status-badge ${request.status}">${request.status}</span></td>
                    <td><span class="payment-badge ${getPaymentStatusClass(paymentStatus)}">${paymentStatus}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${availableActions.includes('in-process') ? 
                                `<button class="process-btn" title="Mark as In Process">
                                    <i class="fa-solid fa-gears"></i> Process
                                </button>` : ''}
                            ${availableActions.includes('scheduled') ? 
                                `<button class="schedule-btn" title="Mark as Scheduled">
                                    <i class="fa-solid fa-calendar-check"></i> Schedule
                                </button>` : ''}
                            ${availableActions.includes('completed') ? 
                                `<button class="complete-btn" title="Mark as Completed">
                                    <i class="fa-solid fa-check-circle"></i> Complete
                                </button>` : ''}
                            ${availableActions.includes('approved') ? 
                                `<button class="approve-btn" title="Approve">
                                    <i class="fa-solid fa-thumbs-up"></i> Approve
                                </button>` : ''}
                            ${availableActions.includes('rejected') ? 
                                `<button class="reject-btn" title="Reject">
                                    <i class="fa-solid fa-ban"></i> Reject
                                </button>` : ''}
                            ${availableActions.includes('cancelled') ? 
                                `<button class="cancel-btn" title="Cancel">
                                    <i class="fa-solid fa-xmark"></i> Cancel
                                </button>` : ''}
                            ${availableActions.includes('pending') ? 
                                `<button class="reset-btn" title="Reset to Pending">
                                    <i class="fa-solid fa-rotate-left"></i> Reset
                                </button>` : ''}
                            ${(request.status === 'scheduled' || request.status === 'completed' || request.status === 'approved') && paymentStatus !== 'paid' ? 
                                `<button class="payment-btn" title="Confirm Payment">
                                    <i class="fa-solid fa-money-bill-wave"></i> Payment
                                </button>` : ''}
                        </div>
                    </td>
                `;
                
                // Add individual export button to the action buttons container
                const actionButtonsContainer = row.querySelector('.action-buttons');
                const exportButton = addIndividualExportButton(request);
                actionButtonsContainer.appendChild(exportButton);
                
                requestsTableBody.appendChild(row);
            });
        }
        updateCounts(data);
    }

    function updateCounts(data){
        totalRequestsCount.textContent = data.length;
        pendingCount.textContent = data.filter(r => r.status === 'pending').length;
        completedCount.textContent = data.filter(r => r.status === 'completed').length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        upcomingCount.textContent = data.filter(r => {
            if (!r.scheduleDate) return false;
            try {
                const funeralDate = new Date(r.scheduleDate);
                funeralDate.setHours(0, 0, 0, 0);
                return funeralDate >= today && (r.status === 'scheduled' || r.status === 'in-process');
            } catch (e) {
                return false;
            }
        }).length;
    }

    function showNotification(message, type='success'){
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        alert.innerHTML = `<span>${message}</span><button class="close-notif">&times;</button>`;
        document.getElementById('alertContainer').appendChild(alert);
        setTimeout(()=>{
            alert.classList.add('hide'); 
            setTimeout(() => alert.remove(), 300);
        }, 3000);
        alert.querySelector('.close-notif').addEventListener('click',()=>alert.remove());
    }

    // Modal handling
    addRequestBtn.addEventListener('click', ()=>modal.classList.add('show'));
    closeBtn.addEventListener('click', ()=>{
        modal.classList.remove('show'); 
        addRequestForm.reset();
    });
    window.addEventListener('click', (e)=>{
        if(e.target===modal){
            modal.classList.remove('show'); 
            addRequestForm.reset();
        }
    });

    // Update form submission to match funeral database structure
    addRequestForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        
        // Generate request number
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const requestNumber = `FUNERAL-${timestamp}-${randomString}`;
        
        const newRequest = {
            nameOfDeceased: document.getElementById('nameOfDeceased').value,
            birthday: document.getElementById('birthday').value,
            civilStatus: document.getElementById('civilStatus').value,
            nameOfHusbandOrWife: document.getElementById('nameOfHusbandOrWife').value,
            informant: document.getElementById('informant').value,
            relationship: document.getElementById('relationship').value,
            residence: document.getElementById('residence').value,
            dateDied: document.getElementById('dateDied').value,
            age: document.getElementById('age').value,
            causeOfDeath: document.getElementById('causeOfDeath').value,
            receivedLastSacrament: document.getElementById('receivedLastSacrament').value,
            placeOfBurialCemetery: document.getElementById('placeOfBurialCemetery').value,
            scheduleDate: document.getElementById('scheduleDate').value,
            scheduleTime: document.getElementById('scheduleTime').value,
            contactNumber: document.getElementById('contactNumber').value,
            status: 'pending',
            submittedByEmail: 'admin@sjmp.com',
            requestNumber: requestNumber,
            fee: 1000,
            paymentStatus: 'pending'
        };
        
        console.log("Submitting new funeral request:", newRequest);
        addRequest(newRequest);
        modal.classList.remove('show'); 
        addRequestForm.reset();
    });

    filterButtons.forEach(button=>{
        button.addEventListener('click', ()=>{
            filterButtons.forEach(btn=>btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.status;
            applyFiltersAndSearch();
        });
    });

    // Search functionality for both search bars
    function handleSearchInput(e) {
        currentSearchTerm = e.target.value;
        applyFiltersAndSearch();
    }

    headerSearchInput.addEventListener('input', handleSearchInput);
    tableSearchInput.addEventListener('input', handleSearchInput);

    // Reason modal handling
    closeReason.addEventListener('click', ()=>{
        reasonModal.classList.remove('show');
        reasonForm.reset();
    });
    
    window.addEventListener('click', (e)=>{
        if(e.target===reasonModal){
            reasonModal.classList.remove('show');
            reasonForm.reset();
        }
    });
    
    reasonForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const reason = reasonInput.value.trim();
        if(reason){
            console.log("Submitting reason:", reason, "for action:", currentAction);
            updateRequestStatus(currentAction.id, currentAction.type, reason);
            reasonModal.classList.remove('show');
            reasonForm.reset();
        }
    });

    // Payment modal handling
    closePayment.addEventListener('click', ()=>{
        paymentModal.classList.remove('show');
        paymentForm.reset();
    });
    
    window.addEventListener('click', (e)=>{
        if(e.target===paymentModal){
            paymentModal.classList.remove('show');
            paymentForm.reset();
        }
    });
    
    paymentForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const paymentData = {
            paymentStatus: 'paid',
            paymentDate: document.getElementById('paymentDate').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentReference: document.getElementById('paymentReference').value || 'N/A',
            paymentNotes: document.getElementById('paymentNotes').value || 'N/A'
        };
        
        if (paymentData.paymentMethod === 'cash') {
            paymentData.paymentReference = paymentData.paymentReference === 'N/A' ? 'CASH_PAYMENT' : paymentData.paymentReference;
        }
        
        console.log("Submitting payment:", paymentData);
        updatePaymentStatus(currentPaymentRequest._id, paymentData);
        paymentModal.classList.remove('show');
        paymentForm.reset();
    });

    requestsTableBody.addEventListener('click',(e)=>{
        const row = e.target.closest('tr'); 
        if(!row || !row.dataset.id) return;
        const id = row.dataset.id; 
        const request = requests.find(r=>r._id===id);
        
        // Handle action buttons
        if(e.target.closest('.process-btn')) { 
            updateRequestStatus(id,'in-process'); 
            return; 
        }
        if(e.target.closest('.schedule-btn')) { 
            updateRequestStatus(id,'scheduled'); 
            return; 
        }
        if(e.target.closest('.complete-btn')) { 
            updateRequestStatus(id,'completed'); 
            return; 
        }
        if(e.target.closest('.approve-btn')) { 
            updateRequestStatus(id,'approved'); 
            return; 
        }
        if(e.target.closest('.reject-btn')) { 
            currentAction = { id, type: 'rejected' };
            actionTypeSpan.textContent = 'rejection';
            reasonModalTitle.textContent = 'Reason for Rejection';
            reasonModal.classList.add('show');
            return; 
        }
        if(e.target.closest('.cancel-btn')) { 
            currentAction = { id, type: 'cancelled' };
            actionTypeSpan.textContent = 'cancellation';
            reasonModalTitle.textContent = 'Reason for Cancellation';
            reasonModal.classList.add('show');
            return; 
        }
        if(e.target.closest('.reset-btn')) { 
            updateRequestStatus(id,'pending'); 
            return; 
        }
        if(e.target.closest('.payment-btn')) { 
            currentPaymentRequest = request;
            paymentRequestId.textContent = request.requestNumber || request._id.substring(0, 8) + '...';
            paymentName.textContent = request.nameOfDeceased;
            paymentContact.textContent = request.informant;
            paymentAmount.textContent = `₱${request.fee || 1000}.00`;
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('paymentDate').value = today;
            paymentModal.classList.add('show');
            return; 
        }
        
        // Show details modal
        if(request){
            showRequestDetails(request);
        }
    });

    // Complete details display for funeral requests
    function showRequestDetails(request) {
        let detailsHTML = `
            <div class="details-section">
                <h3 class="details-section-header">Basic Information</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Request Number:</span>
                        <div class="detail-value">${displayValue(request.requestNumber)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <div class="detail-value"><span class="status-badge ${request.status}">${request.status}</span></div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Submitted By:</span>
                        <div class="detail-value">${displayValue(request.submittedByEmail)}</div>
                    </div>
                </div>
            </div>

            <div class="details-section">
                <h3 class="details-section-header">Deceased Information</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Name of Deceased:</span>
                        <div class="detail-value">${displayValue(request.nameOfDeceased)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date of Birth:</span>
                        <div class="detail-value">${formatDate(request.birthday)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Age:</span>
                        <div class="detail-value">${displayValue(request.age)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Civil Status:</span>
                        <div class="detail-value">${displayValue(request.civilStatus)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Spouse Name:</span>
                        <div class="detail-value">${displayValue(request.nameOfHusbandOrWife)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date of Death:</span>
                        <div class="detail-value">${formatDate(request.dateDied)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cause of Death:</span>
                        <div class="detail-value">${displayValue(request.causeOfDeath)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Received Last Sacrament:</span>
                        <div class="detail-value">${displayValue(request.receivedLastSacrament)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Burial Place/Cemetery:</span>
                        <div class="detail-value">${displayValue(request.placeOfBurialCemetery)}</div>
                    </div>
                </div>
            </div>

            <div class="details-section">
                <h3 class="details-section-header">Requester Information</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Informant/Requester:</span>
                        <div class="detail-value">${displayValue(request.informant)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Relationship to Deceased:</span>
                        <div class="detail-value">${displayValue(request.relationship)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Contact Number:</span>
                        <div class="detail-value">${displayValue(request.contactNumber)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Address:</span>
                        <div class="detail-value">${displayValue(request.residence)}</div>
                    </div>
                </div>
            </div>

            <div class="details-section">
                <h3 class="details-section-header">Funeral Service Details</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Schedule Date:</span>
                        <div class="detail-value">${formatDate(request.scheduleDate)}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Schedule Time:</span>
                        <div class="detail-value">${formatTime(request.scheduleTime)}</div>
                    </div>
                </div>
            </div>

            <div class="details-section">
                <h3 class="details-section-header">Payment Information</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Payment Status:</span>
                        <div class="detail-value"><span class="payment-badge ${getPaymentStatusClass(request.paymentStatus)}">${request.paymentStatus}</span></div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fee Amount:</span>
                        <div class="detail-value">₱${request.fee || 1000}.00</div>
                    </div>
                </div>
            </div>

            <div class="details-section">
                <h3 class="details-section-header">System Information</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Created At:</span>
                        <div class="detail-value">${request.createdAt ? formatDate(request.createdAt) : 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Updated:</span>
                        <div class="detail-value">${request.lastUpdated ? formatDate(request.lastUpdated) : 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;
        
        // REASON SYSTEM DISPLAY - Only if data exists
        if (request.cancellation_reason) {
            detailsHTML += `
                <div class="details-section">
                    <h3 class="details-section-header">Cancellation Details</h3>
                    <div class="details-grid">
                        <div class="detail-item full-width">
                            <span class="detail-label">Cancellation Reason:</span>
                            <div class="detail-textarea">${displayValue(request.cancellation_reason)}</div>
                        </div>
                        ${request.cancelled_by ? `
                            <div class="detail-item">
                                <span class="detail-label">Cancelled By:</span>
                                <div class="detail-value">${displayValue(request.cancelled_by)}</div>
                            </div>
                        ` : ''}
                        ${request.cancelled_at ? `
                            <div class="detail-item">
                                <span class="detail-label">Cancelled At:</span>
                                <div class="detail-value">${formatDate(request.cancelled_at)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        if (request.rejection_reason) {
            detailsHTML += `
                <div class="details-section">
                    <h3 class="details-section-header">Rejection Details</h3>
                    <div class="details-grid">
                        <div class="detail-item full-width">
                            <span class="detail-label">Rejection Reason:</span>
                            <div class="detail-textarea">${displayValue(request.rejection_reason)}</div>
                        </div>
                        ${request.rejected_by ? `
                            <div class="detail-item">
                                <span class="detail-label">Rejected By:</span>
                                <div class="detail-value">${displayValue(request.rejected_by)}</div>
                            </div>
                        ` : ''}
                        ${request.rejected_at ? `
                            <div class="detail-item">
                                <span class="detail-label">Rejected At:</span>
                                <div class="detail-value">${formatDate(request.rejected_at)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // Payment details - Only if payment data exists
        if (request.paymentStatus === 'paid' || request.paymentDate) {
            detailsHTML += `
                <div class="details-section">
                    <h3 class="details-section-header">Payment Details</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Payment Status:</span>
                            <div class="detail-value"><span class="payment-badge ${getPaymentStatusClass(request.paymentStatus)}">${request.paymentStatus}</span></div>
                        </div>
                        ${request.paymentDate ? `
                            <div class="detail-item">
                                <span class="detail-label">Payment Date:</span>
                                <div class="detail-value">${formatDate(request.paymentDate)}</div>
                            </div>
                        ` : ''}
                        ${request.paymentMethod ? `
                            <div class="detail-item">
                                <span class="detail-label">Payment Method:</span>
                                <div class="detail-value">${displayValue(request.paymentMethod)}</div>
                            </div>
                        ` : ''}
                        ${request.paymentReference ? `
                            <div class="detail-item">
                                <span class="detail-label">Payment Reference:</span>
                                <div class="detail-value">${displayValue(request.paymentReference)}</div>
                            </div>
                        ` : ''}
                        ${request.paymentNotes ? `
                            <div class="detail-item full-width">
                                <span class="detail-label">Payment Notes:</span>
                                <div class="detail-textarea">${displayValue(request.paymentNotes)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        detailsContent.innerHTML = detailsHTML;
        detailsModal.classList.add('show');
    }

    closeDetails.addEventListener('click',()=>detailsModal.classList.remove('show'));
    window.addEventListener('click',(e)=>{if(e.target===detailsModal) detailsModal.classList.remove('show');});

    // ==================== INDIVIDUAL PDF EXPORT FUNCTIONALITY ====================

    // Function to add individual export button to each row
    function addIndividualExportButton(request) {
        const button = document.createElement('button');
        button.className = 'export-individual-btn';
        button.title = 'Export Individual PDF';
        button.innerHTML = '<i class="fa-solid fa-file-export"></i> Export';
        
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row click event
            showIndividualExportModal(request);
        });
        
        return button;
    }

    // Function to show individual export modal
    function showIndividualExportModal(request) {
        currentIndividualRequest = request;
        
        // Populate preview content
        previewContent.innerHTML = `
            <div class="preview-item">
                <span class="preview-label">Request Number:</span>
                <span class="preview-value">${request.requestNumber || 'N/A'}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Deceased Name:</span>
                <span class="preview-value">${request.nameOfDeceased}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Date of Death:</span>
                <span class="preview-value">${formatDate(request.dateDied)}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Service Date:</span>
                <span class="preview-value">${formatDate(request.scheduleDate)}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Service Time:</span>
                <span class="preview-value">${formatTime(request.scheduleTime)}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Contact Person:</span>
                <span class="preview-value">${request.informant}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Status:</span>
                <span class="preview-value"><span class="status-badge ${request.status}">${request.status}</span></span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Payment Status:</span>
                <span class="preview-value"><span class="payment-badge ${getPaymentStatusClass(request.paymentStatus)}">${request.paymentStatus}</span></span>
            </div>
        `;
        
        individualExportModal.classList.add('show');
    }

    // Function to generate individual PDF
    function generateIndividualPDF(request, options = {}) {
        try {
            // Show progress
            const progress = document.getElementById('individualExportProgress');
            const progressFill = document.getElementById('individualProgressFill');
            const progressText = document.getElementById('individualProgressText');
            
            progress.style.display = 'block';
            progressFill.style.width = '30%';
            progressText.textContent = '30%';

            // Initialize jsPDF with Letter format
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            progressFill.style.width = '50%';
            progressText.textContent = '50%';

            // Set font
            doc.setFont('helvetica');
            
            // Add header
            doc.setFontSize(18);
            doc.setTextColor(27, 94, 32); // Green color
            doc.text('SAN JOSE MANGGAGAWA PARISH', 4.25, 0.75, { align: 'center' });
            
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('PAMISA SA PATAY FORM ', 4.25, 1.0, { align: 'center' });
            
            // Add request details
            doc.setFontSize(10);
            let yPosition = 1.5;
            
            // Basic Information Section
            doc.setFontSize(12);
            doc.setTextColor(27, 94, 32);
            doc.text('BASIC INFORMATION', 0.5, yPosition);
            doc.setDrawColor(27, 94, 32);
            
            yPosition += 0.3;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            doc.text(`Request Number: ${request.requestNumber || 'N/A'}`, 0.5, yPosition);
            doc.text(`Status: ${request.status.toUpperCase()}`, 4.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Submitted By: ${request.submittedByEmail || 'N/A'}`, 0.5, yPosition);
            doc.text(`Submitted Date: ${request.createdAt ? formatDate(request.createdAt) : 'N/A'}`, 4.5, yPosition);
            yPosition += 0.3;

            // Deceased Information Section
            doc.setFontSize(12);
            doc.setTextColor(27, 94, 32);
            doc.text('DECEASED INFORMATION', 0.5, yPosition);
            
            yPosition += 0.3;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            doc.text(`Name of Deceased: ${request.nameOfDeceased}`, 0.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Date of Birth: ${formatDate(request.birthday)}`, 0.5, yPosition);
            doc.text(`Age: ${request.age || 'N/A'}`, 4.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Civil Status: ${request.civilStatus || 'N/A'}`, 0.5, yPosition);
            doc.text(`Spouse Name: ${request.nameOfHusbandOrWife || 'N/A'}`, 4.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Date of Death: ${formatDate(request.dateDied)}`, 0.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Cause of Death: ${request.causeOfDeath || 'N/A'}`, 0.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Received Last Sacrament: ${request.receivedLastSacrament || 'No'}`, 0.5, yPosition);
            yPosition += 0.2;
            
            doc.text(`Burial Place/Cemetery: ${request.placeOfBurialCemetery || 'N/A'}`, 0.5, yPosition);
            yPosition += 0.3;

            // Requester Information Section (if enabled)
            if (options.includeContactInfo !== false) {
                doc.setFontSize(12);
                doc.setTextColor(27, 94, 32);
                doc.text('REQUESTER INFORMATION', 0.5, yPosition);
                
                yPosition += 0.3;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                
                doc.text(`Requester Name: ${request.informant || 'N/A'}`, 0.5, yPosition);
                yPosition += 0.2;
                
                doc.text(`Relationship to Deceased: ${request.relationship || 'N/A'}`, 0.5, yPosition);
                yPosition += 0.2;
                
                doc.text(`Contact Number: ${request.contactNumber || 'N/A'}`, 0.5, yPosition);
                yPosition += 0.2;
                
                doc.text(`Address: ${request.residence || 'N/A'}`, 0.5, yPosition);
                yPosition += 0.3;
            }

            // Service Details Section
            doc.setFontSize(12);
            doc.setTextColor(27, 94, 32);
            doc.text('SERVICE DETAILS', 0.5, yPosition);
            
            yPosition += 0.3;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            doc.text(`Service Date: ${formatDate(request.scheduleDate)}`, 0.5, yPosition);
            doc.text(`Service Time: ${formatTime(request.scheduleTime)}`, 4.5, yPosition);
            yPosition += 0.3;

            // Payment Information Section (if enabled)
            if (options.includePaymentInfo !== false) {
                doc.setFontSize(12);
                doc.setTextColor(27, 94, 32);
                doc.text('PAYMENT INFORMATION', 0.5, yPosition);
                
                yPosition += 0.3;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                
                doc.text(`Payment Status: ${request.paymentStatus ? request.paymentStatus.toUpperCase() : 'PENDING'}`, 0.5, yPosition);
                doc.text(`Fee Amount: ₱${request.fee || 1000}.00`, 4.5, yPosition);
                yPosition += 0.2;
                
                if (request.paymentDate) {
                    doc.text(`Payment Date: ${formatDate(request.paymentDate)}`, 0.5, yPosition);
                    yPosition += 0.2;
                }
                
                if (request.paymentMethod) {
                    doc.text(`Payment Method: ${request.paymentMethod}`, 0.5, yPosition);
                    yPosition += 0.2;
                }
                
                if (request.paymentReference && request.paymentReference !== 'N/A') {
                    doc.text(`Payment Reference: ${request.paymentReference}`, 0.5, yPosition);
                    yPosition += 0.2;
                }
                
                yPosition += 0.2;
            }

            // Reason Information Section (if applicable and enabled)
            if (options.includeReasonInfo !== false) {
                if (request.cancellation_reason) {
                    doc.setFontSize(12);
                    doc.setTextColor(27, 94, 32);
                    doc.text('CANCELLATION DETAILS', 0.5, yPosition);
                    
                    yPosition += 0.3;
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    
                    const cancellationReason = doc.splitTextToSize(`Cancellation Reason: ${request.cancellation_reason}`, 7.5);
                    doc.text(cancellationReason, 0.5, yPosition);
                    yPosition += (cancellationReason.length * 0.15) + 0.2;
                    
                    if (request.cancelled_by) {
                        doc.text(`Cancelled By: ${request.cancelled_by}`, 0.5, yPosition);
                        yPosition += 0.2;
                    }
                    
                    if (request.cancelled_at) {
                        doc.text(`Cancelled At: ${formatDate(request.cancelled_at)}`, 0.5, yPosition);
                        yPosition += 0.2;
                    }
                    
                    yPosition += 0.2;
                }
                
                if (request.rejection_reason) {
                    doc.setFontSize(12);
                    doc.setTextColor(27, 94, 32);
                    doc.text('REJECTION DETAILS', 0.5, yPosition);
                    
                    yPosition += 0.3;
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    
                    const rejectionReason = doc.splitTextToSize(`Rejection Reason: ${request.rejection_reason}`, 7.5);
                    doc.text(rejectionReason, 0.5, yPosition);
                    yPosition += (rejectionReason.length * 0.15) + 0.2;
                    
                    if (request.rejected_by) {
                        doc.text(`Rejected By: ${request.rejected_by}`, 0.5, yPosition);
                        yPosition += 0.2;
                    }
                    
                    if (request.rejected_at) {
                        doc.text(`Rejected At: ${formatDate(request.rejected_at)}`, 0.5, yPosition);
                        yPosition += 0.2;
                    }
                }
            }

            // Add footer
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 0.5, 10.5);
            doc.text('Confidential - San Jose Manggagawa Parish', 4.25, 10.5, { align: 'center' });
            doc.text(`Page 1 of 1`, 7.5, 10.5, { align: 'right' });

            progressFill.style.width = '95%';
            progressText.textContent = '95%';

            // Generate filename
            const filename = `Funeral_Request_${request.requestNumber || request._id.substring(0, 8)}_${request.nameOfDeceased.replace(/\s+/g, '_')}`;

            // Save PDF
            doc.save(`${filename}.pdf`);

            progressFill.style.width = '100%';
            progressText.textContent = '100%';

            setTimeout(() => {
                progress.style.display = 'none';
                individualExportModal.classList.remove('show');
                showNotification('Individual PDF generated successfully!', 'success');
            }, 1000);

        } catch (error) {
            console.error('Individual PDF export error:', error);
            showNotification('Failed to generate individual PDF. Please try again.', 'error');
            document.getElementById('individualExportProgress').style.display = 'none';
        }
    }

    // Event listener for generating individual PDF
    generateIndividualPDFBtn.addEventListener('click', () => {
        if (!currentIndividualRequest) return;
        
        const options = {
            includePaymentInfo: document.getElementById('includePaymentInfo').checked,
            includeContactInfo: document.getElementById('includeContactInfo').checked,
            includeReasonInfo: document.getElementById('includeReasonInfo').checked
        };
        
        generateIndividualPDF(currentIndividualRequest, options);
    });

    // Close individual export modal
    individualExportModal.querySelector('.close-btn').addEventListener('click', () => {
        individualExportModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === individualExportModal) {
            individualExportModal.classList.remove('show');
        }
    });

    // ==================== BULK PDF EXPORT FUNCTIONALITY ====================

    // Function to prepare data for PDF export
    function preparePDFData(requests) {
        return requests.map(request => {
            return {
                'REQUEST_NUMBER': request.requestNumber || 'N/A',
                'DECEASED_NAME': request.nameOfDeceased,
                'DATE_OF_BIRTH': formatDate(request.birthday),
                'AGE': request.age || 'N/A',
                'CIVIL_STATUS': request.civilStatus || 'N/A',
                'SPOUSE_NAME': request.nameOfHusbandOrWife || 'N/A',
                'DATE_OF_DEATH': formatDate(request.dateDied),
                'CAUSE_OF_DEATH': request.causeOfDeath || 'N/A',
                'LAST_SACRAMENT': request.receivedLastSacrament || 'No',
                'BURIAL_PLACE': request.placeOfBurialCemetery || 'N/A',
                'REQUESTER_NAME': request.informant || 'N/A',
                'RELATIONSHIP': request.relationship || 'N/A',
                'CONTACT_NUMBER': request.contactNumber || 'N/A',
                'ADDRESS': request.residence || 'N/A',
                'SERVICE_DATE': formatDate(request.scheduleDate),
                'SERVICE_TIME': formatTime(request.scheduleTime),
                'STATUS': request.status.toUpperCase(),
                'PAYMENT_STATUS': request.paymentStatus ? request.paymentStatus.toUpperCase() : 'PENDING',
                'FEE_AMOUNT': `₱${request.fee || 1000}.00`,
                'PAYMENT_DATE': request.paymentDate ? formatDate(request.paymentDate) : 'N/A',
                'PAYMENT_METHOD': request.paymentMethod || 'N/A'
            };
        });
    }

    // Function to export to PDF with Long Bond Paper format
    function exportToPDF(data, filename = 'Funeral_Requests_Report') {
        try {
            // Show progress
            const progress = document.getElementById('exportProgress');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            progress.style.display = 'block';
            progressFill.style.width = '30%';
            progressText.textContent = '30%';

            // Initialize jsPDF with Long Bond Paper dimensions (8.5" x 13")
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: [8.5, 13] // Long Bond Paper size
            });

            progressFill.style.width = '50%';
            progressText.textContent = '50%';

            // Set font
            doc.setFont('helvetica');
            
            // Add header
            doc.setFontSize(16);
            doc.setTextColor(27, 94, 32); // Green color
            doc.text('SAN JOSE MABINI PARISH', 4.25, 0.75, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('PAMISA SA PATAY REQUESTS REPORT', 4.25, 1.0, { align: 'center' });
            
            // Add report details
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 0.5, 1.3);
            doc.text(`Total Records: ${data.length}`, 0.5, 1.5);
            
            progressFill.style.width = '70%';
            progressText.textContent = '70%';

            // Prepare table data
            const tableData = data.map(item => Object.values(item));
            const headers = Object.keys(data[0] || {}).map(header => 
                header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            );

            progressFill.style.width = '85%';
            progressText.textContent = '85%';

            // Add table
            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: 1.8,
                styles: {
                    fontSize: 8,
                    cellPadding: 0.05,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.01
                },
                headStyles: {
                    fillColor: [27, 94, 32],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { top: 1.8, right: 0.5, bottom: 0.5, left: 0.5 },
                tableWidth: 'wrap'
            });

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Page ${i} of ${pageCount}`, 4.25, 12.7, { align: 'center' });
                doc.text('Confidential - San Jose Mabini Parish', 4.25, 12.85, { align: 'center' });
            }

            progressFill.style.width = '95%';
            progressText.textContent = '95%';

            // Save PDF
            doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

            progressFill.style.width = '100%';
            progressText.textContent = '100%';

            setTimeout(() => {
                progress.style.display = 'none';
                exportModal.classList.remove('show');
                showNotification('PDF report generated successfully!', 'success');
            }, 1000);

        } catch (error) {
            console.error('PDF export error:', error);
            showNotification('Failed to generate PDF. Please try again.', 'error');
            document.getElementById('exportProgress').style.display = 'none';
        }
    }

    // Function to update export stats
    function updateExportStats(data) {
        const totalRecords = document.getElementById('totalRecords');
        const dateRange = document.getElementById('dateRange');
        
        totalRecords.textContent = data.length;
        
        if (data.length > 0) {
            const dates = data.map(r => new Date(r.createdAt)).filter(d => !isNaN(d));
            if (dates.length > 0) {
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));
                dateRange.textContent = `${formatDate(minDate)} - ${formatDate(maxDate)}`;
            } else {
                dateRange.textContent = 'No dates';
            }
        } else {
            dateRange.textContent = '-';
        }
    }

    // Helper function to get currently filtered data
    function getFilteredData() {
        let filteredData = [...requests];
        
        if (currentFilter !== 'all') {
            filteredData = filteredData.filter(r => r.status === currentFilter);
        }
        
        if (currentSearchTerm) {
            const term = currentSearchTerm.toLowerCase();
            filteredData = filteredData.filter(r => 
                r.nameOfDeceased.toLowerCase().includes(term) || 
                (r.informant && r.informant.toLowerCase().includes(term)) ||
                (r.contactNumber && r.contactNumber.toLowerCase().includes(term)) ||
                (r.status && r.status.toLowerCase().includes(term)) ||
                (r.requestNumber && r.requestNumber.toLowerCase().includes(term))
            );
        }
        
        return filteredData;
    }

    // Date range change handler
    function updateDateRangeExport() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
            const filteredData = requests.filter(request => {
                if (!request.createdAt) return false;
                const requestDate = new Date(request.createdAt).toISOString().split('T')[0];
                return requestDate >= startDate && requestDate <= endDate;
            });
            
            currentExportData = preparePDFData(filteredData);
            updateExportStats(filteredData);
        }
    }

    // Event listeners for export
    exportBtn.addEventListener('click', () => {
        currentExportData = preparePDFData(requests);
        updateExportStats(requests);
        exportModal.classList.add('show');
    });

    // Close export modal
    exportModal.querySelector('.close-btn').addEventListener('click', () => {
        exportModal.classList.remove('show');
    });

    // Export type selection
    exportModal.querySelectorAll('input[name="exportType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const dateRangeSection = document.getElementById('dateRangeSection');
            if (this.value === 'dateRange') {
                dateRangeSection.classList.add('show');
                
                // Set default dates (last 30 days)
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                
                document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
                document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
                
                updateDateRangeExport();
            } else {
                dateRangeSection.classList.remove('show');
                currentExportData = preparePDFData(requests);
                updateExportStats(requests);
            }
        });
    });

    document.getElementById('startDate').addEventListener('change', updateDateRangeExport);
    document.getElementById('endDate').addEventListener('change', updateDateRangeExport);

    // Start export button
    startExportBtn.addEventListener('click', () => {
        const exportType = exportModal.querySelector('input[name="exportType"]:checked').value;
        let dataToExport = [];
        
        switch(exportType) {
            case 'all':
                dataToExport = preparePDFData(requests);
                break;
            case 'filtered':
                const filteredData = getFilteredData();
                dataToExport = preparePDFData(filteredData);
                break;
            case 'dateRange':
                dataToExport = currentExportData;
                break;
        }
        
        if (dataToExport.length === 0) {
            showNotification('No data to export.', 'error');
            return;
        }
        
        exportToPDF(dataToExport, `Funeral_Requests_${exportType}`);
    });

    // Initial fetch
    fetchRequests();

    // Logout
    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click",(e)=>{
        e.preventDefault();
        Swal.fire({
            title:'Are you sure you want to log out?',
            text:"You will be redirected to the login page.",
            icon:'warning',
            showCancelButton:true,
            confirmButtonColor:'#3085d6',
            cancelButtonColor:'#d33',
            confirmButtonText:'Yes, log me out!'
        }).then((result)=>{
            if(result.isConfirmed){window.location.href="index.html";}
        });
    });
});