
export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Fleet Manager',
  DRIVER = 'Driver',
  MAINTENANCE = 'Maintenance Staff'
}

export interface DriverTripRecord {
  route: string;
  status: 'On-Time' | 'Early' | 'Delayed';
  fuel: 'Optimal' | 'High Consumption' | 'Efficient';
}

export interface DriverStats {
  efficiency: number;
  safetyRank: number;
  totalDistance: number;
  rating: number;
  tripCount: number;
  safetyScore: number;
  recentTrips: DriverTripRecord[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for authentication
  role: UserRole;
  phone?: string;
  avatar?: string;
  stats?: DriverStats;
}

export type VehicleType = 
  | 'Motorcycle' 
  | 'Scooter' 
  | 'Auto Rickshaw' 
  | 'E-Rickshaw' 
  | 'Hatchback' 
  | 'Sedan' 
  | 'SUV' 
  | 'Mini Van' 
  | 'Tempo Traveler' 
  | 'Pickup Truck' 
  | 'LCV (Tata Ace)' 
  | '6-Tyre Truck' 
  | '10-Tyre Truck' 
  | '12-Tyre Lorry' 
  | '16-Tyre Trailer' 
  | 'Tipper' 
  | 'Tanker' 
  | 'Tractor' 
  | 'Bus';

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  type: VehicleType;
  status: 'Active' | 'In Maintenance' | 'Out of Service' | 'Retired';
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
  mileage: number;
  nextServiceDue: string;
  image?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  mileage: number;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  technician: string;
  description: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate?: string;
  startOdometer: number;
  endOdometer?: number;
  distance: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  fuelConsumed?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
}
