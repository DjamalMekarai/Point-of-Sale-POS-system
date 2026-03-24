// Shared micro-components used across all admin pages

import { Loader2, AlertCircle } from 'lucide-react';

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, colorClass = 'bg-sage-100 text-sage-700' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}

// ─── Status badge lookup ──────────────────────────────────────────────────────
export function StatusBadge({ value, map }) {
  const entry = map?.find(m => m.value === value);
  return <Badge label={entry?.label ?? value} colorClass={entry?.color ?? 'bg-gray-100 text-gray-700'} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, bg = 'bg-white', trend, up }) {
  return (
    <div className={`${bg} rounded-2xl border border-sage-100 shadow-sm p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold ${up ? 'text-green-600' : 'text-red-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-sage-500 font-medium">{label}</p>
      <div className="flex items-end gap-1.5">
        <p className="text-2xl font-extrabold text-sage-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-sage-400 pb-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, icon, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-sage-100 bg-[#F9F7E8] sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {icon && <div className="w-9 h-9 rounded-xl bg-sage-800 flex items-center justify-center text-white">{icon}</div>}
        <div>
          <h1 className="text-lg font-extrabold text-sage-900">{title}</h1>
          {subtitle && <p className="text-xs text-sage-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ onClick, children, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  const variants = {
    primary: 'bg-sage-800 text-white hover:bg-sage-900 shadow-sm',
    secondary: 'bg-white text-sage-700 border border-sage-200 hover:bg-sage-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-sage-600 hover:bg-sage-100',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ─── Search input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`flex items-center gap-2 bg-white border border-sage-200 rounded-xl px-3 py-2 ${className}`}>
      <svg className="w-4 h-4 text-sage-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-sage-800 placeholder-sage-400"
      />
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage-100">
          <h2 className="font-bold text-sage-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sage-400 hover:bg-sage-50 hover:text-sage-700 transition-colors">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
export function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-sage-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border border-sage-200 rounded-xl bg-sage-50 text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all placeholder-sage-400 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm border border-sage-200 rounded-xl bg-sage-50 text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm border border-sage-200 rounded-xl bg-sage-50 text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all placeholder-sage-400 resize-none ${className}`}
      rows={3}
      {...props}
    />
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────
export function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-sage-500">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
      <AlertCircle size={28} />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-sage-400">
      <div className="text-5xl">{icon || '📭'}</div>
      <p className="font-semibold text-sage-700">{title}</p>
      {subtitle && <p className="text-sm text-center max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 z-[200] px-5 py-3 rounded-xl shadow-xl font-semibold text-white text-sm flex items-center gap-2 transition-all ${
      message.type === 'success' ? 'bg-green-600' : message.type === 'error' ? 'bg-red-500' : 'bg-sage-800'
    }`}>
      {message.text}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

// fix missing import
import { useState } from 'react';
