export default function MainLoading() {
  const rows = ["first", "second", "third", "fourth", "fifth"];
  return (
    <div
      role="status"
      className="animate-pulse space-y-5"
      aria-label="読み込み中"
    >
      <div className="h-8 w-2/5 rounded bg-surface-container" />
      <div className="h-48 rounded-lg bg-surface-container" />
      <div className="space-y-1 overflow-hidden rounded-lg border border-border-subtle">
        {rows.map((row) => (
          <div
            key={row}
            className="h-20 border-b border-border-subtle bg-white last:border-0"
          />
        ))}
      </div>
    </div>
  );
}
