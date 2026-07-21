import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "destructive-link"
  | "active";

export type ButtonSize = "sm" | "default" | "lg" | "icon" | "icon-sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  default:
    "border-transparent bg-primary text-on-primary shadow-sm hover:bg-primary-container",
  secondary:
    "border-transparent bg-muted text-on-surface shadow-sm hover:bg-surface-container-high",
  outline:
    "border-border-subtle bg-white text-on-surface shadow-sm hover:bg-accent hover:text-accent-foreground",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-on-surface",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-error/90",
  link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
  "destructive-link":
    "border-transparent bg-transparent text-destructive underline-offset-4 hover:underline",
  active:
    "border-primary/20 bg-accent text-accent-foreground shadow-sm hover:bg-primary-fixed-dim",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label-sm",
  default: "h-10 px-4 text-body-sm",
  lg: "h-11 px-6 text-body-md",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-8 w-8 p-0",
};

export function buttonStyles({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  ...props
}: Props) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props} />
  );
}
