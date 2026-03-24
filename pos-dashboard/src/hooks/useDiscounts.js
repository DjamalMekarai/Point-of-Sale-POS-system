import { useState, useEffect, useCallback } from 'react';

export function useDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/discounts');
      if (!res.ok) throw new Error('Failed to fetch discounts');
      setDiscounts(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createDiscount = async (data) => {
    const res = await fetch('/api/discounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
    await fetch_();
  };

  const updateDiscount = async (id, data) => {
    const res = await fetch(`/api/discounts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update discount');
    await fetch_();
  };

  const toggleDiscount = async (id) => {
    const res = await fetch(`/api/discounts/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle discount');
    await fetch_();
  };

  const deleteDiscount = async (id) => {
    const res = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete discount');
    await fetch_();
  };

  return { discounts, loading, error, refresh: fetch_, createDiscount, updateDiscount, toggleDiscount, deleteDiscount };
}
