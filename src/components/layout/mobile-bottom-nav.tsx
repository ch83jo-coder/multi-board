import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getViewer } from "@/lib/data";

export async function MobileBottomNav() {
  const viewer = await getViewer();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-white md:hidden">
      {[
        { icon: "home", label: "ホーム", href: "/" },
        {
          icon: "calculate",
          label: "充電計算",
          href: "/tools/charging-cost",
        },
        { icon: "edit", label: "質問", href: "/boards?mode=write" },
        {
          icon: "person",
          label: "アカウント",
          href: viewer ? "/profile" : "/login",
        },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex min-w-16 flex-col items-center gap-1 text-[10px] text-text-muted hover:text-primary"
        >
          <MaterialIcon name={item.icon} className="text-[22px]" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
