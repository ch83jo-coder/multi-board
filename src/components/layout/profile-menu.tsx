"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { useDismissibleMenu } from "@/components/layout/use-dismissible-menu";
import { Avatar } from "@/components/ui/avatar";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Profile } from "@/lib/types";

export function ProfileMenu({ viewer }: { viewer: Profile }) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismissibleMenu(open, setOpen);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="プロフィールメニュー"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full p-1 hover:bg-surface-alt"
      >
        <Avatar username={viewer.username} url={viewer.avatar_url} size="sm" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="プロフィールメニュー"
          className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-border-subtle bg-white py-2 shadow-xl"
        >
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="truncate font-label-md text-label-md font-bold">
              {viewer.username}
            </p>
            <p className="text-label-sm text-text-muted">
              {viewer.karma} カルマ
            </p>
          </div>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface hover:bg-surface-alt"
          >
            <MaterialIcon name="person" />
            プロフィール
          </Link>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-body-sm text-on-surface hover:bg-surface-alt"
            >
              <MaterialIcon name="logout" />
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
