import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const styles = {
    primary:
      "border-primary bg-primary text-on-primary hover:bg-primary-container",
    ghost: "border-border-subtle bg-white text-on-surface hover:bg-surface-alt",
    danger: "border-error bg-error text-on-error hover:opacity-90",
  };
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded border px-4 py-2 font-label-md text-label-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
