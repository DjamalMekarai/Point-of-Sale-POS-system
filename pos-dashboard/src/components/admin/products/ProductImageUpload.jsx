import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, RefreshCw } from "lucide-react";

export default function ProductImageUpload({ value, onChange, error }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Handle existing image URL (edit mode) or File/Blob object
    if (value) {
      if (typeof value === "string") {
        setPreviewUrl(value);
      } else if (value instanceof Blob || value instanceof File) {
        const objectUrl = URL.createObjectURL(value);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const processFile = (file) => {
    setLocalError("");
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setLocalError("Only JPG, PNG and WEBP files are allowed.");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setLocalError("Image must be smaller than 2MB.");
      return;
    }

    onChange(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer?.files?.[0]);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLocalError("");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          error || localError
            ? "border-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/20"
            : isDragging
            ? "border-sage-500 bg-sage-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/80"
        } overflow-hidden`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
                title="Change Photo"
                onClick={handleClick}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove Photo"
                onClick={handleRemove}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 flex flex-col items-center">
            <UploadCloud className={`w-10 h-10 mb-3 ${error || localError ? "text-red-500" : "text-gray-400"}`} />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Click to upload product photo
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              JPG, PNG, WEBP (Max 2MB)
            </p>
          </div>
        )}
      </div>

      {(error || localError) && (
        <p className="mt-2 text-sm text-red-500 font-medium">
          {localError || error}
        </p>
      )}
    </div>
  );
}
