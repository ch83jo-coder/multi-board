export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success";
}) {
  const style =
    tone === "primary"
      ? "bg-primary text-white"
      : tone === "success"
        ? "bg-secondary text-white"
        : "bg-surface-container text-text-muted";
  return (
    <span
      className={`inline-flex rounded px-2 py-1 font-label-sm text-label-sm ${style}`}
    >
      {children}
    </span>
  );
}
