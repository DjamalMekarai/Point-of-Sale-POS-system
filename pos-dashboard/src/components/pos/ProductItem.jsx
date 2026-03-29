import React from 'react';
import { motion } from 'framer-motion';
import { AlignJustify } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const ProductItem = React.memo(({ p, onAddToCart }) => {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }} 
      onClick={() => onAddToCart(p)}
      className="bg-white rounded-2xl p-2.5 border border-sage-100 shadow-sm hover:shadow-md transition-all flex flex-col group text-left"
    >
      <div className="aspect-square rounded-xl bg-sage-50 overflow-hidden mb-3 relative">
         {p.image ? (
           <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
         ) : <div className="w-full h-full flex items-center justify-center text-sage-200"><AlignJustify size={32} /></div>}
         <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-[#4C6B50] shadow-sm">
            {formatCurrency(p.price)}
         </div>
      </div>
      <h4 className="text-xs font-bold text-sage-900 leading-tight mb-1 truncate">{p.name}</h4>
      <p className="text-[10px] text-sage-400 font-bold uppercase tracking-tight">{p.categoryName || p.category}</p>
    </motion.button>
  );
});

export default ProductItem;
