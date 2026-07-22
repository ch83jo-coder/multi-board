import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getViewer } from "@/lib/data";

export async function MobileBottomNav() {
  const viewer = await getViewer();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-white md:hidden">
      {[
        { icon: "home", label: "ホーム", href: "/" },
        { icon: "database", label: "準備中", disabled: true },
        { icon: "edit", label: "質問", href: "/boards?mode=write" },
        {
          icon: "person",
          label: "アカウント",
          href: viewer ? "/profile" : "/login",
        },
      ].map((item) =>
        item.disabled ? (
          <button
            key={item.label}
            type="button"
            disabled
            aria-label="実測データ（準備中）"
            title="実測データは準備中です"
            className="flex min-w-16 cursor-not-allowed flex-col items-center gap-1 text-[10px] text-text-muted opacity-50"
          >
            <MaterialIcon name={item.icon} className="text-[22px]" />
            {item.label}
          </button>
        ) : (
          <Link
            key={item.label}
            href={item.href ?? "/"}
            className="flex min-w-16 flex-col items-center gap-1 text-[10px] text-text-muted hover:text-primary"
          >
            <MaterialIcon name={item.icon} className="text-[22px]" />
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
