import { useState, useEffect, useCallback } from 'react';

export function useOrders(defaultFilters = {}) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 50, ...defaultFilters });

  const fetchOrders = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ...filters, ...overrides });
      // Remove empty values
      [...params.keys()].forEach(k => { if (!params.get(k)) params.delete(k); });
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const createOrder = async (payload) => {
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create order'); }
    await fetchOrders();
    return res.json();
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!res.ok) throw new Error('Failed to update status');
    await fetchOrders();
  };

  const togglePriority = async (id) => {
    const res = await fetch(`/api/orders/${id}/priority`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle priority');
    await fetchOrders();
  };

  const cancelOrder = async (id) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to cancel order');
    await fetchOrders();
  };

  return { orders, total, loading, error, filters, setFilters, refresh: fetchOrders, createOrder, updateStatus, togglePriority, cancelOrder };
}
