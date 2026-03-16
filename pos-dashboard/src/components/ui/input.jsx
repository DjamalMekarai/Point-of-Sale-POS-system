import { cn } from "../../lib/utils";

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm text-sage-900 placeholder-sage-400 shadow-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
