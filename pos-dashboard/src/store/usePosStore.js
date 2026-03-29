import { create } from 'zustand';

const usePosStore = create((set, get) => ({
  // Active states
  activeCategoryId: null,
  searchQuery: '',
  orderType: 'DINE_IN',
  customer: null,
  selectedTableId: '',
  
  // Cart state
  cartItems: [],
  promoCode: '',
  appliedDiscount: null,
  isCheckoutLoading: false,

  // Actions
  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setOrderType: (type) => set({ orderType: type }),
  setCustomer: (customer) => set({ customer }),
  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setPromoCode: (code) => set({ promoCode: code }),
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
  setIsCheckoutLoading: (isLoading) => set({ isCheckoutLoading: isLoading }),

  // Cart operations (Direct mutations are forbidden in Zustand, we return a new state)
  addToCart: (product) => set((state) => {
    const existing = state.cartItems.find(i => i.id === product.id);
    if (existing) {
      return {
        cartItems: state.cartItems.map(i => 
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      };
    }
    return { cartItems: [...state.cartItems, { ...product, qty: 1 }] };
  }),

  changeCartItemQty: (id, delta) => set((state) => ({
    cartItems: state.cartItems
      .map(i => (i.id === id ? { ...i, qty: i.qty + delta } : i))
      .filter(i => i.qty > 0)
  })),

  clearCart: () => set({
    cartItems: [],
    promoCode: '',
    appliedDiscount: null,
    selectedTableId: '',
    customer: null,
  }),

  // Computed state selectors
  // Note: While Zustand allows functions that compute values on the fly, 
  // it's often better for performance to compute these in the component using useMemo, 
  // or use derived state libraries. For simple calculations, a selector is fine.
  getCartTotals: (taxRate = 19, taxInclusive = false) => {
    const { cartItems, appliedDiscount } = get();
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = taxInclusive ? 0 : (subtotal * (taxRate / 100));
    
    let discountValue = 0;
    if (appliedDiscount) {
      discountValue = appliedDiscount.type === 'PERCENTAGE' 
        ? subtotal * (appliedDiscount.value / 100) 
        : appliedDiscount.value;
    }
    
    const total = subtotal + tax - discountValue;
    
    return { subtotal, tax, discountValue, total };
  }
}));

export default usePosStore;