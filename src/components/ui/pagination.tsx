import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export function Pagination({
  current = 1,
  pages = 1,
  sort,
}: {
  current?: number;
  pages?: number;
  sort?: string;
}) {
  const href = (page: number) => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };
  return (
    <nav
      aria-label="ページ送り"
      className="flex items-center justify-center gap-1 py-6"
    >
      <Link
        href={href(Math.max(1, current - 1))}
        aria-label="前のページ"
        aria-disabled={current === 1}
        tabIndex={current === 1 ? -1 : undefined}
        className={buttonStyles({
          variant: "outline",
          size: "icon-sm",
          className: current === 1 ? "pointer-events-none opacity-50" : "",
        })}
      >
        ‹
      </Link>
      {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={href(page)}
          aria-current={page === current ? "page" : undefined}
          className={buttonStyles({
            variant: page === current ? "default" : "outline",
            size: "icon-sm",
          })}
        >
          {page}
        </Link>
      ))}
      <Link
        href={href(Math.min(pages, current + 1))}
        aria-label="次のページ"
        aria-disabled={current === pages}
        tabIndex={current === pages ? -1 : undefined}
        className={buttonStyles({
          variant: "outline",
          size: "icon-sm",
          className: current === pages ? "pointer-events-none opacity-50" : "",
        })}
      >
        ›
      </Link>
    </nav>
  );
}
