// Global variables
let schedules = [];
let transactions = [];
let currentScheduleId = null;
let currentTransactionId = null;
let isEditMode = false;
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];

// Budget limits for each category (in USD)
const budgetLimits = {
    food: 200, // $200 for food
    transport: 100, // $100 for transport
    shopping: 300, // $300 for shopping
    entertainment: 150, // $150 for entertainment
    utilities: 200, // $200 for utilities
    health: 500, // $500 for health
    education: 1000, // $1000 for education
    other: 100 // $100 for other
};

// AI Category Classification Rules
const aiClassificationRules = {
    food: ['restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'coffee', 'cafe', 'pizza', 'burger', 'mcdonald', 'kfc', 'starbucks', 'grocery', 'supermarket', 'market', 'eat', 'drink', 'meal', 'snack'],
    transport: ['taxi', 'uber', 'grab', 'bus', 'train', 'metro', 'gas', 'fuel', 'parking', 'toll', 'transport', 'ride', 'car', 'bike', 'motorcycle', 'flight', 'airline', 'ticket'],
    shopping: ['shop', 'store', 'mall', 'amazon', 'ebay', 'clothes', 'shirt', 'dress', 'shoes', 'bag', 'watch', 'jewelry', 'cosmetics', 'beauty', 'fashion', 'retail', 'purchase', 'buy'],
    entertainment: ['movie', 'cinema', 'theater', 'concert', 'show', 'game', 'gaming', 'netflix', 'spotify', 'youtube', 'subscription', 'entertainment', 'fun', 'party', 'club', 'bar', 'pub'],
    utilities: ['electricity', 'water', 'gas', 'internet', 'phone', 'cable', 'utility', 'bill', 'payment', 'service', 'maintenance', 'repair'],
    health: ['doctor', 'hospital', 'clinic', 'pharmacy', 'medicine', 'drug', 'health', 'medical', 'dental', 'eye', 'vision', 'therapy', 'treatment', 'insurance'],
    education: ['school', 'university', 'college', 'course', 'book', 'education', 'learning', 'tuition', 'fee', 'student', 'study', 'training', 'class'],
    other: ['other', 'misc', 'miscellaneous', 'general', 'personal', 'gift', 'donation', 'charity', 'tip', 'fee', 'charge']
};

// Sample data
const sampleSchedules = [
    {
        id: 1,
        name: "Tiền điện",
        category: "utilities",
        amount: 150.00,
        currency: "USD",
        frequency: "monthly",
        weeklyDays: [],
        startDate: "2024-01-01",
        endDate: null,
        status: "active",
        notes: "Monthly electricity bill",
        nextOccurrence: "2024-12-15"
    },
    {
        id: 2,
        name: "Mở khóa gym",
        category: "health",
        amount: 50.00,
        currency: "USD",
        frequency: "monthly",
        weeklyDays: [],
        startDate: "2024-01-15",
        endDate: null,
        status: "active",
        notes: "Gym membership fee",
        nextOccurrence: "2024-12-15"
    },
    {
        id: 3,
        name: "Subscription Spotify",
        category: "subscriptions",
        amount: 9.99,
        currency: "USD",
        frequency: "monthly",
        weeklyDays: [],
        startDate: "2024-02-01",
        endDate: null,
        status: "active",
        notes: "Music streaming service",
        nextOccurrence: "2024-12-01"
    },
    {
        id: 4,
        name: "Coffee Daily",
        category: "entertainment",
        amount: 5.50,
        currency: "USD",
        frequency: "daily",
        weeklyDays: [],
        startDate: "2024-11-01",
        endDate: null,
        status: "paused",
        notes: "Daily coffee expense",
        nextOccurrence: "2024-12-16"
    }
];

const sampleTransactions = [
    {
        id: 1,
        description: "Lunch at McDonald's",
        amount: 12.50,
        type: "expense",
        category: "food",
        date: "2024-12-15",
        notes: "Quick lunch",
        aiPredictedCategory: "food"
    },
    {
        id: 2,
        description: "Uber ride to office",
        amount: 8.75,
        type: "expense",
        category: "transport",
        date: "2024-12-15",
        notes: "Morning commute",
        aiPredictedCategory: "transport"
    },
    {
        id: 3,
        description: "Netflix subscription",
        amount: 15.99,
        type: "expense",
        category: "entertainment",
        date: "2024-12-14",
        notes: "Monthly subscription",
        aiPredictedCategory: "entertainment"
    },
    {
        id: 4,
        description: "Salary payment",
        amount: 3000.00,
        type: "income",
        category: "other",
        date: "2024-12-01",
        notes: "Monthly salary",
        aiPredictedCategory: "other"
    },
    {
        id: 5,
        description: "Grocery shopping at Walmart",
        amount: 85.30,
        type: "expense",
        category: "food",
        date: "2024-12-13",
        notes: "Weekly groceries",
        aiPredictedCategory: "food"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    loadSchedules();
    updateSummaryStats();
});

function initializeApp() {
    // Load sample data
    schedules = [...sampleSchedules];
    transactions = [...sampleTransactions];
    
    // Set today's date as default for start date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleStartDate').value = today;
    document.getElementById('transactionDate').value = today;
}

function setupEventListeners() {
    // Authentication forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Password toggle buttons
    document.getElementById('toggleLoginPassword').addEventListener('click', togglePasswordVisibility);
    document.getElementById('toggleRegisterPassword').addEventListener('click', togglePasswordVisibility);
    
    // Modal controls
    document.getElementById('addScheduleBtn').addEventListener('click', openAddModal);
    document.getElementById('addTransactionBtn').addEventListener('click', openTransactionModal);
    document.getElementById('addTransactionBtn2').addEventListener('click', openTransactionModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmModal);
    
    // Form submission
    document.getElementById('scheduleForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // Frequency change handler
    document.getElementById('scheduleFrequency').addEventListener('change', handleFrequencyChange);
    
    // AI Classification
    document.getElementById('transactionDescription').addEventListener('input', handleDescriptionChange);
    document.getElementById('reclassifyBtn').addEventListener('click', reclassifyTransaction);
    
    // Filter and search
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // Transaction filters
    document.getElementById('transactionDateFilter').addEventListener('change', applyTransactionFilters);
    document.getElementById('transactionCategoryFilter').addEventListener('change', applyTransactionFilters);
    document.getElementById('transactionTypeFilter').addEventListener('change', applyTransactionFilters);
    document.getElementById('transactionSearchInput').addEventListener('input', applyTransactionFilters);
    
    // Detail modal actions
    document.getElementById('editScheduleBtn').addEventListener('click', editSchedule);
    document.getElementById('pauseScheduleBtn').addEventListener('click', pauseSchedule);
    document.getElementById('deleteScheduleBtn').addEventListener('click', deleteSchedule);
    
    // Confirmation modal
    document.getElementById('confirmBtn').addEventListener('click', confirmAction);
}

function loadSchedules() {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';
    
    if (schedules.length === 0) {
        scheduleList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
                <h3>No schedules found</h3>
                <p>Create your first scheduled expense to get started.</p>
            </div>
        `;
        return;
    }
    
    schedules.forEach(schedule => {
        const scheduleElement = createScheduleElement(schedule);
        scheduleList.appendChild(scheduleElement);
    });
}

function createScheduleElement(schedule) {
    const div = document.createElement('div');
    div.className = 'schedule-item';
    div.dataset.scheduleId = schedule.id;
    
    const currencySymbol = getCurrencySymbol(schedule.currency);
    const statusClass = schedule.status === 'active' ? 'status-active' : 'status-paused';
    const statusText = schedule.status === 'active' ? 'Active' : 'Paused';
    
    div.innerHTML = `
        <div class="schedule-info">
            <div class="schedule-name">${schedule.name}</div>
            <div class="schedule-amount">${currencySymbol}${schedule.amount.toFixed(2)}</div>
            <div class="schedule-frequency">${schedule.frequency}</div>
            <div class="schedule-date">${formatDate(schedule.startDate)}</div>
            <div class="schedule-date">${schedule.endDate ? formatDate(schedule.endDate) : 'Never'}</div>
            <div class="schedule-status ${statusClass}">${statusText}</div>
        </div>
        <div class="schedule-actions">
            <button class="action-btn" onclick="viewSchedule(${schedule.id})" title="View Details">
                <i class="bi bi-eye"></i>
            </button>
            <button class="action-btn" onclick="editSchedule(${schedule.id})" title="Edit">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="action-btn" onclick="toggleScheduleStatus(${schedule.id})" title="${schedule.status === 'active' ? 'Pause' : 'Resume'}">
                <i class="bi bi-${schedule.status === 'active' ? 'pause' : 'play'}-circle"></i>
            </button>
            <button class="action-btn delete" onclick="confirmDeleteSchedule(${schedule.id})" title="Delete">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

function openAddModal() {
    isEditMode = false;
    currentScheduleId = null;
    document.getElementById('scheduleModalLabel').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add New Schedule';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('weeklyDaysGroup').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
}

function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
    if (modal) modal.hide();
    document.getElementById('scheduleForm').reset();
}

function closeDetailModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
    if (modal) modal.hide();
}

function closeConfirmModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    if (modal) modal.hide();
}

function handleFrequencyChange() {
    const frequency = document.getElementById('scheduleFrequency').value;
    const weeklyDaysGroup = document.getElementById('weeklyDaysGroup');
    
    if (frequency === 'weekly') {
        weeklyDaysGroup.style.display = 'block';
    } else {
        weeklyDaysGroup.style.display = 'none';
        // Clear weekly days selection
        const checkboxes = weeklyDaysGroup.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const scheduleData = {
        name: formData.get('name'),
        category: formData.get('category'),
        amount: parseFloat(formData.get('amount')),
        currency: formData.get('currency'),
        frequency: formData.get('frequency'),
        weeklyDays: formData.getAll('weeklyDays'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate') || null,
        status: formData.get('status'),
        notes: formData.get('notes')
    };
    
    // Validation
    if (!scheduleData.name || !scheduleData.category || !scheduleData.amount || !scheduleData.frequency || !scheduleData.startDate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (scheduleData.frequency === 'weekly' && scheduleData.weeklyDays.length === 0) {
        showToast('Please select at least one day for weekly frequency', 'error');
        return;
    }
    
    if (isEditMode && currentScheduleId) {
        // Update existing schedule
        const index = schedules.findIndex(s => s.id === currentScheduleId);
        if (index !== -1) {
            schedules[index] = {
                ...schedules[index],
                ...scheduleData,
                nextOccurrence: calculateNextOccurrence(scheduleData)
            };
            showToast('Schedule updated successfully', 'success');
        }
    } else {
        // Add new schedule
        const newSchedule = {
            id: Date.now(),
            ...scheduleData,
            nextOccurrence: calculateNextOccurrence(scheduleData)
        };
        schedules.push(newSchedule);
        showToast('Schedule created successfully', 'success');
    }
    
    closeModal();
    loadSchedules();
    updateSummaryStats();
}

function viewSchedule(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    currentScheduleId = id;
    
    const currencySymbol = getCurrencySymbol(schedule.currency);
    const statusText = schedule.status === 'active' ? 'Active' : 'Paused';
    
    document.getElementById('detailModalLabel').innerHTML = `<i class="bi bi-info-circle me-2"></i>${schedule.name}`;
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-section">
            <h3>Basic Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Category:</label>
                    <span>${schedule.category}</span>
                </div>
                <div class="detail-item">
                    <label>Amount:</label>
                    <span>${currencySymbol}${schedule.amount.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <label>Frequency:</label>
                    <span>${schedule.frequency}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="schedule-status ${schedule.status === 'active' ? 'status-active' : 'status-paused'}">${statusText}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Schedule Details</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Start Date:</label>
                    <span>${formatDate(schedule.startDate)}</span>
                </div>
                <div class="detail-item">
                    <label>End Date:</label>
                    <span>${schedule.endDate ? formatDate(schedule.endDate) : 'Never'}</span>
                </div>
                <div class="detail-item">
                    <label>Next Occurrence:</label>
                    <span>${formatDate(schedule.nextOccurrence)}</span>
                </div>
            </div>
        </div>
        
        ${schedule.notes ? `
        <div class="detail-section">
            <h3>Notes</h3>
            <p>${schedule.notes}</p>
        </div>
        ` : ''}
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

function editSchedule(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    isEditMode = true;
    currentScheduleId = id;
    
    document.getElementById('scheduleModalLabel').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Schedule';
    document.getElementById('scheduleName').value = schedule.name;
    document.getElementById('scheduleCategory').value = schedule.category;
    document.getElementById('scheduleAmount').value = schedule.amount;
    document.getElementById('scheduleCurrency').value = schedule.currency;
    document.getElementById('scheduleFrequency').value = schedule.frequency;
    document.getElementById('scheduleStartDate').value = schedule.startDate;
    document.getElementById('scheduleEndDate').value = schedule.endDate || '';
    document.getElementById('scheduleStatus').value = schedule.status;
    document.getElementById('scheduleNotes').value = schedule.notes || '';
    
    // Handle weekly days
    handleFrequencyChange();
    if (schedule.frequency === 'weekly') {
        schedule.weeklyDays.forEach(day => {
            const checkbox = document.querySelector(`input[name="weeklyDays"][value="${day}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    closeDetailModal();
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
}

function toggleScheduleStatus(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    schedule.status = schedule.status === 'active' ? 'paused' : 'active';
    loadSchedules();
    updateSummaryStats();
    
    const action = schedule.status === 'active' ? 'resumed' : 'paused';
    showToast(`Schedule ${action} successfully`, 'success');
}

function confirmDeleteSchedule(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    currentScheduleId = id;
    document.getElementById('confirmMessage').textContent = `Are you sure you want to delete "${schedule.name}"? This action cannot be undone.`;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

function deleteSchedule() {
    const index = schedules.findIndex(s => s.id === currentScheduleId);
    if (index !== -1) {
        schedules.splice(index, 1);
        showToast('Schedule deleted successfully', 'success');
        loadSchedules();
        updateSummaryStats();
    }
    closeConfirmModal();
}

function confirmAction() {
    if (currentScheduleId) {
        deleteSchedule();
    }
}

function applyFilters() {
    const timeFilter = document.getElementById('timeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredSchedules = schedules.filter(schedule => {
        // Time filter
        if (timeFilter === 'upcoming') {
            const nextDate = new Date(schedule.nextOccurrence);
            const today = new Date();
            if (nextDate < today) return false;
        } else if (timeFilter === 'past') {
            const nextDate = new Date(schedule.nextOccurrence);
            const today = new Date();
            if (nextDate >= today) return false;
        }
        
        // Category filter
        if (categoryFilter !== 'all' && schedule.category !== categoryFilter) {
            return false;
        }
        
        // Status filter
        if (statusFilter !== 'all' && schedule.status !== statusFilter) {
            return false;
        }
        
        // Search filter
        if (searchTerm && !schedule.name.toLowerCase().includes(searchTerm) && 
            !(schedule.notes && schedule.notes.toLowerCase().includes(searchTerm))) {
            return false;
        }
        
        return true;
    });
    
    // Update display
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';
    
    if (filteredSchedules.length === 0) {
        scheduleList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
                <h3>No schedules found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }
    
    filteredSchedules.forEach(schedule => {
        const scheduleElement = createScheduleElement(schedule);
        scheduleList.appendChild(scheduleElement);
    });
}

function updateSummaryStats() {
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter(s => s.status === 'active');
    
    // Calculate monthly total
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let monthlyTotal = 0;
    
    activeSchedules.forEach(schedule => {
        if (schedule.frequency === 'monthly') {
            monthlyTotal += schedule.amount;
        } else if (schedule.frequency === 'weekly') {
            monthlyTotal += schedule.amount * 4.33; // Approximate weeks per month
        } else if (schedule.frequency === 'daily') {
            monthlyTotal += schedule.amount * 30; // Approximate days per month
        } else if (schedule.frequency === 'yearly') {
            monthlyTotal += schedule.amount / 12;
        }
    });
    
    // Find next payment
    const upcomingSchedules = activeSchedules
        .filter(s => new Date(s.nextOccurrence) >= new Date())
        .sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));
    
    const nextPayment = upcomingSchedules.length > 0 ? upcomingSchedules[0].nextOccurrence : null;
    
    document.getElementById('totalSchedules').textContent = totalSchedules;
    document.getElementById('monthlyTotal').textContent = `$${monthlyTotal.toFixed(2)}`;
    document.getElementById('nextPayment').textContent = nextPayment ? formatDate(nextPayment) : '-';
}

function calculateNextOccurrence(schedule) {
    const startDate = new Date(schedule.startDate);
    const today = new Date();
    let nextDate = new Date(startDate);
    
    while (nextDate <= today) {
        switch (schedule.frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
    }
    
    return nextDate.toISOString().split('T')[0];
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'VND': '₫',
        'EUR': '€'
    };
    return symbols[currency] || '$';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-warning';
    
    const toastHTML = `
        <div class="toast ${bgClass} text-white" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgClass} text-white border-0">
                <i class="bi bi-${icon} me-2"></i>
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Add CSS for detail modal
const detailStyles = `
.detail-section {
    margin-bottom: 24px;
}

.detail-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-item label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-item span {
    font-size: 14px;
    color: #374151;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
}

.empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
}

.empty-state p {
    font-size: 14px;
}

@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject detail styles
const styleSheet = document.createElement('style');
styleSheet.textContent = detailStyles;
document.head.appendChild(styleSheet);

// Authentication Functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAppContent();
    } else {
        showWelcomeScreen();
    }
}

function showWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('appContent').style.display = 'none';
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'none';
}

function showAppContent() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userProfile').style.display = 'block';
    document.getElementById('userDisplayName').textContent = currentUser.firstName + ' ' + currentUser.lastName;
    
    // Load user-specific schedules
    loadUserSchedules();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAppContent();
        showToast('Đăng nhập thành công!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('loginForm').reset();
    } else {
        showToast('Email hoặc mật khẩu không đúng!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (password.length < 8) {
        showToast('Mật khẩu phải có ít nhất 8 ký tự!', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showToast('Email đã được sử dụng!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showAppContent();
    showToast('Đăng ký thành công!', 'success');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    modal.hide();
    
    // Clear form
    document.getElementById('registerForm').reset();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showWelcomeScreen();
    showToast('Đã đăng xuất thành công!', 'success');
}

function togglePasswordVisibility(e) {
    const button = e.target.closest('button');
    const input = button.previousElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

function loadUserSchedules() {
    if (currentUser) {
        const userSchedules = JSON.parse(localStorage.getItem(`schedules_${currentUser.id}`)) || [];
        schedules = userSchedules.length > 0 ? userSchedules : [...sampleSchedules];
        loadSchedules();
        updateSummaryStats();
    }
}

function saveUserSchedules() {
    if (currentUser) {
        localStorage.setItem(`schedules_${currentUser.id}`, JSON.stringify(schedules));
    }
}

// Update existing functions to save user data
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const scheduleData = {
        name: formData.get('name'),
        category: formData.get('category'),
        amount: parseFloat(formData.get('amount')),
        currency: formData.get('currency'),
        frequency: formData.get('frequency'),
        weeklyDays: formData.getAll('weeklyDays'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate') || null,
        status: formData.get('status'),
        notes: formData.get('notes')
    };
    
    // Validation
    if (!scheduleData.name || !scheduleData.category || !scheduleData.amount || !scheduleData.frequency || !scheduleData.startDate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (scheduleData.frequency === 'weekly' && scheduleData.weeklyDays.length === 0) {
        showToast('Please select at least one day for weekly frequency', 'error');
        return;
    }
    
    if (isEditMode && currentScheduleId) {
        // Update existing schedule
        const index = schedules.findIndex(s => s.id === currentScheduleId);
        if (index !== -1) {
            schedules[index] = {
                ...schedules[index],
                ...scheduleData,
                nextOccurrence: calculateNextOccurrence(scheduleData)
            };
            showToast('Schedule updated successfully', 'success');
        }
    } else {
        // Add new schedule
        const newSchedule = {
            id: Date.now(),
            ...scheduleData,
            nextOccurrence: calculateNextOccurrence(scheduleData)
        };
        schedules.push(newSchedule);
        showToast('Schedule created successfully', 'success');
    }
    
    closeModal();
    loadSchedules();
    updateSummaryStats();
    saveUserSchedules(); // Save to user's data
}

// AI Classification Functions
function classifyTransaction(description) {
    const lowerDesc = description.toLowerCase();
    let bestMatch = 'other';
    let maxScore = 0;
    
    for (const [category, keywords] of Object.entries(aiClassificationRules)) {
        let score = 0;
        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword)) {
                score += 1;
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestMatch = category;
        }
    }
    
    return bestMatch;
}

function handleDescriptionChange() {
    const description = document.getElementById('transactionDescription').value;
    if (description.trim()) {
        const predictedCategory = classifyTransaction(description);
        document.getElementById('aiCategory').value = predictedCategory;
        document.getElementById('transactionCategory').value = predictedCategory;
    }
}

function reclassifyTransaction() {
    const description = document.getElementById('transactionDescription').value;
    if (description.trim()) {
        const predictedCategory = classifyTransaction(description);
        document.getElementById('aiCategory').value = predictedCategory;
        document.getElementById('transactionCategory').value = predictedCategory;
        showToast('Transaction reclassified!', 'success');
    }
}

// Transaction Management Functions
function openTransactionModal() {
    currentTransactionId = null;
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('aiCategory').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const transactionData = {
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        type: formData.get('type'),
        category: formData.get('category'),
        date: formData.get('date'),
        notes: formData.get('notes'),
        aiPredictedCategory: document.getElementById('aiCategory').value
    };
    
    // Validation
    if (!transactionData.description || !transactionData.amount || !transactionData.type || !transactionData.category || !transactionData.date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (transactionData.amount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }
    
    // Add new transaction
    const newTransaction = {
        id: Date.now(),
        ...transactionData
    };
    
    transactions.push(newTransaction);
    showToast('Transaction added successfully', 'success');
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
    modal.hide();
    
    loadTransactions();
    updateAnalytics();
    saveUserTransactions();
    checkBudgetAlerts();
}

function loadTransactions() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-cash-coin" style="font-size: 3rem; color: #dee2e6; margin-bottom: 1rem;"></i>
                <h3>No transactions found</h3>
                <p>Add your first transaction to get started.</p>
            </div>
        `;
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        transactionList.appendChild(transactionElement);
    });
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.dataset.transactionId = transaction.id;
    
    const typeClass = transaction.type === 'income' ? 'text-success' : 'text-danger';
    const typeIcon = transaction.type === 'income' ? 'bi-arrow-up-circle' : 'bi-arrow-down-circle';
    const amountPrefix = transaction.type === 'income' ? '+' : '-';
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-description">
                <h6 class="mb-1 fw-bold">${transaction.description}</h6>
                <small class="text-muted">${formatDate(transaction.date)}</small>
            </div>
            <div class="transaction-amount ${typeClass}">
                <i class="bi ${typeIcon} me-1"></i>
                ${amountPrefix}$${transaction.amount.toFixed(2)}
            </div>
            <div class="transaction-category">
                <span class="badge bg-primary">${transaction.category}</span>
            </div>
            <div class="transaction-notes">
                <small class="text-muted">${transaction.notes || ''}</small>
            </div>
        </div>
        <div class="transaction-actions">
            <button class="action-btn" onclick="editTransaction(${transaction.id})" title="Edit">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="action-btn delete" onclick="confirmDeleteTransaction(${transaction.id})" title="Delete">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

function applyTransactionFilters() {
    const dateFilter = document.getElementById('transactionDateFilter').value;
    const categoryFilter = document.getElementById('transactionCategoryFilter').value;
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    const searchTerm = document.getElementById('transactionSearchInput').value.toLowerCase();
    
    const filteredTransactions = transactions.filter(transaction => {
        // Date filter
        if (dateFilter !== 'all') {
            const transactionDate = new Date(transaction.date);
            const today = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (transactionDate.toDateString() !== today.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (transactionDate < weekAgo) return false;
                    break;
                case 'month':
                    if (transactionDate.getMonth() !== today.getMonth() || 
                        transactionDate.getFullYear() !== today.getFullYear()) return false;
                    break;
                case 'year':
                    if (transactionDate.getFullYear() !== today.getFullYear()) return false;
                    break;
            }
        }
        
        // Category filter
        if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
            return false;
        }
        
        // Type filter
        if (typeFilter !== 'all' && transaction.type !== typeFilter) {
            return false;
        }
        
        // Search filter
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm) && 
            !(transaction.notes && transaction.notes.toLowerCase().includes(searchTerm))) {
            return false;
        }
        
        return true;
    });
    
    // Update display
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';
    
    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-search" style="font-size: 3rem; color: #dee2e6; margin-bottom: 1rem;"></i>
                <h3>No transactions found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }
    
    filteredTransactions.forEach(transaction => {
        const transactionElement = createTransactionElement(transaction);
        transactionList.appendChild(transactionElement);
    });
}

function updateAnalytics() {
    const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySpent = transactions
        .filter(t => t.type === 'expense' && 
                    new Date(t.date).getMonth() === currentMonth && 
                    new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate over budget categories
    const categoryTotals = {};
    transactions
        .filter(t => t.type === 'expense' && 
                    new Date(t.date).getMonth() === currentMonth && 
                    new Date(t.date).getFullYear() === currentYear)
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
    
    const overBudgetCount = Object.entries(categoryTotals)
        .filter(([category, amount]) => budgetLimits[category] && amount > budgetLimits[category])
        .length;
    
    // Update UI
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('monthlySpent').textContent = `$${monthlySpent.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('overBudget').textContent = overBudgetCount;
    
    // Update category chart
    updateCategoryChart(categoryTotals);
    
    // Update budget alerts
    updateBudgetAlerts(categoryTotals);
}

function updateCategoryChart(categoryTotals) {
    const chartContainer = document.getElementById('categoryChart');
    
    if (Object.keys(categoryTotals).length === 0) {
        chartContainer.innerHTML = '<p class="text-muted text-center">No data to display</p>';
        return;
    }
    
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    let chartHTML = '<div class="row">';
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        chartHTML += `
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-semibold text-capitalize">${category}</span>
                    <span class="text-muted">$${amount.toFixed(2)}</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar" role="progressbar" style="width: ${percentage}%"></div>
                </div>
                <small class="text-muted">${percentage}%</small>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartContainer.innerHTML = chartHTML;
}

function updateBudgetAlerts(categoryTotals) {
    const alertsContainer = document.getElementById('budgetAlerts');
    let alertsHTML = '';
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const limit = budgetLimits[category];
        if (limit && amount > limit) {
            const overAmount = amount - limit;
            alertsHTML += `
                <div class="alert alert-danger d-flex align-items-center mb-2">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <div>
                        <strong>${category.toUpperCase()}</strong> over budget by $${overAmount.toFixed(2)}
                        <br><small>Spent: $${amount.toFixed(2)} / Limit: $${limit}</small>
                    </div>
                </div>
            `;
        }
    });
    
    if (alertsHTML === '') {
        alertsHTML = '<p class="text-muted text-center">No budget alerts</p>';
    }
    
    alertsContainer.innerHTML = alertsHTML;
}

function checkBudgetAlerts() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const categoryTotals = {};
    transactions
        .filter(t => t.type === 'expense' && 
                    new Date(t.date).getMonth() === currentMonth && 
                    new Date(t.date).getFullYear() === currentYear)
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const limit = budgetLimits[category];
        if (limit && amount > limit) {
            showToast(`${category.toUpperCase()} budget exceeded by $${(amount - limit).toFixed(2)}!`, 'warning');
        }
    });
}

function saveUserTransactions() {
    if (currentUser) {
        localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(transactions));
    }
}

function loadUserTransactions() {
    if (currentUser) {
        const userTransactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.id}`)) || [];
        transactions = userTransactions.length > 0 ? userTransactions : [...sampleTransactions];
        loadTransactions();
        updateAnalytics();
    }
}

// Update existing functions to load transactions
function showAppContent() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userProfile').style.display = 'block';
    document.getElementById('userDisplayName').textContent = currentUser.firstName + ' ' + currentUser.lastName;
    
    // Load user-specific data
    loadUserSchedules();
    loadUserTransactions();
}
