import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, TrendingDown, Clock, AlertTriangle,
  ChefHat, BarChart2, RefreshCw, ArrowRight, Star,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PageHeader, StatCard, LoadingSpinner, EmptyState } from '../../components/ui/index.jsx';
import { formatCurrency, formatDateTime, elapsed } from '../../lib/utils.js';
import { ORDER_STATUSES, ORDER_TYPES } from '../../lib/constants.js';

const GREEN = '#4C6B50';
const COLORS = [GREEN, '#EAB308', '#ef4444', '#6366f1', '#06b6d4'];

function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [salesRes, topRes, ordersRes] = await Promise.all([
        fetch(`/api/reports/sales?from=${today}&to=${today}`),
        fetch('/api/reports/top-items?limit=5'),
        fetch('/api/orders?status=PENDING&status=CONFIRMED&status=IN_PROGRESS&limit=10'),
      ]);
      const [sales, top, ordersData] = await Promise.all([salesRes.json(), topRes.json(), ordersRes.json()]);
      setData({ sales, top, liveOrders: ordersData.orders || [] });
    } catch (e) {
      setData({ sales: null, top: [], liveOrders: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { data, loading, reload: load };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, reload } = useDashboardData();

  const kpi = [
    {
      label: 'Revenue Today', icon: <DollarSign size={16} />,
      value: formatCurrency(data?.sales?.totalRevenue ?? 0),
      trend: '+2%', up: true,
    },
    {
      label: 'Orders Today', icon: <ShoppingBag size={16} />,
      value: data?.sales?.totalOrders ?? 0,
      sub: `Live: ${data?.liveOrders?.length ?? 0}`,
    },
    {
      label: 'Avg. Order', icon: <BarChart2 size={16} />,
      value: formatCurrency(data?.sales?.avgOrderValue ?? 0),
      trend: '+5%', up: true,
    },
    {
      label: 'Top Category', icon: <Star size={16} />,
      value: data?.sales?.byCategory ? Object.entries(data.sales.byCategory).sort((a,b) => b[1]-a[1])[0]?.[0] ?? '—' : '—',
    },
  ];

  const byTypeData = data?.sales?.byType
    ? ORDER_TYPES.map(t => ({ name: t.label, value: Math.round(data.sales.byType[t.value] || 0) }))
    : [];

  const byDayData = data?.sales?.byDay
    ? Object.entries(data.sales.byDay).map(([date, revenue]) => ({ date: date.slice(5), revenue: Math.round(revenue) }))
    : [];

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        icon={<BarChart2 size={18} />}
        action={
          <button onClick={reload} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-sage-200 text-sage-600 hover:bg-white transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {loading ? <LoadingSpinner text="Loading dashboard…" /> : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpi.map((k, i) => (
                <StatCard key={i} {...k} />
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue line */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-sage-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-sage-500" /> Revenue — Last 7 Days
                </h2>
                {byDayData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={byDayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9aaa8a' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9aaa8a' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                      <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke={GREEN} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon="📊" title="No data yet" subtitle="Complete some orders to see revenue charts" />
                )}
              </div>

              {/* Order type pie */}
              <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-sage-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-sage-500" /> Orders by Type
                </h2>
                {byTypeData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={byTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {byTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [formatCurrency(v)]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon="🥧" title="No orders today" />
                )}
              </div>
            </div>

            {/* Live orders + Top items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Live orders */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                    <Clock size={14} className="text-sage-500" /> Live Orders
                  </h2>
                  <button onClick={() => navigate('/admin/orders')} className="text-xs text-sage-500 hover:text-sage-800 flex items-center gap-1 font-medium">
                    View all <ArrowRight size={12} />
                  </button>
                </div>
                {data?.liveOrders?.length === 0 ? (
                  <EmptyState icon="✅" title="No active orders" subtitle="All orders are completed!" />
                ) : (
                  <div className="space-y-2">
                    {data?.liveOrders?.map(order => {
                      const mins = elapsed(order.createdAt);
                      const statusEntry = ORDER_STATUSES.find(s => s.value === order.status);
                      return (
                        <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-sage-50 border border-sage-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mins > 10 ? 'bg-red-500' : mins > 5 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            <div>
                              <p className="text-xs font-bold text-sage-900">{order.orderNumber}</p>
                              <p className="text-[10px] text-sage-500">
                                {order.table?.number ?? 'Takeaway'} · {mins}m ago · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusEntry?.color ?? 'bg-gray-100 text-gray-600'}`}>
                              {statusEntry?.label ?? order.status}
                            </span>
                            <span className="text-xs font-bold text-sage-900">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top items */}
              <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-sage-900 mb-4 flex items-center gap-2">
                  <Package size={14} className="text-sage-500" /> Top Items Today
                </h2>
                {data?.top?.length === 0 ? (
                  <EmptyState icon="🏆" title="No sales yet" />
                ) : (
                  <div className="space-y-3">
                    {data?.top?.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-sage-900 truncate">{t.product?.name ?? '—'}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex-1 h-1.5 rounded-full bg-sage-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ background: GREEN, width: `${Math.min(100, (t.totalQuantity / (data.top[0]?.totalQuantity || 1)) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-sage-700 flex-shrink-0">{t.totalQuantity}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-sage-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: '📋 All Orders',   to: '/admin/orders' },
                  { label: '🍽️  Menu Items',   to: '/admin/products' },
                  { label: '🪑 Tables',         to: '/admin/tables' },
                  { label: '👥 Staff',          to: '/admin/staff' },
                  { label: '📦 Inventory',      to: '/admin/inventory' },
                  { label: '🏷️  Discounts',      to: '/admin/discounts' },
                  { label: '👤 Customers',      to: '/admin/customers' },
                  { label: '🔪 Kitchen',        to: '/admin/kitchen' },
                ].map(a => (
                  <button key={a.to} onClick={() => navigate(a.to)}
                    className="px-4 py-2 rounded-xl border border-sage-200 text-sm text-sage-700 font-medium hover:bg-sage-50 hover:border-sage-300 transition-all">
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
