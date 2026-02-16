
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole, Notification, Trip } from './types';
import { MOCK_USERS, MOCK_TRIPS } from './services/mockData';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Wrench, 
  MapPin, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Search,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Globe,
  BellRing,
  Save,
  Smartphone,
  Laptop,
  ChevronLeft,
  Settings2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

// Modules
import Dashboard from './components/Dashboard';
import VehicleModule from './components/VehicleModule';
import DriverModule from './components/DriverModule';
import MaintenanceModule from './components/MaintenanceModule';
import AnalyticsModule from './components/AnalyticsModule';
import RouteOptimizer from './components/RouteOptimizer';
import AdminConsole from './components/AdminConsole';

// Translation Dictionary
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'English (IN)': {
    dashboard: 'Dashboard',
    vehicles: 'Vehicles',
    drivers: 'Drivers',
    maintenance: 'Maintenance',
    routes: 'Route Planner',
    analytics: 'Analytics',
    admin: 'System Admin',
    logout: 'Logout',
    searchPlaceholder: 'Search by vehicle, plate, or location...',
    myProfile: 'My Profile',
    securitySettings: 'Security Settings',
    preferences: 'Preferences',
    welcome: 'Welcome Back',
    fleetDashboard: 'Fleet Dashboard',
    realTimeMonitoring: 'Real-time monitoring of Indian regional fleet operations.',
    totalVehicles: 'Total Vehicles',
    activeTrips: 'Active Trips',
    maintenanceAlerts: 'Maintenance Alerts',
    fuelCost: 'Fuel Cost (MTD)',
    newTrip: 'New Trip',
    exportData: 'Export Fleet Data'
  }
};

// App Context
interface AppContextType {
  user: User | null;
  searchQuery: string;
  notifications: Notification[];
  trips: Trip[];
  language: string;
  setLanguage: (lang: string) => void;
  setSearchQuery: (query: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const { user, logout, t } = useApp();
  const location = useLocation();

  const navItems = [
    { label: t('dashboard'), path: '/', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER, UserRole.MAINTENANCE] },
    { label: t('vehicles'), path: '/vehicles', icon: Truck, roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { label: t('drivers'), path: '/drivers', icon: Users, roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { label: t('maintenance'), path: '/maintenance', icon: Wrench, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.MAINTENANCE] },
    { label: t('routes'), path: '/routes', icon: MapPin, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER] },
    { label: t('analytics'), path: '/analytics', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { label: t('admin'), path: '/admin', icon: Settings2, roles: [UserRole.ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-400 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Truck className="h-8 w-8 text-blue-500 mr-3" />
          <span className="text-xl font-bold text-white tracking-tight">FleetTrack<span className="text-blue-500">Pro</span></span>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {filteredNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggle()}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center space-x-3 mb-4 px-4">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-50/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { searchQuery, setSearchQuery, notifications, markAllNotificationsAsRead, logout, user, updateUser, t, language, setLanguage } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 lg:hidden mr-2 text-slate-600"><Menu className="h-6 w-6" /></button>
        
        {/* Only show search bar for non-driver roles */}
        {user?.role !== UserRole.DRIVER && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full w-64 lg:w-96 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white font-bold">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <button onClick={() => { markAllNotificationsAsRead(); setShowNotifications(false); }} className="text-xs text-blue-600 font-bold">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                      <p className="text-xs text-slate-500">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={`flex items-center space-x-2 p-1.5 pr-3 rounded-full transition-all ${showProfileMenu ? 'bg-blue-50' : 'hover:bg-slate-100'}`}>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{user?.name.charAt(0)}</div>
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden py-1">
              <button onClick={() => { setActiveModal('profile'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-slate-50"><UserIcon className="h-4 w-4 text-slate-400" /><span>{t('myProfile')}</span></button>
              <button onClick={() => { setActiveModal('security'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-slate-50"><ShieldCheck className="h-4 w-4 text-slate-400" /><span>{t('securitySettings')}</span></button>
              <button onClick={() => { setActiveModal('preferences'); setShowProfileMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-slate-50"><Settings className="h-4 w-4 text-slate-400" /><span>{t('preferences')}</span></button>
              <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold"><LogOut className="h-4 w-4" /><span>{t('logout')}</span></button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const LoginPage = () => {
  const { login, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError('Invalid individual credentials. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-12 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
              <Truck className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">FleetTrack<span className="text-blue-600">Pro</span></h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">{t('welcome')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Individual Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@fleettrack.in" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm transition-all" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {loading ? 'Authorizing Access...' : 'Secure Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
              Access is strictly restricted to authorized regional personnel. Credentials are encrypted and audited.
            </p>
          </div>
        </div>

        {/* Demo Hint */}
        <div className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Demo Environment Credentials</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="px-2 py-1 bg-white/10 rounded text-[8px] font-bold text-white/60">Admin: admin@fleettrack.in / admin123</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[8px] font-bold text-white/60">Driver: suresh@fleettrack.in / driver123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('English (IN)');
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'Service Due', message: 'Vehicle MH-12-RT-4567 is 100km away from scheduled service.', type: 'warning', timestamp: '2h ago', isRead: false },
    { id: 'n2', title: 'Trip Alert', message: 'Truck KA-01-MJ-2233 has arrived.', type: 'info', timestamp: '4h ago', isRead: false }
  ]);

  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;
  
  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => { setUser(null); setSearchQuery(''); };
  const updateUser = (updates: Partial<User>) => setUser(prev => prev ? { ...prev, ...updates } : null);
  const markNotificationAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  
  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addTrip = (trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  if (!user) {
    return (
      <AppContext.Provider value={{ user, searchQuery, notifications, trips, language, setLanguage, setSearchQuery, login, logout, updateUser, markNotificationAsRead, markAllNotificationsAsRead, addNotification, addTrip, updateTrip, t }}>
        <HashRouter><Routes><Route path="*" element={<LoginPage />} /></Routes></HashRouter>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={{ user, searchQuery, notifications, trips, language, setLanguage, setSearchQuery, login, logout, updateUser, markNotificationAsRead, markAllNotificationsAsRead, addNotification, addTrip, updateTrip, t }}>
      <HashRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vehicles" element={<VehicleModule />} />
                <Route path="/drivers" element={<DriverModule />} />
                <Route path="/maintenance" element={<MaintenanceModule />} />
                <Route path="/routes" element={<RouteOptimizer />} />
                <Route path="/analytics" element={<AnalyticsModule />} />
                <Route path="/admin" element={<AdminConsole />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
