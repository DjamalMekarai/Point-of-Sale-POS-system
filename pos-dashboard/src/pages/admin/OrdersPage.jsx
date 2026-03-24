import { useState } from 'react';
import { ShoppingBag, Plus, Flag, XCircle, ChevronDown } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders.js';
import {
  PageHeader, SearchInput, Btn, Badge, LoadingSpinner,
  ErrorState, EmptyState, Modal, Field, Input, Select, Textarea, useToast, Toast,
} from '../../components/ui/index.jsx';
import { ORDER_STATUSES, ORDER_TYPES } from '../../lib/constants.js';
import { formatCurrency, formatDateTime, elapsed } from '../../lib/utils.js';

const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['READY', 'CANCELLED'],
  READY: ['SERVED'],
  SERVED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

function OrderRow({ order, onStatusChange, onPriority, onCancel }) {
  const [open, setOpen] = useState(false);
  const statusEntry = ORDER_STATUSES.find(s => s.value === order.status);
  const typeEntry = ORDER_TYPES.find(t => t.value === order.type);
  const mins = elapsed(order.createdAt);
  const nextStatuses = STATUS_FLOW[order.status] || [];

  return (
    <>
      <tr
        onClick={() => setOpen(o => !o)}
        className="border-b border-sage-50 hover:bg-sage-50/60 transition-colors cursor-pointer group"
      >
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2">
            {order.isPriority && <Flag size={12} className="text-red-500 flex-shrink-0" />}
            <div>
              <p className="text-xs font-bold text-sage-900">{order.orderNumber}</p>
              <p className="text-[10px] text-sage-400">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>
        </td>
        <td className="py-3 pr-3">
          <span className="text-sm">{typeEntry?.icon}</span>{' '}
          <span className="text-xs text-sage-600 font-medium">{typeEntry?.label}</span>
          {order.table && <span className="text-[10px] text-sage-400 block">Table {order.table.number}</span>}
        </td>
        <td className="py-3 pr-3">
          <p className="text-xs text-sage-700">{order.items?.map(i => i.product?.name).slice(0, 2).join(', ')}{order.items?.length > 2 ? ` +${order.items.length - 2}` : ''}</p>
        </td>
        <td className="py-3 pr-3">
          <span className={`text-[10px] font-bold ${mins > 10 ? 'text-red-600' : mins > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
            {mins}m
          </span>
        </td>
        <td className="py-3 pr-3">
          <Badge label={statusEntry?.label ?? order.status} colorClass={statusEntry?.color} />
        </td>
        <td className="py-3 pr-3 font-bold text-sage-900 text-sm">{formatCurrency(order.total)}</td>
        <td className="py-3 pr-4">
          <ChevronDown size={14} className={`text-sage-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </td>
      </tr>

      {open && (
        <tr className="bg-sage-50/40">
          <td colSpan={7} className="px-6 py-4">
            <div className="flex flex-wrap gap-4">
              {/* Items detail */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-bold text-sage-700 mb-2">Items</p>
                <div className="space-y-1">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-sage-600">
                      <span>{item.quantity}× {item.product?.name}</span>
                      <span className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                {order.notes && <p className="text-[11px] text-sage-400 mt-2 italic">📝 {order.notes}</p>}
              </div>

              {/* Totals */}
              <div className="min-w-[140px]">
                <p className="text-xs font-bold text-sage-700 mb-2">Summary</p>
                <div className="space-y-1 text-xs text-sage-600">
                  <div className="flex justify-between gap-4"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                  <div className="flex justify-between gap-4"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
                  <div className="flex justify-between gap-4 font-bold text-sage-900 border-t border-sage-200 pt-1 mt-1"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-sage-700">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map(st => {
                    const entry = ORDER_STATUSES.find(s => s.value === st);
                    return (
                      <Btn key={st} size="sm" variant={st === 'CANCELLED' ? 'danger' : 'primary'}
                        onClick={e => { e.stopPropagation(); onStatusChange(order.id, st); }}>
                        → {entry?.label}
                      </Btn>
                    );
                  })}
                  <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); onPriority(order.id); }}>
                    <Flag size={12} /> {order.isPriority ? 'Unmark' : 'Priority'}
                  </Btn>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrdersPage() {
  const { orders, total, loading, error, filters, setFilters, refresh, updateStatus, togglePriority, cancelOrder } = useOrders();
  const { toast, show } = useToast();
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o =>
    !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.items?.some(i => i.product?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handle = async (fn, successMsg) => {
    try { await fn(); show('success', successMsg); }
    catch (e) { show('error', e.message); }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader title="Orders" subtitle={`${total} total orders`} icon={<ShoppingBag size={18} />} />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Order # or item name…" className="w-64" />

          <Select className="w-36 text-xs py-2" value={filters.status || ''} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>

          <Select className="w-36 text-xs py-2" value={filters.type || ''} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}>
            <option value="">All Types</option>
            {ORDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </Select>

          <Input type="date" className="w-40 text-xs py-2" value={filters.date || ''} onChange={e => setFilters(f => ({ ...f, date: e.target.value, page: 1 }))} />

          <Btn variant="secondary" size="sm" onClick={() => setFilters({ page: 1, limit: 50 })}>Clear</Btn>
          <Btn variant="secondary" size="sm" onClick={refresh}><span className="text-base leading-none">↻</span> Refresh</Btn>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden">
          {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={refresh} /> : filtered.length === 0 ? (
            <EmptyState icon="🧾" title="No orders found" subtitle="Orders placed from the POS will appear here" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-100 bg-sage-50/50">
                    {['Order #', 'Type', 'Items', 'Time', 'Status', 'Total', ''].map((h, i) => (
                      <th key={i} className="text-left text-xs font-bold text-sage-500 px-3 py-3 first:pl-4 last:pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onStatusChange={(id, st) => handle(() => updateStatus(id, st), `Order ${st.toLowerCase()}`)}
                      onPriority={id => handle(() => togglePriority(id), 'Priority updated')}
                      onCancel={id => handle(() => cancelOrder(id), 'Order cancelled')}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination info */}
        {total > 0 && (
          <p className="text-xs text-sage-400 text-right">
            Showing {filtered.length} of {total} orders
          </p>
        )}
      </div>
    </div>
  );
}
