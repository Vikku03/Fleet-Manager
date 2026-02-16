
import React, { useState } from 'react';
import { useApp, Modal } from '../App';
import { MOCK_USERS } from '../services/mockData';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Settings2, 
  Database, 
  Key, 
  History, 
  Edit2, 
  Lock, 
  Eye, 
  Trash2, 
  CheckCircle2,
  Clock,
  UserPlus,
  Mail,
  Shield,
  X,
  Globe,
  DollarSign,
  Ruler
} from 'lucide-react';

export default function AdminConsole() {
  const { addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'logs'>('users');
  const [personnel, setPersonnel] = useState(MOCK_USERS);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // System Config State
  const [systemCurrency, setSystemCurrency] = useState('Indian Rupee (INR)');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Metric (KM/Litre)');
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [globalIPRestriction, setGlobalIPRestriction] = useState(false);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, type: 'AUTH_SUCCESS', msg: 'System baseline updated.', time: '10:25 AM' },
    { id: 2, type: 'CONFIG_CHANGE', msg: 'Currency set to INR.', time: '09:15 AM' }
  ]);

  // Personnel Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [personnelForm, setPersonnelForm] = useState({
    name: '',
    email: '',
    role: UserRole.DRIVER
  });

  // Regional Modal State
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState(false);
  const [regionalForm, setRegionalForm] = useState({
    currency: systemCurrency,
    unit: unitOfMeasure
  });

  const addAuditEntry = (msg: string) => {
    const newLog = {
      id: Date.now(),
      type: 'CONFIG_CHANGE',
      msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleToggle2FA = () => {
    const nextState = !enforce2FA;
    setEnforce2FA(nextState);
    addNotification('Security Updated', `2FA Enforcement is now ${nextState ? 'ENABLED' : 'DISABLED'}.`, 'info');
    addAuditEntry(`Multi-factor authentication set to ${nextState ? 'ACTIVE' : 'INACTIVE'}.`);
  };

  const handleToggleIP = () => {
    const nextState = !globalIPRestriction;
    setGlobalIPRestriction(nextState);
    addNotification('Security Updated', `IP Restriction is now ${nextState ? 'ENABLED' : 'DISABLED'}.`, 'warning');
    addAuditEntry(`Global IP Filtering set to ${nextState ? 'ACTIVE' : 'INACTIVE'}.`);
  };

  const handleSaveRegional = () => {
    setSystemCurrency(regionalForm.currency);
    setUnitOfMeasure(regionalForm.unit);
    setIsRegionalModalOpen(false);
    addNotification('Config Saved', 'Regional preferences updated across the platform.', 'success');
    addAuditEntry(`Regional standards updated: ${regionalForm.currency}, ${regionalForm.unit}.`);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleOpenInvite = () => {
    setEditingId(null);
    setPersonnelForm({ name: '', email: '', role: UserRole.DRIVER });
    setIsModalOpen(true);
  };

  const handleEditClick = (staff: any) => {
    setEditingId(staff.id);
    setPersonnelForm({
      name: staff.name,
      email: staff.email,
      role: staff.role
    });
    setIsModalOpen(true);
  };

  const handlePersonnelSubmit = () => {
    if (!personnelForm.name.trim() || !personnelForm.email.trim()) {
      addNotification('Validation Error', 'Full name and email are mandatory fields.', 'error');
      return;
    }

    if (!validateEmail(personnelForm.email)) {
      addNotification('Invalid Email', 'Please provide a valid corporate email address.', 'error');
      return;
    }

    const isDuplicate = personnel.some(p => 
      p.email.toLowerCase() === personnelForm.email.toLowerCase() && p.id !== editingId
    );

    if (isDuplicate) {
      addNotification('Conflict Detected', 'This email address is already registered.', 'error');
      return;
    }

    if (editingId) {
      setPersonnel(prev => prev.map(p => p.id === editingId ? { ...p, ...personnelForm } : p));
      addNotification('Profile Updated', `Records for ${personnelForm.name} modified.`, 'success');
    } else {
      const newUser = { id: `u${Date.now()}`, ...personnelForm };
      setPersonnel(prev => [newUser, ...prev]);
      addNotification('Invitation Sent', `${personnelForm.name} added to directory.`, 'success');
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleResetCredentials = (userId: string, userName: string) => {
    setProcessingId(userId);
    setTimeout(() => {
      setProcessingId(null);
      addNotification('Security Update', `Access tokens for ${userName} refreshed.`, 'success');
    }, 1500);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setPersonnel(currentList => currentList.filter(user => user.id !== userId));
    addNotification('Account Revoked', `${userName} removed from organization.`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">System Administration</h1>
          <p className="text-slate-500 font-medium mt-1">Manage global fleet governance and personnel access.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
          {[
            { id: 'users', icon: Users, label: 'Personnel' },
            { id: 'system', icon: Settings2, label: 'Config' },
            { id: 'logs', icon: History, label: 'Audit' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl transition-all group-hover:scale-150"></div>
            <ShieldCheck className="h-8 w-8 text-blue-600 mb-6" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Personnel</h3>
            <p className="text-4xl font-black text-slate-900 italic">{personnel.length}</p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <Database className="h-8 w-8 text-indigo-400 mb-6" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Health</h4>
            <p className="text-2xl font-black italic">NOMINAL</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Connected</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'users' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">Personnel Directory</h3>
                <button 
                  onClick={handleOpenInvite}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite Employee
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Profile</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {personnel.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black border border-slate-200 shadow-sm">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{staff.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold lowercase mt-0.5">{staff.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            staff.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                            staff.role === UserRole.MANAGER ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {processingId === staff.id ? (
                            <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                              <Clock className="h-3 w-3" /> Resetting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 className="h-3 w-3" /> Active Access
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditClick(staff)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 rounded-xl transition-all shadow-sm">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleResetCredentials(staff.id, staff.name)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-100 rounded-xl transition-all shadow-sm">
                              <Key className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteUser(staff.id, staff.name)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm group/del">
                              <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-6 italic">Regional Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">System Currency</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{systemCurrency}</p>
                    </div>
                    <button onClick={() => setIsRegionalModalOpen(true)} className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm">
                      <Edit2 className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Units of Measure</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{unitOfMeasure}</p>
                    </div>
                    <button onClick={() => setIsRegionalModalOpen(true)} className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm">
                      <Edit2 className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-6 italic">Security Baseline</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enforce 2FA</span>
                    <button 
                      onClick={handleToggle2FA}
                      className={`h-6 w-12 rounded-full relative transition-colors duration-300 ${enforce2FA ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all duration-300 shadow-md ${enforce2FA ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global IP Restriction</span>
                    <button 
                      onClick={handleToggleIP}
                      className={`h-6 w-12 rounded-full relative transition-colors duration-300 ${globalIPRestriction ? 'bg-orange-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all duration-300 shadow-md ${globalIPRestriction ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">System Audit Logs</h3>
                 <button onClick={() => setAuditLogs([])} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Clear History</button>
               </div>
               {auditLogs.length > 0 ? auditLogs.map((log) => (
                 <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
                   <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                     <Lock className="h-4 w-4 text-slate-400" />
                   </div>
                   <div className="flex-1">
                     <p className="text-xs font-bold text-slate-800"><span className="text-blue-600 font-black uppercase tracking-tight">{log.type}:</span> {log.msg}</p>
                     <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Today at {log.time}</p>
                   </div>
                   <Eye className="h-4 w-4 text-slate-300 cursor-pointer" />
                 </div>
               )) : (
                 <div className="py-20 text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log directory is empty.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Personnel Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Personnel Profile" : "Invite New Personnel"}>
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            {editingId ? <Edit2 className="h-5 w-5 text-blue-600 mt-0.5" /> : <Mail className="h-5 w-5 text-blue-600 mt-0.5" />}
            <div className="flex-1">
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight">{editingId ? "Data Modification" : "Administrative Invitation"}</p>
              <p className="text-xs text-blue-600/80 font-medium leading-relaxed">{editingId ? "Changes will propagate across all nodes." : "Invitation will be dispatched to the provided email."}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
            <input type="text" value={personnelForm.name} onChange={e => setPersonnelForm({...personnelForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <input type="email" value={personnelForm.email} onChange={e => setPersonnelForm({...personnelForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
            <select value={personnelForm.role} onChange={e => setPersonnelForm({...personnelForm, role: e.target.value as UserRole})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm">
              <option value={UserRole.DRIVER}>Active Driver</option>
              <option value={UserRole.MANAGER}>Fleet Manager</option>
              <option value={UserRole.ADMIN}>System Admin</option>
            </select>
          </div>
          <button onClick={handlePersonnelSubmit} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95">{editingId ? "Update Profile" : "Send Invitation"}</button>
        </div>
      </Modal>

      {/* Regional Config Modal */}
      <Modal isOpen={isRegionalModalOpen} onClose={() => setIsRegionalModalOpen(false)} title="Update Regional Settings">
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <Globe className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-indigo-900 uppercase tracking-tight">Localization Policy</p>
              <p className="text-xs text-indigo-600/80 font-medium leading-relaxed">Updating these standards will affect all cost calculations and distance telemetry in reports.</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Currency</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select 
                value={regionalForm.currency} 
                onChange={e => setRegionalForm({...regionalForm, currency: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:border-indigo-500"
              >
                <option value="Indian Rupee (INR)">Indian Rupee (INR)</option>
                <option value="US Dollar (USD)">US Dollar (USD)</option>
                <option value="Euro (EUR)">Euro (EUR)</option>
                <option value="British Pound (GBP)">British Pound (GBP)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Standard</label>
            <div className="relative">
              <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select 
                value={regionalForm.unit} 
                onChange={e => setRegionalForm({...regionalForm, unit: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:border-indigo-500"
              >
                <option value="Metric (KM/Litre)">Metric (KM/Litre)</option>
                <option value="Imperial (Miles/Gallon)">Imperial (Miles/Gallon)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsRegionalModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200">Cancel</button>
            <button onClick={handleSaveRegional} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95">Save Configuration</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
