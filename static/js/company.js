// DOM Elements
const batchSearch = document.getElementById('batchSearch');
const searchBtn = document.getElementById('searchBtn');
const batchCards = document.getElementById('batchCards');
const batchDetailsSection = document.getElementById('batchDetailsSection');

// Batch Details Elements
const detailBatchId = document.getElementById('detailBatchId');
const detailStatus = document.getElementById('detailStatus');
const detailTemp = document.getElementById('detailTemp');
const detailLocation = document.getElementById('detailLocation');
const detailStage = document.getElementById('detailStage');
const detailTempLimits = document.getElementById('detailTempLimits');

// Stage Elements
const stageFactory = document.getElementById('stageFactory');
const stageHub = document.getElementById('stageHub');
const stageStorage = document.getElementById('stageStorage');
const stageHospital = document.getElementById('stageHospital');
const stagePatient = document.getElementById('stagePatient');

// Company Action Elements
const statusButtons = document.querySelectorAll('.status-btn');
const updateStage = document.getElementById('updateStage');
const updateStageBtn = document.getElementById('updateStageBtn');

// Add Vaccine Elements
const locationInput = document.getElementById('location');
const stageSelect = document.getElementById('stage');
const tempMinInput = document.getElementById('tempMin');
const tempMaxInput = document.getElementById('tempMax');
const addVaccineBtn = document.getElementById('addVaccineBtn');

// Current batch being viewed
let currentBatchId = null;

// Initialize the application
function initApp() {
    // Fetch all batches for company view
    fetchBatches();
    
    // Set up event listeners
    searchBtn.addEventListener('click', searchBatch);
    batchSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBatch();
    });
    
    // Set up status button listeners
    statusButtons.forEach(btn => {
        btn.addEventListener('click', () => updateBatchStatus(btn.dataset.status));
    });
    
    // Set up stage update listener
    updateStageBtn.addEventListener('click', updateBatchStage);
    
    // Set up add vaccine listener
    addVaccineBtn.addEventListener('click', addNewVaccine);
    
    // Auto-refresh data every 30 seconds
    setInterval(fetchBatches, 30000);
}

// Fetch all batches for company view
function fetchBatches() {
    fetch('/api/company/batches')
        .then(response => response.json())
        .then(batches => {
            renderBatchCards(batches);
            
            // If a batch is currently being viewed, refresh its details
            if (currentBatchId) {
                fetchBatchDetails(currentBatchId);
            }
        })
        .catch(error => console.error('Error fetching batches:', error));
}

// Render batch cards
function renderBatchCards(batches) {
    batchCards.innerHTML = '';
    
    if (batches.length === 0) {
        batchCards.innerHTML = '<p class="no-batches">No batches found.</p>';
        return;
    }
    
    batches.forEach(batch => {
        const card = document.createElement('div');
        card.className = `batch-card ${batch.status.toLowerCase().replace(' ', '-')}`;
        card.innerHTML = `
            <h3>${batch.id}</h3>
            <p class="batch-temp">${batch.temperature}°C</p>
            <p class="batch-status">${batch.status}</p>
            <p class="batch-stage">${batch.stage}</p>
        `;
        
        card.addEventListener('click', () => fetchBatchDetails(batch.id));
        batchCards.appendChild(card);
    });
}

// Search for a specific batch
function searchBatch() {
    const batchId = batchSearch.value.trim();
    if (batchId) {
        fetchBatchDetails(batchId);
    }
}

// Fetch details for a specific batch
function fetchBatchDetails(batchId) {
    fetch(`/api/batches/${batchId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Batch not found');
            }
            return response.json();
        })
        .then(batch => {
            currentBatchId = batch.id;
            displayBatchDetails(batch);
            batchDetailsSection.style.display = 'block';
        })
        .catch(error => {
            alert('Batch not found. Please check the ID and try again.');
            console.error('Error fetching batch details:', error);
        });
}

// Display batch details
function displayBatchDetails(batch) {
    detailBatchId.textContent = batch.id;
    detailStatus.textContent = batch.status;
    detailStatus.className = `status-badge ${batch.status.toLowerCase().replace(' ', '-')}`;
    
    detailTemp.textContent = `${batch.temperature}°C`;
    detailLocation.textContent = batch.location;
    detailStage.textContent = batch.stage;
    
    if (batch.tempLimits) {
        detailTempLimits.textContent = `${batch.tempLimits.min}°C to ${batch.tempLimits.max}°C`;
    } else {
        detailTempLimits.textContent = 'Not specified';
    }
    
    // Update stage tracker
    updateStageTracker(batch.stage);
    
    // Populate scan history
    populateScanHistory(batch.scanHistory);
    
    // Set the current stage in the update dropdown
    updateStage.value = batch.stage;
}

// Update the stage tracker visualization
function updateStageTracker(currentStage) {
    const stages = ['Factory', 'Hub', 'Storage', 'Hospital', 'Patient'];
    const stageElements = [stageFactory, stageHub, stageStorage, stageHospital, stagePatient];
    
    const currentIndex = stages.indexOf(currentStage);
    
    stageElements.forEach((element, index) => {
        if (index < currentIndex) {
            element.className = 'stage completed';
        } else if (index === currentIndex) {
            element.className = 'stage current';
        } else {
            element.className = 'stage';
        }
    });
}

// Populate scan history table
function populateScanHistory(scanHistory) {
    const scanHistoryBody = document.getElementById('scanHistoryBody');
    scanHistoryBody.innerHTML = '';
    
    if (!scanHistory || scanHistory.length === 0) {
        scanHistoryBody.innerHTML = '<tr><td colspan="6">No scan history available</td></tr>';
        return;
    }
    
    // Sort scan history by timestamp (newest first)
    const sortedHistory = [...scanHistory].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    sortedHistory.forEach(scan => {
        const row = document.createElement('tr');
        
        // Format the timestamp
        const timestamp = new Date(scan.timestamp);
        const formattedDate = timestamp.toLocaleDateString();
        const formattedTime = timestamp.toLocaleTimeString();
        
        row.innerHTML = `
            <td>${formattedDate} ${formattedTime}</td>
            <td>${scan.location}</td>
            <td>${scan.scannedBy}</td>
            <td>${scan.temperature}°C</td>
            <td class="${scan.status.toLowerCase().replace(' ', '-')}">${scan.status}</td>
            <td>${scan.stage}</td>
        `;
        
        scanHistoryBody.appendChild(row);
    });
}

// Update batch status
function updateBatchStatus(status) {
    if (!currentBatchId) return;
    
    fetch(`/api/company/update-status/${currentBatchId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refresh batch details and batch list
            displayBatchDetails(data.batch);
            fetchBatches();
        } else {
            alert('Failed to update status: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating batch status:', error);
        alert('Failed to update status. Please try again.');
    });
}

// Update batch stage
function updateBatchStage() {
    if (!currentBatchId) return;
    
    const stage = updateStage.value;
    
    fetch(`/api/company/update-stage/${currentBatchId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stage })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refresh batch details and batch list
            displayBatchDetails(data.batch);
            fetchBatches();
        } else {
            alert('Failed to update stage: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating batch stage:', error);
        alert('Failed to update stage. Please try again.');
    });
}

// Add a new vaccine
function addNewVaccine() {
    const location = locationInput.value.trim();
    const stage = stageSelect.value;
    const tempMin = parseFloat(tempMinInput.value);
    const tempMax = parseFloat(tempMaxInput.value);
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    if (tempMin >= tempMax) {
        alert('Minimum temperature must be less than maximum temperature');
        return;
    }
    
    const vaccineData = {
        location,
        stage,
        temp_min: tempMin,
        temp_max: tempMax
    };
    
    fetch('/api/company/add-vaccine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vaccineData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear form
            locationInput.value = '';
            
            // Refresh batch list and show the new batch details
            fetchBatches();
            fetchBatchDetails(data.batch.id);
            
            alert(`New vaccine batch ${data.batch.id} added successfully!`);
        } else {
            alert('Failed to add vaccine: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error adding vaccine:', error);
        alert('Failed to add vaccine. Please try again.');
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);