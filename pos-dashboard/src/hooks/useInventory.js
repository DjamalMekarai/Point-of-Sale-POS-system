import { useState, useEffect, useCallback } from 'react';

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      setItems(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createItem = async (data) => {
    const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to create item');
    await fetch_();
  };

  const updateItem = async (id, data) => {
    const res = await fetch(`/api/inventory/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update item');
    await fetch_();
  };

  const restock = async (id, quantity, note) => {
    const res = await fetch(`/api/inventory/${id}/restock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity, note }) });
    if (!res.ok) throw new Error('Failed to restock item');
    await fetch_();
  };

  const deleteItem = async (id) => {
    const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
    await fetch_();
  };

  const lowStockItems = items.filter(i => i.isLowStock);

  return { items, lowStockItems, loading, error, refresh: fetch_, createItem, updateItem, restock, deleteItem };
}
