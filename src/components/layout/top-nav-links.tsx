"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Board } from "@/lib/types";

const baseLinkClass =
  "relative flex h-16 items-center px-1 font-label-md text-label-md transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform";

function linkClassName(active: boolean) {
  return `${baseLinkClass} ${
    active
      ? "text-primary after:scale-x-100"
      : "text-text-muted hover:text-primary"
  }`;
}

export function TopNavLinks({
  boards,
}: {
  boards: Pick<Board, "id" | "slug" | "name">[];
}) {
  const pathname = usePathname();
  return (
    <nav className="hidden h-16 items-center gap-6 md:flex">
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        className={linkClassName(pathname === "/")}
      >
        注目
      </Link>
      {boards.map((board) => {
        const href = `/boards/${board.slug}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={board.id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={linkClassName(active)}
          >
            {board.name}
          </Link>
        );
      })}
    </nav>
  );
}
