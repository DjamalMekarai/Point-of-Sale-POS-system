import { X, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ProductImageUpload from "./ProductImageUpload";
import { useEffect } from "react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0.01, "Price must be greater than 0")),
  category: z.string().min(1, "Category is required"),
  stock: z.preprocess((val) => Number(val), z.number().min(0, "Stock cannot be negative")),
  // photo handled separately since it's a file
});

export default function ProductFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData = null }) {
  const isEditing = !!initialData;

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
      category: "",
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
          category: initialData.category || "",
          stock: initialData.stock || 0,
        });
      } else {
        reset({ name: "", description: "", price: "", category: "", stock: "" });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data) => {
    // For react-hook-form managed image
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
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-sage-800 mb-1">Category *</label>
                <select
                  {...register("category")}
                  className={`w-full p-2.5 rounded-xl border ${errors.category ? "border-red-500" : "border-sage-200"} outline-none focus:border-sage-500 bg-white`}
                >
                  <option value="">Select...</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Tea">Tea</option>
                  <option value="Snack">Snack</option>
                  <option value="Merch">Merch</option>
                </select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-sage-800 mb-1">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className={`w-full p-2.5 rounded-xl border ${errors.price ? "border-red-500" : "border-sage-200"} outline-none focus:border-sage-500 bg-white`}
                  placeholder="0.00"
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
