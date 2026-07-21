import Link from "next/link";

export function Pagination({
  current = 1,
  pages = 5,
}: {
  current?: number;
  pages?: number;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 py-6"
    >
      <Link
        href={`?page=${Math.max(1, current - 1)}`}
        className="rounded border border-border-subtle bg-white px-3 py-2 text-body-sm text-text-muted hover:border-primary"
      >
        ‹
      </Link>
      {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={`?page=${page}`}
          aria-current={page === current ? "page" : undefined}
          className={`rounded border px-3 py-2 text-body-sm ${page === current ? "border-primary bg-primary text-white" : "border-border-subtle bg-white text-text-muted hover:border-primary"}`}
        >
          {page}
        </Link>
      ))}
      <Link
        href={`?page=${Math.min(pages, current + 1)}`}
        className="rounded border border-border-subtle bg-white px-3 py-2 text-body-sm text-text-muted hover:border-primary"
      >
        ›
      </Link>
    </nav>
  );
}
