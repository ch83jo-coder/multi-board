export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success";
}) {
  const style =
    tone === "primary"
      ? "border-primary/20 bg-accent text-accent-foreground"
      : tone === "success"
        ? "border-secondary/20 bg-secondary-container text-on-secondary-container"
        : "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm ${style}`}
    >
      {children}
    </span>
  );
}
