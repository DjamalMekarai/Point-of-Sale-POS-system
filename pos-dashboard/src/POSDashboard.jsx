import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, Plus, Minus, AlertCircle, SlidersHorizontal, 
  ChevronLeft, AlignJustify, ChevronDown, ChevronRight, 
  Receipt, BarChart2, X, Printer, CalendarClock, CreditCard, User, Heart, Tag,
  ShoppingBag, RefreshCw
} from "lucide-react";

// Hooks
import { useProducts } from "./hooks/useProducts";
import { useOrders } from "./hooks/useOrders";
import { useAuth } from "./context/AuthContext";

// UI Helpers
import { ORDER_TYPES } from "./lib/constants";
import { Toast, useToast, LoadingSpinner, Modal, Field, Input, Btn, EmptyState } from "./components/ui/index.jsx";
import ProductItem from "./components/pos/ProductItem.jsx";
import CartSidebar from "./components/pos/CartSidebar.jsx";

// Store
import usePosStore from "./store/usePosStore";

export default function POSDashboard() {
  const { user, logout: onLogout } = useAuth();
  const navigate = useNavigate();

  const onNavigate = (path) => {
    if (path === 'admin') navigate('/admin');
    else navigate(path);
  };
  // ─── State (Zustand) ────────────────────────────────────────────────────────
  const activeCategoryId = usePosStore(state => state.activeCategoryId);
  const setActiveCategoryId = usePosStore(state => state.setActiveCategoryId);
  const searchQuery = usePosStore(state => state.searchQuery);
  const setSearchQuery = usePosStore(state => state.setSearchQuery);
  const addToCart = usePosStore(state => state.addToCart);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { products, loading: productsLoading } = useProducts();
  const { orders: recentOrders } = useOrders({ limit: 10 });
  const { toast } = useToast();

  // ─── Computed Data (Performance Optimized) ──────────────────────────────────
  const categories = useMemo(() => {
    const cats = [];
    const map = new Map();
    products.forEach(p => {
       const catName = p.categoryName || p.category;
       if (catName && !map.has(catName)) {
         map.set(catName, true);
         cats.push({ id: catName, name: catName, count: 0 });
       }
    });
    // Count items
    cats.forEach(c => {
       c.count = products.filter(p => (p.categoryName || p.category) === c.id).length;
    });
    return cats;
  }, [products]);

  // Set first category as active initially
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId, setActiveCategoryId]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      (!activeCategoryId || (p.categoryName || p.category) === activeCategoryId) &&
      (p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(searchQuery)))
    );
  }, [products, activeCategoryId, searchQuery]);

  return (
    <div className="h-screen bg-[#F9F7E8] font-sans flex flex-col overflow-hidden">
      <Toast message={toast} />

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-sage-100 bg-white/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4C6B50] flex items-center justify-center shadow-lg shadow-green-900/10">
              <span className="text-white text-xs font-black">GG</span>
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#343e2c]">Green Grounds</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-sage-400">POS Terminal</p>
            </div>
          </div>
          <div className="h-8 w-px bg-sage-100 hidden md:block" />
          <p className="text-xs font-bold text-sage-500 hidden md:block">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        <div className="flex items-center gap-4">
           {user?.role === 'admin' && (
             <button onClick={() => onNavigate('admin')} className="text-xs font-bold text-sage-600 px-3 py-2 rounded-xl hover:bg-sage-100 transition-all flex items-center gap-2">
                <BarChart2 size={14} /> Admin
             </button>
           )}
           <div className="flex items-center gap-2.5 bg-white border border-sage-200 rounded-2xl px-3 py-1.5 shadow-sm">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Staff')}&background=4C6B50&color=fff`} className="w-7 h-7 rounded-full object-cover" />
              <div className="leading-none pr-1">
                 <p className="text-xs font-black text-sage-900">{user?.name || 'Staff'}</p>
                 <p className="text-[10px] text-sage-400 uppercase font-bold mt-1">{user?.role || 'Cashier'}</p>
              </div>
           </div>
           <button onClick={onLogout} className="p-2 rounded-xl text-sage-400 hover:text-red-500 hover:bg-red-50 transition-all"><X size={18} /></button>
        </div>
      </header>

      {/* ── Main View ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Categories Sidebar */}
        <nav className="w-20 md:w-24 bg-white border-r border-sage-100 flex flex-col items-center py-6 gap-6 overflow-y-auto z-10">
           {categories.map(cat => (
             <button 
               key={cat.id} 
               onClick={() => setActiveCategoryId(cat.id)}
               className={`flex flex-col items-center gap-2 group transition-all ${activeCategoryId === cat.id ? 'scale-110' : 'opacity-40 hover:opacity-70'}`}
             >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all ${activeCategoryId === cat.id ? 'bg-[#4C6B50] text-white rotate-3' : 'bg-sage-50 text-sage-600'}`}>
                 <AlignJustify size={20} />
               </div>
               <span className="text-[10px] font-black uppercase text-center leading-none tracking-tighter px-1">{cat.name}</span>
             </button>
           ))}
        </nav>

        {/* Product Grid Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#F9F7E8]/50">
           {/* Catalog Header */}
           <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400 group-focus-within:text-[#4C6B50] transition-colors" size={16} />
                 <input 
                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search coffee, tea, snacks or scan barcode..."
                    className="w-full bg-white border border-sage-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#4C6B50]/10 focus:border-[#4C6B50] transition-all shadow-sm"
                 />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-sage-400 bg-white px-3 py-2 rounded-xl border border-sage-100">
                 <CalendarClock size={14} /> {recentOrders.length} Completed Today
              </div>
           </div>

           {/* Grid */}
           <div className="flex-1 overflow-y-auto px-6 pb-6">
              {productsLoading ? <div className="mt-20"><LoadingSpinner /></div> : filteredProducts.length === 0 ? (
                <EmptyState icon="☕" title="No matching items" subtitle="Try another search or category" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredProducts.map(p => (
                    <ProductItem key={p.id} p={p} onAddToCart={addToCart} />
                  ))}
                </div>
              )}
           </div>
        </section>

        {/* Right Cart Sidebar */}
        <CartSidebar />
      </div>

      {/* Reusable mini-icon for internal use */}
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
}

