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

// Status quick-set
const statusButtons = document.querySelectorAll('.status-btn');

// Proceed/Halt
const proceedBtn = document.getElementById('proceedBtn');
const haltBtn = document.getElementById('haltBtn');
const actionHint = document.getElementById('actionHint');

// Add Vaccine
const locationInput = document.getElementById('location');
const stageSelect = document.getElementById('stage');
const tempMinInput = document.getElementById('tempMin');
const tempMaxInput = document.getElementById('tempMax');
const addVaccineBtn = document.getElementById('addVaccineBtn');

// NFC
const scanButton = document.getElementById('scanNFCButton');
const scanStatus = document.getElementById('scanStatus');

// Current batch
let currentBatchId = null;
let lastRecommendation = null;

// Initialize
function initApp() {
    fetchBatches();

    searchBtn.addEventListener('click', searchBatch);
    batchSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBatch();
    });

    statusButtons.forEach(btn => {
        if (btn.dataset.status) {
            btn.addEventListener('click', () => updateBatchStatus(btn.dataset.status));
        }
    });

    if (addVaccineBtn) addVaccineBtn.addEventListener('click', addNewVaccine);

    if (scanButton) scanButton.addEventListener('click', startNFCScan);

    if (proceedBtn) proceedBtn.addEventListener('click', doProceed);
    if (haltBtn) haltBtn.addEventListener('click', doHalt);

    // periodic refresh
    setInterval(fetchBatches, 30000);
}

// Fetch batches
function fetchBatches() {
    fetch('/api/company/batches')
        .then(r => r.json())
        .then(batches => {
            renderBatchCards(batches);
            if (currentBatchId) fetchBatchDetails(currentBatchId);
        })
        .catch(e => console.error('Error fetching batches:', e));
}

// Render cards
function renderBatchCards(batchesArr) {
    batchCards.innerHTML = '';
    if (!batchesArr.length) {
        batchCards.innerHTML = '<p class="no-batches">No batches found.</p>';
        return;
    }
    batchesArr.forEach(batch => {
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

// Search
function searchBatch() {
    const batchId = batchSearch.value.trim();
    if (batchId) fetchBatchDetails(batchId);
}

// Fetch batch details
function fetchBatchDetails(batchId) {
    fetch(`/api/batches/${batchId}`)
        .then(r => {
            if (!r.ok) throw new Error('Batch not found');
            return r.json();
        })
        .then(batch => {
            currentBatchId = batch.id;
            displayBatchDetails(batch);
            batchDetailsSection.style.display = 'block';
        })
        .catch(e => {
            alert('Batch not found. Please check the ID and try again.');
            console.error(e);
        });
}

// Display batch
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

    updateStageTracker(batch.stage);
    populateScanHistory(batch.scanHistory);

    // Enable/disable Proceed/Halt based on last recommendation (after scan)
    if (lastRecommendation) {
        applyRecommendation(lastRecommendation);
    } else {
        proceedBtn.disabled = true;
        haltBtn.disabled = true;
        actionHint.textContent = 'Scan first to enable Proceed/Halt.';
    }
}

// Stage tracker
function updateStageTracker(currentStage) {
    const stages = ['Factory', 'Hub', 'Storage', 'Hospital', 'Patient'];
    const stageElements = [stageFactory, stageHub, stageStorage, stageHospital, stagePatient];
    const idx = stages.indexOf(currentStage);
    stageElements.forEach((el, i) => {
        if (i < idx) el.className = 'stage completed';
        else if (i === idx) el.className = 'stage current';
        else el.className = 'stage';
    });
}

// History table
function populateScanHistory(scanHistory) {
    const body = document.getElementById('scanHistoryBody');
    body.innerHTML = '';
    if (!scanHistory || !scanHistory.length) {
        body.innerHTML = '<tr><td colspan="7">No scan history available</td></tr>';
        return;
    }
    const sorted = [...scanHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    sorted.forEach(s => {
        const ts = new Date(s.timestamp);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ts.toLocaleDateString()} ${ts.toLocaleTimeString()}</td>
          <td>${s.location || '-'}</td>
          <td>${s.scannedBy || '-'}</td>
          <td>${s.temperature}°C</td>
          <td class="${s.status.toLowerCase().replace(' ','-')}">${s.status}</td>
          <td>${s.stage}</td>
          <td>${s.action || '-'}</td>
        `;
        body.appendChild(tr);
    });
}

// Quick status update (still allowed)
function updateBatchStatus(status) {
    if (!currentBatchId) return;
    fetch(`/api/company/update-status/${currentBatchId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                lastRecommendation = null; // manual change resets recommendation
                displayBatchDetails(data.batch);
                fetchBatches();
            } else {
                alert('Failed to update status: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(e => {
            console.error('Error updating status:', e);
            alert('Failed to update status. Please try again.');
        });
}

// Add vaccine
function addNewVaccine() {
    const location = locationInput.value.trim();
    const stage = stageSelect.value;
    const tempMin = parseFloat(tempMinInput.value);
    const tempMax = parseFloat(tempMaxInput.value);

    if (!location) return alert('Please enter a location');
    if (isNaN(tempMin) || isNaN(tempMax) || tempMin >= tempMax)
        return alert('Please check temperature limits');

    const payload = { location, stage, temp_min: tempMin, temp_max: tempMax };
    fetch('/api/company/add-vaccine', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                locationInput.value = '';
                fetchBatches();
                fetchBatchDetails(data.batch.id);
                alert(`New vaccine batch ${data.batch.id} added successfully!`);
            } else {
                alert('Failed to add vaccine: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(e => {
            console.error('Error adding vaccine:', e);
            alert('Failed to add vaccine. Please try again.');
        });
}

// --------------- NFC SCANNING FLOW ----------------
async function startNFCScan() {
    if (!currentBatchId) {
        alert('Select/open a batch first, then tap SCAN NFC.');
        return;
    }
    if (!("NDEFReader" in window)) {
        // fallback: ask temperature manually
        const t = prompt("Web NFC not supported. Enter temperature (°C):");
        if (t === null) return;
        const temp = parseFloat(t);
        if (isNaN(temp)) return alert('Invalid temperature.');
        return submitNFCResult(temp);
    }

    try {
        scanStatus.textContent = "Tap NFC tag to scan…";
        const ndef = new NDEFReader();
        await ndef.scan();

        ndef.onreading = async (event) => {
            try {
                // Expect CSV on tag like: "-16.8,18.459524N,73.884392E" OR "-16.8,18.459524,73.884392"
                const rec = event.message.records[0];
                const txt = new TextDecoder().decode(rec.data).trim();
                // Parse temperature first numeric in CSV
                const parts = txt.split(',').map(s => s.trim());
                let temp = null;
                for (const p of parts) {
                    const n = parseFloat(p.replace(/[^\d\.-]/g, ''));
                    if (!isNaN(n)) { temp = n; break; }
                }
                if (temp === null) {
                    const fallback = prompt("Couldn't parse temp from tag. Enter temperature (°C):");
                    if (fallback === null) { scanStatus.textContent = "Scan cancelled."; return; }
                    temp = parseFloat(fallback);
                    if (isNaN(temp)) { alert('Invalid temperature.'); return; }
                }
                await submitNFCResult(temp);
            } catch (e) {
                console.error(e);
                scanStatus.textContent = "❌ Failed to read tag.";
            }
        };
    } catch (err) {
        console.error(err);
        scanStatus.textContent = "❌ NFC Scan failed or cancelled.";
    }
}

async function submitNFCResult(temperature) {
    scanStatus.textContent = "Uploading scan…";
    const res = await fetch('/api/company/nfc-scan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            batch_id: currentBatchId,
            temperature: Number(temperature)
            // coords ignored; server hardcodes to "18.459524N, 73.884392E"
        })
    });
    const data = await res.json();
    if (data.success) {
        scanStatus.textContent = "✅ Scan logged!";
        lastRecommendation = data.recommendation; // "proceed" / "halt"
        displayBatchDetails(data.batch);
        fetchBatches();
        applyRecommendation(lastRecommendation);
    } else {
        scanStatus.textContent = "❌ Failed to log scan.";
        alert(data.error || 'Failed to log scan');
    }
}

function applyRecommendation(rec) {
    if (rec === "proceed") {
        proceedBtn.disabled = false;
        haltBtn.disabled = true;
        actionHint.textContent = "Temperature is SAFE. You can Proceed to the next stage.";
    } else {
        proceedBtn.disabled = true;
        haltBtn.disabled = false;
        actionHint.textContent = "Temperature out of range. You should Halt.";
    }
}

// Proceed / Halt actions
function doProceed() {
    if (!currentBatchId) return;
    fetch(`/api/company/proceed/${currentBatchId}`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                lastRecommendation = null; // reset after action
                displayBatchDetails(data.batch);
                fetchBatches();
                proceedBtn.disabled = true;
                haltBtn.disabled = true;
                actionHint.textContent = "Action logged.";
            } else {
                alert(data.error || 'Failed to proceed.');
            }
        })
        .catch(e => {
            console.error(e);
            alert('Failed to proceed.');
        });
}

function doHalt() {
    if (!currentBatchId) return;
    fetch(`/api/company/halt/${currentBatchId}`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                lastRecommendation = null;
                displayBatchDetails(data.batch);
                fetchBatches();
                proceedBtn.disabled = true;
                haltBtn.disabled = true;
                actionHint.textContent = "Halt logged.";
            } else {
                alert(data.error || 'Failed to halt.');
            }
        })
        .catch(e => {
            console.error(e);
            alert('Failed to halt.');
        });
}

// Init
document.addEventListener('DOMContentLoaded', initApp);
