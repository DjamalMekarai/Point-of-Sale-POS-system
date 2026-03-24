import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Utensils, Users, Package,
  BarChart2, Heart, Tag, ChefHat, Settings, LogOut,
  LayoutGrid, Coffee,
} from 'lucide-react';

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/orders',     icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/products',   icon: Utensils,        label: 'Menu' },
  { to: '/admin/tables',     icon: Coffee,          label: 'Tables' },
  { to: '/admin/staff',      icon: Users,           label: 'Staff' },
  { to: '/admin/inventory',  icon: Package,         label: 'Inventory' },
  { to: '/admin/reports',    icon: BarChart2,       label: 'Reports' },
  { to: '/admin/customers',  icon: Heart,           label: 'Customers' },
  { to: '/admin/discounts',  icon: Tag,             label: 'Discounts' },
  { to: '/admin/kitchen',    icon: ChefHat,         label: 'Kitchen' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
];

const GREEN = '#4C6B50';
const BG_SIDEBAR = '#343e2c';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <aside
      className="flex flex-col w-56 min-h-screen flex-shrink-0 select-none"
      style={{ background: BG_SIDEBAR }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GREEN }}>
          <span className="text-white text-xs font-extrabold tracking-tight">GG</span>
        </div>
        <div className="leading-tight">
          <p className="text-white text-xs font-extrabold tracking-widest uppercase">Green</p>
          <p className="text-white/60 text-[10px] font-semibold tracking-widest uppercase">Grounds</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/90'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* POS shortcut */}
      <div className="px-3 pb-3">
        <button
          onClick={() => navigate('/pos')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <LayoutGrid size={16} />
          POS Terminal
        </button>
      </div>

      {/* User card */}
      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/8">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=4C6B50&color=fff`}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-white/50 text-[10px] capitalize">{user?.role || 'admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
