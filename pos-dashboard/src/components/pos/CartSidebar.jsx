import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, Plus, Minus, AlignJustify, User, Tag,
  ShoppingBag, RefreshCw, CreditCard
} from "lucide-react";

import { useTables } from "../../hooks/useTables";
import { useSettings } from "../../hooks/useSettings";
import { useOrders } from "../../hooks/useOrders";
import { useAuth } from "../../context/AuthContext";

import { formatCurrency } from "../../lib/utils";
import { Btn, useToast } from "../ui/index.jsx";
import usePosStore from "../../store/usePosStore";

const CartSidebar = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { tables } = useTables();
  const { createOrder, refresh: refreshOrders } = useOrders({ limit: 10 });
  const { show } = useToast();

  const cartItems = usePosStore(state => state.cartItems);
  const changeCartItemQty = usePosStore(state => state.changeCartItemQty);
  const clearCart = usePosStore(state => state.clearCart);
  
  const orderType = usePosStore(state => state.orderType);
  const setOrderType = usePosStore(state => state.setOrderType);
  
  const customer = usePosStore(state => state.customer);
  const selectedTableId = usePosStore(state => state.selectedTableId);
  const setSelectedTableId = usePosStore(state => state.setSelectedTableId);
  
  const promoCode = usePosStore(state => state.promoCode);
  const setPromoCode = usePosStore(state => state.setPromoCode);
  
  const appliedDiscount = usePosStore(state => state.appliedDiscount);
  const setAppliedDiscount = usePosStore(state => state.setAppliedDiscount);
  
  const isCheckoutLoading = usePosStore(state => state.isCheckoutLoading);
  const setIsCheckoutLoading = usePosStore(state => state.setIsCheckoutLoading);
  const getCartTotals = usePosStore(state => state.getCartTotals);

  const { subtotal, tax, discountValue, total } = useMemo(() => 
    getCartTotals(settings?.taxRate, settings?.taxInclusive), 
  [cartItems, appliedDiscount, settings, getCartTotals]);

  const handleValidatePromo = useCallback(async () => {
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
  }, [promoCode, subtotal, setAppliedDiscount, show]);

  const handlePlaceOrder = useCallback(async () => {
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
        notes: "",
      };
      
      const order = await createOrder(payload);
      show('success', `Order ${order.orderNumber} placed!`);
      clearCart();
      refreshOrders();
    } catch (err) {
      show('error', err.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [cartItems, orderType, selectedTableId, user, customer, appliedDiscount, createOrder, show, clearCart, refreshOrders, setIsCheckoutLoading]);

  return (
    <aside className="w-[340px] md:w-[380px] bg-white border-l border-sage-100 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
      <div className="px-5 py-5 border-b border-sage-50">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-black text-sage-900 tracking-tight flex items-center gap-2">
              <Receipt size={16} className="text-[#4C6B50]" /> CURRENT ORDER
           </h3>
           <Btn variant="ghost" size="sm" onClick={clearCart} className="text-red-400 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase">
              Clear All
           </Btn>
        </div>

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
                   value={selectedTableId || ""} onChange={e => setSelectedTableId(e.target.value)}
                   className="w-full appearance-none bg-sage-50 border border-sage-100 rounded-xl pl-8 pr-2 py-2 text-[11px] font-bold text-sage-800 outline-none focus:border-sage-300"
                 >
                   <option value="">Table</option>
                   {tables.map(t => <option key={t.id} value={t.id}>{t.number}</option>)}
                </select>
             </div>
           )}
        </div>
      </div>

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
                        <button onClick={() => changeCartItemQty(item.id, -1)} className="w-5 h-5 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600 hover:bg-sage-200">
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-black text-sage-800 w-4 text-center">{item.qty}</span>
                        <button onClick={() => changeCartItemQty(item.id, 1)} className="w-5 h-5 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600 hover:bg-sage-200">
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

      <div className="px-6 pt-4 pb-6 border-t border-sage-50 bg-[#F9F7E8]/30">
         <div className="space-y-2 mb-4">
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
               <span className="text-sage-400">Tax ({settings?.taxRate || 0}%)</span>
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
  );
};

export default React.memo(CartSidebar);