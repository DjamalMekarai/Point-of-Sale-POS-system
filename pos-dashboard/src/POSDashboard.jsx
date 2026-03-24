import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Bell, Plus, Minus, AlertCircle, SlidersHorizontal, 
  ChevronLeft, AlignJustify, ChevronDown, ChevronRight, 
  Receipt, BarChart2, X, Printer, CalendarClock, CreditCard, User, Heart, Tag,
  ShoppingBag, RefreshCw
} from "lucide-react";

// Hooks
import { useProducts } from "./hooks/useProducts";
import { useOrders } from "./hooks/useOrders";
import { useTables } from "./hooks/useTables";
import { useSettings } from "./hooks/useSettings";
import { useCustomers } from "./hooks/useCustomers";
import { useDiscounts } from "./hooks/useDiscounts";
import { useAuth } from "./context/AuthContext";

// UI Helpers
import { formatCurrency, formatDateTime } from "./lib/utils";
import { ORDER_TYPES } from "./lib/constants";
import { Toast, useToast, LoadingSpinner, Modal, Field, Input, Btn, EmptyState } from "./components/ui/index.jsx";

export default function POSDashboard() {
  const { user, logout: onLogout } = useAuth();
  const navigate = useNavigate();

  const onNavigate = (path) => {
    if (path === 'admin') navigate('/admin');
    else navigate(path);
  };
  // ─── State ──────────────────────────────────────────────────────────────────
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [orderType, setOrderType] = useState("DINE_IN");
  const [customer, setSelectedCustomer] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { products, loading: productsLoading } = useProducts();
  const { createOrder, orders: recentOrders, refresh: refreshOrders } = useOrders({ limit: 10 });
  const { tables } = useTables();
  const { settings } = useSettings();
  const { customers, refresh: searchCustomers } = useCustomers();
  const { toast, show } = useToast();

  // ─── Derived Data ───────────────────────────────────────────────────────────
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
  }, [categories, activeCategoryId]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (!activeCategoryId || (p.categoryName || p.category) === activeCategoryId) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery))
    );
  }, [products, activeCategoryId, searchQuery]);

  // ─── Cart Logic ─────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxRate = settings?.taxRate || 19;
  const tax = settings?.taxInclusive ? 0 : (subtotal * (taxRate / 100));
  
  let discountValue = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'PERCENTAGE') discountValue = subtotal * (appliedDiscount.value / 100);
    else discountValue = appliedDiscount.value;
  }
  
  const total = subtotal + tax - discountValue;

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleValidatePromo = async () => {
    if (!promoCode) return;
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderTotal: subtotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppliedDiscount(data.discount);
      show('success', 'Promo code applied!');
    } catch (err) {
      show('error', err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);
    try {
      const payload = {
        type: orderType,
        tableId: orderType === 'DINE_IN' ? parseInt(selectedTableId) : null,
        staffId: user?.id,
        customerId: customer?.id,
        discountId: appliedDiscount?.id,
        items: cartItems.map(i => ({ 
          productId: i.id, 
          quantity: i.qty, 
          unitPrice: i.price,
          notes: i.tempNotes 
        })),
        notes: "", // Global order notes
      };
      
      const order = await createOrder(payload);
      show('success', `Order ${order.orderNumber} placed!`);
      setCartItems([]);
      setPromoCode("");
      setAppliedDiscount(null);
      setSelectedTableId("");
      refreshOrders();
    } catch (err) {
      show('error', err.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

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
                    <motion.button 
                      whileTap={{ scale: 0.95 }} key={p.id} onClick={() => addToCart(p)}
                      className="bg-white rounded-2xl p-2.5 border border-sage-100 shadow-sm hover:shadow-md transition-all flex flex-col group text-left"
                    >
                      <div className="aspect-square rounded-xl bg-sage-50 overflow-hidden mb-3 relative">
                         {p.image ? (
                           <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         ) : <div className="w-full h-full flex items-center justify-center text-sage-200"><AlignJustify size={32} /></div>}
                         <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-[#4C6B50] shadow-sm">
                            {formatCurrency(p.price)}
                         </div>
                      </div>
                      <h4 className="text-xs font-bold text-sage-900 leading-tight mb-1 truncate">{p.name}</h4>
                      <p className="text-[10px] text-sage-400 font-bold uppercase tracking-tight">{p.categoryName || p.category}</p>
                    </motion.button>
                  ))}
                </div>
              )}
           </div>
        </section>

        {/* Right Cart Sidebar */}
        <aside className="w-[340px] md:w-[380px] bg-white border-l border-sage-100 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
           <div className="px-5 py-5 border-b border-sage-50">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-sage-900 tracking-tight flex items-center gap-2">
                   <Receipt size={16} className="text-[#4C6B50]" /> CURRENT ORDER
                </h3>
                <Btn variant="ghost" size="sm" onClick={() => setCartItems([])} className="text-red-400 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase">
                   Clear All
                </Btn>
             </div>

             {/* Order Settings */}
             <div className="grid grid-cols-3 gap-2 p-1 bg-sage-50 rounded-xl mb-4">
                {['DINE_IN', 'TAKEAWAY', 'DELIVERY'].map(t => (
                  <button 
                    key={t} onClick={() => setOrderType(t)}
                    className={`text-[9px] font-black py-2 rounded-lg transition-all ${orderType === t ? 'bg-[#4C6B50] text-white shadow-md' : 'text-sage-400 hover:text-sage-600'}`}>
                    {t.replace('_', ' ')}
                  </button>
                ))}
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                   <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage-300" size={12} />
                   <input 
                      className="w-full bg-sage-50 border border-sage-100 rounded-xl pl-8 pr-2 py-2 text-[11px] font-bold text-sage-800 outline-none focus:border-sage-300" 
                      placeholder="Customer Name"
                   />
                </div>
                {orderType === 'DINE_IN' && (
                  <div className="relative">
                     <AlignJustify className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage-300" size={12} />
                     <select 
                        value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)}
                        className="w-full appearance-none bg-sage-50 border border-sage-100 rounded-xl pl-8 pr-2 py-2 text-[11px] font-bold text-sage-800 outline-none focus:border-sage-300"
                      >
                        <option value="">Table</option>
                        {tables.map(t => <option key={t.id} value={t.id}>{t.number}</option>)}
                     </select>
                  </div>
                )}
             </div>
           </div>

           {/* Items List */}
           <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <AnimatePresence initial={false}>
                 {cartItems.map(item => (
                   <motion.div 
                     layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                     key={item.id} className="group bg-white rounded-2xl p-3 border border-sage-50 hover:border-sage-200 transition-all flex items-center gap-3"
                   >
                     <div className="w-12 h-12 rounded-xl bg-sage-50 flex-shrink-0 overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h5 className="text-[11px] font-black text-sage-900 truncate leading-tight">{item.name}</h5>
                           <span className="text-[11px] font-black text-sage-900">{formatCurrency(item.price * item.qty)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                           <div className="flex items-center gap-2">
                             <button onClick={() => changeQty(item.id, -1)} className="w-5 h-5 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600 hover:bg-sage-200">
                               <Minus size={10} />
                             </button>
                             <span className="text-xs font-black text-sage-800 w-4 text-center">{item.qty}</span>
                             <button onClick={() => changeQty(item.id, 1)} className="w-5 h-5 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600 hover:bg-sage-200">
                               <Plus size={10} />
                             </button>
                           </div>
                           <span className="text-[9px] font-bold text-sage-400">{formatCurrency(item.price)} each</span>
                        </div>
                     </div>
                   </motion.div>
                 ))}
                 {cartItems.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-sage-300 py-20 opacity-40">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="text-xs font-black uppercase tracking-widest mt-4">Order is empty</p>
                   </div>
                 )}
              </AnimatePresence>
           </div>

           {/* Footer Detail */}
           <div className="px-6 pt-4 pb-6 border-t border-sage-50 bg-[#F9F7E8]/30">
              <div className="space-y-2 mb-4">
                 {/* Promo Code Input */}
                 <div className="flex gap-2 mb-4">
                    <input 
                       value={promoCode} onChange={e => setPromoCode(e.target.value)}
                       placeholder="Promo code..."
                       className="flex-1 bg-white border border-sage-100 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:border-[#4C6B50]"
                    />
                    <Btn size="sm" onClick={handleValidatePromo} disabled={!promoCode} variant="secondary">Apply</Btn>
                 </div>

                 <div className="flex justify-between text-xs font-bold">
                    <span className="text-sage-400">Subtotal</span>
                    <span className="text-sage-800">{formatCurrency(subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                    <span className="text-sage-400">Tax ({taxRate}%)</span>
                    <span className="text-sage-800">{formatCurrency(tax)}</span>
                 </div>
                 {appliedDiscount && (
                   <div className="flex justify-between text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1"><Tag size={12} /> {appliedDiscount.name}</div>
                      <span>-{formatCurrency(discountValue)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-end pt-2 border-t border-sage-100 mt-2">
                    <span className="text-sm font-black text-sage-900">Total Amount</span>
                    <span className="text-2xl font-black text-[#4C6B50] tracking-tighter">{formatCurrency(total)}</span>
                 </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || isCheckoutLoading}
                className="w-full bg-[#4C6B50] hover:bg-[#344636] active:scale-[0.98] disabled:opacity-50 text-white rounded-2xl py-4 font-black text-base shadow-xl shadow-green-900/20 transition-all flex items-center justify-center gap-3"
              >
                 {isCheckoutLoading ? <RefreshCw className="animate-spin" size={20} /> : (
                   <>
                     <CreditCard size={20} /> 
                     <span>FINISH & PAY ORDER</span>
                   </>
                 )}
              </button>
           </div>
        </aside>
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

