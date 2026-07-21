import Image from "next/image";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Post } from "@/lib/types";

export function FeedRow({ post }: { post: Post }) {
  const href = `/boards/${post.board?.slug ?? "humor"}/${post.id}`;
  return (
    <article className="group flex gap-4 bg-white p-4 transition-colors hover:bg-surface-alt">
      <div className="flex w-11 shrink-0 flex-col items-center gap-0.5 text-text-muted">
        <MaterialIcon name="expand_less" className="text-primary" />
        <span className="font-label-md text-label-md font-bold">
          {formatCompact(post.vote_count)}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Chip>{post.board?.name ?? "Board"}</Chip>
          {post.is_notice && <Chip tone="success">NOTICE</Chip>}
        </div>
        <Link
          href={href}
          className="block font-headline-md text-[18px] font-semibold leading-6 text-on-surface transition-colors group-hover:text-primary"
        >
          {post.title}
        </Link>
        <p className="line-clamp-1 text-body-sm text-text-muted">
          {post.author?.username ?? "Member"} · {formatDate(post.created_at)} ·{" "}
          {post.comment_count} comments
        </p>
      </div>
      {post.thumbnail_url && (
        <Image
          src={post.thumbnail_url}
          alt=""
          width={112}
          height={80}
          className="hidden h-20 w-28 shrink-0 rounded object-cover sm:block"
        />
      )}
    </article>
  );
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
