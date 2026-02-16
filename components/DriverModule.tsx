
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { MOCK_USERS, MOCK_VEHICLES } from '../services/mockData';
import { User, UserRole, Trip } from '../types';
// Added FileText to the import list from lucide-react to fix reference error on line 165
import { Star, MapPin, Truck, Phone, Mail, ChevronRight, Award, Trash2, Plus, AlertCircle, TrendingUp, Zap, ShieldCheck, AlertTriangle, SearchX, Edit2, Navigation, Gauge, Droplets, Package, FileText } from 'lucide-react';
import { Modal } from '../App';

export default function DriverModule() {
  const { searchQuery, trips } = useApp();
  const [drivers, setDrivers] = useState<User[]>(() => 
    MOCK_USERS.filter(u => u.role === UserRole.DRIVER || u.role === UserRole.MANAGER)
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<User | null>(null);
  const [performanceDriver, setPerformanceDriver] = useState<User | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
  const [selectedLogbookTrip, setSelectedLogbookTrip] = useState<Trip | null>(null);
  
  const [driverForm, setDriverForm] = useState({ name: '', email: '', role: UserRole.DRIVER, phone: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const filteredDrivers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return drivers.filter(d => 
      d.name.toLowerCase().includes(query) || 
      d.email.toLowerCase().includes(query) ||
      d.role.toLowerCase().includes(query)
    );
  }, [drivers, searchQuery]);

  // Find actual trips for the driver being analyzed
  const driverTrips = useMemo(() => {
    if (!performanceDriver) return [];
    return trips.filter(t => t.driverId === performanceDriver.id);
  }, [performanceDriver, trips]);

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setDriverForm({ name: '', email: '', role: UserRole.DRIVER, phone: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver: User) => {
    setEditingDriver(driver);
    setDriverForm({ 
      name: driver.name, 
      email: driver.email, 
      role: driver.role,
      phone: driver.phone || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSaveDriver = () => {
    const errs: any = {};
    if (!driverForm.name.trim()) errs.name = "Name is required";
    if (!driverForm.email.trim()) errs.email = "Email is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...driverForm } : d));
    } else {
      const added: User = { id: `u${Date.now()}`, ...driverForm, stats: { efficiency: 0, safetyRank: 0, totalDistance: 0, rating: 0, tripCount: 0, safetyScore: 0, recentTrips: [] } };
      setDrivers(prev => [...prev, added]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers & Personnel</h1>
          <p className="text-slate-500">Manage driver assignments and performance rankings.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 font-bold"
        >
          <Plus className="h-5 w-5" />
          Add Driver
        </button>
      </div>

      {filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDrivers.map(driver => (
            <div key={driver.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-2xl border-2 border-blue-50">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{driver.name}</h3>
                      <p className="text-[10px] text-blue-600 uppercase tracking-[0.2em] font-black mt-1">{driver.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEditModal(driver)} className="p-2 text-slate-300 hover:text-blue-600 rounded-xl"><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => setDeletingDriverId(driver.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-xl"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-3 rounded-xl"><Mail className="h-4 w-4 mr-3 text-slate-400" />{driver.email}</div>
                  <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-3 rounded-xl"><Phone className="h-4 w-4 mr-3 text-slate-400" />{driver.phone || 'N/A'}</div>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50">
                <button onClick={() => setPerformanceDriver(driver)} className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-black text-slate-600 uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                  View Performance Scorecard <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
          <SearchX className="h-10 w-10 text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900">No Personnel Found</h3>
        </div>
      )}

      {/* Performance Modal */}
      <Modal 
        isOpen={!!performanceDriver} 
        onClose={() => setPerformanceDriver(null)} 
        title={`Scorecard: ${performanceDriver?.name}`}
      >
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600 mb-4" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Efficiency</p>
              <p className="text-3xl font-black text-blue-900">{performanceDriver?.stats?.efficiency || 0}%</p>
            </div>
            <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
              <ShieldCheck className="h-6 w-6 text-green-600 mb-4" />
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Safety Score</p>
              <p className="text-3xl font-black text-green-900">{performanceDriver?.stats?.safetyScore || 0}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500" /> Trip History</h4>
            <div className="space-y-3">
              {driverTrips.length > 0 ? driverTrips.map((trip) => (
                <div key={trip.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{trip.origin} → {trip.destination}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{trip.status}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedLogbookTrip(trip)}
                    className="p-2 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              )) : (
                <div className="p-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase">No recent trajectories</div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Logbook Modal (Accessible from within Performance Modal) */}
      <Modal 
        isOpen={!!selectedLogbookTrip} 
        onClose={() => setSelectedLogbookTrip(null)} 
        title="Trip Detailed Log"
      >
        {selectedLogbookTrip && (() => {
          const vehicle = MOCK_VEHICLES.find(v => v.id === selectedLogbookTrip.vehicleId);
          return (
            <div className="space-y-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">ID: {selectedLogbookTrip.id}</span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">{selectedLogbookTrip.status}</span>
              </div>
              <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500 uppercase font-black">Origin</p>
                  <p className="font-black italic">{selectedLogbookTrip.origin}</p>
                </div>
                <Navigation className="h-4 w-4 text-blue-500 rotate-90" />
                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500 uppercase font-black">Destination</p>
                  <p className="font-black italic">{selectedLogbookTrip.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Gauge className="h-4 w-4 text-blue-600 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase">Start Odo</p>
                  <p className="font-black">{selectedLogbookTrip.startOdometer} KM</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Truck className="h-4 w-4 text-green-600 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase">Distance</p>
                  <p className="font-black">{selectedLogbookTrip.distance} KM</p>
                </div>
              </div>
              <div className="p-6 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Vehicle</p>
                    <p className="text-sm font-black">{vehicle?.make} {vehicle?.model}</p>
                  </div>
                </div>
                <p className="text-blue-600 font-black font-mono">{vehicle?.plate}</p>
              </div>
              <button onClick={() => setSelectedLogbookTrip(null)} className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest">Close Record</button>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDriver ? "Edit Personnel" : "Add Personnel"}>
        <div className="space-y-4">
          <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl" placeholder="Full Name" value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} />
          <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl" placeholder="Email" value={driverForm.email} onChange={e => setDriverForm({...driverForm, email: e.target.value})} />
          <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl" placeholder="Phone" value={driverForm.phone} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} />
          <button onClick={handleSaveDriver} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">Save Driver</button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deletingDriverId} onClose={() => setDeletingDriverId(null)} title="Confirm Removal">
        <div className="space-y-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-slate-500">Are you sure you want to remove this driver from the fleet system?</p>
          <div className="flex gap-4">
            <button onClick={() => setDeletingDriverId(null)} className="flex-1 py-3 bg-slate-100 rounded-xl">Cancel</button>
            <button onClick={() => { setDrivers(prev => prev.filter(d => d.id !== deletingDriverId)); setDeletingDriverId(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Confirm Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
