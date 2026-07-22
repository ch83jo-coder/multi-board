import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getViewer } from "@/lib/data";

export async function MobileBottomNav() {
  const viewer = await getViewer();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-white md:hidden">
      {[
        ["home", "ホーム", "/"],
        ["database", "実測データ", "/tesla-data"],
        ["edit", "質問", "/boards?mode=write"],
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
