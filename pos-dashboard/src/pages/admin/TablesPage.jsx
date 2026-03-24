import { useState } from 'react';
import { Coffee, Plus, Map, Trash2, Edit2, Users } from 'lucide-react';
import { useTables } from '../../hooks/useTables.js';
import {
  PageHeader, Btn, Badge, LoadingSpinner,
  ErrorState, EmptyState, Modal, Field, Input, Select, useToast, Toast, StatCard
} from '../../components/ui/index.jsx';
import { TABLE_STATUSES } from '../../lib/constants.js';

export default function TablesPage() {
  const { tables, loading, error, refresh, createTable, updateTable, deleteTable } = useTables();
  const { toast, show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = [
    { label: 'Total Tables', value: tables.length, icon: <Coffee size={16} /> },
    { label: 'Available', value: tables.filter(t => t.status === 'AVAILABLE').length, icon: <Coffee size={16} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Occupied', value: tables.filter(t => t.status === 'OCCUPIED').length, icon: <Coffee size={16} className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Reserved', value: tables.filter(t => t.status === 'RESERVED').length, icon: <Coffee size={16} className="text-yellow-500" />, bg: 'bg-yellow-50' },
  ];

  const handleOpenModal = (table = null) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (editingTable) {
        await updateTable(editingTable.id, data);
        show('success', 'Table updated successfully');
      } else {
        await createTable(data);
        show('success', 'Table created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      show('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await deleteTable(id);
        show('success', 'Table deleted successfully');
      } catch (err) {
        show('error', err.message);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader
        title="Tables Management"
        subtitle="Manage seating layout and status"
        icon={<Coffee size={18} />}
        action={
          <Btn onClick={() => handleOpenModal()}>
            <Plus size={16} /> Add Table
          </Btn>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Tables Grid */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-sage-900 flex items-center gap-2">
              <Map size={14} className="text-sage-500" /> Floor Map Preview
            </h2>
            <div className="flex items-center gap-3">
               {TABLE_STATUSES.map(s => (
                 <div key={s.value} className="flex items-center gap-1.5">
                   <div className={`w-2.5 h-2.5 rounded-full ${s.color.split(' ')[0]}`} />
                   <span className="text-[10px] text-sage-500 font-medium">{s.label}</span>
                 </div>
               ))}
            </div>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map(table => (
                <div 
                  key={table.id}
                  className={`relative p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer group ${
                    table.status === 'AVAILABLE' ? 'bg-green-50 border-green-100 text-green-700' :
                    table.status === 'OCCUPIED' ? 'bg-red-50 border-red-100 text-red-700' :
                    table.status === 'RESERVED' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                    'bg-blue-50 border-blue-100 text-blue-700'
                  }`}
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(table)} className="p-1 hover:bg-white/50 rounded-md">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(table.id)} className="p-1 hover:bg-white/50 rounded-md">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-lg font-black tracking-tight">{table.number}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{table.zone}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Users size={10} />
                      <span className="text-[10px] font-bold">{table.capacity}</span>
                    </div>
                  </div>
                </div>
              ))}
              {tables.length === 0 && (
                <div className="col-span-full py-10">
                   <EmptyState title="No tables configured" subtitle="Start by adding tables to your floor map" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTable ? 'Edit Table' : 'Add New Table'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Table Number" required>
              <Input name="number" defaultValue={editingTable?.number} placeholder="e.g. T1" required />
            </Field>
            <Field label="Capacity" required>
              <Input name="capacity" type="number" defaultValue={editingTable?.capacity || 4} required />
            </Field>
          </div>
          <Field label="Zone / Area" required>
            <Select name="zone" defaultValue={editingTable?.zone || 'Indoor'}>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Terrace">Terrace</option>
              <option value="VIP">VIP Room</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-3 pt-4">
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingTable ? 'Update Table' : 'Add Table'}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
