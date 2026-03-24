import { useState } from 'react';
import { Package, Plus, AlertTriangle, ArrowUpDown, History, Search } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory.js';
import {
  PageHeader, Btn, Badge, LoadingSpinner,
  ErrorState, EmptyState, Modal, Field, Input, Select, useToast, Toast, StatCard, SearchInput
} from '../../components/ui/index.jsx';
import { INVENTORY_UNITS, INVENTORY_CATEGORIES } from '../../lib/constants.js';
import { formatCurrency, formatDate } from '../../lib/utils.js';

export default function InventoryPage() {
  const { items, lowStockItems, loading, error, refresh, createItem, updateItem, restock, deleteItem } = useInventory();
  const { toast, show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockModal, setRestockModal] = useState({ open: false, item: null });
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total Items', value: items.length, icon: <Package size={16} /> },
    { label: 'Low Stock', value: lowStockItems.length, icon: <AlertTriangle size={16} className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Inventory Value', value: formatCurrency(items.reduce((s, i) => s + (i.currentStock * i.costPerUnit), 0)), icon: <Package size={16} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Suppliers', value: [...new Set(items.map(i => i.supplier).filter(Boolean))].length, icon: <Package size={16} className="text-blue-500" />, bg: 'bg-blue-50' },
  ];

  const handleOpenModal = (item = null) => { setEditingItem(item); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const formData = Object.fromEntries(new FormData(e.target));
    try {
      if (editingItem) { await updateItem(editingItem.id, formData); show('success', 'Item updated'); }
      else { await createItem(formData); show('success', 'Item added'); }
      setIsModalOpen(false);
    } catch (err) { show('error', err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleRestock = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const qty = e.target.quantity.value; const note = e.target.note.value;
    try {
      await restock(restockModal.item.id, qty, note);
      show('success', 'Stock level updated');
      setRestockModal({ open: false, item: null });
    } catch (err) { show('error', err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inventory item?')) {
      try { await deleteItem(id); show('success', 'Item removed'); }
      catch (err) { show('error', err.message); }
    }
  };

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      <Toast message={toast} />
      <PageHeader 
        title="Inventory & Stock" 
        subtitle="Manage ingredients, supplies, and low stock alerts" 
        icon={<Package size={18} />} 
        action={<Btn onClick={() => handleOpenModal()}><Plus size={16} /> Add Item</Btn>}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search ingredients..." className="w-64" />
            <Btn variant="secondary" size="sm" onClick={refresh}>↻ Refresh Stock</Btn>
          </div>

          {loading ? <LoadingSpinner text="Checking inventory..." /> : error ? <ErrorState message={error} onRetry={refresh} /> : filtered.length === 0 ? (
            <EmptyState icon="📦" title="Inventory is empty" subtitle="Add ingredients and supplies to track stock levels" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                   <tr className="border-b border-sage-100 italic bg-sage-50/10">
                    <th className="font-bold text-sage-500 py-3 pl-2">Ingredient / Item</th>
                    <th className="font-bold text-sage-500 py-3">Category</th>
                    <th className="font-bold text-sage-500 py-3">Current Stock</th>
                    <th className="font-bold text-sage-500 py-3">Low Threshold</th>
                    <th className="font-bold text-sage-500 py-3">Unit Cost</th>
                    <th className="font-bold text-sage-500 py-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className={`border-b border-sage-50 hover:bg-sage-50/50 transition-colors ${item.isLowStock ? 'bg-red-50/30' : ''}`}>
                      <td className="py-3 pl-2">
                         <div className="flex items-center gap-2.5">
                           <div className={`w-2.5 h-2.5 rounded-full ${item.isLowStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-green-500'}`} />
                           <div>
                             <p className="font-bold text-sage-900">{item.name}</p>
                             <p className="text-[10px] text-sage-400 font-medium">{item.supplier || 'No supplier set'}</p>
                           </div>
                         </div>
                      </td>
                      <td className="py-3"><Badge label={item.category} /></td>
                      <td className="py-3">
                        <span className={`font-black tracking-tight text-base ${item.isLowStock ? 'text-red-600' : 'text-sage-900'}`}>{item.currentStock}</span>
                        <span className="text-[10px] text-sage-500 ml-1 font-bold uppercase">{item.unit}</span>
                      </td>
                      <td className="py-3 text-sage-500 text-xs font-bold">{item.minimumStock} <span className="text-[10px] uppercase font-normal">{item.unit}</span></td>
                      <td className="py-3 font-semibold text-sage-900">{formatCurrency(item.costPerUnit)}</td>
                      <td className="py-3 text-right pr-2">
                         <div className="flex justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                            <button onClick={() => setRestockModal({ open: true, item })} className="p-1.5 rounded-lg border border-sage-100 text-sage-600 hover:bg-sage-100" title="Restock">
                               <ArrowUpDown size={14} />
                            </button>
                            <button onClick={() => handleOpenModal(item)} className="p-1.5 rounded-lg border border-sage-100 text-sage-400 hover:text-sage-700 hover:bg-sage-50" title="Edit">
                               <Plus size={14} className="rotate-45" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg border border-red-50 text-red-300 hover:text-red-600 hover:bg-red-50" title="Delete">
                               <History size={14} /> {/* replaced Trash with History icon for delete in this context */}
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

      {/* Product Form Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Item Name" required><Input name="name" defaultValue={editingItem?.name} placeholder="e.g. Whole Milk" required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category"><Select name="category" defaultValue={editingItem?.category || 'Dairy'}>{INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</Select></Field>
            <Field label="Unit" required><Select name="unit" defaultValue={editingItem?.unit || 'pieces'}>{INVENTORY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}</Select></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current Stock" required><Input name="currentStock" type="number" step="0.01" defaultValue={editingItem?.currentStock || 0} required /></Field>
            <Field label="Low Stock Threshold" required><Input name="minimumStock" type="number" step="0.01" defaultValue={editingItem?.minimumStock || 5} required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cost per Unit (DZD)"><Input name="costPerUnit" type="number" step="0.01" defaultValue={editingItem?.costPerUnit || 0} /></Field>
            <Field label="Expiry Date"><Input name="expiryDate" type="date" defaultValue={editingItem?.expiryDate?.split('T')[0]} /></Field>
          </div>
          <Field label="Supplier Name"><Input name="supplier" defaultValue={editingItem?.supplier} placeholder="e.g. Dairy Central" /></Field>
          <div className="flex justify-end gap-3 pt-4">
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal open={restockModal.open} onClose={() => setRestockModal({ open: false, item: null })} title={`Restock: ${restockModal.item?.name}`}>
        <form onSubmit={handleRestock} className="space-y-4">
          <p className="text-xs text-sage-500 mb-2">Adding stock to existing balance of <b>{restockModal.item?.currentStock} {restockModal.item?.unit}</b>.</p>
          <Field label={`Quantity to Add (${restockModal.item?.unit})`} required>
            <Input name="quantity" type="number" step="0.01" autoFocus required />
          </Field>
          <Field label="Note / Reference">
            <Input name="note" placeholder="Invoice # or supplier batch" />
          </Field>
          <div className="flex justify-end gap-3 pt-4">
            <Btn variant="secondary" onClick={() => setRestockModal({ open: false, item: null })}>Cancel</Btn>
            <Btn type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Confirm Restock'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
