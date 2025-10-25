// Mock data for demonstration purposes
const mockBatches = [
    {
        id: "VAX-2023-001",
        temperature: -18.2,
        location: "51.5074° N, 0.1278° W",
        stage: "Storage",
        status: "Safe",
        lastUpdated: new Date(Date.now() - 300000), // 5 minutes ago
        scanHistory: [
            {
                timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
                location: "52.5200° N, 13.4050° E",
                scannedBy: "John Smith",
                device: "NFC Scanner #12",
                temperature: -18.5,
                status: "Safe",
                stage: "Factory"
            },
            {
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
                location: "51.5074° N, 0.1278° W",
                scannedBy: "Emma Johnson",
                device: "NFC Scanner #08",
                temperature: -18.3,
                status: "Safe",
                stage: "Hub"
            },
            {
                timestamp: new Date(Date.now() - 300000), // 5 minutes ago
                location: "51.5074° N, 0.1278° W",
                scannedBy: "Michael Brown",
                device: "NFC Scanner #15",
                temperature: -18.2,
                status: "Safe",
                stage: "Storage"
            }
        ]
    },
    {
        id: "VAX-2023-002",
        temperature: -15.8,
        location: "40.7128° N, 74.0060° W",
        stage: "Hospital",
        status: "At Risk",
        lastUpdated: new Date(Date.now() - 120000), // 2 minutes ago
        scanHistory: [
            {
                timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
                location: "52.5200° N, 13.4050° E",
                scannedBy: "John Smith",
                device: "NFC Scanner #12",
                temperature: -18.5,
                status: "Safe",
                stage: "Factory"
            },
            {
                timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
                location: "48.8566° N, 2.3522° E",
                scannedBy: "Sophie Martin",
                device: "NFC Scanner #05",
                temperature: -18.0,
                status: "Safe",
                stage: "Hub"
            },
            {
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
                location: "40.7128° N, 74.0060° W",
                scannedBy: "Robert Wilson",
                device: "NFC Scanner #22",
                temperature: -17.5,
                status: "Safe",
                stage: "Storage"
            },
            {
                timestamp: new Date(Date.now() - 120000), // 2 minutes ago
                location: "40.7128° N, 74.0060° W",
                scannedBy: "Jennifer Davis",
                device: "NFC Scanner #18",
                temperature: -15.8,
                status: "At Risk",
                stage: "Hospital"
            }
        ]
    },
    {
        id: "VAX-2023-003",
        temperature: -12.1,
        location: "34.0522° N, 118.2437° W",
        stage: "Hospital",
        status: "Unsafe",
        lastUpdated: new Date(Date.now() - 180000), // 3 minutes ago
        scanHistory: [
            {
                timestamp: new Date(Date.now() - 86400000 * 4), // 4 days ago
                location: "52.5200° N, 13.4050° E",
                scannedBy: "John Smith",
                device: "NFC Scanner #12",
                temperature: -18.5,
                status: "Safe",
                stage: "Factory"
            },
            {
                timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
                location: "48.8566° N, 2.3522° E",
                scannedBy: "Sophie Martin",
                device: "NFC Scanner #05",
                temperature: -18.2,
                status: "Safe",
                stage: "Hub"
            },
            {
                timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
                location: "37.7749° N, 122.4194° W",
                scannedBy: "David Thompson",
                device: "NFC Scanner #30",
                temperature: -17.8,
                status: "Safe",
                stage: "Storage"
            },
            {
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
                location: "34.0522° N, 118.2437° W",
                scannedBy: "Lisa Anderson",
                device: "NFC Scanner #25",
                temperature: -16.5,
                status: "At Risk",
                stage: "Hospital"
            },
            {
                timestamp: new Date(Date.now() - 180000), // 3 minutes ago
                location: "34.0522° N, 118.2437° W",
                scannedBy: "Lisa Anderson",
                device: "NFC Scanner #25",
                temperature: -12.1,
                status: "Unsafe",
                stage: "Hospital"
            }
        ]
    },
    {
        id: "VAX-2023-004",
        temperature: -18.7,
        location: "41.8781° N, 87.6298° W",
        stage: "Hub",
        status: "Safe",
        lastUpdated: new Date(Date.now() - 240000), // 4 minutes ago
        scanHistory: [
            {
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
                location: "52.5200° N, 13.4050° E",
                scannedBy: "John Smith",
                device: "NFC Scanner #12",
                temperature: -18.9,
                status: "Safe",
                stage: "Factory"
            },
            {
                timestamp: new Date(Date.now() - 240000), // 4 minutes ago
                location: "41.8781° N, 87.6298° W",
                scannedBy: "Kevin Miller",
                device: "NFC Scanner #14",
                temperature: -18.7,
                status: "Safe",
                stage: "Hub"
            }
        ]
    },
    {
        id: "VAX-2023-005",
        temperature: -17.9,
        location: "19.4326° N, 99.1332° W",
        stage: "Storage",
        status: "Safe",
        lastUpdated: new Date(Date.now() - 360000), // 6 minutes ago
        scanHistory: [
            {
                timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
                location: "52.5200° N, 13.4050° E",
                scannedBy: "John Smith",
                device: "NFC Scanner #12",
                temperature: -18.5,
                status: "Safe",
                stage: "Factory"
            },
            {
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
                location: "25.7617° N, 80.1918° W",
                scannedBy: "Carlos Rodriguez",
                device: "NFC Scanner #19",
                temperature: -18.2,
                status: "Safe",
                stage: "Hub"
            },
            {
                timestamp: new Date(Date.now() - 360000), // 6 minutes ago
                location: "19.4326° N, 99.1332° W",
                scannedBy: "Maria Garcia",
                device: "NFC Scanner #27",
                temperature: -17.9,
                status: "Safe",
                stage: "Storage"
            }
        ]
    }
];

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
    updateDashboardStats();
    renderBatchCards();
    setupEventListeners();
    
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        simulateDataUpdates();
        updateDashboardStats();
        renderBatchCards();
        
        // If a batch is selected, update its details too
        const selectedBatchId = detailBatchId.textContent;
        if (selectedBatchId !== 'Select a batch to view details') {
            const batch = mockBatches.find(b => b.id === selectedBatchId);
            if (batch) {
                showBatchDetails(batch);
            }
        }
    }, 30000);
}

// Update dashboard statistics
function updateDashboardStats() {
    const total = mockBatches.length;
    const inTransit = mockBatches.filter(b => b.stage !== 'Patient').length;
    const safe = mockBatches.filter(b => b.status === 'Safe').length;
    const atRisk = mockBatches.filter(b => b.status === 'At Risk').length;
    const unsafe = mockBatches.filter(b => b.status === 'Unsafe').length;
    
    totalBatchesEl.textContent = total;
    inTransitEl.textContent = inTransit;
    safeBatchesEl.textContent = safe;
    atRiskBatchesEl.textContent = atRisk;
    unsafeBatchesEl.textContent = unsafe;
}

// Render batch cards in the live data section
function renderBatchCards() {
    batchContainer.innerHTML = '';
    
    mockBatches.forEach(batch => {
        const card = document.createElement('div');
        card.className = `batch-card ${getStatusClass(batch.status)}`;
        card.dataset.batchId = batch.id;
        
        const lastUpdatedTime = formatTimeAgo(batch.lastUpdated);
        
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
            showBatchDetails(batch);
            
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
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedHistory.forEach(scan => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDateTime(scan.timestamp)}</td>
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
    
    const batch = mockBatches.find(b => b.id.toUpperCase().includes(searchTerm));
    
    if (batch) {
        showBatchDetails(batch);
        
        // Highlight the found batch card
        document.querySelectorAll('.batch-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.batchId === batch.id) {
                card.classList.add('active');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    } else {
        alert(`No batch found with ID containing "${searchTerm}"`);
    }
}

// Simulate data updates (for demonstration purposes)
function simulateDataUpdates() {
    mockBatches.forEach(batch => {
        // Randomly adjust temperature slightly
        const tempChange = (Math.random() - 0.5) * 0.3;
        batch.temperature = parseFloat((batch.temperature + tempChange).toFixed(1));
        
        // Update status based on temperature
        if (batch.temperature > -15) {
            batch.status = 'Unsafe';
        } else if (batch.temperature > -17) {
            batch.status = 'At Risk';
        } else {
            batch.status = 'Safe';
        }
        
        // Update last updated timestamp
        batch.lastUpdated = new Date();
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