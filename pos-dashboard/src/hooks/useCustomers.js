import { useState, useEffect, useCallback } from 'react';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async (search = '') => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/customers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      setCustomers(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const createCustomer = async (data) => {
    const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
    await fetch_(); return res.json();
  };

  const updateCustomer = async (id, data) => {
    const res = await fetch(`/api/customers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update customer');
    await fetch_();
  };

  const updatePoints = async (id, delta) => {
    const res = await fetch(`/api/customers/${id}/points`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) });
    if (!res.ok) throw new Error('Failed to update points');
    await fetch_();
  };

  return { customers, loading, error, refresh: fetch_, createCustomer, updateCustomer, updatePoints };
}
