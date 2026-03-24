import { useState, useEffect, useCallback } from 'react';

export function useStaff(filters = {}) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/staff?${params}`);
      if (!res.ok) throw new Error('Failed to fetch staff');
      setStaff(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createMember = async (data) => {
    const res = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create staff'); }
    await fetch_(); return res.json();
  };

  const updateMember = async (id, data) => {
    const res = await fetch(`/api/staff/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update staff');
    await fetch_();
  };

  const toggleActive = async (id) => {
    const res = await fetch(`/api/staff/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle staff');
    await fetch_();
  };

  const deleteMember = async (id) => {
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete staff');
    await fetch_();
  };

  return { staff, loading, error, refresh: fetch_, createMember, updateMember, toggleActive, deleteMember };
}
