import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${VARIANTS[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {loading && <Spinner size="h-4 w-4" className="text-current" />}
      {children}
    </button>
  );
}
