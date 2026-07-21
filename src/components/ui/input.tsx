import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "subtle";
};

export function Input({
  variant = "default",
  className = "",
  ...props
}: InputProps) {
  const appearance =
    variant === "subtle"
      ? "border-transparent bg-muted shadow-none focus-visible:bg-white"
      : "border-input bg-white shadow-sm";
  return (
    <input
      className={`h-10 w-full rounded-md border px-3 text-body-md text-on-surface outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 ${appearance} ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-40 w-full resize-y rounded-md border border-input bg-white px-3 py-2.5 text-body-md text-on-surface shadow-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
