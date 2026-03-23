import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting, product }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center transform scale-100 transition-transform duration-200">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
        
        <p className="text-sm text-gray-500 mb-8">
          Are you sure you want to delete <span className="font-semibold text-gray-800">"{product?.name}"</span>? 
          This action cannot be undone and will remove it from the system entirely.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onConfirm(product.id)}
            className="w-full inline-flex justify-center rounded-xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 disabled:opacity-70 items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
