import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards, getViewer } from "@/lib/data";

export async function MobileBottomNav() {
  const [viewer, boards] = await Promise.all([getViewer(), getBoards()]);
  const firstBoard = boards[0];
  const boardHref = firstBoard ? `/boards/${firstBoard.slug}` : "/";
  const writeHref = firstBoard ? `/boards/${firstBoard.slug}/write` : "/login";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-white md:hidden">
      {[
        ["home", "ホーム", "/"],
        ["explore", "ボード", boardHref],
        ["edit", "投稿", writeHref],
        ["person", "アカウント", viewer ? "/profile" : "/login"],
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
