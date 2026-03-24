import { useState, useEffect, useCallback } from 'react';

export function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/tables');
      if (!res.ok) throw new Error('Failed to fetch tables');
      setTables(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createTable = async (data) => {
    const res = await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to create table');
    await fetch_(); return res.json();
  };

  const updateTable = async (id, data) => {
    const res = await fetch(`/api/tables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update table');
    await fetch_();
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/tables/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!res.ok) throw new Error('Failed to update table status');
    await fetch_();
  };

  const deleteTable = async (id) => {
    const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete table');
    await fetch_();
  };

  return { tables, loading, error, refresh: fetch_, createTable, updateTable, updateStatus, deleteTable };
}
