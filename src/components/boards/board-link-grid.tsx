import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Board } from "@/lib/types";

export function BoardLinkGrid({
  boards,
  mode = "browse",
}: {
  boards: Board[];
  mode?: "browse" | "write";
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {boards.map((board) => (
        <Link
          key={board.id}
          href={
            mode === "write"
              ? `/boards/${board.slug}/write`
              : `/boards/${board.slug}`
          }
          className="group flex min-h-24 items-center gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <MaterialIcon name={board.icon} />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-body-md font-semibold">
              {board.name}
            </strong>
            <span className="mt-1 line-clamp-2 block text-body-sm text-muted-foreground">
              {board.description}
            </span>
          </span>
          <MaterialIcon
            name={mode === "write" ? "edit" : "chevron_right"}
            className="shrink-0 text-[20px] text-muted-foreground transition-colors group-hover:text-primary"
          />
        </Link>
      ))}
    </div>
  );
}
