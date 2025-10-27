// API Configuration
const API_BASE_URL = 'https://sjmpadmin.onrender.com/api';

// Database Models for Website Content
class WebsiteAnnouncement {
    constructor(title, content, image = null) {
        this.title = title;
        this.content = content;
        this.image = image;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

class WebsiteEvent {
    constructor(title, date, description, image = null) {
        this.title = title;
        this.date = date;
        this.description = description;
        this.image = image;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

// Database Service
class WebsiteDBService {
    static async saveAnnouncement(announcementData) {
        try {
            const response = await fetch(`${API_BASE_URL}/website/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(announcementData)
            });

            if (!response.ok) throw new Error('Failed to save announcement');
            return await response.json();
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    }

    static async saveEvent(eventData) {
        try {
            const response = await fetch(`${API_BASE_URL}/website/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) throw new Error('Failed to save event');
            return await response.json();
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    }

    static async getAnnouncements() {
        try {
            const response = await fetch(`${API_BASE_URL}/website/announcements`);
            if (!response.ok) throw new Error('Failed to fetch announcements');
            return await response.json();
        } catch (error) {
            console.error('Database Error:', error);
            return [];
        }
    }

    static async getEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/website/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('Database Error:', error);
            return [];
        }
    }

    static async deleteAnnouncement(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/website/announcements/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete announcement');
            return true;
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    }

    static async deleteEvent(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/website/events/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete event');
            return true;
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    }
}

// UI Controller
class WebsiteDashboardUI {
    static init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    static setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function() {
                WebsiteDashboardUI.handleMenuClick(this);
            });
        });

        // Form handlers
        document.getElementById('saveAnnouncementBtn').addEventListener('click', () => this.saveAnnouncement());
        document.getElementById('saveEventBtn').addEventListener('click', () => this.saveEvent());
        
        // Add other event listeners...
    }

    static async handleMenuClick(menuItem) {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        menuItem.classList.add('active');
        
        document.querySelectorAll('.content-box').forEach(box => box.classList.remove('active'));
        const targetId = menuItem.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Load data for the selected tab
        switch(targetId) {
            case 'dashboard':
                await this.loadDashboardStats();
                break;
            case 'announcements':
                await this.loadAnnouncements();
                break;
            case 'events':
                await this.loadEvents();
                break;
        }
    }

    static async loadDashboardStats() {
        try {
            const announcements = await WebsiteDBService.getAnnouncements();
            const events = await WebsiteDBService.getEvents();
            
            document.getElementById('totalAnnouncements').textContent = announcements.length;
            document.getElementById('totalEvents').textContent = events.length;
        } catch (error) {
            AlertSystem.show('error', 'Error', 'Failed to load dashboard statistics');
        }
    }

    static async loadAnnouncements() {
        try {
            const announcements = await WebsiteDBService.getAnnouncements();
            this.displayAnnouncements(announcements);
        } catch (error) {
            AlertSystem.show('error', 'Error', 'Failed to load announcements');
        }
    }

    static async loadEvents() {
        try {
            const events = await WebsiteDBService.getEvents();
            this.displayEvents(events);
        } catch (error) {
            AlertSystem.show('error', 'Error', 'Failed to load events');
        }
    }

    static displayAnnouncements(announcements) {
        const list = document.getElementById('announcementsList');
        
        if (announcements.length === 0) {
            list.innerHTML = this.getEmptyStateHTML('announcements');
            return;
        }

        list.innerHTML = announcements.map(announcement => this.createAnnouncementHTML(announcement)).join('');
        this.attachPostEvents();
    }

    static displayEvents(events) {
        const list = document.getElementById('eventsList');
        
        if (events.length === 0) {
            list.innerHTML = this.getEmptyStateHTML('events');
            return;
        }

        list.innerHTML = events.map(event => this.createEventHTML(event)).join('');
        this.attachPostEvents();
    }

    static createAnnouncementHTML(announcement) {
        return `
            <div class="post-item" id="announcement-${announcement._id}">
                <div class="post-header">
                    <div class="post-title">${announcement.title}</div>
                    <div class="post-date">${new Date(announcement.createdAt).toLocaleDateString()}</div>
                </div>
                ${announcement.image ? `
                    <div class="post-image">
                        <img src="${announcement.image}" alt="Announcement Image">
                    </div>
                ` : ''}
                <div class="post-content">${announcement.content}</div>
                <div class="post-actions">
                    <button class="edit-btn" data-id="${announcement._id}" data-type="announcement">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" data-id="${announcement._id}" data-type="announcement">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    static createEventHTML(event) {
        return `
            <div class="post-item" id="event-${event._id}">
                <div class="post-header">
                    <div class="post-title">${event.title}</div>
                    <div class="post-date">
                        ${new Date(event.date).toLocaleDateString()} • 
                        ${new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                ${event.image ? `
                    <div class="post-image">
                        <img src="${event.image}" alt="Event Image">
                    </div>
                ` : ''}
                <div class="post-content">${event.description}</div>
                <div class="post-actions">
                    <button class="edit-btn" data-id="${event._id}" data-type="event">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" data-id="${event._id}" data-type="event">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    static getEmptyStateHTML(type) {
        const icons = {
            announcements: 'fa-bullhorn',
            events: 'fa-calendar-alt'
        };
        const messages = {
            announcements: 'No announcements yet. Create your first announcement!',
            events: 'No events scheduled yet. Create your first event!'
        };

        return `
            <div style="text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas ${icons[type]}" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>${messages[type]}</p>
            </div>
        `;
    }

    static attachPostEvents() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                AlertSystem.show('info', 'Edit Feature', 'Edit functionality will be implemented soon!');
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                
                AlertSystem.show('info', 'Delete', `Are you sure you want to delete this ${type}?`, true, async (confirmed) => {
                    if (confirmed) {
                        try {
                            if (type === 'announcement') {
                                await WebsiteDBService.deleteAnnouncement(id);
                                await this.loadAnnouncements();
                            } else {
                                await WebsiteDBService.deleteEvent(id);
                                await this.loadEvents();
                            }
                            await this.loadDashboardStats();
                            AlertSystem.show('success', 'Success', `${type} deleted successfully!`);
                        } catch (error) {
                            AlertSystem.show('error', 'Error', `Failed to delete ${type}`);
                        }
                    }
                });
            });
        });
    }

    static async saveAnnouncement() {
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        const imageFile = document.getElementById('announcementImage').files[0];

        if (!title || !content) {
            AlertSystem.show('error', 'Error', 'Please fill in all required fields');
            return;
        }

        try {
            const announcementData = {
                title,
                content,
                image: imageFile ? await this.convertImageToBase64(imageFile) : null,
                createdAt: new Date().toISOString()
            };

            await WebsiteDBService.saveAnnouncement(announcementData);
            
            document.getElementById('announcementForm').style.display = 'none';
            this.resetForm('announcement');
            await this.loadAnnouncements();
            await this.loadDashboardStats();
            
            AlertSystem.show('success', 'Success', 'Announcement published successfully!');
        } catch (error) {
            AlertSystem.show('error', 'Error', 'Failed to save announcement');
        }
    }

    static async saveEvent() {
        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        const description = document.getElementById('eventDescription').value;
        const imageFile = document.getElementById('eventImage').files[0];

        if (!title || !date || !description) {
            AlertSystem.show('error', 'Error', 'Please fill in all required fields');
            return;
        }

        try {
            const eventData = {
                title,
                date,
                description,
                image: imageFile ? await this.convertImageToBase64(imageFile) : null,
                createdAt: new Date().toISOString()
            };

            await WebsiteDBService.saveEvent(eventData);
            
            document.getElementById('eventForm').style.display = 'none';
            this.resetForm('event');
            await this.loadEvents();
            await this.loadDashboardStats();
            
            AlertSystem.show('success', 'Success', 'Event published successfully!');
        } catch (error) {
            AlertSystem.show('error', 'Error', 'Failed to save event');
        }
    }

    static async convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    static resetForm(type) {
        const fields = type === 'announcement' 
            ? ['announcementTitle', 'announcementContent', 'announcementImage', 'announcementImagePreview']
            : ['eventTitle', 'eventDate', 'eventDescription', 'eventImage', 'eventImagePreview'];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element.type === 'file') element.value = '';
            else if (field.includes('Preview')) {
                element.innerHTML = '';
                element.style.display = 'none';
            }
            else element.value = '';
        });
    }

    static loadInitialData() {
        this.loadDashboardStats();
        this.loadAnnouncements();
        this.loadEvents();
    }
}

// Alert System
class AlertSystem {
    static show(type, title, message, confirmDialog = false, callback = null) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        const alertHTML = `
            <div class="alert-overlay" id="${alertId}">
                <div class="alert-popup alert-${type}">
                    <i class="fas ${icon} alert-icon"></i>
                    <div class="alert-title">${title}</div>
                    <div class="alert-message">${message}</div>
                    <div class="alert-actions">
                        ${confirmDialog ? `
                            <button class="btn" onclick="AlertSystem.handleResponse('${alertId}', true)">Yes</button>
                            <button class="btn" style="background: var(--gray);" onclick="AlertSystem.handleResponse('${alertId}', false)">No</button>
                        ` : `
                            <button class="btn" onclick="AlertSystem.close('${alertId}')">OK</button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        const alertElement = document.getElementById(alertId);
        setTimeout(() => alertElement.classList.add('show'), 10);
        
        if (callback) {
            this.callbacks = this.callbacks || {};
            this.callbacks[alertId] = callback;
        }
    }

    static handleResponse(id, response) {
        this.close(id);
        if (this.callbacks && this.callbacks[id]) {
            this.callbacks[id](response);
            delete this.callbacks[id];
        }
    }

    static close(id) {
        const alert = document.getElementById(id);
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    WebsiteDashboardUI.init();
});