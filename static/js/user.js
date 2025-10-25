// DOM Elements
const batchDetailsSection = document.getElementById('batchDetailsSection');
const searchBtn = document.getElementById('searchBtn');
const batchSearch = document.getElementById('batchSearch');

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
    setupEventListeners();
    
    // Auto-refresh data every 30 seconds if a batch is being viewed
    setInterval(() => {
        const batchId = detailBatchId.textContent;
        if (batchId !== 'Enter a batch ID to view details') {
            fetchBatchDetails(batchId);
        }
    }, 30000);
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);