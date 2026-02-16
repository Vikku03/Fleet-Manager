
import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../App';
import { MOCK_VEHICLES } from '../services/mockData';
import { Plus, Filter, Search as SearchIcon, Truck, Fuel, Calendar, X, Edit2, Camera, Navigation, Gauge, AlertCircle } from 'lucide-react';
import { Vehicle, VehicleType } from '../types';

// Precise image mapping for all 19 Indian vehicle types with verified high-quality assets
const VEHICLE_TYPE_CONFIG: Record<VehicleType, { image: string; defaultMileage: number; fuel: Vehicle['fuelType'] }> = {
  'Motorcycle': { image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=600', defaultMileage: 5000, fuel: 'Gasoline' },
  'Scooter': { image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=600', defaultMileage: 2500, fuel: 'Gasoline' },
  'Auto Rickshaw': { image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&q=80&w=600', defaultMileage: 15000, fuel: 'CNG' },
  'E-Rickshaw': { image: 'https://images.unsplash.com/photo-1619460907101-78a0d4580218?auto=format&fit=crop&q=80&w=600', defaultMileage: 1200, fuel: 'Electric' },
  'Hatchback': { image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600', defaultMileage: 8000, fuel: 'Gasoline' },
  'Sedan': { image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600', defaultMileage: 12000, fuel: 'Diesel' },
  'SUV': { image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600', defaultMileage: 15000, fuel: 'Diesel' },
  'Mini Van': { image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=600', defaultMileage: 25000, fuel: 'CNG' },
  'Tempo Traveler': { image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600', defaultMileage: 35000, fuel: 'Diesel' },
  'Pickup Truck': { image: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=600', defaultMileage: 18000, fuel: 'Diesel' },
  'LCV (Tata Ace)': { image: 'https://images.unsplash.com/photo-1594913785162-e6785b49dea3?auto=format&fit=crop&q=80&w=600', defaultMileage: 22000, fuel: 'Diesel' },
  '6-Tyre Truck': { image: 'https://images.unsplash.com/photo-1591768793355-74d7af73859f?auto=format&fit=crop&q=80&w=600', defaultMileage: 45000, fuel: 'Diesel' },
  '10-Tyre Truck': { image: 'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&q=80&w=600', defaultMileage: 65000, fuel: 'Diesel' },
  '12-Tyre Lorry': { image: 'https://images.unsplash.com/photo-1566367790947-63d64bcc057a?auto=format&fit=crop&q=80&w=600', defaultMileage: 85000, fuel: 'Diesel' },
  '16-Tyre Trailer': { image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600', defaultMileage: 120000, fuel: 'Diesel' },
  'Tipper': { image: 'https://images.unsplash.com/photo-1517524008410-99256e6cabc6?auto=format&fit=crop&q=80&w=600', defaultMileage: 5000, fuel: 'Diesel' },
  'Tanker': { image: 'https://images.unsplash.com/photo-1542442828-287217bfb842?auto=format&fit=crop&q=80&w=600', defaultMileage: 70000, fuel: 'Diesel' },
  'Tractor': { image: 'https://images.unsplash.com/photo-1586191128546-abc2741914f1?auto=format&fit=crop&q=80&w=600', defaultMileage: 1500, fuel: 'Diesel' },
  'Bus': { image: 'https://images.unsplash.com/photo-1494515426402-f1980ca7a4cd?auto=format&fit=crop&q=80&w=600', defaultMileage: 150000, fuel: 'Diesel' },
};

export default function VehicleModule() {
  const { searchQuery } = useApp();
  // State management for the vehicle inventory
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => [...MOCK_VEHICLES]);
  const [filter, setFilter] = useState('All');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    make: '', model: '', year: 2024, plate: '', vin: '', type: 'SUV', status: 'Active', fuelType: 'Diesel', mileage: 0, nextServiceDue: ''
  });

  const handleTypeChange = (type: VehicleType) => {
    const config = VEHICLE_TYPE_CONFIG[type];
    setFormData(prev => ({
      ...prev,
      type,
      image: config.image,
      mileage: config.defaultMileage,
      fuelType: config.fuel
    }));
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filter === 'All' || v.status === filter;
      
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, filter]);

  const handleOpenModal = useCallback((vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({ ...vehicle });
    } else {
      setEditingVehicle(null);
      const defaultType: VehicleType = 'SUV';
      const config = VEHICLE_TYPE_CONFIG[defaultType];
      setFormData({
        make: '', 
        model: '', 
        year: 2024, 
        plate: '', 
        vin: '', 
        type: defaultType, 
        status: 'Active', 
        fuelType: config.fuel, 
        mileage: config.defaultMileage, 
        nextServiceDue: new Date().toISOString().split('T')[0],
        image: config.image
      });
    }
    setIsModalOpen(true);
  }, []);

  const handleSave = () => {
    if (!formData.make || !formData.model || !formData.plate) {
      alert("Please fill in basic details (Make, Model, Plate)");
      return;
    }

    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...formData } as Vehicle : v));
    } else {
      const newVehicle: Vehicle = {
        ...formData,
        id: `v${Date.now()}`,
      } as Vehicle;
      setVehicles(prev => [newVehicle, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Inventory</h1>
          <p className="text-slate-500 font-medium">Monitoring {filteredVehicles.length} regional transport assets.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 font-black uppercase tracking-widest text-xs active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span>Register Vehicle</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center space-x-2 w-full">
          <Filter className="h-5 w-5 text-slate-400 mr-2" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Maintenance">In Maintenance</option>
            <option value="Out of Service">Out of Service</option>
            <option value="Retired">Retired</option>
          </select>
          <div className="text-xs font-black text-slate-400 ml-auto hidden md:block uppercase tracking-widest">
            Results: {filteredVehicles.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVehicles.length > 0 ? filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full">
            {/* Header Image with Status */}
            <div className="h-52 relative overflow-hidden bg-slate-100">
              <img 
                src={vehicle.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400'} 
                alt={vehicle.model} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute top-5 right-5">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/30 ${
                  vehicle.status === 'Active' ? 'bg-green-500/90 text-white' : 
                  vehicle.status === 'In Maintenance' ? 'bg-orange-500/90 text-white' : 
                  vehicle.status === 'Retired' ? 'bg-slate-500/90 text-white' : 'bg-red-500/90 text-white'
                }`}>
                  {vehicle.status}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 flex items-start justify-between">
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">{vehicle.make} {vehicle.model}</h3>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vehicle.type}</span>
                     <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{vehicle.year}</span>
                   </div>
                </div>
              </div>

              {/* Registration Mark Box */}
              <div className="p-5 bg-[#0e172a] rounded-[1.5rem] mb-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-8 h-1 w-12 bg-blue-500/30 rounded-b-full"></div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-center opacity-80">Registration Mark</p>
                <p className="text-xl font-black text-center text-white tracking-[0.35em] uppercase font-mono">{vehicle.plate}</p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-4 bg-[#f8faff] rounded-[2rem] border border-blue-50 shadow-sm">
                  <div className="p-3 bg-blue-100/50 rounded-2xl text-blue-600">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-slate-400 font-black uppercase text-[8px] tracking-[0.1em] mb-1">Mileage</p>
                    <p className="font-black text-slate-800 text-sm truncate">{vehicle.mileage.toLocaleString()} KM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-[#fffaf5] rounded-[2rem] border border-orange-50 shadow-sm">
                  <div className="p-3 bg-orange-100/50 rounded-2xl text-orange-600">
                    <Fuel className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-slate-400 font-black uppercase text-[8px] tracking-[0.1em] mb-1">Fuel</p>
                    <p className="font-black text-slate-800 text-sm truncate">{vehicle.fuelType}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center text-slate-400 font-bold uppercase tracking-tighter text-[10px]">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Service Due: {new Date(vehicle.nextServiceDue).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS - Only Update allowed as requested */}
            <div className="px-8 pb-10 flex items-center">
              <button 
                onClick={() => handleOpenModal(vehicle)}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-white border-2 border-slate-200 text-slate-700 rounded-full text-[11px] font-black uppercase tracking-[0.1em] hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
              >
                <Edit2 className="h-4 w-4" />
                <span>Update Asset Details</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="h-28 w-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <SearchIcon className="h-12 w-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No Assets Found</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-4 leading-relaxed">Adjust your search or status filters to locate specific regional assets.</p>
          </div>
        )}
      </div>

      {/* Asset Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-full max-h-[90vh]">
            
            {/* Asset Sidebar Preview */}
            <div className="w-full md:w-[40%] bg-slate-100 relative group overflow-hidden border-r border-slate-100 hidden md:block">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0e172a] via-slate-900/10 to-transparent z-10"></div>
               <img 
                 src={formData.image} 
                 alt="Preview" 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
               />
               <div className="absolute bottom-10 left-10 right-10 z-20">
                 <div className="p-8 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Registration Profile</p>
                    <h3 className="text-4xl font-black text-white tracking-tight leading-none mb-6 italic uppercase">
                       {formData.plate || 'No Plate'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                        <Gauge className="h-3 w-3 text-blue-400" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{formData.mileage} KM</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                        <Fuel className="h-3 w-3 text-orange-400" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{formData.fuelType}</span>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Data Entry Form */}
            <div className="w-full md:w-[60%] flex flex-col bg-white">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white/50 sticky top-0 z-20">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                    {editingVehicle ? 'Edit Fleet Asset' : 'Register New Fleet'}
                  </h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Administrative Management Console</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-[1.5rem] transition-all bg-slate-50">
                  <X className="h-6 w-6 text-slate-500" />
                </button>
              </div>

              <div className="p-12 flex-1 overflow-y-auto space-y-10 custom-scrollbar">
                {/* Status Selection Row - Clear & Prominent */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-5 block">Operational Status Change</label>
                  <div className="flex flex-wrap gap-3">
                    {['Active', 'In Maintenance', 'Out of Service', 'Retired'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFormData({...formData, status: status as any})}
                        className={`flex-1 min-w-[120px] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          formData.status === status 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Fleet Category</label>
                    <select 
                      value={formData.type} 
                      onChange={e => handleTypeChange(e.target.value as VehicleType)}
                      className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black text-sm transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      {Object.keys(VEHICLE_TYPE_CONFIG).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Brand/Manufacturer</label>
                      <input 
                        type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})}
                        placeholder="e.g. Tata Motors" className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold text-sm shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Model Variant</label>
                      <input 
                        type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}
                        placeholder="e.g. Nexon EV Prime" className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold text-sm shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">License Plate</label>
                      <input 
                        type="text" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})}
                        placeholder="MH-XX-XX-XXXX" className="w-full p-5 bg-slate-900 text-white rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/30 font-black text-lg uppercase font-mono tracking-[0.2em] shadow-xl" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Mileage Reading (KM)</label>
                      <input 
                        type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})}
                        className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-black text-sm shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Fuel Selection</label>
                      <select 
                        value={formData.fuelType} 
                        onChange={e => setFormData({...formData, fuelType: e.target.value as any})}
                        className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-black text-sm shadow-sm"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Gasoline">Petrol</option>
                        <option value="CNG">CNG</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-4 block">Service Schedule</label>
                      <input 
                        type="date" value={formData.nextServiceDue} onChange={e => setFormData({...formData, nextServiceDue: e.target.value})}
                        className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-black text-sm shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 border-t border-slate-50 bg-slate-50/50 flex items-center space-x-6">
                <button 
                  onClick={handleSave}
                  className="flex-1 py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-4"
                >
                  <Navigation className="h-6 w-6" />
                  {editingVehicle ? 'Update Fleet Record' : 'Commit New Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
