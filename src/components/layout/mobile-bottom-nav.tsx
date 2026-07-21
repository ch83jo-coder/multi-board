import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-white md:hidden">
      {[
        ["home", "ホーム", "/"],
        ["explore", "ボード", "/boards/humor"],
        ["edit", "投稿", "/boards/humor/write"],
        ["person", "アカウント", "/login"],
      ].map(([icon, label, href]) => (
        <Link
          key={label}
          href={href}
          className="flex min-w-16 flex-col items-center gap-1 text-[10px] text-text-muted hover:text-primary"
        >
          <MaterialIcon name={icon} className="text-[22px]" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
