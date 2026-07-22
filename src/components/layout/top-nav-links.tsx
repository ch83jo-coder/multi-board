"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDismissibleMenu } from "@/components/layout/use-dismissible-menu";
import { MaterialIcon } from "@/components/ui/material-icon";
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
  boards: Pick<Board, "id" | "slug" | "name" | "icon">[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useDismissibleMenu(open, setOpen);
  const dataActive =
    pathname === "/tesla-data" || pathname.startsWith("/tesla-data/");
  const isBoardActive = (slug: string) => {
    const href = `/boards/${slug}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const teslaActive =
    dataActive ||
    pathname === "/boards" ||
    boards.some((board) => isBoardActive(board.slug));

  return (
    <nav className="hidden h-16 items-center gap-6 md:flex">
      <div ref={rootRef} className="relative h-16">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((value) => !value)}
          className={linkClassName(teslaActive)}
        >
          <MaterialIcon name="electric_car" className="text-[19px]" />
          Tesla
          <MaterialIcon
            name="expand_more"
            className={`text-[18px] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div
            role="menu"
            aria-label="Teslaメニュー"
            className="absolute left-0 top-14 z-50 w-64 overflow-hidden rounded-lg border border-border-subtle bg-white shadow-xl"
          >
            <div className="border-b border-border-subtle px-4 py-3">
              <p className="font-label-sm text-label-sm text-text-muted">
                TESLA COMMUNITY
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto py-2">
              <Link
                role="menuitem"
                href="/tesla-data"
                aria-current={dataActive ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-body-sm transition-colors ${
                  dataActive
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-on-surface hover:bg-surface-alt"
                }`}
              >
                <MaterialIcon
                  name="database"
                  className="text-[20px] text-text-muted"
                />
                <span>実測データ</span>
              </Link>
              {boards.map((board) => {
                const href = `/boards/${board.slug}`;
                const active = isBoardActive(board.slug);
                return (
                  <Link
                    key={board.id}
                    role="menuitem"
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-body-sm transition-colors ${
                      active
                        ? "bg-accent font-semibold text-accent-foreground"
                        : "text-on-surface hover:bg-surface-alt"
                    }`}
                  >
                    <MaterialIcon
                      name={board.icon}
                      className="text-[20px] text-text-muted"
                    />
                    <span className="truncate">{board.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-border-subtle p-2">
              <Link
                role="menuitem"
                href="/boards"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded px-3 py-2 text-body-sm font-semibold text-primary hover:bg-surface-alt"
              >
                Tesla掲示板一覧
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
