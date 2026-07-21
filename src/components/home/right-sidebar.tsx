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
            人気のコミュニティ
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
                  投稿 {formatCompact(board.post_count ?? 0)}件
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="mb-3 font-headline-md text-base font-semibold">
          トレンドキーワード
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "#Panmoa2",
            "#AI",
            "#リモートワーク",
            "#プレミアリーグ",
            "#インディーゲーム",
          ].map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag.slice(1))}`}
            >
              <Chip>{tag}</Chip>
            </Link>
          ))}
        </div>
      </Card>
    </aside>
  );
}
