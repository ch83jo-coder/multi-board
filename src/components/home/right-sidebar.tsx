import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { formatCompact } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Board } from "@/lib/types";

export function RightSidebar({ boards }: { boards: Board[] }) {
  return (
    <aside className="hidden w-72 shrink-0 space-y-4 lg:block">
      <Card className="overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="font-headline-md text-base font-semibold">
            Top Communities
          </h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {boards.slice(0, 5).map((board, index) => (
            <Link
              key={board.id}
              href={`/boards/${board.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt"
            >
              <span className="w-4 text-center font-label-md text-primary">
                {index + 1}
              </span>
              <MaterialIcon
                name={board.icon}
                className="text-[20px] text-text-muted"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{board.name}</p>
                <p className="text-[11px] text-text-muted">
                  {formatCompact(board.post_count ?? 0)} posts
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden bg-primary-fixed p-5">
        <span className="font-label-sm text-primary">SPONSORED</span>
        <h3 className="mt-3 font-headline-md text-lg font-semibold text-on-primary-fixed">
          Write more. Scroll less.
        </h3>
        <p className="mt-2 text-body-sm text-on-primary-fixed-variant">
          Join curated discussions in a community built for signal.
        </p>
      </Card>
      <Card className="p-4">
        <h2 className="mb-3 font-headline-md text-base font-semibold">
          Trending Keywords
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "#Panmoa2",
            "#AI",
            "#RemoteWork",
            "#PremierLeague",
            "#IndieGames",
          ].map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </Card>
    </aside>
  );
}
