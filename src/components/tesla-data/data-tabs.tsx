import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { TESLA_DATA_TABS } from "@/lib/tesla-data";
import type { TeslaDataType } from "@/lib/types";

export function DataTabs({
  active,
  mode = "browse",
}: {
  active: TeslaDataType;
  mode?: "browse" | "write";
}) {
  return (
    <nav
      aria-label="Tesla実測データの種類"
      className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
    >
      {TESLA_DATA_TABS.map((tab) => {
        const href =
          mode === "write"
            ? `/tesla-data/new?type=${tab.value}`
            : tab.value === "charging"
              ? "/tesla-data"
              : `/tesla-data?type=${tab.value}`;
        const selected = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={href}
            aria-current={selected ? "page" : undefined}
            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-label-sm font-semibold transition-colors sm:text-body-sm ${
              selected
                ? "bg-white text-on-surface shadow-sm"
                : "text-muted-foreground hover:text-on-surface"
            }`}
          >
            <MaterialIcon
              name={tab.icon}
              className="hidden text-[18px] sm:inline-block"
            />
            <span className="truncate sm:hidden">{tab.shortLabel}</span>
            <span className="hidden truncate sm:inline">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
