from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import uuid
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from dotenv import load_dotenv

app = Flask(__name__, template_folder='templates', static_folder='static')


#MongoDB
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["vaxtrax"]  # Database name
collection = db["scans"]

# Secret key for session
app.secret_key = os.urandom(24)

# Mock database for users (in a real app, use a proper database)
users = {
    "admin@vaxtrax.com": {
        "password": generate_password_hash("admin123"),
        "name": "Admin User",
        "role": "admin"
    },
    "user@vaxtrax.com": {
        "password": generate_password_hash("user123"),
        "name": "Regular User",
        "role": "user"
    },
    "company@vaxtrax.com": {
        "password": generate_password_hash("company123"),
        "name": "Company User",
        "role": "company"
    }
}

# Default temperature limits for vaccines
default_temp_limits = {
    "min": -20.0,
    "max": -15.0
}

# Mock database for vaccine batches (in a real app, use a proper database)
batches = {}

# Generate mock batch data
def generate_mock_batches():
    global batches
    batch_ids = [f"VAX-2023-{str(i).zfill(3)}" for i in range(1, 6)]
    stages = ["Factory", "Hub", "Storage", "Hospital", "Patient"]
    locations = [
        "51.5074° N, 0.1278° W",  # London
        "40.7128° N, 74.0060° W",  # New York
        "34.0522° N, 118.2437° W",  # Los Angeles
        "41.8781° N, 87.6298° W",  # Chicago
        "19.4326° N, 99.1332° W"   # Mexico City
    ]
    
    for i, batch_id in enumerate(batch_ids):
        # Determine status based on temperature
        temperature = round(random.uniform(-19.0, -12.0), 1)
        if temperature > -15:
            status = "Unsafe"
        elif temperature > -17:
            status = "At Risk"
        else:
            status = "Safe"
        
        # Create scan history
        scan_history = []
        current_stage_index = min(i % len(stages), len(stages) - 1)
        
        for stage_idx in range(current_stage_index + 1):
            stage = stages[stage_idx]
            days_ago = (current_stage_index - stage_idx) * 2
            scan_temp = round(temperature + random.uniform(-0.5, 0.5), 1)
            
            # Determine status for this scan
            if scan_temp > -15:
                scan_status = "Unsafe"
            elif scan_temp > -17:
                scan_status = "At Risk"
            else:
                scan_status = "Safe"
                
            scan = {
                "timestamp": (datetime.now() - timedelta(days=days_ago, minutes=random.randint(0, 360))).isoformat(),
                "location": locations[stage_idx % len(locations)],
                "scannedBy": f"Operator {random.randint(1, 10)}",
                "device": f"NFC Scanner #{random.randint(1, 30)}",
                "temperature": scan_temp,
                "status": scan_status,
                "stage": stage
            }
            scan_history.append(scan)
        
        batches[batch_id] = {
            "id": batch_id,
            "temperature": temperature,
            "location": locations[i % len(locations)],
            "stage": stages[current_stage_index],
            "status": status,
            "lastUpdated": datetime.now().isoformat(),
            "scanHistory": scan_history
        }

# Generate initial batch data
generate_mock_batches()

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session or session['role'] != 'admin':
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Company required decorator
def company_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session or session['role'] != 'company':
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    if 'user' in session:
        if session['role'] == 'admin':
            return redirect(url_for('admin_dashboard'))
        elif session['role'] == 'company':
            return redirect(url_for('company_dashboard'))
        else:
            return redirect(url_for('user_dashboard'))
    return redirect(url_for('login'))

@app.route('/company')
@login_required
@company_required
def company_dashboard():
    return render_template('company_dashboard.html', name=session['name'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        if email in users and check_password_hash(users[email]['password'], password):
            session['user'] = email
            session['name'] = users[email]['name']
            session['role'] = users[email]['role']
            
            if users[email]['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif users[email]['role'] == 'company':
                return redirect(url_for('company_dashboard'))
            else:
                return redirect(url_for('user_dashboard'))
        else:
            error = 'Invalid credentials. Please try again.'
    
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('name', None)
    session.pop('role', None)
    return redirect(url_for('login'))

@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    return render_template('admin_dashboard.html', name=session['name'])

@app.route('/user')
@login_required
def user_dashboard():
    return render_template('user_dashboard.html', name=session['name'])

# API Routes
@app.route('/api/batches', methods=['GET'])
@login_required
def get_batches():
    if session['role'] == 'admin':
        return jsonify(list(batches.values()))
    else:
        # For regular users, only return batches they search for
        return jsonify([])

@app.route('/api/batches/<batch_id>', methods=['GET'])
@login_required
def get_batch(batch_id):
    if batch_id in batches:
        return jsonify(batches[batch_id])
    else:
        return jsonify({"error": "Batch not found"}), 404

@app.route('/api/refresh-data', methods=['GET'])
@login_required
def refresh_data():
    # Simulate data updates
    for batch_id in batches:
        # Randomly adjust temperature slightly
        temp_change = round((random.random() - 0.5) * 0.3, 1)
        batches[batch_id]['temperature'] = round(batches[batch_id]['temperature'] + temp_change, 1)
        
        # Update status based on temperature
        if batches[batch_id]['temperature'] > -15:
            batches[batch_id]['status'] = 'Unsafe'
        elif batches[batch_id]['temperature'] > -17:
            batches[batch_id]['status'] = 'At Risk'
        else:
            batches[batch_id]['status'] = 'Safe'
        
        # Update last updated timestamp
        batches[batch_id]['lastUpdated'] = datetime.now().isoformat()
    
    return jsonify({"success": True})

# Company API Routes
@app.route('/api/company/batches', methods=['GET'])
@login_required
@company_required
def get_company_batches():
    return jsonify(list(batches.values()))

@app.route('/api/company/update-status/<batch_id>', methods=['POST'])
@login_required
@company_required
def update_batch_status(batch_id):
    if batch_id not in batches:
        return jsonify({"error": "Batch not found"}), 404
    
    data = request.json
    if 'status' not in data or data['status'] not in ['Safe', 'At Risk', 'Unsafe']:
        return jsonify({"error": "Invalid status value"}), 400
    
    batches[batch_id]['status'] = data['status']
    
    # Add a new scan entry
    new_scan = {
        "timestamp": datetime.now().isoformat(),
        "location": batches[batch_id]['location'],
        "scannedBy": session['name'],
        "device": f"Web Interface",
        "temperature": batches[batch_id]['temperature'],
        "status": data['status'],
        "stage": batches[batch_id]['stage']
    }
    
    batches[batch_id]['scanHistory'].append(new_scan)
    batches[batch_id]['lastUpdated'] = datetime.now().isoformat()
    
    return jsonify({"success": True, "batch": batches[batch_id]})

@app.route('/api/company/update-stage/<batch_id>', methods=['POST'])
@login_required
@company_required
def update_batch_stage(batch_id):
    if batch_id not in batches:
        return jsonify({"error": "Batch not found"}), 404
    
    data = request.json
    stages = ["Factory", "Hub", "Storage", "Hospital", "Patient"]
    
    if 'stage' not in data or data['stage'] not in stages:
        return jsonify({"error": "Invalid stage value"}), 400
    
    batches[batch_id]['stage'] = data['stage']
    
    # Add a new scan entry
    new_scan = {
        "timestamp": datetime.now().isoformat(),
        "location": batches[batch_id]['location'],
        "scannedBy": session['name'],
        "device": f"Web Interface",
        "temperature": batches[batch_id]['temperature'],
        "status": batches[batch_id]['status'],
        "stage": data['stage']
    }
    
    batches[batch_id]['scanHistory'].append(new_scan)
    batches[batch_id]['lastUpdated'] = datetime.now().isoformat()
    
    return jsonify({"success": True, "batch": batches[batch_id]})

@app.route('/api/company/add-vaccine', methods=['POST'])
@login_required
@company_required
def add_vaccine():
    data = request.json
    
    # Validate required fields
    required_fields = ['location', 'stage']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Generate a new batch ID
    batch_count = len(batches) + 1
    batch_id = f"VAX-{datetime.now().year}-{str(batch_count).zfill(3)}"
    
    # Get temperature limits
    temp_min = data.get('temp_min', default_temp_limits['min'])
    temp_max = data.get('temp_max', default_temp_limits['max'])
    
    # Generate a random temperature within the specified limits
    temperature = round(random.uniform(temp_min, temp_max), 1)
    
    # Determine status based on temperature
    if temperature > temp_max:
        status = "Unsafe"
    elif temperature > (temp_min + (temp_max - temp_min) / 2):
        status = "At Risk"
    else:
        status = "Safe"
    
    # Create initial scan
    initial_scan = {
        "timestamp": datetime.now().isoformat(),
        "location": data['location'],
        "scannedBy": session['name'],
        "device": "Web Interface",
        "temperature": temperature,
        "status": status,
        "stage": data['stage']
    }
    
    # Create the new batch
    batches[batch_id] = {
        "id": batch_id,
        "temperature": temperature,
        "location": data['location'],
        "stage": data['stage'],
        "status": status,
        "lastUpdated": datetime.now().isoformat(),
        "scanHistory": [initial_scan],
        "tempLimits": {
            "min": temp_min,
            "max": temp_max
        }
    }
    
    return jsonify({"success": True, "batch": batches[batch_id]})

@app.route('/add_scan', methods=['POST'])
def add_scan():
    data = request.get_json()
    collection.insert_one(data)
    return jsonify({"message": "Scan added successfully!"}), 201

@app.route('/get_scans/<batch_no>', methods=['GET'])
def get_scans(batch_no):
    scans = list(collection.find({"batch_no": batch_no}, {"_id": 0}))
    return jsonify(scans)

@app.route('/healthz')
def health():
    return "OK", 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
