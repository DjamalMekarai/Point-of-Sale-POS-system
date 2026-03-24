import { useState } from 'react';
import { Users, Plus, Mail, Phone, Calendar, UserCheck, UserX, Trash2, Edit2 } from 'lucide-react';
import { useStaff } from '../../hooks/useStaff.js';
import {
  PageHeader, Btn, Badge, LoadingSpinner,
  ErrorState, EmptyState, Modal, Field, Input, Select, useToast, Toast, StatCard, SearchInput, StatusBadge
} from '../../components/ui/index.jsx';
import { STAFF_ROLES } from '../../lib/constants.js';
import { formatDate } from '../../lib/utils.js';

export default function StaffPage() {
  const { staff, loading, error, refresh, createMember, updateMember, toggleActive, deleteMember } = useStaff();
  const { toast, show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total Staff', value: staff.length, icon: <Users size={16} /> },
    { label: 'Active', value: staff.filter(s => s.isActive).length, icon: <UserCheck size={16} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Off-duty', value: staff.filter(s => !s.isActive).length, icon: <UserX size={16} className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, icon: <Users size={16} className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  const handleOpenModal = (member = null) => {
    setEditingStaff(member);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = Object.fromEntries(new FormData(e.target));
    
    try {
      if (editingStaff) {
        await updateMember(editingStaff.id, formData);
        show('success', 'Staff updated successfully');
      } else {
        await createMember(formData);
        show('success', 'Staff member added successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      show('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id);
      show('success', 'Status updated');
    } catch (err) {
      show('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await deleteMember(id);
        show('success', 'Staff member removed');
      } catch (err) {
        show('error', err.message);
      }
    }
  };

  const filtered = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader 
        title="Staff Management" 
        subtitle="Manage roles, permissions, and shift status" 
        icon={<Users size={18} />} 
        action={<Btn onClick={() => handleOpenModal()}><Plus size={16} /> Add Staff</Btn>}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Search staff..." className="w-64" />
            <div className="flex bg-sage-50 rounded-xl p-0.5 gap-0.5">
               <Btn variant="secondary" size="sm" onClick={refresh}>Refresh List</Btn>
            </div>
          </div>

          {loading ? <LoadingSpinner text="Loading staff records..." /> : error ? <ErrorState message={error} onRetry={refresh} /> : filtered.length === 0 ? (
            <EmptyState icon="👥" title="No staff records" subtitle="Start by adding your team members" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-sage-100">
                    <th className="font-bold text-sage-500 py-3 pl-2">Staff Member</th>
                    <th className="font-bold text-sage-500 py-3">Role</th>
                    <th className="font-bold text-sage-500 py-3">Contact</th>
                    <th className="font-bold text-sage-500 py-3">Hire Date</th>
                    <th className="font-bold text-sage-500 py-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(member => (
                     <tr key={member.id} className="border-b border-sage-50 hover:bg-sage-50/50 transition-colors group">
                       <td className="py-3 pl-2">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl overflow-hidden bg-sage-100 flex-shrink-0">
                             <img src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4C6B50&color=fff`} className="w-full h-full object-cover" />
                           </div>
                           <div>
                             <p className="font-bold text-sage-900">{member.name}</p>
                             <div className="flex items-center gap-1.5">
                               <div className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                               <span className="text-[10px] text-sage-400 font-bold uppercase">{member.isActive ? 'Active' : 'Off-duty'}</span>
                             </div>
                           </div>
                         </div>
                       </td>
                       <td className="py-3">
                         <StatusBadge value={member.role} map={STAFF_ROLES} />
                       </td>
                       <td className="py-3 space-y-0.5">
                         <div className="flex items-center gap-1.5 text-sage-600 text-[11px]"><Mail size={12} className="opacity-50" /> {member.email}</div>
                         {member.phone && <div className="flex items-center gap-1.5 text-sage-600 text-[11px]"><Phone size={12} className="opacity-50" /> {member.phone}</div>}
                       </td>
                       <td className="py-3 text-[11px] text-sage-500">
                         <div className="flex items-center gap-1.5"><Calendar size={12} className="opacity-50" /> {formatDate(member.hireDate)}</div>
                       </td>
                       <td className="py-3 text-right pr-2">
                         <div className="flex justify-end gap-1.5">
                           <button onClick={() => handleToggleActive(member.id)} className={`p-1.5 rounded-lg border transition-all ${member.isActive ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-500 border-green-100 hover:bg-green-50'}`} title={member.isActive ? 'Deactivate' : 'Activate'}>
                             {member.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                           </button>
                           <button onClick={() => handleOpenModal(member)} className="p-1.5 rounded-lg border border-sage-100 text-sage-400 hover:text-sage-700 hover:bg-sage-50" title="Edit Staff">
                             <Edit2 size={14} />
                           </button>
                           <button onClick={() => handleDelete(member.id)} className="p-1.5 rounded-lg border border-red-50 text-red-300 hover:text-red-600 hover:bg-red-50" title="Remove Staff">
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" required><Input name="name" defaultValue={editingStaff?.name} placeholder="e.g. John Doe" required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email Address" required><Input name="email" type="email" defaultValue={editingStaff?.email} placeholder="john@example.com" required /></Field>
            <Field label="Phone Number"><Input name="phone" defaultValue={editingStaff?.phone} placeholder="+213..." /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" required>
              <Select name="role" defaultValue={editingStaff?.role || 'CASHIER'} required>
                {STAFF_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </Field>
            <Field label="Security PIN"><Input name="pin" type="password" placeholder="4 digits for POS login" maxLength={4} /></Field>
          </div>
          <Field label="Hire Date"><Input name="hireDate" type="date" defaultValue={editingStaff?.hireDate?.split('T')[0] || new Date().toISOString().split('T')[0]} /></Field>
          <div className="flex justify-end gap-3 pt-4">
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingStaff ? 'Update Member' : 'Add Member'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
