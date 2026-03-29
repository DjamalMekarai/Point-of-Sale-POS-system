import { X, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ProductImageUpload from "./ProductImageUpload";
import { useEffect, useState } from "react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0.01, "Price must be greater than 0")),
  categoryName: z.string().min(1, "Category is required"),
  stock: z.preprocess((val) => Number(val), z.number().min(0, "Stock cannot be negative")),
});

export default function ProductFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData = null }) {
  const isEditing = !!initialData;
  const [categories, setCategories] = useState([]);

  // Load categories dynamically from API
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryName: "",
      stock: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name || "",
          description: initialData.description || "",
          price: initialData.price || "",
          categoryName: initialData.categoryName || initialData.category || "",
          stock: initialData.stock || 0,
        });
      } else {
        reset({ name: "", description: "", price: "", categoryName: "", stock: "" });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data) => {
    data.photo = data.photoFile || initialData?.image || null;
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-sage-100">
          <h2 className="text-xl font-bold text-sage-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-sage-400 hover:bg-sage-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-4">
          <div className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-sage-800 mb-1">
                Product Photo {isEditing ? "(Optional)" : "*"}
              </label>
              <Controller
                name="photoFile"
                control={control}
                render={({ field }) => (
                  <ProductImageUpload
                    value={field.value || initialData?.image}
                    onChange={field.onChange}
                    error={errors.photoFile?.message}
                  />
                )}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-sage-800 mb-1">Product Name *</label>
              <input
                {...register("name")}
                className={`w-full p-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-sage-200"} outline-none focus:border-sage-500 bg-white`}
                placeholder="e.g. Caramel Macchiato"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category — loaded from /api/categories */}
              <div>
                <label className="block text-sm font-semibold text-sage-800 mb-1">Category *</label>
                <select
                  {...register("categoryName")}
                  className={`w-full p-2.5 rounded-xl border ${errors.categoryName ? "border-red-500" : "border-sage-200"} outline-none focus:border-sage-500 bg-white`}
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryName && <p className="text-sm text-red-500 mt-1">{errors.categoryName.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-sage-800 mb-1">Price (DA) *</label>
                <input
                  type="number"
                  step="1"
                  {...register("price")}
                  className={`w-full p-2.5 rounded-xl border ${errors.price ? "border-red-500" : "border-sage-200"} outline-none focus:border-sage-500 bg-white`}
                  placeholder="0"
                />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
              </div>

              {/* Stock */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-sage-800 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  {...register("stock")}
                  className={`w-full p-2.5 rounded-xl border ${errors.stock ? "border-red-500" : "border-sage-200"} outline-none focus:border-sage-500 bg-white`}
                  placeholder="e.g. 50"
                />
                {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-sage-800 mb-1">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-sage-200 outline-none focus:border-sage-500 bg-white"
                placeholder="Product description..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-sage-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-semibold text-sage-700 hover:bg-sage-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-sage-800 hover:bg-sage-900 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
