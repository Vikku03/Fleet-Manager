
import React, { useState, useMemo } from 'react';
import { GeminiService } from '../services/gemini';
import { useApp, Modal } from '../App';
import { MOCK_USERS, MOCK_VEHICLES } from '../services/mockData';
import { UserRole, Trip } from '../types';
import { MapPin, Navigation, Info, Loader2, Route as RouteIcon, Search, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RouteOptimizer() {
  const { addNotification, addTrip } = useApp();
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<any>(null);
  const [inputs, setInputs] = useState({ origin: '', destination: '', vehicleType: 'Truck' });
  
  // Dispatch States
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const gemini = useMemo(() => new GeminiService(), []);

  const availableDrivers = useMemo(() => 
    MOCK_USERS.filter(u => u.role === UserRole.DRIVER), 
  []);

  const handleOptimize = async () => {
    if (!inputs.origin.trim() || !inputs.destination.trim()) {
      addNotification('Missing Information', 'Please specify both origin and destination points.', 'warning');
      return;
    }
    setLoading(true);
    setIsDispatched(false);
    try {
      const result = await gemini.getRouteOptimization(inputs.origin, inputs.destination, inputs.vehicleType);
      setRoute(result);
      
      if (result.source === 'Local') {
        addNotification('Standard Route Used', 'AI Quota limit reached. Providing standard highway corridor.', 'info');
      } else {
        addNotification('AI Optimization Active', 'Neural engine has synthesized the most efficient route.', 'success');
      }
    } catch (e) {
      console.error(e);
      addNotification('Service Error', 'Logistics engine is currently offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchExecute = () => {
    const driver = availableDrivers.find(d => d.id === selectedDriverId);
    if (!driver) return;

    const vehicle = MOCK_VEHICLES.find(v => v.status === 'Active') || MOCK_VEHICLES[0];

    const newTrip: Trip = {
      id: `t${Date.now()}`,
      vehicleId: vehicle.id,
      driverId: driver.id,
      origin: inputs.origin,
      destination: inputs.destination,
      startDate: new Date().toISOString(),
      startOdometer: vehicle.mileage,
      distance: route?.total_distance_km || 0,
      status: 'In Progress'
    };

    addTrip(newTrip);
    setIsDispatchModalOpen(false);
    setIsDispatched(true);
    addNotification('Fleet Dispatched', `${driver.name} assigned to: ${route?.route_name}.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Route Terminal</h1>
          <p className="text-slate-500 font-medium">Trajectory calculation with AI-to-Local auto-failover.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" /> Configuration
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origin Point</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input type="text" value={inputs.origin} onChange={e => setInputs(prev => ({ ...prev, origin: e.target.value }))} placeholder="City/Hub" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input type="text" value={inputs.destination} onChange={e => setInputs(prev => ({ ...prev, destination: e.target.value }))} placeholder="Target Hub" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" />
                </div>
              </div>

              <button 
                onClick={handleOptimize}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl disabled:opacity-70 transition-all uppercase tracking-[0.2em] text-xs"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-blue-400" />}
                <span>{loading ? 'Calculating...' : 'Calculate Route'}</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <ShieldCheck className="absolute top-[-20px] right-[-20px] h-40 w-40 opacity-10" />
            <h4 className="font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> Fail-Safe Engine
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              This terminal automatically switches to standard logistics corridors if AI quota is exhausted, ensuring zero downtime for dispatch operations.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {route ? (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className={`p-10 border-b border-slate-100 flex items-center justify-between ${route.source === 'Local' ? 'bg-orange-50/30' : 'bg-blue-50/30'}`}>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic mb-1 uppercase">{route.route_name}</h3>
                  <div className="flex items-center gap-2">
                    {route.source === 'Local' ? (
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Standard Corridor (AI Offline)
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Optimized
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black italic tracking-tighter text-slate-900">{route.efficiency_score}%</div>
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Efficiency</div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white text-center">
                <div className="p-8">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Distance</p>
                  <p className="text-2xl font-black text-slate-900">{route.total_distance_km} KM</p>
                </div>
                <div className="p-8">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Time</p>
                  <p className="text-2xl font-black text-slate-900">{route.estimated_duration_min} MIN</p>
                </div>
                <div className="p-8">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Fuel Est.</p>
                  <p className="text-2xl font-black text-green-600">₹{route.fuel_cost_estimate?.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-10">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <RouteIcon className="h-4 w-4 text-blue-600" /> Navigation Protocol
                </h4>
                <div className="space-y-6">
                  {route.steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-6">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => setIsDispatchModalOpen(true)}
                    disabled={isDispatched}
                    className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                      isDispatched ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100'
                    }`}
                  >
                    {isDispatched ? 'Dispatched Successfully' : 'Execute Dispatch'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center">
              <RouteIcon className="h-16 w-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-900 italic">No Active Trajectory</h3>
              <p className="text-slate-400 max-w-xs mt-4 font-bold text-sm">Enter manual location hubs to initiate route calculation.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isDispatchModalOpen} onClose={() => setIsDispatchModalOpen(false)} title="Select Personnel">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Available regional drivers</label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {availableDrivers.map(driver => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriverId(driver.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedDriverId === driver.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-slate-50 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black border border-slate-100 shadow-sm">{driver.name.charAt(0)}</div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900">{driver.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{driver.role}</p>
                    </div>
                  </div>
                  {selectedDriverId === driver.id && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleDispatchExecute}
            disabled={!selectedDriverId}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50"
          >
            Confirm Dispatch
          </button>
        </div>
      </Modal>
    </div>
  );
}
