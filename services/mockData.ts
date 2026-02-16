
import { Vehicle, UserRole, User, MaintenanceRecord, Trip } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Admin User', 
    email: 'admin@fleettrack.in', 
    password: 'admin123',
    role: UserRole.ADMIN 
  },
  { 
    id: 'u2', 
    name: 'Rajesh Kumar', 
    email: 'rajesh@fleettrack.in', 
    password: 'manager123',
    role: UserRole.MANAGER,
    stats: {
      efficiency: 94.2,
      safetyRank: 2,
      totalDistance: 12500,
      rating: 4.8,
      tripCount: 85,
      safetyScore: 99,
      recentTrips: [
        { route: 'Mumbai - Ahmedabad', status: 'On-Time', fuel: 'Optimal' },
        { route: 'Surat - Vadodara', status: 'Early', fuel: 'Efficient' }
      ]
    }
  },
  { 
    id: 'u3', 
    name: 'Suresh Raina', 
    email: 'suresh@fleettrack.in', 
    password: 'driver123',
    role: UserRole.DRIVER,
    stats: {
      efficiency: 88.5,
      safetyRank: 12,
      totalDistance: 45200,
      rating: 4.6,
      tripCount: 156,
      safetyScore: 94,
      recentTrips: [
        { route: 'Delhi - Jaipur', status: 'On-Time', fuel: 'High Consumption' },
        { route: 'Jaipur - Agra', status: 'Delayed', fuel: 'Optimal' },
        { route: 'Agra - Delhi', status: 'On-Time', fuel: 'Efficient' }
      ]
    }
  },
  { 
    id: 'u4', 
    name: 'Amit Mistry', 
    email: 'amit@fleettrack.in', 
    password: 'service123',
    role: UserRole.MAINTENANCE 
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', vin: 'IND928374829', make: 'Tata', model: 'Nexon EV', year: 2023, plate: 'MH-12-RT-4567', type: 'SUV', status: 'Active', fuelType: 'Electric', mileage: 12400, nextServiceDue: '2024-08-15', image: 'https://images.unsplash.com/photo-1623055812903-883712952865?auto=format&fit=crop&q=80&w=400' },
  { id: 'v2', vin: 'IND102938475', make: 'Mahindra', model: 'Bolero Neo', year: 2022, plate: 'DL-04-CA-8901', type: 'SUV', status: 'In Maintenance', fuelType: 'Diesel', mileage: 35000, nextServiceDue: '2024-04-10', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400' },
  { id: 'v3', vin: 'IND556677889', make: 'Ashok Leyland', model: 'Dost+', year: 2021, plate: 'KA-01-MJ-2233', type: 'LCV (Tata Ace)', status: 'Active', fuelType: 'Diesel', mileage: 58000, nextServiceDue: '2024-06-20', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400' },
  { id: 'v4', vin: 'IND443322110', make: 'Maruti Suzuki', model: 'Eeco', year: 2020, plate: 'HR-26-DQ-5544', type: 'Mini Van', status: 'Active', fuelType: 'Gasoline', mileage: 82000, nextServiceDue: '2024-05-15', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400' },
  { id: 'v5', vin: 'IND778899001', make: 'Tata', model: 'Prima 5530.S', year: 2023, plate: 'UP-32-BZ-9911', type: '16-Tyre Trailer', status: 'Active', fuelType: 'Diesel', mileage: 15000, nextServiceDue: '2024-12-01', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400' },
];

export const MOCK_TRIPS: Trip[] = [
  { id: 't1', vehicleId: 'v1', driverId: 'u3', origin: 'Mumbai', destination: 'Pune', startDate: '2024-01-10T08:00:00', endDate: '2024-01-10T11:30:00', startOdometer: 12000, endOdometer: 12150, distance: 150, status: 'Completed', fuelConsumed: 18 },
  { id: 't2', vehicleId: 'v5', driverId: 'u3', origin: 'Delhi', destination: 'Jaipur', startDate: '2024-01-15T06:00:00', startOdometer: 14800, distance: 280, status: 'In Progress' },
];

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', vehicleId: 'v2', serviceType: 'Clutch Replacement', date: '2024-02-10', mileage: 34900, cost: 12500, status: 'In Progress', technician: 'Amit Mistry', description: 'Heavy wear detected on clutch plate.' },
  { id: 'm2', vehicleId: 'v3', serviceType: 'Oil Filter & Coolant', date: '2023-11-15', mileage: 55000, cost: 4200, status: 'Completed', technician: 'Amit Mistry', description: 'Periodic maintenance.' },
];
