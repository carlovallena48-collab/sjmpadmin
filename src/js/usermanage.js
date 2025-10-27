const API_URL = "https://sjmpadmin.onrender.com/api/users";
const LOG_URL = "https://sjmpadmin.onrender.com/api/dashboard/activity-log";
const BAPTISM_API = "https://sjmpadmin.onrender.com/api/baptism";
const CONFIRMATION_API = "https://sjmpadmin.onrender.com/api/confirmation";
const MATRIMONY_API = "https://sjmpadmin.onrender.com/api/matrimony";
const EUCHARIST_API = "https://sjmpadmin.onrender.com/api/eucharist";
const HOLY_ORDERS_API = "https://sjmpadmin.onrender.com/api/holy-orders";
const PAMISA_API = "https://sjmpadmin.onrender.com/api/pamisa";
const FUNERAL_API = "https://sjmpadmin.onrender.com/api/funeralrequests";
const BLESSING_API = "https://sjmpadmin.onrender.com/api/blessing";
const CERTIFICATE_API = "https://sjmpadmin.onrender.com/api/certificates";

let users = [];
let deleteId = null;
let currentUserHistory = [];

document.addEventListener("DOMContentLoaded", async () => {
    setActiveNavLink();
    await fetchUsers();
    document.getElementById("searchInput").addEventListener("input", filterTable);
    document.getElementById("userForm").addEventListener("submit", handleFormSubmit);
    document.getElementById("confirmDeleteBtn").addEventListener("click", deleteUser);
    
    // Sidebar toggle functionality - FROM CERTIFICATE PAGE
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Dropdown functionality - FROM CERTIFICATE PAGE
    document.querySelectorAll('.nav-dropdown > a').forEach(function(dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });
});

// ========== FETCH USERS ==========
async function fetchUsers() {
    try {
        const res = await fetch(API_URL);
        users = await res.json();
        
        // Fetch schedule counts for each user
        for (let user of users) {
            user.scheduleCount = await getUserScheduleCount(user.email);
        }
        
        renderTable(users);
    } catch (err) {
        console.error(err);
        showCustomAlert("Failed to load users","error");
    }
}

// Get user's schedule count from all sacrament APIs
async function getUserScheduleCount(userEmail) {
    try {
        let totalCount = 0;
        
        // Fetch baptism schedules
        const baptismRes = await fetch(BAPTISM_API);
        const baptismData = await baptismRes.json();
        const baptismCount = baptismData.filter(schedule => 
            schedule.submittedByEmail && schedule.submittedByEmail === userEmail
        ).length;
        
        // Fetch confirmation schedules
        const confirmationRes = await fetch(CONFIRMATION_API);
        const confirmationData = await confirmationRes.json();
        const confirmationCount = confirmationData.filter(schedule => 
            schedule.submittedByEmail && schedule.submittedByEmail === userEmail
        ).length;
        
        // Fetch matrimony schedules
        try {
            const matrimonyRes = await fetch(MATRIMONY_API);
            const matrimonyData = await matrimonyRes.json();
            const matrimonyCount = matrimonyData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += matrimonyCount;
        } catch (error) {
            console.warn("Matrimony API not available:", error);
        }
        
        // Fetch eucharist schedules
        try {
            const eucharistRes = await fetch(EUCHARIST_API);
            const eucharistData = await eucharistRes.json();
            const eucharistCount = eucharistData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += eucharistCount;
        } catch (error) {
            console.warn("Eucharist API not available:", error);
        }
        
        // Fetch holy orders schedules
        try {
            const holyOrdersRes = await fetch(HOLY_ORDERS_API);
            const holyOrdersData = await holyOrdersRes.json();
            const holyOrdersCount = holyOrdersData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += holyOrdersCount;
        } catch (error) {
            console.warn("Holy Orders API not available:", error);
        }
        
        // Fetch pamisa schedules
        try {
            const pamisaRes = await fetch(PAMISA_API);
            const pamisaData = await pamisaRes.json();
            const pamisaCount = pamisaData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += pamisaCount;
        } catch (error) {
            console.warn("Pamisa API not available:", error);
        }
        
        // Fetch funeral schedules
        try {
            const funeralRes = await fetch(FUNERAL_API);
            const funeralData = await funeralRes.json();
            const funeralCount = funeralData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += funeralCount;
        } catch (error) {
            console.warn("Funeral API not available:", error);
        }
        
        // Fetch blessing schedules
        try {
            const blessingRes = await fetch(BLESSING_API);
            const blessingData = await blessingRes.json();
            const blessingCount = blessingData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += blessingCount;
        } catch (error) {
            console.warn("Blessing API not available:", error);
        }
        
        // Fetch certificate requests
        try {
            const certificateRes = await fetch(CERTIFICATE_API);
            const certificateData = await certificateRes.json();
            const certificateCount = certificateData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).length;
            totalCount += certificateCount;
        } catch (error) {
            console.warn("Certificate API not available:", error);
        }
        
        totalCount = baptismCount + confirmationCount + totalCount;
        return totalCount;
        
    } catch (error) {
        console.error("Error fetching schedule count:", error);
        return 0;
    }
}

function renderTable(data) {
    const tbody = document.querySelector("#userTable tbody");
    const emptyState = document.getElementById("emptyState");
    tbody.innerHTML = "";
    if (!data || data.length === 0) { 
        emptyState.style.display = "block"; 
        return; 
    } else emptyState.style.display = "none";

    data.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="user-profile-cell">
                <img src="https://i.pravatar.cc/150?u=${user._id}" alt="${user.fullName}">
                <span>${user.fullName}</span>
            </td>
            <td>${user.role || ""}</td>
            <td>${user.address || ""}</td>
            <td>${user.contact || ""}</td>
            <td>${user.scheduleCount || 0}</td>
            <td class="action-buttons">
                <button class="view-btn" onclick="viewUserDetails('${user._id}')"><i class="fas fa-eye"></i></button>
                <button class="edit-btn" onclick="showUserForm('${user._id}')"><i class="fas fa-pen-to-square"></i></button>
                <button class="delete-btn" onclick="showConfirmModal('${user._id}')"><i class="fas fa-trash"></i></button>
            </td>`;
        tbody.appendChild(row);
    });
}

// ========== SEARCH ==========
function filterTable() {
    const filter = document.getElementById("searchInput").value.toLowerCase();
    const filtered = users.filter(u =>
        (u.fullName && u.fullName.toLowerCase().includes(filter)) || 
        (u.username && u.username.toLowerCase().includes(filter))
    );
    renderTable(filtered);
}

// ========== ADD/EDIT ==========
async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("userId").value;
    const userData = {
        password: document.getElementById("password").value,
        email: document.getElementById("userEmail").value,
        fullName: document.getElementById("fullName").value,
        role: document.getElementById("userRole").value,
        address: document.getElementById("userAddress").value,
        contact: document.getElementById("userContact").value
    };

    try {
        let actionType = "";
        if(id){
            delete userData.password;
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(userData)
            });
            actionType = "UPDATE";
        } else {
            await fetch(API_URL, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(userData)
            });
            actionType = "CREATE";
        }
        closeUserForm();
        await fetchUsers();

        await fetch(LOG_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({action: actionType, collection:"users", userFullName:userData.fullName, email:userData.email, timestamp:new Date()})
        });
        showCustomAlert(`User ${id ? 'updated' : 'added'} successfully!`,"success");

    } catch(err){
        console.error(err);
        showCustomAlert("Failed to save user","error");
    }
}

function showUserForm(id=null){
    const modal = document.getElementById("userModal");
    const form = document.getElementById("userForm");
    const title = document.getElementById("modalTitle");

    form.reset();
    document.getElementById("userId").value = "";
    document.getElementById("password").closest('.form-group').style.display = id ? 'none' : 'block';
    document.getElementById("password").required = !id;

    if(id){
        const user = users.find(u => u._id === id);
        if(user){
            title.textContent = "Edit User";
            document.getElementById("userId").value = user._id;
    
            document.getElementById("userEmail").value = user.email || "";
            document.getElementById("fullName").value = user.fullName || "";
            document.getElementById("userRole").value = user.role || "Member";
            document.getElementById("userAddress").value = user.address || "";
            document.getElementById("userContact").value = user.contact || "";
        }
    } else {
        title.textContent = "Add New User";
    }
    modal.classList.add("show");
}

function closeUserForm(){document.getElementById("userModal").classList.remove("show");}

// ========== VIEW USER DETAILS WITH SCHEDULE HISTORY ==========
async function viewUserDetails(id){
    const user = users.find(u => u._id === id);
    if(!user) return;

    // Store user ID for tab switching
    document.getElementById("viewUserModal").dataset.userId = id;

    // Set basic user info
    document.getElementById("viewUserImage").src = `https://i.pravatar.cc/150?u=${user._id}`;
    document.getElementById("viewUserName").textContent = user.fullName || "";
    document.getElementById("viewfullName").textContent = user.fullName || "";
    document.getElementById("viewUserRole").textContent = user.role || "";
    document.getElementById("viewUserEmail").textContent = user.email || "";
    document.getElementById("viewUserContact").textContent = user.contact || "";
    document.getElementById("viewUserAddress").textContent = user.address || "";

    // Load schedule history
    await loadUserScheduleHistory(user.email);

    document.getElementById("viewUserModal").classList.add("show");
}

// Load user's schedule history from all sacrament APIs
async function loadUserScheduleHistory(userEmail) {
    try {
        document.getElementById("historyTableBody").innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading schedule history...</p>
                </td>
            </tr>
        `;

        let allSchedules = [];

        // Fetch baptism schedules
        try {
            const baptismRes = await fetch(BAPTISM_API);
            const baptismData = await baptismRes.json();
            const userBaptismSchedules = baptismData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Baptism',
                name: schedule.name,
                date: schedule.baptismDate,
                time: schedule.baptismTime,
                status: schedule.status || 'pending',
                type: 'baptism'
            }));
            allSchedules = [...allSchedules, ...userBaptismSchedules];
        } catch (error) {
            console.error("Error fetching baptism schedules:", error);
        }

        // Fetch confirmation schedules
        try {
            const confirmationRes = await fetch(CONFIRMATION_API);
            const confirmationData = await confirmationRes.json();
            const userConfirmationSchedules = confirmationData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Confirmation',
                name: schedule.confirmandName || schedule.name || 'N/A',
                date: schedule.kumpilDate || schedule.date,
                time: schedule.kumpilTime || schedule.time,
                status: schedule.status || 'pending',
                type: 'confirmation'
            }));
            allSchedules = [...allSchedules, ...userConfirmationSchedules];
        } catch (error) {
            console.error("Error fetching confirmation schedules:", error);
        }

        // Fetch matrimony schedules
        try {
            const matrimonyRes = await fetch(MATRIMONY_API);
            const matrimonyData = await matrimonyRes.json();
            const userMatrimonySchedules = matrimonyData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Matrimony',
                name: schedule.groomName && schedule.brideName ? `${schedule.groomName} & ${schedule.brideName}` : 'N/A',
                date: schedule.marriageDate || schedule.date,
                time: schedule.marriageTime || schedule.time,
                status: schedule.status || 'pending',
                type: 'matrimony'
            }));
            allSchedules = [...allSchedules, ...userMatrimonySchedules];
        } catch (error) {
            console.warn("Matrimony API not available:", error);
        }

        // Fetch eucharist schedules
        try {
            const eucharistRes = await fetch(EUCHARIST_API);
            const eucharistData = await eucharistRes.json();
            const userEucharistSchedules = eucharistData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Eucharist',
                name: schedule.name || 'N/A',
                date: schedule.date,
                time: schedule.time,
                status: schedule.status || 'pending',
                type: 'eucharist'
            }));
            allSchedules = [...allSchedules, ...userEucharistSchedules];
        } catch (error) {
            console.warn("Eucharist API not available:", error);
        }

        // Fetch holy orders schedules
        try {
            const holyOrdersRes = await fetch(HOLY_ORDERS_API);
            const holyOrdersData = await holyOrdersRes.json();
            const userHolyOrdersSchedules = holyOrdersData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Holy Orders',
                name: schedule.name || 'N/A',
                date: schedule.ordinationDate || schedule.date,
                time: schedule.ordinationTime || schedule.time,
                status: schedule.status || 'pending',
                type: 'holy-orders'
            }));
            allSchedules = [...allSchedules, ...userHolyOrdersSchedules];
        } catch (error) {
            console.warn("Holy Orders API not available:", error);
        }

        // Fetch pamisa schedules
        try {
            const pamisaRes = await fetch(PAMISA_API);
            const pamisaData = await pamisaRes.json();
            const userPamisaSchedules = pamisaData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Pamisa',
                name: schedule.names && schedule.names.length > 0 ? schedule.names[0] : 'N/A',
                date: schedule.date,
                time: schedule.time,
                status: schedule.status || 'pending',
                type: 'pamisa'
            }));
            allSchedules = [...allSchedules, ...userPamisaSchedules];
        } catch (error) {
            console.warn("Pamisa API not available:", error);
        }

        // Fetch funeral schedules
        try {
            const funeralRes = await fetch(FUNERAL_API);
            const funeralData = await funeralRes.json();
            const userFuneralSchedules = funeralData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Funeral Service',
                name: schedule.nameOfDeceased || 'N/A',
                date: schedule.scheduleDate,
                time: schedule.scheduleTime,
                status: schedule.status || 'pending',
                type: 'funeral'
            }));
            allSchedules = [...allSchedules, ...userFuneralSchedules];
        } catch (error) {
            console.warn("Funeral API not available:", error);
        }

        // Fetch blessing schedules
        try {
            const blessingRes = await fetch(BLESSING_API);
            const blessingData = await blessingRes.json();
            const userBlessingSchedules = blessingData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Blessing',
                name: schedule.name || 'N/A',
                date: schedule.date,
                time: schedule.time,
                status: schedule.status || 'pending',
                type: 'blessing'
            }));
            allSchedules = [...allSchedules, ...userBlessingSchedules];
        } catch (error) {
            console.warn("Blessing API not available:", error);
        }

        // Fetch certificate requests
        try {
            const certificateRes = await fetch(CERTIFICATE_API);
            const certificateData = await certificateRes.json();
            const userCertificateSchedules = certificateData.filter(schedule => 
                schedule.submittedByEmail && schedule.submittedByEmail === userEmail
            ).map(schedule => ({
                sacrament: 'Certificate - ' + schedule.certificateType,
                name: schedule.fullName || 'N/A',
                date: schedule.scheduledDate || schedule.requestDate,
                time: 'N/A',
                status: schedule.status || 'pending',
                type: 'certificate'
            }));
            allSchedules = [...allSchedules, ...userCertificateSchedules];
        } catch (error) {
            console.warn("Certificate API not available:", error);
        }

        console.log("All schedules for", userEmail, ":", allSchedules);
        currentUserHistory = allSchedules;
        updateHistoryStats(allSchedules);
        renderHistoryTable(allSchedules);

    } catch (error) {
        console.error("Error loading schedule history:", error);
        document.getElementById("historyTableBody").innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading schedule history</p>
                </td>
            </tr>
        `;
    }
}

// Update statistics counters
function updateHistoryStats(schedules) {
    const baptismCount = schedules.filter(s => s.type === 'baptism').length;
    const confirmationCount = schedules.filter(s => s.type === 'confirmation').length;
    const eucharistCount = schedules.filter(s => s.type === 'eucharist').length;
    const matrimonyCount = schedules.filter(s => s.type === 'matrimony').length;
    const holyOrdersCount = schedules.filter(s => s.type === 'holy-orders').length;
    const pamisaCount = schedules.filter(s => s.type === 'pamisa').length;
    const funeralCount = schedules.filter(s => s.type === 'funeral').length;
    const blessingCount = schedules.filter(s => s.type === 'blessing').length;
    const certificateCount = schedules.filter(s => s.type === 'certificate').length;

    document.getElementById('baptismCount').textContent = baptismCount;
    document.getElementById('confirmationCount').textContent = confirmationCount;
    document.getElementById('eucharistCount').textContent = eucharistCount;
    document.getElementById('matrimonyCount').textContent = matrimonyCount;

    // You can add more stat cards for other sacraments if needed
}

// Render history table
function renderHistoryTable(schedules) {
    const tbody = document.getElementById("historyTableBody");
    const emptyState = document.getElementById("historyEmptyState");

    tbody.innerHTML = "";

    if (schedules.length === 0) {
        emptyState.style.display = "block";
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    <i class="fas fa-calendar-times"></i>
                    <p>No schedule history found</p>
                </td>
            </tr>
        `;
        return;
    }

    emptyState.style.display = "none";

    schedules.forEach(schedule => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <span class="sacrament-badge ${schedule.type}">${schedule.sacrament}</span>
            </td>
            <td>${schedule.name || 'N/A'}</td>
            <td>${schedule.date ? new Date(schedule.date).toLocaleDateString() : 'N/A'}</td>
            <td>${schedule.time || 'N/A'}</td>
            <td><span class="status-badge ${schedule.status}">${schedule.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Filter history table
function filterHistory() {
    const sacramentFilter = document.getElementById("sacramentFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    let filtered = currentUserHistory;

    if (sacramentFilter !== 'all') {
        filtered = filtered.filter(schedule => schedule.sacrament === sacramentFilter);
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    renderHistoryTable(filtered);
}

function closeViewUserModal(){ 
    document.getElementById("viewUserModal").classList.remove("show");
    currentUserHistory = [];
    delete document.getElementById("viewUserModal").dataset.userId;
}

// ========== DELETE ==========
function showConfirmModal(id){ 
    deleteId = id;
    document.getElementById("confirmModal").classList.add("show");
}

function closeConfirmModal(){ 
    document.getElementById("confirmModal").classList.remove("show");
    deleteId=null;
}

async function deleteUser(){
    if(!deleteId) return;
    const user = users.find(u => u._id === deleteId);

    try {
        const res = await fetch(`${API_URL}/${deleteId}`, { method:"DELETE" });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to delete user");
        }

        showCustomAlert("User deleted successfully!","success");
        closeConfirmModal();
        await fetchUsers();

        if(user){
            await fetch(LOG_URL, {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    action:"DELETE",
                    collection:"users",
                    userFullName:user.fullName,
                    email:user.email,
                    timestamp:new Date()
                })
            });
        }

    } catch(err){
        console.error("Delete error:", err);
        showCustomAlert("Failed to delete user: " + err.message,"error");
    }
}

// ========== ALERT ==========
function showCustomAlert(message,type){
    const container = document.getElementById("alertContainer");
    const alert = document.createElement("div");
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `
        <i class="custom-alert-icon fas ${type==='success'?'fa-check-circle':'fa-times-circle'}"></i>
        <span class="custom-alert-message">${message}</span>
        <button class="custom-alert-close" onclick="this.closest('.custom-alert').remove()">&times;</button>
    `;
    container.appendChild(alert);
    setTimeout(()=>{alert.style.animation="slideOutRight .5s ease-in forwards"},5000);
    setTimeout(()=>alert.remove(),5500);
}

// ========== NAV ACTIVE ==========
function setActiveNavLink() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        if(link.getAttribute('href')===path){
            link.classList.add('active');
            const parent = link.closest('.nav-dropdown');
            if(parent) parent.classList.add('open');
        }
    });
}

// ========== TABS ==========
function switchTab(tab){
    document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.querySelector(`.tab-button[onclick*='${tab}']`).classList.add('active');
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    // Refresh history when switching to history tab
    if (tab === 'history') {
        const userId = document.getElementById("viewUserModal").dataset.userId;
        const user = users.find(u => u._id === userId);
        if (user) {
            loadUserScheduleHistory(user.email);
        }
    }
}