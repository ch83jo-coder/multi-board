import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardRow } from "@/components/ui/board-row";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Pagination } from "@/components/ui/pagination";
import {
  getBoard,
  getBoardBestPosts,
  getBoardPostCount,
  getBoardPosts,
  POSTS_PER_PAGE,
  parseBoardSort,
} from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const board = await getBoard((await params).slug);
  return { title: board ? `${board.name}掲示板` : "掲示板" };
}

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const parsedPage = Number(query.page ?? 1);
  const requestedPage = Number.isFinite(parsedPage)
    ? Math.max(1, Math.floor(parsedPage))
    : 1;
  const sort = parseBoardSort(query.sort);
  const board = await getBoard(slug);
  if (!board) notFound();
  const [total, weekly] = await Promise.all([
    getBoardPostCount(board.id),
    getBoardBestPosts(board.id),
  ]);
  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const page = Math.min(requestedPage, pages);
  const posts = await getBoardPosts(board.id, page, sort);
  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
            <span>掲示板</span>
            <MaterialIcon name="chevron_right" className="text-[14px]" />
            <span className="font-bold text-primary">{board.name}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {board.name}掲示板
          </h1>
          <p className="mt-2 max-w-2xl text-body-md text-text-muted">
            {board.description}
          </p>
        </div>
        <Link
          href={`/boards/${slug}/write`}
          className={buttonStyles({ size: "lg" })}
        >
          <MaterialIcon name="edit" className="text-[18px]" />
          新規投稿
        </Link>
      </header>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-end border-b border-border-subtle bg-white px-4 py-3">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <Link
              href={`/boards/${slug}?sort=popular`}
              aria-current={sort === "popular" ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors ${sort === "popular" ? "bg-white text-on-surface shadow-sm" : "text-muted-foreground hover:text-on-surface"}`}
            >
              人気
            </Link>
            <Link
              href={`/boards/${slug}`}
              aria-current={sort === "latest" ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors ${sort === "latest" ? "bg-white text-on-surface shadow-sm" : "text-muted-foreground hover:text-on-surface"}`}
            >
              新着
            </Link>
          </div>
        </div>
        <div className="hidden grid-cols-[60px_1fr_120px_100px_80px] border-b border-border-subtle bg-surface-alt px-4 py-3 font-label-md text-label-md text-text-muted md:grid">
          <div className="text-center">番号</div>
          <div>タイトル</div>
          <div>投稿者</div>
          <div className="text-center">日時</div>
          <div className="text-center">閲覧数</div>
        </div>
        <div className="divide-y divide-border-subtle">
          {posts.length ? (
            posts.map((post, index) => (
              <BoardRow
                key={post.id}
                post={post}
                number={(page - 1) * POSTS_PER_PAGE + index + 1}
                slug={slug}
              />
            ))
          ) : (
            <div className="px-6 py-14 text-center text-body-md text-text-muted">
              まだ投稿がありません。最初の投稿を作成してみましょう。
            </div>
          )}
        </div>
      </Card>
      <Pagination
        current={page}
        pages={pages}
        sort={sort === "latest" ? undefined : sort}
      />
      <section>
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="workspace_premium" className="text-primary" />
          <h2 className="font-headline-md text-headline-md">今週のベスト</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {weekly.length ? (
            weekly.map((post, index) => (
              <Link
                key={post.id}
                href={`/boards/${slug}/${post.id}`}
                className={`min-h-36 rounded-lg border border-border-subtle p-5 transition-transform hover:-translate-y-0.5 ${index === 0 ? "bg-primary text-white" : "bg-white"}`}
              >
                <span
                  className={`font-label-sm ${index === 0 ? "text-white/70" : "text-primary"}`}
                >
                  第{index + 1}位
                </span>
                <h3 className="mt-3 line-clamp-2 font-headline-md text-lg font-semibold">
                  {post.title}
                </h3>
                <p
                  className={`mt-3 text-body-sm ${index === 0 ? "text-white/70" : "text-text-muted"}`}
                >
                  投票 {post.vote_count}件 · コメント {post.comment_count}件
                </p>
              </Link>
            ))
          ) : (
            <p className="rounded-lg border border-border-subtle bg-white p-5 text-body-sm text-text-muted md:col-span-3">
              今週のベスト投稿はまだありません。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
