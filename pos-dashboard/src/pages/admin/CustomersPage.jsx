import { useState } from 'react';
import { Heart, Users, Star, History, Search, Plus, Phone, Mail, Award, Edit2, Trash2 } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers.js';
import {
  PageHeader, Btn, Badge, LoadingSpinner,
  ErrorState, EmptyState, Modal, Field, Input, useToast, Toast, StatCard, SearchInput, StatusBadge
} from '../../components/ui/index.jsx';
import { formatCurrency, formatDate } from '../../lib/utils.js';
import { LOYALTY_TIERS } from '../../lib/constants.js';

export default function CustomersPage() {
  const { customers, loading, error, refresh, createCustomer, updateCustomer, updatePoints } = useCustomers();
  const { toast, show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsModal, setPointsModal] = useState({ open: false, customer: null });
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: <Users size={16} /> },
    { label: 'Gold Members', value: customers.filter(c => c.loyaltyTier === 'Gold').length, icon: <Star size={16} className="text-yellow-500" />, bg: 'bg-yellow-50' },
    { label: 'Avg Spend', value: formatCurrency(customers.reduce((s, c) => s + c.totalSpent, 0) / (customers.length || 1)), icon: <Award size={16} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Total Loyalty', value: customers.reduce((s, c) => s + c.loyaltyPoints, 0), sub: 'Points Active', icon: <Heart size={16} className="text-red-500" />, bg: 'bg-red-50' },
  ];

  const handleOpenModal = (c = null) => { setEditingCustomer(c); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const formData = Object.fromEntries(new FormData(e.target));
    try {
      if (editingCustomer) { await updateCustomer(editingCustomer.id, formData); show('success', 'Customer profile updated'); }
      else { await createCustomer(formData); show('success', 'Customer added'); }
      setIsModalOpen(false);
    } catch (err) { show('error', err.message); }
    finally { setIsSubmitting(false); }
  };

  const handlePoints = async (e) => {
     e.preventDefault(); setIsSubmitting(true);
     const delta = e.target.delta.value;
     try {
       await updatePoints(pointsModal.customer.id, delta);
       show('success', 'Loyalty points updated');
       setPointsModal({ open: false, customer: null });
     } catch (err) { show('error', err.message); }
     finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader
        title="Customers & Loyalty"
        subtitle="Track customer loyalty, spending habits, and feedback"
        icon={<Heart size={18} />}
        action={<Btn onClick={() => handleOpenModal()}><Plus size={16} /> Add Customer</Btn>}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
             <SearchInput value={search} onChange={(v) => { setSearch(v); refresh(v); }} placeholder="Search by name or phone..." className="w-80" />
             <Btn variant="secondary" size="sm" onClick={() => refresh()}>↻ Sync Records</Btn>
          </div>

          {loading ? <LoadingSpinner text="Searching database..." /> : error ? <ErrorState message={error} onRetry={() => refresh()} /> : customers.length === 0 ? (
            <EmptyState icon="👤" title="No customers found" subtitle="Register customers to track their coffee journey" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-100 italic bg-sage-50/10 text-sage-400">
                    <th className="text-left py-3 pl-2">Customer Name</th>
                    <th className="text-left py-3 text-[10px] uppercase">Tier</th>
                    <th className="text-left py-3">Points</th>
                    <th className="text-left py-3">Total Spent</th>
                    <th className="text-left py-3">Last Visit</th>
                    <th className="text-right py-3 pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => {
                    const tier = LOYALTY_TIERS.find(t => t.tier === c.loyaltyTier);
                    return (
                      <tr key={c.id} className="border-b border-sage-50 hover:bg-sage-50/50 transition-colors">
                        <td className="py-3 pl-2">
                           <div className="flex flex-col">
                             <span className="font-bold text-sage-900">{c.name}</span>
                             <div className="flex items-center gap-2 text-[10px] text-sage-400 mt-0.5 font-bold">
                               <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>
                               {c.email && <span className="flex items-center gap-1 opacity-60"><Mail size={10} /> {c.email}</span>}
                             </div>
                           </div>
                        </td>
                        <td className="py-3">
                           <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${tier?.color || 'bg-gray-100 text-gray-500'}`}>
                              {c.loyaltyTier}
                           </span>
                        </td>
                        <td className="py-3">
                           <div className="flex items-center gap-1.5 font-black text-sage-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              {c.loyaltyPoints} <span className="text-[10px] font-bold text-sage-400">pts</span>
                           </div>
                        </td>
                        <td className="py-3 font-bold text-sage-900">{formatCurrency(c.totalSpent)}</td>
                        <td className="py-3 text-[10px] font-bold text-sage-500 flex flex-col uppercase">
                           <span>{formatDate(c.lastVisit)}</span>
                           <span className="opacity-40 font-normal">{c.totalVisits} visits total</span>
                        </td>
                        <td className="py-3 text-right pr-2">
                           <div className="flex justify-end gap-1.5">
                              <button onClick={() => setPointsModal({ open: true, customer: c })} className="p-1.5 rounded-lg border border-red-50 text-red-400 hover:bg-red-50" title="Adjust Points">
                                <Heart size={14} className="fill-red-400" />
                              </button>
                              <button onClick={() => handleOpenModal(c)} className="p-1.5 rounded-lg border border-sage-100 text-sage-400 hover:text-sage-700 hover:bg-sage-50" title="Edit Profile">
                                <Edit2 size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg border border-sage-100 text-sage-400 hover:text-sage-900" title="Order History">
                                <History size={14} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Profile' : 'New Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <Field label="Full Name" required><Input name="name" defaultValue={editingCustomer?.name} placeholder="e.g. Salim Benali" required /></Field>
           <Field label="Phone Number" required><Input name="phone" defaultValue={editingCustomer?.phone} placeholder="+213..." required /></Field>
           <Field label="Email Address"><Input name="email" type="email" defaultValue={editingCustomer?.email} placeholder="salim@example.dz" /></Field>
           <div className="grid grid-cols-2 gap-4">
              <Field label="Birthday"><Input name="birthdate" type="date" defaultValue={editingCustomer?.birthdate?.split('T')[0]} /></Field>
              <Field label="Loyalty Tier"><Input value={editingCustomer?.loyaltyTier || 'Bronze'} disabled /></Field>
           </div>
           <Field label="Staff Notes"><Input name="notes" defaultValue={editingCustomer?.notes} placeholder="VIP, allergies, constant latte consumer..." /></Field>
           <div className="flex justify-end gap-3 pt-4">
             <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
             <Btn type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Add Register'}</Btn>
           </div>
        </form>
      </Modal>

      <Modal open={pointsModal.open} onClose={() => setPointsModal({ open: false, customer: null })} title="Adjust Loyalty Points">
        <form onSubmit={handlePoints} className="space-y-4">
           <p className="text-xs text-sage-500">Add or remove points for <b>{pointsModal.customer?.name}</b>. Currently has <b>{pointsModal.customer?.loyaltyPoints}</b>.</p>
           <Field label="Point Delta (positive/negative)" required>
              <Input name="delta" type="number" placeholder="e.g. 50 or -30" autoFocus required />
           </Field>
           <div className="flex justify-end gap-3 pt-4">
             <Btn variant="secondary" onClick={() => setPointsModal({ open: false, customer: null })}>Cancel</Btn>
             <Btn type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Save Change'}</Btn>
           </div>
        </form>
      </Modal>
    </div>
  );
}
