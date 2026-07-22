import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { formatCompact, formatDate } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { displayAuthorName } from "@/lib/author";
import type { Post } from "@/lib/types";

export function BoardRow({
  post,
  number,
  slug,
}: {
  post: Post;
  number: number;
  slug: string;
}) {
  return (
    <div
      className={`grid grid-cols-[44px_1fr] items-center gap-2 px-3 py-3.5 transition-colors hover:bg-surface-alt md:grid-cols-[60px_1fr_120px_100px_80px] md:px-4 ${post.is_pinned ? "bg-success-light/50" : "bg-white"}`}
    >
      <div
        className={`text-center text-body-sm ${post.is_pinned ? "font-bold text-secondary" : "text-text-muted"}`}
      >
        {post.is_pinned ? "固定" : number}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {post.is_notice && (
          <span className="shrink-0">
            <Chip tone="success">お知らせ</Chip>
          </span>
        )}
        <Link
          href={`/boards/${slug}/${post.id}`}
          className="min-w-0 truncate text-body-md font-medium hover:text-primary"
        >
          {post.title}
        </Link>
        <span className="shrink-0 text-body-sm font-semibold text-primary">
          [{post.comment_count}]
        </span>
        {post.thumbnail_url && (
          <MaterialIcon name="image" className="text-[16px] text-primary" />
        )}
      </div>
      <div className="hidden truncate text-body-sm text-on-surface-variant md:block">
        {displayAuthorName(post)}
      </div>
      <div className="hidden text-center text-body-sm text-text-muted md:block">
        {formatDate(post.created_at).slice(0, 5)}
      </div>
      <div className="hidden text-center text-body-sm text-text-muted md:block">
        {formatCompact(post.view_count)}
      </div>
    </div>
  );
}
