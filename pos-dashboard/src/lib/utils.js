// ─── Currency formatter ────────────────────────────────────────────────────────
export function formatCurrency(amount, currency = 'DZD') {
  if (currency === 'DZD') {
    return `${Number(amount || 0).toLocaleString('fr-DZ')} DA`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
}

// ─── Date / time helpers ──────────────────────────────────────────────────────
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-DZ', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

export function formatTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return formatDate(date);
}

export function elapsed(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000); // minutes
  return diff;
}

// ─── Class name merger ────────────────────────────────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ─── Number formatting ────────────────────────────────────────────────────────
export function formatNumber(n) {
  return Number(n || 0).toLocaleString('fr-DZ');
}
