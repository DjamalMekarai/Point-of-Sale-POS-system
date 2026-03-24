import { useState } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, Trash2, Edit2, Ticket, Percent, Clock, Calendar } from 'lucide-react';
import { useDiscounts } from '../../hooks/useDiscounts.js';
import {
  PageHeader, Btn, Badge, LoadingSpinner,
  ErrorState, EmptyState, Modal, Field, Input, Select, useToast, Toast, StatCard, SearchInput
} from '../../components/ui/index.jsx';
import { DISCOUNT_TYPES, DAYS_OF_WEEK } from '../../lib/constants.js';
import { formatCurrency, formatDate } from '../../lib/utils.js';

export default function DiscountsPage() {
  const { discounts, loading, error, refresh, createDiscount, updateDiscount, toggleDiscount, deleteDiscount } = useDiscounts();
  const { toast, show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total Promotions', value: discounts.length, icon: <Tag size={16} /> },
    { label: 'Active Today', value: discounts.filter(d => d.isActive).length, icon: <CheckCircle2 size={16} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Promo Codes', value: discounts.filter(d => d.code).length, icon: <Ticket size={16} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Avg Value', value: '15%', sub: 'Percentage based', icon: <Percent size={16} className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  const handleOpenModal = (d = null) => { setEditingDiscount(d); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Parse numeric fields
    data.value = parseFloat(data.value);
    if (data.minOrder) data.minOrder = parseFloat(data.minOrder);
    if (data.maxUses) data.maxUses = parseInt(data.maxUses);
    
    // Parse validDays
    const days = [];
    e.target.querySelectorAll('input[name="validDays"]:checked').forEach(c => days.push(parseInt(c.value)));
    data.validDays = days;

    try {
      if (editingDiscount) { await updateDiscount(editingDiscount.id, data); show('success', 'Promotion updated'); }
      else { await createDiscount(data); show('success', 'Promotion created'); }
      setIsModalOpen(false);
    } catch (err) { show('error', err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this discount?')) {
      try { await deleteDiscount(id); show('success', 'Promotion deleted'); }
      catch (err) { show('error', err.message); }
    }
  };

  const filtered = discounts.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader 
        title="Discounts & Promotions" 
        subtitle="Manage happy hour deals, promo codes, and daily specials" 
        icon={<Tag size={18} />} 
        action={<Btn onClick={() => handleOpenModal()}><Plus size={16} /> Create Promo</Btn>}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center px-1">
             <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code..." className="w-80" />
             <Btn variant="secondary" size="sm" onClick={refresh}>↻ Sync Offers</Btn>
          </div>

          {loading ? <LoadingSpinner text="Checking offers..." /> : error ? <ErrorState message={error} onRetry={refresh} /> : filtered.length === 0 ? (
            <EmptyState icon="🏷️" title="No active promotions" subtitle="Draw in more customers with happy hour deals or promo codes" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-sage-100 italic bg-sage-50/10 text-sage-400">
                    <th className="py-3 pl-2">Promotion Details</th>
                    <th className="py-3">Type & Value</th>
                    <th className="py-3">Conditions</th>
                    <th className="py-3">Validity</th>
                    <th className="py-2 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id} className="border-b border-sage-50 hover:bg-sage-50/50 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="flex flex-col">
                           <span className="font-bold text-sage-900">{d.name}</span>
                           {d.code ? (
                             <code className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit mt-1 tracking-widest">{d.code}</code>
                           ) : <span className="text-[10px] text-sage-400 italic font-bold">Automatic Discount</span>}
                        </div>
                      </td>
                      <td className="py-3">
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-sage-700">{DISCOUNT_TYPES.find(t => t.value === d.type)?.label}</span>
                           <span className="text-lg font-black tracking-tighter text-sage-900">{d.type === 'PERCENTAGE' ? `${d.value}%` : formatCurrency(d.value)}</span>
                         </div>
                      </td>
                      <td className="py-3">
                         <div className="flex flex-col gap-1">
                           {d.minOrder && <span className="text-[10px] text-sage-500 font-bold uppercase flex items-center gap-1"><CheckCircle2 size={10} /> Min Order: {formatCurrency(d.minOrder)}</span>}
                           {d.maxUses && <span className="text-[10px] text-sage-500 font-bold uppercase flex items-center gap-1"><XCircle size={10} /> Limit: {d.usedCount}/{d.maxUses} uses</span>}
                           {!d.minOrder && !d.maxUses && <span className="text-[10px] text-sage-400 font-bold">No conditions</span>}
                         </div>
                      </td>
                      <td className="py-3">
                         <div className="flex flex-col gap-1">
                           {d.expiresAt && <span className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1"><Calendar size={10} /> Exp: {formatDate(d.expiresAt)}</span>}
                           {d.startTime && <span className="text-[10px] text-blue-500 font-bold uppercase flex items-center gap-1"><Clock size={10} /> {d.startTime} - {d.endTime}</span>}
                           {d.validDays?.length > 0 && <span className="text-[10px] text-purple-600 font-bold uppercase">{d.validDays.map(day => DAYS_OF_WEEK[day]).join(' ')}</span>}
                           {!d.expiresAt && !d.startTime && <span className="text-[10px] text-sage-400 font-bold">Always valid</span>}
                         </div>
                      </td>
                      <td className="py-3 text-right pr-2">
                         <div className="flex justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleDiscount(d.id)} className={`p-1.5 rounded-lg border transition-all ${d.isActive ? 'text-green-500 border-green-100 hover:bg-green-50' : 'text-orange-400 border-orange-100 hover:bg-orange-50'}`} title={d.isActive ? 'Active' : 'Inactive'}>
                               {d.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            </button>
                            <button onClick={() => handleOpenModal(d)} className="p-1.5 rounded-lg border border-sage-100 text-sage-400 hover:text-sage-700 hover:bg-sage-50" title="Edit">
                               <Plus size={14} className="rotate-45" />
                            </button>
                            <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg border border-red-50 text-red-300 hover:text-red-600 hover:bg-red-50" title="Delete">
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Promotion Details">
        <form onSubmit={handleSubmit} className="space-y-4">
           <Field label="Promotion Name" required><Input name="name" defaultValue={editingDiscount?.name} placeholder="e.g. Happy Hour Special" required /></Field>
           <Field label="Promo Code (optional)"><Input name="code" defaultValue={editingDiscount?.code} placeholder="e.g. COFFEE20" /></Field>
           
           <div className="grid grid-cols-2 gap-4">
              <Field label="Type" required><Select name="type" defaultValue={editingDiscount?.type || 'PERCENTAGE'}>{DISCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></Field>
              <Field label="Value" required><Input name="value" type="number" step="0.01" defaultValue={editingDiscount?.value || 0} required /></Field>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Field label="Min Order Amount"><Input name="minOrder" type="number" step="0.01" defaultValue={editingDiscount?.minOrder || 0} /></Field>
              <Field label="Usage Limit (total)"><Input name="maxUses" type="number" defaultValue={editingDiscount?.maxUses || 0} /></Field>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Field label="Start Time"><Input name="startTime" type="time" defaultValue={editingDiscount?.startTime} /></Field>
              <Field label="End Time"><Input name="endTime" type="time" defaultValue={editingDiscount?.endTime} /></Field>
           </div>
           
           <Field label="Valid Days">
              <div className="flex flex-wrap gap-3 mt-1">
                 {DAYS_OF_WEEK.map((day, i) => (
                    <label key={i} className="flex items-center gap-1.5 cursor-pointer group">
                       <input type="checkbox" name="validDays" value={i} defaultChecked={editingDiscount?.validDays?.includes(i)} className="w-3.5 h-3.5 accent-sage-800 rounded border-sage-300 transition-colors" />
                       <span className="text-xs text-sage-500 font-bold uppercase group-hover:text-sage-800 transition-colors">{day}</span>
                    </label>
                 ))}
              </div>
           </Field>

           <Field label="Expiry Date"><Input name="expiresAt" type="date" defaultValue={editingDiscount?.expiresAt?.split('T')[0]} /></Field>

           <div className="flex justify-end gap-3 pt-4">
             <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
             <Btn type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Promotion'}</Btn>
           </div>
        </form>
      </Modal>
    </div>
  );
}
