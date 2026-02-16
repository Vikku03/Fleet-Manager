
import React, { useState, useMemo } from 'react';
import { useApp, Modal } from '../App';
import { MOCK_MAINTENANCE, MOCK_VEHICLES } from '../services/mockData';
import { GeminiService } from '../services/gemini';
import { Wrench, Calendar, Clock, AlertCircle, Sparkles, CheckCircle2, Loader2, SearchX, Plus, User, IndianRupee, FileText, Edit2 } from 'lucide-react';
import { MaintenanceRecord } from '../types';

export default function MaintenanceModule() {
  const { searchQuery } = useApp();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [activeVehicle, setActiveVehicle] = useState(MOCK_VEHICLES[0]);
  
  // State for maintenance history
  const [records, setRecords] = useState<MaintenanceRecord[]>(() => [...MOCK_MAINTENANCE]);
  
  // Modal & Form State
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  
  const [workOrderForm, setWorkOrderForm] = useState({
    vehicleId: MOCK_VEHICLES[0].id,
    serviceType: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    technician: '',
    description: '',
    status: 'Scheduled' as MaintenanceRecord['status'],
    mileage: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter(record => {
      const vehicle = MOCK_VEHICLES.find(v => v.id === record.vehicleId);
      return (
        record.serviceType.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.technician.toLowerCase().includes(query) ||
        vehicle?.plate.toLowerCase().includes(query) ||
        vehicle?.model.toLowerCase().includes(query) ||
        vehicle?.make.toLowerCase().includes(query)
      );
    });
  }, [records, searchQuery]);

  const getAIPredictions = async () => {
    setLoading(true);
    try {
      const gemini = new GeminiService();
      const history = records.filter(m => m.vehicleId === activeVehicle.id);
      const result = await gemini.getPredictiveMaintenance(activeVehicle, history);
      setPredictions(result);
    } catch (e) {
      console.error(e);
      alert('Error fetching predictions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setWorkOrderForm({
      vehicleId: MOCK_VEHICLES[0].id,
      serviceType: '',
      date: new Date().toISOString().split('T')[0],
      cost: '',
      technician: '',
      description: '',
      status: 'Scheduled',
      mileage: ''
    });
    setFormErrors({});
    setIsWorkOrderModalOpen(true);
  };

  const handleOpenEditModal = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setWorkOrderForm({
      vehicleId: record.vehicleId,
      serviceType: record.serviceType,
      date: record.date,
      cost: record.cost.toString(),
      technician: record.technician,
      description: record.description,
      status: record.status,
      mileage: record.mileage.toString()
    });
    setFormErrors({});
    setIsWorkOrderModalOpen(true);
  };

  const handleSaveWorkOrder = () => {
    const errors: Record<string, string> = {};
    if (!workOrderForm.serviceType.trim()) errors.serviceType = "Service type is required";
    if (!workOrderForm.technician.trim()) errors.technician = "Technician name is required";
    if (!workOrderForm.cost || isNaN(Number(workOrderForm.cost))) errors.cost = "Valid cost is required";
    if (!workOrderForm.mileage || isNaN(Number(workOrderForm.mileage))) errors.mileage = "Current mileage required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingRecord) {
      // Update Existing Record
      setRecords(prev => prev.map(r => 
        r.id === editingRecord.id 
          ? { 
              ...r, 
              vehicleId: workOrderForm.vehicleId,
              serviceType: workOrderForm.serviceType,
              date: workOrderForm.date,
              mileage: Number(workOrderForm.mileage),
              cost: Number(workOrderForm.cost),
              status: workOrderForm.status,
              technician: workOrderForm.technician,
              description: workOrderForm.description
            } 
          : r
      ));
    } else {
      // Create New Record
      const newRecord: MaintenanceRecord = {
        id: `m${Date.now()}`,
        vehicleId: workOrderForm.vehicleId,
        serviceType: workOrderForm.serviceType,
        date: workOrderForm.date,
        mileage: Number(workOrderForm.mileage),
        cost: Number(workOrderForm.cost),
        status: workOrderForm.status,
        technician: workOrderForm.technician,
        description: workOrderForm.description
      };
      setRecords(prev => [newRecord, ...prev]);
    }

    setIsWorkOrderModalOpen(false);
    setEditingRecord(null);
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service & Maintenance</h1>
          <p className="text-slate-500 font-medium">Track repairs, schedule preventive care, and view AI health insights.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2 font-black uppercase tracking-widest text-xs active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Create Work Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Maintenance History</h3>
              {searchQuery && (
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                  Showing {filteredRecords.length} Results
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? filteredRecords.map(record => {
                const vehicle = MOCK_VEHICLES.find(v => v.id === record.vehicleId);
                return (
                  <div key={record.id} className="p-6 flex items-start space-x-6 hover:bg-slate-50/50 transition-colors group">
                    <div className={`p-4 rounded-[1.25rem] transition-colors ${
                      record.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                      record.status === 'In Progress' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Wrench className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-slate-900 text-lg leading-tight">{record.serviceType}</h4>
                          <button 
                            onClick={() => handleOpenEditModal(record)}
                            className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Work Order"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-lg font-black text-slate-900">₹{record.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{vehicle?.plate}</span>
                        <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vehicle?.make} {vehicle?.model}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{record.description || 'No detailed description provided.'}</p>
                      <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                          <Calendar className="h-3 w-3 text-blue-500" /> 
                          {new Date(record.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                          <Clock className="h-3 w-3 text-blue-500" /> 
                          {record.mileage.toLocaleString()} KM
                        </span>
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                          <User className="h-3 w-3 text-blue-500" /> 
                          {record.technician}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg font-black ${
                          record.status === 'Completed' ? 'bg-green-500 text-white' : 
                          record.status === 'In Progress' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-20 text-center">
                  <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchX className="h-10 w-10 text-slate-200" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">No Records Found</h4>
                  <p className="text-slate-500 mt-2 max-w-xs mx-auto">Adjust your search or register a new work order to populate the maintenance log.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 flex items-center text-lg">
                <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
                Fleet Diagnostics
              </h3>
            </div>
            <div className="mb-6 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset for Analysis</label>
              <select 
                value={activeVehicle.id}
                onChange={(e) => setActiveVehicle(MOCK_VEHICLES.find(v => v.id === e.target.value)!)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-purple-500 font-bold appearance-none cursor-pointer"
              >
                {MOCK_VEHICLES.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} • {v.make} {v.model}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={getAIPredictions}
              disabled={loading}
              className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-purple-200 active:scale-95"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {loading ? 'Analyzing Telemetry...' : 'Generate AI Insights'}
            </button>

            <div className="mt-8 space-y-4">
              {predictions.length > 0 ? predictions.map((p, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-black text-sm text-slate-900 italic">{p.task}</h5>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter ${
                      p.urgency === 'Critical' ? 'bg-red-500 text-white' :
                      p.urgency === 'High' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {p.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{p.reason}</p>
                  <div className="flex items-center justify-between text-[10px] font-black border-t border-slate-200/50 pt-3">
                    <span className="text-slate-400 uppercase tracking-widest">Est: <span className="text-slate-900">₹{p.estimated_cost.toLocaleString()}</span></span>
                    <span className="text-slate-400 uppercase tracking-widest">At: <span className="text-slate-900">{p.estimated_mileage.toLocaleString()} KM</span></span>
                  </div>
                </div>
              )) : !loading && (
                <div className="text-center py-12 px-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <AlertCircle className="h-7 w-7 text-slate-200" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    Run predictive diagnostic to identify imminent component failures.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Work Order Modal */}
      <Modal 
        isOpen={isWorkOrderModalOpen} 
        onClose={() => setIsWorkOrderModalOpen(false)} 
        title={editingRecord ? "Edit Maintenance Record" : "Fleet Work Order Registration"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Allocation</label>
            <div className="relative">
              <select 
                value={workOrderForm.vehicleId}
                onChange={e => setWorkOrderForm({...workOrderForm, vehicleId: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold appearance-none text-sm"
              >
                {MOCK_VEHICLES.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} ({v.make} {v.model})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
              <div className="relative">
                <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="e.g. Brake Replacement"
                  value={workOrderForm.serviceType}
                  onChange={e => { setWorkOrderForm({...workOrderForm, serviceType: e.target.value}); setFormErrors({...formErrors, serviceType: ''}); }}
                  className={`w-full p-4 pl-12 bg-slate-50 border-2 ${formErrors.serviceType ? 'border-red-500' : 'border-slate-100'} rounded-2xl outline-none focus:border-blue-500 font-bold text-sm`}
                />
              </div>
              {formErrors.serviceType && <p className="text-[10px] text-red-500 font-black ml-1">{formErrors.serviceType}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technician</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Name"
                  value={workOrderForm.technician}
                  onChange={e => { setWorkOrderForm({...workOrderForm, technician: e.target.value}); setFormErrors({...formErrors, technician: ''}); }}
                  className={`w-full p-4 pl-12 bg-slate-50 border-2 ${formErrors.technician ? 'border-red-500' : 'border-slate-100'} rounded-2xl outline-none focus:border-blue-500 font-bold text-sm`}
                />
              </div>
              {formErrors.technician && <p className="text-[10px] text-red-500 font-black ml-1">{formErrors.technician}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Cost</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input 
                  type="number" 
                  placeholder="Amount"
                  value={workOrderForm.cost}
                  onChange={e => { setWorkOrderForm({...workOrderForm, cost: e.target.value}); setFormErrors({...formErrors, cost: ''}); }}
                  className={`w-full p-4 pl-12 bg-slate-50 border-2 ${formErrors.cost ? 'border-red-500' : 'border-slate-100'} rounded-2xl outline-none focus:border-blue-500 font-bold text-sm`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Odometer</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input 
                  type="number" 
                  placeholder="KM"
                  value={workOrderForm.mileage}
                  onChange={e => { setWorkOrderForm({...workOrderForm, mileage: e.target.value}); setFormErrors({...formErrors, mileage: ''}); }}
                  className={`w-full p-4 pl-12 bg-slate-50 border-2 ${formErrors.mileage ? 'border-red-500' : 'border-slate-100'} rounded-2xl outline-none focus:border-blue-500 font-bold text-sm`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Date</label>
              <input 
                type="date" 
                value={workOrderForm.date}
                onChange={e => setWorkOrderForm({...workOrderForm, date: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
              <textarea 
                placeholder="Details of the reported fault or maintenance requirements..."
                rows={3}
                value={workOrderForm.description}
                onChange={e => setWorkOrderForm({...workOrderForm, description: e.target.value})}
                className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Status</label>
            <div className="flex gap-3">
              {['Scheduled', 'In Progress', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setWorkOrderForm({...workOrderForm, status: status as any})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    workOrderForm.status === status 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSaveWorkOrder}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all uppercase tracking-[0.3em] text-xs active:scale-95"
          >
            {editingRecord ? "Update Work Order" : "Authorize Work Order"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
