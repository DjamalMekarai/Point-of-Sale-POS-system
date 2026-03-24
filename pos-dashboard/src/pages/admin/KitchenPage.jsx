import { useState, useEffect } from 'react';
import { ChefHat, ShoppingBag, Clock, CheckCircle2, AlertTriangle, MessageSquare, Play, PackageCheck, Flag } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders.js';
import { PageHeader, LoadingSpinner, ErrorState, EmptyState, Badge, Btn, Toast, useToast } from '../../components/ui/index.jsx';
import { formatTime, elapsed } from '../../lib/utils.js';
import { ORDER_STATUSES, ORDER_TYPES } from '../../lib/constants.js';

export default function KitchenPage() {
  const { orders, loading, error, refresh, updateStatus } = useOrders({
    status: ['CONFIRMED', 'IN_PROGRESS', 'READY']
  });
  const { toast, show } = useToast();

  const activeOrders = orders.filter(o => ['CONFIRMED', 'IN_PROGRESS'].includes(o.status))
    .sort((a, b) => { // Sort by priority, then by time
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  const readyOrders = orders.filter(o => o.status === 'READY')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  useEffect(() => {
    const timer = setInterval(refresh, 15000); // Auto-refresh every 15s
    return () => clearInterval(timer);
  }, [refresh]);

  const handleAction = async (id, nextStatus) => {
    try {
      await updateStatus(id, nextStatus);
      show('success', `Order moved to ${nextStatus.replace('_', ' ').toLowerCase()}`);
    } catch (err) {
      show('error', err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111827]">
      <Toast message={toast} />
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1f2937] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4C6B50] flex items-center justify-center">
            <ChefHat size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">KITCHEN DISPLAY</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Orders ({activeOrders.length})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
             <div className="w-16 h-1 rounded-full bg-red-500" /> &gt; 10m
             <div className="w-16 h-1 rounded-full bg-yellow-500" /> &gt; 5m
           </div>
           <Btn variant="ghost" className="text-gray-400 hover:text-white" onClick={refresh}><Clock size={16} /> Sync</Btn>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Cooking View */}
        <div className="flex-1 overflow-x-auto p-6 flex gap-6 items-start content-start">
           {loading && activeOrders.length === 0 ? <div className="mx-auto mt-20"><LoadingSpinner text="Connecting to kitchen server..." /></div> : error ? <div className="mx-auto mt-20"><ErrorState message={error} /></div> : activeOrders.length === 0 ? (
             <div className="mx-auto mt-20 text-center"><EmptyState icon="🍳" title="Kitchen is quiet" subtitle="New orders will appear here automatically" /></div>
           ) : activeOrders.map(order => {
             const mins = elapsed(order.createdAt);
             const typeEntry = ORDER_TYPES.find(t => t.value === order.type);
             return (
                <div 
                  key={order.id} 
                  className={`w-80 flex-shrink-0 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 flex flex-col transition-all duration-300 ${
                    order.isPriority ? 'border-red-500' : 'border-gray-100'
                  }`}
                >
                  {/* Header */}
                  <div className={`px-4 py-3 flex items-center justify-between ${
                    order.isPriority ? 'bg-red-500 text-white' : 
                    mins > 10 ? 'bg-red-50 text-red-700' :
                    mins > 5 ? 'bg-yellow-50 text-yellow-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg tracking-tighter">{order.orderNumber}</span>
                      {order.isPriority && <Flag size={14} className="fill-white" />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-60 flex items-center gap-1">
                        {typeEntry?.icon} {order.table?.number ? `Table ${order.table.number}` : typeEntry?.label}
                      </span>
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Clock size={12} /> {mins}m
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="flex-1 p-4 space-y-3 min-h-[160px]">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex gap-3">
                         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-lg text-gray-800 flex-shrink-0">
                           {item.quantity}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-bold text-gray-900 leading-tight flex items-center gap-1.5 flex-wrap">
                             {item.product?.name}
                           </p>
                           {/* Modifiers / Variants would go here */}
                           {item.notes && <p className="text-[10px] text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded mt-1">⚠ {item.notes}</p>}
                         </div>
                      </div>
                    ))}
                    {order.notes && (
                      <div className="mt-4 p-2 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-2">
                        <MessageSquare size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-yellow-700 font-bold leading-tight uppercase tracking-tight">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                     {order.status === 'CONFIRMED' ? (
                       <button 
                         onClick={() => handleAction(order.id, 'IN_PROGRESS')}
                         className="flex-1 flex items-center justify-center gap-2 bg-[#4C6B50] hover:bg-[#344636] text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                       >
                         <Play size={18} /> START PREPARING
                       </button>
                     ) : (
                        <button 
                         onClick={() => handleAction(order.id, 'READY')}
                         className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 animate-bounce-subtle"
                       >
                         <PackageCheck size={18} /> MARK AS READY
                       </button>
                     )}
                  </div>
                </div>
             );
           })}
        </div>

        {/* Ready / Sidebar */}
        <div className="w-80 border-l border-gray-800 bg-[#1f2937] p-5 flex flex-col gap-4 overflow-y-auto">
           <h2 className="text-[10px] font-black tracking-widest text-gray-500 uppercase flex items-center gap-2">
             <CheckCircle2 size={12} className="text-green-500" /> Ready to Serve ({readyOrders.length})
           </h2>
           <div className="space-y-3">
             {readyOrders.map(o => (
               <div key={o.id} className="bg-[#2d3748] rounded-xl p-3 border border-gray-700 flex flex-col gap-2">
                 <div className="flex items-center justify-between">
                   <span className="font-black text-white">{o.orderNumber}</span>
                   <span className="text-[10px] font-bold text-gray-400">{o.table?.number ? `Table ${o.table.number}` : 'Takeaway'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-500">{o.items?.length} items · Served BY STAFF</span>
                    <button 
                      onClick={() => handleAction(o.id, 'SERVED')}
                      className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-lg border border-green-500/20 hover:bg-green-500 hover:text-white transition-all uppercase"
                    >
                      BUMP
                    </button>
                 </div>
               </div>
             ))}
             {readyOrders.length === 0 && <p className="text-center text-xs text-gray-600 mt-20">No orders ready</p>}
           </div>
        </div>
      </div>
    </div>
  );
}
