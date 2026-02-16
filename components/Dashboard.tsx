
import React, { useState, useMemo } from 'react';
import { useApp, Modal } from '../App';
import { MOCK_VEHICLES, MOCK_USERS } from '../services/mockData';
import { UserRole, Trip } from '../types';
import { 
  Truck, 
  AlertTriangle, 
  Clock, 
  Fuel, 
  MapPin, 
  X,
  Plus,
  Download,
  SearchX,
  ChevronRight,
  Navigation,
  User as UserIcon,
  CheckCircle2,
  Calendar,
  Zap,
  Package,
  FileText,
  Gauge,
  Droplets,
  Edit3,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const dataStatus = [
  { name: 'Active', value: 12, color: '#3b82f6' },
  { name: 'In Repair', value: 3, color: '#f59e0b' },
  { name: 'Inactive', value: 2, color: '#94a3b8' },
];

const dataEfficiency = [
  { name: 'Mon', fuel: 400, trips: 24 },
  { name: 'Tue', fuel: 300, trips: 13 },
  { name: 'Wed', fuel: 200, trips: 98 },
  { name: 'Thu', fuel: 278, trips: 39 },
  { name: 'Fri', fuel: 189, trips: 48 },
  { name: 'Sat', fuel: 239, trips: 38 },
  { name: 'Sun', fuel: 349, trips: 43 },
];

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const ACTIVE_FLEET = [
  { id: 'v1', name: 'Tata Nexon EV', plate: 'MH-12-RT-4567', loc: 'Pune Expressway', status: 'In Transit', speed: '85 km/h', time: '2 mins ago' },
  { id: 'v2', name: 'Mahindra Bolero Neo', plate: 'DL-04-CA-8901', loc: 'Connaught Place', status: 'Parked', speed: '0 km/h', time: '15 mins ago' },
  { id: 'v3', name: 'Ashok Leyland Dost+', plate: 'KA-01-MJ-2233', loc: 'Outer Ring Rd, Blr', status: 'Idling', speed: '5 km/h', time: '1 min ago' },
];

export default function Dashboard() {
  const { searchQuery, user, t, addNotification, trips, addTrip, updateTrip } = useApp();
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedLogbookTrip, setSelectedLogbookTrip] = useState<Trip | null>(null);
  const [statusUpdateTrip, setStatusUpdateTrip] = useState<Trip | null>(null);
  
  const [tripForm, setTripForm] = useState({
    vehicleId: '',
    driverId: '',
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });

  const availableDrivers = useMemo(() => MOCK_USERS.filter(u => u.role === UserRole.DRIVER), []);
  const activeVehicles = useMemo(() => MOCK_VEHICLES.filter(v => v.status === 'Active'), []);

  const myTrips = useMemo(() => {
    if (user?.role === UserRole.DRIVER) {
      // Show all assignments regardless of status to allow historical lookup if needed
      return trips.filter(t => t.driverId === user.id);
    }
    return trips;
  }, [trips, user]);

  const filteredFleet = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return ACTIVE_FLEET.filter(v => 
      v.name.toLowerCase().includes(query) || 
      v.plate.toLowerCase().includes(query) ||
      v.loc.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleExportData = () => {
    addNotification('Export Complete', 'Fleet report generated successfully.', 'success');
  };

  const handleCreateTrip = () => {
    if (!tripForm.vehicleId || !tripForm.driverId || !tripForm.origin || !tripForm.destination) return;
    const selectedVehicle = MOCK_VEHICLES.find(v => v.id === tripForm.vehicleId);
    const newTrip: Trip = {
      id: `t${Date.now()}`,
      vehicleId: tripForm.vehicleId,
      driverId: tripForm.driverId,
      origin: tripForm.origin,
      destination: tripForm.destination,
      startDate: `${tripForm.date}T09:00:00`,
      startOdometer: selectedVehicle?.mileage || 0,
      distance: 0,
      status: 'Scheduled'
    };
    addTrip(newTrip);
    addNotification('New Trip Initialized', `Asset dispatched for ${tripForm.destination}.`, 'success');
    setShowTripModal(false);
  };

  const handleStatusChange = (status: Trip['status']) => {
    if (!statusUpdateTrip) return;
    
    const updates: Partial<Trip> = { status };
    if (status === 'Completed') {
      updates.endDate = new Date().toISOString();
    }
    
    updateTrip(statusUpdateTrip.id, updates);
    addNotification('Trip Updated', `Trajectory is now marked as ${status}.`, 'success');
    setStatusUpdateTrip(null);
  };

  if (user?.role === UserRole.DRIVER) {
    const activeTripCount = myTrips.filter(t => t.status === 'In Progress').length;
    const safetyScore = user.stats?.safetyScore || 0;
    const totalDist = user.stats?.totalDistance.toLocaleString() || 0;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">My Assignments</h1>
            <p className="text-slate-500 font-medium">Hello {user.name}, manage your active trajectories below.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Assignments" value={activeTripCount} icon={Navigation} color="bg-blue-500" />
          <StatCard title="Total Distance" value={`${totalDist} KM`} icon={Truck} color="bg-indigo-500" />
          <StatCard title="Safety Score" value={`${safetyScore}%`} icon={CheckCircle2} color="bg-green-500" />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">Assigned Trajectories</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {myTrips.length > 0 ? myTrips.map(trip => {
              const vehicle = MOCK_VEHICLES.find(v => v.id === trip.vehicleId);
              return (
                <div key={trip.id} className="p-8 hover:bg-slate-50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-200">
                      <Truck className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-xl text-slate-900 tracking-tight">{trip.origin} → {trip.destination}</h4>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          trip.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                          trip.status === 'Completed' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>{trip.status}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-500">{vehicle?.plate} • {new Date(trip.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setStatusUpdateTrip(trip)}
                      className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" /> Manage Status
                    </button>
                    <button 
                      onClick={() => setSelectedLogbookTrip(trip)} 
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                      Open Logbook
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="p-20 text-center text-slate-400">No Assignments Found</div>
            )}
          </div>
        </div>

        {/* Status Update Modal */}
        <Modal 
          isOpen={!!statusUpdateTrip} 
          onClose={() => setStatusUpdateTrip(null)} 
          title="Update Trajectory Status"
        >
          {statusUpdateTrip && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Trajectory</p>
                <p className="text-lg font-black text-slate-900 italic">{statusUpdateTrip.origin} → {statusUpdateTrip.destination}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleStatusChange('In Progress')}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 border-2 transition-all ${
                    statusUpdateTrip.status === 'In Progress' 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                  }`}
                >
                  <PlayCircle className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-widest">Mark as In Progress</p>
                    <p className="text-[10px] opacity-70">Begin active telemetry tracking</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleStatusChange('Completed')}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 border-2 transition-all ${
                    statusUpdateTrip.status === 'Completed' 
                    ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-200' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-green-200'
                  }`}
                >
                  <CheckCircle className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-widest">Mark as Completed</p>
                    <p className="text-[10px] opacity-70">Finalize trip and log odometer</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleStatusChange('Scheduled')}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 border-2 transition-all ${
                    statusUpdateTrip.status === 'Scheduled' 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <Calendar className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-black text-xs uppercase tracking-widest">Mark as Scheduled</p>
                    <p className="text-[10px] opacity-70">Reset to planning phase</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Driver Logbook Modal */}
        <Modal isOpen={!!selectedLogbookTrip} onClose={() => setSelectedLogbookTrip(null)} title="Digital Trip Logbook">
          {selectedLogbookTrip && (() => {
            const v = MOCK_VEHICLES.find(veh => veh.id === selectedLogbookTrip.vehicleId);
            return (
              <div className="space-y-8">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>ID: {selectedLogbookTrip.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-white ${
                      selectedLogbookTrip.status === 'Completed' ? 'bg-green-600' : 
                      selectedLogbookTrip.status === 'In Progress' ? 'bg-blue-600' : 'bg-slate-700'
                    }`}>{selectedLogbookTrip.status}</span>
                  </div>
                </div>
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between">
                  <div className="text-center flex-1"><p className="text-[10px] text-slate-500 uppercase font-black">Origin</p><p className="text-lg font-black">{selectedLogbookTrip.origin}</p></div>
                  <Navigation className="h-4 w-4 text-blue-500 rotate-90" />
                  <div className="text-center flex-1"><p className="text-[10px] text-slate-500 uppercase font-black">Destination</p><p className="text-lg font-black">{selectedLogbookTrip.destination}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem]">
                    <Gauge className="h-4 w-4 text-blue-600 mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase">Start Odo</p>
                    <p className="text-2xl font-black text-slate-900">{selectedLogbookTrip.startOdometer} KM</p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem]">
                    <Truck className="h-4 w-4 text-green-600 mb-2" /><p className="text-[10px] font-black text-slate-400 uppercase">Target KM</p>
                    <p className="text-2xl font-black text-slate-900">{selectedLogbookTrip.distance} KM</p>
                  </div>
                </div>
                <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-between">
                  <div className="flex items-center gap-3"><Package className="h-6 w-6 text-slate-300" /><div><p className="text-[10px] text-slate-400 font-black">Asset</p><p className="text-sm font-black">{v?.plate}</p></div></div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setStatusUpdateTrip(selectedLogbookTrip);
                      setSelectedLogbookTrip(null);
                    }}
                    className="flex-1 py-5 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50"
                  >
                    Manage Status
                  </button>
                  <button onClick={() => setSelectedLogbookTrip(null)} className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">Close Record</button>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-slate-900 italic uppercase">{t('fleetDashboard')}</h1><p className="text-slate-500 font-medium">{t('realTimeMonitoring')}</p></div>
        <div className="flex items-center space-x-3">
          <button onClick={handleExportData} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"><Download className="h-4 w-4" /> {t('exportData')}</button>
          <button onClick={() => setShowTripModal(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all"><Plus className="h-4 w-4" /> {t('newTrip')}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalVehicles')} value="48" icon={Truck} trend={12} color="bg-blue-500" />
        <StatCard title={t('activeTrips')} value={trips.filter(tr => tr.status !== 'Completed').length.toString()} icon={MapPin} color="bg-indigo-500" />
        <StatCard title={t('maintenanceAlerts')} value="6" icon={AlertTriangle} trend={-5} color="bg-orange-500" />
        <StatCard title={t('fuelCost')} value="₹8,45,200" icon={Fuel} trend={8} color="bg-green-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Efficiency Metrics</h3>
            <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={dataEfficiency}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} /><Bar dataKey="trips" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} /><Bar dataKey="fuel" fill="#fbbf24" radius={[6, 6, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Fleet Availability</h3>
          <div className="h-64 relative mb-6"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dataStatus} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">{dataStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-3xl font-black text-slate-900">48</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regional Units</span></div></div>
        </div>
      </div>
      <Modal isOpen={showTripModal} onClose={() => setShowTripModal(false)} title="Dispatch Terminal">
        <div className="space-y-4">
          <select value={tripForm.vehicleId} onChange={e => setTripForm({...tripForm, vehicleId: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
            <option value="">Select Asset</option>
            {activeVehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
          </select>
          <select value={tripForm.driverId} onChange={e => setTripForm({...tripForm, driverId: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
            <option value="">Select Personnel</option>
            {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input type="text" placeholder="Origin" value={tripForm.origin} onChange={e => setTripForm({...tripForm, origin: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" />
          <input type="text" placeholder="Destination" value={tripForm.destination} onChange={e => setTripForm({...tripForm, destination: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" />
          <button onClick={handleCreateTrip} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl">Authorize Dispatch</button>
        </div>
      </Modal>
    </div>
  );
}
