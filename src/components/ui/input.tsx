import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded border border-border-subtle bg-white px-3 py-2.5 text-body-md outline-none transition focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
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
      className={`min-h-40 w-full resize-y rounded border border-border-subtle bg-white px-3 py-2.5 text-body-md outline-none transition focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
