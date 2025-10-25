// DOM Elements
const batchContainer = document.getElementById('batchContainer');
const batchDetailsSection = document.getElementById('batchDetailsSection');
const searchBtn = document.getElementById('searchBtn');
const batchSearch = document.getElementById('batchSearch');

// Dashboard Stats Elements
const totalBatchesEl = document.getElementById('totalBatches');
const inTransitEl = document.getElementById('inTransit');
const safeBatchesEl = document.getElementById('safeBatches');
const atRiskBatchesEl = document.getElementById('atRiskBatches');
const unsafeBatchesEl = document.getElementById('unsafeBatches');

// Batch Detail Elements
const detailBatchId = document.getElementById('detailBatchId');
const detailStatus = document.getElementById('detailStatus');
const detailTemp = document.getElementById('detailTemp');
const detailLocation = document.getElementById('detailLocation');
const detailStage = document.getElementById('detailStage');
const scanHistoryBody = document.getElementById('scanHistoryBody');

// Stage Elements
const stageElements = {
    'Factory': document.getElementById('stageFactory'),
    'Hub': document.getElementById('stageHub'),
    'Storage': document.getElementById('stageStorage'),
    'Hospital': document.getElementById('stageHospital'),
    'Patient': document.getElementById('stagePatient')
};

// Initialize the application
function initApp() {
    fetchBatches();
    setupEventListeners();
    
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        refreshData();
    }, 30000);
}

// Fetch all batches from the API
function fetchBatches() {
    fetch('/api/batches')
        .then(response => response.json())
        .then(data => {
            updateDashboardStats(data);
            renderBatchCards(data);
        })
        .catch(error => {
            console.error('Error fetching batches:', error);
        });
}

// Refresh data from the API
function refreshData() {
    fetch('/api/refresh-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchBatches();
                
                // If a batch is selected, update its details too
                const selectedBatchId = detailBatchId.textContent;
                if (selectedBatchId !== 'Select a batch to view details') {
                    fetchBatchDetails(selectedBatchId);
                }
            }
        })
        .catch(error => {
            console.error('Error refreshing data:', error);
        });
}

// Fetch details for a specific batch
function fetchBatchDetails(batchId) {
    fetch(`/api/batches/${batchId}`)
        .then(response => response.json())
        .then(batch => {
            if (batch.error) {
                alert(batch.error);
            } else {
                showBatchDetails(batch);
            }
        })
        .catch(error => {
            console.error('Error fetching batch details:', error);
        });
}

// Update dashboard statistics
function updateDashboardStats(batches) {
    const total = batches.length;
    const inTransit = batches.filter(b => b.stage !== 'Patient').length;
    const safe = batches.filter(b => b.status === 'Safe').length;
    const atRisk = batches.filter(b => b.status === 'At Risk').length;
    const unsafe = batches.filter(b => b.status === 'Unsafe').length;
    
    totalBatchesEl.textContent = total;
    inTransitEl.textContent = inTransit;
    safeBatchesEl.textContent = safe;
    atRiskBatchesEl.textContent = atRisk;
    unsafeBatchesEl.textContent = unsafe;
}

// Render batch cards in the live data section
function renderBatchCards(batches) {
    batchContainer.innerHTML = '';
    
    batches.forEach(batch => {
        const card = document.createElement('div');
        card.className = `batch-card ${getStatusClass(batch.status)}`;
        card.dataset.batchId = batch.id;
        
        const lastUpdatedTime = formatTimeAgo(new Date(batch.lastUpdated));
        
        card.innerHTML = `
            <h3>
                ${batch.id}
                <span class="status-badge ${getStatusClass(batch.status)}">${batch.status}</span>
            </h3>
            <div class="batch-info">
                <div class="info-item">
                    <h4>Temperature</h4>
                    <p>${batch.temperature}°C</p>
                </div>
                <div class="info-item">
                    <h4>Current Stage</h4>
                    <p>${batch.stage}</p>
                </div>
                <div class="info-item">
                    <h4>Location</h4>
                    <p>${formatLocation(batch.location)}</p>
                </div>
                <div class="info-item">
                    <h4>Last Updated</h4>
                    <p>${lastUpdatedTime}</p>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            fetchBatchDetails(batch.id);
            
            // Add active class to the selected card
            document.querySelectorAll('.batch-card').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
        });
        
        batchContainer.appendChild(card);
    });
}

// Show detailed information for a selected batch
function showBatchDetails(batch) {
    detailBatchId.textContent = batch.id;
    detailStatus.textContent = batch.status;
    detailStatus.className = `status-badge ${getStatusClass(batch.status)}`;
    detailTemp.textContent = `${batch.temperature}°C`;
    detailLocation.textContent = formatLocation(batch.location);
    detailStage.textContent = batch.stage;
    
    // Update stage tracker
    updateStageTracker(batch.stage);
    
    // Populate scan history
    populateScanHistory(batch.scanHistory);
    
    // Scroll to the details section
    batchDetailsSection.scrollIntoView({ behavior: 'smooth' });
}

// Update the stage tracker based on current stage
function updateStageTracker(currentStage) {
    const stages = ['Factory', 'Hub', 'Storage', 'Hospital', 'Patient'];
    const currentIndex = stages.indexOf(currentStage);
    
    // Reset all stages
    stages.forEach(stage => {
        stageElements[stage].classList.remove('active', 'completed');
    });
    
    // Mark completed and active stages
    for (let i = 0; i < stages.length; i++) {
        if (i < currentIndex) {
            stageElements[stages[i]].classList.add('completed');
        } else if (i === currentIndex) {
            stageElements[stages[i]].classList.add('active');
        }
    }
    
    // Update connectors
    const connectors = document.querySelectorAll('.stage-connector');
    connectors.forEach((connector, index) => {
        connector.classList.remove('completed');
        if (index < currentIndex) {
            connector.classList.add('completed');
        }
    });
}

// Populate the scan history table
function populateScanHistory(history) {
    scanHistoryBody.innerHTML = '';
    
    // Sort history by timestamp (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedHistory.forEach(scan => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDateTime(new Date(scan.timestamp))}</td>
            <td>${formatLocation(scan.location)}</td>
            <td>${scan.scannedBy}</td>
            <td>${scan.device}</td>
            <td>${scan.temperature}°C</td>
            <td><span class="status-badge ${getStatusClass(scan.status)}">${scan.status}</span></td>
        `;
        
        scanHistoryBody.appendChild(row);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    batchSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Handle batch search
function handleSearch() {
    const searchTerm = batchSearch.value.trim().toUpperCase();
    
    if (!searchTerm) {
        alert('Please enter a Batch ID to search');
        return;
    }
    
    fetch(`/api/batches/${searchTerm}`)
        .then(response => response.json())
        .then(batch => {
            if (batch.error) {
                alert(`No batch found with ID "${searchTerm}"`);
            } else {
                showBatchDetails(batch);
                
                // Highlight the found batch card
                document.querySelectorAll('.batch-card').forEach(card => {
                    card.classList.remove('active');
                    if (card.dataset.batchId === batch.id) {
                        card.classList.add('active');
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error searching for batch:', error);
            alert('Error searching for batch. Please try again.');
        });
}

// Helper function to get CSS class based on status
function getStatusClass(status) {
    switch (status) {
        case 'Safe': return 'safe';
        case 'At Risk': return 'at-risk';
        case 'Unsafe': return 'unsafe';
        default: return '';
    }
}

// Format location for display
function formatLocation(location) {
    return location.split(',')[0];
}

// Format date and time
function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);