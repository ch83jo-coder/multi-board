import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Board, Post } from "@/lib/types";

export function Hero({ post, boards }: { post?: Post; boards: Board[] }) {
  const firstBoard = boards[0];
  const featuredBoard =
    boards.find((board) => board.slug === "humor") ?? firstBoard;
  const secondaryBoard =
    boards.find((board) => board.slug === "game") ?? boards[1] ?? firstBoard;
  const href = post?.board
    ? `/boards/${post.board.slug}/${post.id}`
    : firstBoard
      ? `/boards/${firstBoard.slug}`
      : "/";
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Link
        href={href}
        className="group relative h-64 overflow-hidden rounded-lg border border-border-subtle bg-inverse-surface md:col-span-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,#0055ff_0,transparent_45%),linear-gradient(135deg,#10203f,#111827)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 z-10 p-6">
          <span className="mb-2 inline-block rounded-sm bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            速報
          </span>
          <h1 className="font-headline-lg text-headline-lg-mobile leading-tight text-white md:text-headline-lg">
            {post?.title ?? "Panmoa 2.0：新しい議論の時代へ"}
          </h1>
          <p className="mt-2 line-clamp-1 text-body-sm text-white/75">
            情報をすばやく、分かりやすく交換できる新しいコミュニティです。
          </p>
        </div>
      </Link>
      <div className="flex flex-col gap-4 md:col-span-4">
        <Link
          href={featuredBoard ? `/boards/${featuredBoard.slug}` : "/"}
          className="group relative flex-1 overflow-hidden rounded-lg bg-primary-container p-5 text-on-primary-container"
        >
          <h2 className="font-headline-md text-headline-md">
            今週の{featuredBoard?.name ?? "掲示板"}
          </h2>
          <p className="mt-2 text-body-sm opacity-90">
            今週話題になった投稿をまとめてチェックしましょう。
          </p>
          <MaterialIcon
            name="sentiment_very_satisfied"
            className="absolute -bottom-2 -right-2 text-6xl opacity-20 transition-transform group-hover:rotate-6"
          />
        </Link>
        <Link
          href={secondaryBoard ? `/boards/${secondaryBoard.slug}` : "/"}
          className="flex-1 rounded-lg border border-border-subtle bg-surface-container p-5"
        >
          <h2 className="font-headline-md text-headline-md text-primary">
            {secondaryBoard?.name ?? "掲示板"}
          </h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            最新の投稿と議論をチェックしましょう。
          </p>
          <span className="mt-4 inline-flex items-center gap-1 font-label-md text-primary">
            掲示板へ
            <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </span>
        </Link>
      </div>
    </section>
  );
}
