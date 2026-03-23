import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Package, ChevronLeft, Loader2 } from "lucide-react";
import { useProducts } from "../../../hooks/useProducts";
import ProductFormModal from "./ProductFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function ProductList({ onBack }) {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteData, setDeleteData] = useState({ isOpen: false, product: null });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msgType, text) => {
    // A simple toast using local state for demo purposes. 
    // Usually you'd use react-toastify or similar.
    setToastMessage({ type: msgType, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteData({ isOpen: true, product });
  };

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast("success", "Product updated successfully");
      } else {
        await addProduct(formData);
        showToast("success", "Product added successfully");
      }
      setIsFormOpen(false);
    } catch (err) {
      showToast("error", "Failed to save product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmDelete = async (id) => {
    setIsDeletingLoading(true);
    try {
      await deleteProduct(id);
      showToast("success", "Product deleted successfully");
      setDeleteData({ isOpen: false, product: null });
    } catch (err) {
      showToast("error", "Failed to delete product: " + err.message);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9F7E8] min-h-screen">
      
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg font-medium text-white ${toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-500'} animate-in slide-in-from-top-2`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
             <button onClick={onBack} className="p-2 bg-white rounded-lg border border-sage-200 text-sage-600 hover:bg-sage-50">
               <ChevronLeft size={20} />
             </button>
          )}
          <h1 className="text-2xl font-extrabold text-sage-900 flex items-center gap-2">
            <Package className="text-sage-600" />
            Products & Stock
          </h1>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-800 text-white font-bold rounded-xl hover:bg-sage-900 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-5 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-sage-50 border border-sage-200 rounded-xl px-4 py-2 w-full max-w-sm">
            <Search size={16} className="text-sage-400" />
            <input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-sage-800 placeholder-sage-400"
            />
          </div>
        </div>

        {/* Table layout matching the dashboard */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-sage-100">
                <th className="font-semibold text-sage-400 pb-3 pl-3">Product</th>
                <th className="font-semibold text-sage-400 pb-3">Category</th>
                <th className="font-semibold text-sage-400 pb-3">Price</th>
                <th className="font-semibold text-sage-400 pb-3">Stock</th>
                <th className="font-semibold text-sage-400 pb-3 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-sage-500 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-sage-500">
                    No products found. Add a new product to get started!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-sage-50 hover:bg-sage-50/60 transition-colors group">
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                           <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                        ) : (
                           <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center text-sage-400 border border-sage-200">
                             <Package size={20} />
                           </div>
                        )}
                        <span className="font-bold text-sage-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sage-600 font-medium">
                      <span className="bg-sage-100 text-sage-700 px-2.5 py-1 rounded-md text-xs">{p.category}</span>
                    </td>
                    <td className="py-3 font-bold text-sage-900">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className={`font-bold px-2.5 py-1 rounded-md text-xs ${p.stock > 10 ? "bg-emerald-100 text-emerald-800" : p.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 bg-sage-50 text-sage-600 border border-sage-200 rounded-lg hover:bg-sage-100 hover:text-sage-900 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
                          className="p-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onFormSubmit}
        isSubmitting={isSubmitting}
        initialData={editingProduct}
      />

      <DeleteConfirmModal
        isOpen={deleteData.isOpen}
        onClose={() => setDeleteData({ isOpen: false, product: null })}
        onConfirm={onConfirmDelete}
        isDeleting={isDeletingLoading}
        product={deleteData.product}
      />
    </div>
  );
}
