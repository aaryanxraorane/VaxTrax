from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')

# MongoDB
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri) if mongo_uri else None
db = client["vaxtrax"] if client is not None else None
collection = db["scans"] if db is not None else None

# Secret key for session
app.secret_key = os.urandom(24)

# Users (mock)
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

default_temp_limits = {"min": -20.0, "max": -15.0}
batches = {}

# ---------------- MOCK DATA ----------------
def generate_mock_batches():
    global batches
    batch_ids = [f"VAX-2023-{str(i).zfill(3)}" for i in range(1, 6)]
    stages = ["Factory", "Hub", "Storage", "Hospital", "Patient"]
    locations = [
        "51.5074° N, 0.1278° W",
        "40.7128° N, 74.0060° W",
        "34.0522° N, 118.2437° W",
        "41.8781° N, 87.6298° W",
        "19.4326° N, 99.1332° W"
    ]

    for i, batch_id in enumerate(batch_ids):
        temperature = round(random.uniform(-19.0, -12.0), 1)
        if temperature > -15:
            status = "Unsafe"
        elif temperature > -17:
            status = "At Risk"
        else:
            status = "Safe"

        batches[batch_id] = {
            "id": batch_id,
            "temperature": temperature,
            "location": locations[i],
            "stage": stages[i % len(stages)],
            "status": status,
            "lastUpdated": datetime.now().isoformat(),
            "scanHistory": [],
            "tempLimits": dict(default_temp_limits)
        }

generate_mock_batches()

STAGES = ["Factory", "Hub", "Storage", "Hospital", "Patient"]

def next_stage(stage):
    idx = STAGES.index(stage)
    return STAGES[idx + 1] if idx < len(STAGES) - 1 else stage

def evaluate_status(temp, tmin, tmax):
    buffer = 2.0
    if tmin <= temp <= tmax:
        return "Safe"
    if (tmax < temp <= tmax + buffer) or (tmin - buffer <= temp < tmin):
        return "At Risk"
    return "Unsafe"

# ---------------- AUTH HELPERS ----------------
def require_role(role):
    def decorator(f):
        @wraps(f)
        def run(*args, **kwargs):
            if 'user' not in session or session['role'] != role:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return run
    return decorator

def login_required(f):
    @wraps(f)
    def run(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return run

# ---------------- ROUTES ----------------
@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for(f"{session['role']}_dashboard"))
    return redirect(url_for('login'))

@app.route('/company')
@login_required
@require_role('company')
def company_dashboard():
    return render_template('company_dashboard.html', name=session['name'])

@app.route('/login', methods=['GET','POST'])
def login():
    err = None
    if request.method == 'POST':
        email = request.form['email']
        pwd = request.form['password']
        if email in users and check_password_hash(users[email]['password'], pwd):
            session.update({"user":email, "name":users[email]['name'], "role":users[email]['role']})
            return redirect('/')
        err = "Invalid credentials."
    return render_template('login.html', error=err)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

# ---------------- API ----------------
@app.route('/api/company/batches')
@login_required
@require_role('company')
def get_company_batches():
    return jsonify(list(batches.values()))

@app.route('/api/batches/<batch_id>')
@login_required
def get_batch(batch_id):
    return jsonify(batches.get(batch_id, {"error": "Batch not found"}))
# ----------- NFC SCAN (UPDATED & FIXED) -----------
@app.route('/api/company/nfc-scan', methods=['POST'])
@login_required
@require_role('company')
def nfc_scan():
    data = request.json
    batch_id = data.get("batch_id")
    temperature = float(data.get("temperature"))
    
    # Hardcoded coordinates
    location = "18.459524N, 73.884392E"

    tmin = batches[batch_id]["tempLimits"]["min"]
    tmax = batches[batch_id]["tempLimits"]["max"]
    status = evaluate_status(temperature, tmin, tmax)

    batches[batch_id].update({
        "temperature": round(temperature, 1),
        "status": status,
        "location": location,
        "lastUpdated": datetime.now().isoformat()
    })

    entry = {
        "batch_no": batch_id,
        "temperature": round(temperature, 1),
        "status": status,
        "location": location,
        "stage": batches[batch_id]['stage'],
        "timestamp": datetime.now().isoformat(),
        "action": "NFC scan"
    }

    # Store in memory history
    batches[batch_id]["scanHistory"].append(entry)

    # Store in Mongo safely (no ObjectId leak)
    if collection is not None:
        collection.insert_one(entry.copy())

    return jsonify({
        "success": True,
        "batch": batches[batch_id],
        "recommendation": "proceed" if status == "Safe" else "halt"
    })


# ----------- PROCEED (UPDATED & FIXED) ---------
@app.route('/api/company/proceed/<batch_id>', methods=['POST'])
@login_required
@require_role('company')
def proceed(batch_id):
    old_stage = batches[batch_id]['stage']
    new_stage = next_stage(old_stage)
    batches[batch_id]['stage'] = new_stage

    entry = {
        "batch_no": batch_id,
        "temperature": batches[batch_id]['temperature'],
        "status": batches[batch_id]['status'],
        "location": batches[batch_id]['location'],
        "stage": new_stage,
        "timestamp": datetime.now().isoformat(),
        "action": f"Proceed ({old_stage} → {new_stage})"
    }

    batches[batch_id]["scanHistory"].append(entry)

    if collection is not None:
        collection.insert_one(entry.copy())

    return jsonify({"success": True, "batch": batches[batch_id]})


# ----------- HALT (UPDATED & FIXED) ---------
@app.route('/api/company/halt/<batch_id>', methods=['POST'])
@login_required
@require_role('company')
def halt(batch_id):
    entry = {
        "batch_no": batch_id,
        "temperature": batches[batch_id]['temperature'],
        "status": batches[batch_id]['status'],
        "location": batches[batch_id]['location'],
        "stage": batches[batch_id]['stage'],
        "timestamp": datetime.now().isoformat(),
        "action": "Halt"
    }

    batches[batch_id]["scanHistory"].append(entry)

    if collection is not None:
        collection.insert_one(entry.copy())

    return jsonify({"success": True, "batch": batches[batch_id]})


@app.route('/healthz')
def health():
    return "OK", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT",10000)))
