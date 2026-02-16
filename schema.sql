
-- Fleet Management System Database Schema

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vin VARCHAR(17) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active',
    fuel_type VARCHAR(20),
    mileage INTEGER DEFAULT 0,
    last_service_mileage INTEGER,
    next_service_due DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    service_date DATE NOT NULL,
    mileage_at_service INTEGER,
    cost DECIMAL(10, 2),
    technician_name VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Completed'
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    origin VARCHAR(255),
    destination VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    distance_km DECIMAL(10, 2),
    fuel_consumed DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Scheduled'
);
