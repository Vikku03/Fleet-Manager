
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)

# Database Configuration (PostgreSQL)
# Replace with your actual credentials: 'postgresql://username:password@localhost:5432/fleet_db'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/fleet_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configure Gemini
genai.configure(api_key=os.environ.get("API_KEY"))
model = genai.GenerativeModel('gemini-3-flash-preview')

# --- Models ---
class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vin = db.Column(db.String(17), unique=True, nullable=False)
    make = db.Column(db.String(50))
    model = db.Column(db.String(50))
    year = db.Column(db.Integer)
    plate = db.Column(db.String(20), unique=True)
    status = db.Column(db.String(20), default='Active') # Active, In Maintenance, etc.
    mileage = db.Column(db.Integer, default=0)

class MaintenanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    service_type = db.Column(db.String(100))
    date = db.Column(db.Date)
    cost = db.Column(db.Float)
    description = db.Column(db.Text)

# --- Routes ---

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([{
        'id': v.id, 'vin': v.vin, 'make': v.make, 
        'model': v.model, 'plate': v.plate, 'status': v.status, 'mileage': v.mileage
    } for v in vehicles])

@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    data = request.json
    new_v = Vehicle(
        vin=data['vin'], make=data['make'], model=data['model'], 
        year=data['year'], plate=data['plate'], mileage=data.get('mileage', 0)
    )
    db.session.add(new_v)
    db.session.commit()
    return jsonify({'message': 'Vehicle added successfully'}), 201

@app.route('/api/ai/optimize-route', methods=['POST'])
def optimize_route():
    data = request.json
    prompt = f"""
    Suggest an optimized route from {data['origin']} to {data['destination']} for a {data['vehicleType']}. 
    Provide response in JSON format:
    {{
        "route_name": "string",
        "steps": ["step1", "step2"],
        "total_distance_km": number,
        "estimated_duration_min": number,
        "fuel_cost_estimate": number,
        "efficiency_score": number
    }}
    """
    response = model.generate_content(prompt)
    # Clean the response if Gemini wraps it in markdown code blocks
    text = response.text.strip().replace('```json', '').replace('```', '')
    return jsonify(json.loads(text))

@app.route('/api/ai/predict-maintenance', methods=['POST'])
def predict_maintenance():
    data = request.json
    # Logic to fetch history from DB would go here
    prompt = f"""
    Analyze vehicle {data['make']} {data['model']} with {data['mileage']}km.
    Recent history: {data['history']}
    Predict next 3 maintenance tasks in JSON array format:
    [{{ "task": "string", "urgency": "Low|Medium|High", "estimated_cost": number, "reason": "string" }}]
    """
    response = model.generate_content(prompt)
    text = response.text.strip().replace('```json', '').replace('```', '')
    return jsonify(json.loads(text))

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Simple way to initialize tables
    app.run(debug=True, port=5000)
