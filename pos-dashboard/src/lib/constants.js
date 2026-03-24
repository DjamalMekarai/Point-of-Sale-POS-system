export const ORDER_STATUSES = [
  { value: 'PENDING',     label: 'Pending',     color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED',   label: 'Confirmed',   color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'READY',       label: 'Ready',       color: 'bg-emerald-100 text-emerald-800' },
  { value: 'SERVED',      label: 'Served',      color: 'bg-teal-100 text-teal-800' },
  { value: 'COMPLETED',   label: 'Completed',   color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED',   label: 'Cancelled',   color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED',    label: 'Refunded',    color: 'bg-gray-100 text-gray-700' },
];

export const ORDER_TYPES = [
  { value: 'DINE_IN',   label: 'Dine-in',   icon: '🪑' },
  { value: 'TAKEAWAY',  label: 'Takeaway',  icon: '🛍️' },
  { value: 'DELIVERY',  label: 'Delivery',  icon: '🛵' },
];

export const TABLE_STATUSES = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'OCCUPIED',  label: 'Occupied',  color: 'bg-red-100 text-red-800' },
  { value: 'RESERVED',  label: 'Reserved',  color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CLEANING',  label: 'Cleaning',  color: 'bg-blue-100 text-blue-800' },
];

export const STAFF_ROLES = [
  { value: 'ADMIN',    label: 'Admin',    color: 'bg-purple-100 text-purple-800' },
  { value: 'MANAGER',  label: 'Manager',  color: 'bg-blue-100 text-blue-800' },
  { value: 'CASHIER',  label: 'Cashier',  color: 'bg-green-100 text-green-800' },
  { value: 'BARISTA',  label: 'Barista',  color: 'bg-amber-100 text-amber-800' },
  { value: 'WAITER',   label: 'Waiter',   color: 'bg-teal-100 text-teal-800' },
  { value: 'DELIVERY', label: 'Delivery', color: 'bg-orange-100 text-orange-800' },
];

export const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE',   label: '% Percentage' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  { value: 'FREE_ITEM',    label: 'Free Item' },
  { value: 'BOGO',         label: 'Buy 1 Get 1' },
];

export const LOYALTY_TIERS = [
  { tier: 'Bronze', min: 0,    color: 'text-amber-700 bg-amber-100' },
  { tier: 'Silver', min: 2000, color: 'text-slate-600 bg-slate-100' },
  { tier: 'Gold',   min: 5000, color: 'text-yellow-700 bg-yellow-100' },
];

export const INVENTORY_UNITS = ['pieces', 'kg', 'g', 'L', 'ml', 'box', 'pack', 'bag'];

export const INVENTORY_CATEGORIES = ['Coffee & Beans', 'Dairy', 'Syrups', 'Tea', 'Food & Pastry', 'Packaging', 'Cleaning', 'Other'];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const API_BASE = '/api';
