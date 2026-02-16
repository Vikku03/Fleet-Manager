
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, ComposedChart, Line
} from 'recharts';
import { Download, TrendingUp, DollarSign, Fuel, Wrench, SearchX, FileSpreadsheet } from 'lucide-react';

// Mock Data Generators for different time periods
const generateCostData = (days: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const count = days <= 30 ? 7 : 6;
  return Array.from({ length: count }).map((_, i) => ({
    label: days <= 30 ? `Day ${i + 1}` : months[i % 12],
    maintenance: Math.floor(Math.random() * 5000) + 1000,
    fuel: Math.floor(Math.random() * 8000) + 2000,
    insurance: 1200
  }));
};

const INITIAL_PERFORMANCE_DATA = [
  { name: 'Tata Nexon EV', utilization: 85, efficiency: 70, plate: 'MH-12-RT-4567' },
  { name: 'Mahindra Bolero', utilization: 62, efficiency: 90, plate: 'DL-04-CA-8901' },
  { name: 'Ashok Leyland', utilization: 45, efficiency: 85, plate: 'KA-01-MJ-2233' },
  { name: 'Maruti Eeco', utilization: 92, efficiency: 65, plate: 'HR-26-DQ-5544' },
  { name: 'Tata Prima', utilization: 78, efficiency: 82, plate: 'UP-32-BZ-9911' },
];

export default function AnalyticsModule() {
  const { searchQuery } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('30d');

  // Filter Performance Data based on global search
  const filteredPerformanceData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return INITIAL_PERFORMANCE_DATA.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.plate.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Generate Cost Data based on selected time range
  const dynamicCostData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
    return generateCostData(days);
  }, [timeRange]);

  // CSV Export Functionality
  const handleExport = () => {
    const headers = ['Metric', 'Label', 'Value'];
    const rows = [
      ...dynamicCostData.map(d => ['Maintenance Cost', d.label, d.maintenance]),
      ...dynamicCostData.map(d => ['Fuel Cost', d.label, d.fuel]),
      ...filteredPerformanceData.map(p => ['Utilization', p.name, p.utilization]),
      ...filteredPerformanceData.map(p => ['Efficiency', p.name, p.efficiency]),
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fleet_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Fleet Intelligence</h1>
          <p className="text-slate-500 font-medium">Deep telemetry analysis for regional logistics optimization.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-white border-2 border-slate-100 rounded-2xl p-1.5 shadow-sm">
            {[
              { label: '7 Days', val: '7d' },
              { label: '30 Days', val: '30d' },
              { label: '1 Year', val: '1y' }
            ].map((period) => (
              <button 
                key={period.val}
                onClick={() => setTimeRange(period.val as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  timeRange === period.val 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">+4.2%</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilization</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">76.4%</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-green-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg">+1.2%</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Per KM</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">₹42.50</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">+2.1%</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">14.2 km/l</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MTBF (Reliability)</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">8,400 mi</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Operational Trends</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Cost distribution across {timeRange === '7d' ? 'last week' : timeRange === '30d' ? 'current month' : 'fiscal year'}</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicCostData}>
                <defs>
                  <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                  dy={10} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px'}}
                />
                <Legend iconType="circle" />
                <Area type="monotone" name="Maintenance" dataKey="maintenance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMaint)" />
                <Area type="monotone" name="Fuel & Ops" dataKey="fuel" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Fleet Performance Breakdown</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Vehicle efficiency vs utilization audit</p>
            </div>
            {searchQuery && (
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                <SearchX className="h-3 w-3" /> Filtered
              </span>
            )}
          </div>
          <div className="h-80">
            {filteredPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar name="Utilization Rate (%)" dataKey="utilization" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={24} />
                  <Line type="monotone" name="Fuel Efficiency (%)" dataKey="efficiency" stroke="#f59e0b" strokeWidth={4} dot={{fill: '#f59e0b', strokeWidth: 3, r: 5, stroke: '#fff'}} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <SearchX className="h-10 w-10 text-slate-300 mb-4" />
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching assets in chart</h4>
                <p className="text-xs text-slate-400 mt-2">Adjust your global search query to see vehicle analytics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
