import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, DollarSign, Calendar, Download, RefreshCw, ShoppingBag, Users, Clock, ArrowUpRight } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { PageHeader, StatCard, LoadingSpinner, EmptyState, Btn, Select, Input } from '../../components/ui/index.jsx';
import { formatCurrency, formatNumber } from '../../lib/utils.js';

const GREEN = '#4C6B50';
const COLORS = [GREEN, '#EAB308', '#ef4444', '#6366f1', '#06b6d4', '#f97316', '#8b5cf6'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [range, setRange] = useState('7d');
  const [customDates, setCustomDates] = useState({ from: '', to: '' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      let from = '', to = '';
      const now = new Date();
      if (range === 'today') from = to = now.toISOString().slice(0, 10);
      else if (range === '7d') from = new Date(now.setDate(now.getDate() - 7)).toISOString().slice(0, 10);
      else if (range === '30d') from = new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0, 10);
      else if (range === 'custom') { from = customDates.from; to = customDates.to; }

      const params = new URLSearchParams({ from, to });
      const [salesRes, topRes, hourlyRes, staffRes] = await Promise.all([
        fetch(`/api/reports/sales?${params}`),
        fetch(`/api/reports/top-items?${params}`),
        fetch(`/api/reports/orders-by-hour?${params}`),
        fetch(`/api/reports/staff?${params}`),
      ]);
      
      const [sales, top, hourly, staff] = await Promise.all([
        salesRes.json(), topRes.json(), hourlyRes.json(), staffRes.json()
      ]);
      
      setData({ sales, top, hourly, staff });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [range, customDates.from, customDates.to]);

  const salesByDay = data?.sales?.byDay 
    ? Object.entries(data.sales.byDay).map(([day, revenue]) => ({ day: day.slice(5), revenue }))
    : [];

  const topItems = data?.top?.map(i => ({ name: i.product?.name || 'Unknown', quantity: i.totalQuantity, revenue: i.totalRevenue })) || [];

  const hourlyData = data?.hourly || [];

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data?.sales?.totalRevenue), trend: '+5%', up: true, icon: <DollarSign size={16} /> },
    { label: 'Order Count', value: formatNumber(data?.sales?.totalOrders), trend: '+12%', up: true, icon: <ShoppingBag size={16} /> },
    { label: 'Avg Order Value', value: formatCurrency(data?.sales?.avgOrderValue), trend: '-2%', up: false, icon: <ArrowUpRight size={16} /> },
    { label: 'Staff Performance', value: formatNumber(data?.staff?.length), sub: 'Active Sellers', icon: <Users size={16} /> },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Visualizing your cafe's performance and growth" 
        icon={<BarChart2 size={18} />} 
        action={
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" onClick={() => window.print()}><Download size={14} /> Export PDF</Btn>
            <Btn variant="primary" size="sm" onClick={fetchReports}><RefreshCw size={14} /> Refresh</Btn>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Date Filters Wrapper */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-3 flex flex-wrap gap-3 items-center">
           <div className="flex bg-sage-50 rounded-lg p-0.5 gap-0.5">
              {[
                { label: 'Today', value: 'today' },
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'Custom Range', value: 'custom' },
              ].map(opt => (
                <button 
                  key={opt.value} 
                  onClick={() => setRange(opt.value)}
                  className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${range === opt.value ? 'bg-sage-800 text-white shadow-sm' : 'text-sage-500 hover:text-sage-700 hover:bg-sage-100'}`}>
                  {opt.label}
                </button>
              ))}
           </div>

           {range === 'custom' && (
             <div className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-300">
               <Input type="date" className="text-xs py-1.5 w-36" value={customDates.from} onChange={e => setCustomDates(d => ({ ...d, from: e.target.value }))} />
               <span className="text-sage-300">→</span>
               <Input type="date" className="text-xs py-1.5 w-36" value={customDates.to} onChange={e => setCustomDates(d => ({ ...d, to: e.target.value }))} />
             </div>
           )}
        </div>

        {loading ? <LoadingSpinner text="Generating insights..." /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Trend */}
              <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
                 <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2"><TrendingUp size={16} className="text-sage-500" /> Revenue Trend</h2>
                 <div className="h-[240px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesByDay}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={GREEN} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={GREEN} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a77d' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a77d' }} tickFormatter={v => `${v}`} />
                        <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke={GREEN} fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

               {/* Hourly Distribution */}
               <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
                 <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2"><Clock size={16} className="text-sage-500" /> Hourly Peak Times</h2>
                 <div className="h-[240px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede0" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a77d' }} tickFormatter={h => `${h}h`} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a77d' }} />
                        <Tooltip formatter={(v, name) => [name === 'revenue' ? formatCurrency(v) : v, name]} />
                        <Bar dataKey="revenue" fill={GREEN} radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Staff performance table */}
               <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
                 <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2"><Users size={16} className="text-sage-500" /> Staff Performance</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                       <thead>
                         <tr className="border-b border-sage-100 text-[10px] uppercase font-bold text-sage-400">
                           <th className="text-left pb-2">Name</th>
                           <th className="text-left pb-2">Orders</th>
                           <th className="text-right pb-2">Total Sold</th>
                         </tr>
                       </thead>
                       <tbody>
                         {data?.staff?.map((s, i) => (
                           <tr key={i} className="border-b border-sage-50 last:border-0">
                             <td className="py-2.5 font-bold text-sage-900">{s.staff?.name}</td>
                             <td className="py-2.5 text-sage-600">{s.totalOrders}</td>
                             <td className="py-2.5 text-right font-black text-sage-900">{formatCurrency(s.totalRevenue)}</td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
               </div>

               {/* Top Items chart */}
               <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
                 <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2"><ShoppingBag size={16} className="text-sage-500" /> Top Selling Items</h2>
                 <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topItems} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="revenue" paddingAngle={5}>
                           {topItems.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
