type ValidationToastProps = {
  message: string | null;
  variant?: "error" | "success" | "info";
};

const variantStyles: Record<NonNullable<ValidationToastProps["variant"]>, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-slate-200 bg-white text-slate-600"
};

export function ValidationToast({ message, variant = "error" }: ValidationToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className={`reveal-up rounded-lg border px-3 py-2 text-sm shadow-sm ${variantStyles[variant]}`}>
      {message}
    </div>
  );
}
