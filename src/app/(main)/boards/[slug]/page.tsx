import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardRow } from "@/components/ui/board-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Pagination } from "@/components/ui/pagination";
import { getBoard, getBoardPosts } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const board = await getBoard((await params).slug);
  return { title: board ? `${board.name}掲示板` : "掲示板" };
}

export default async function BoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page ?? 1));
  const board = await getBoard(slug);
  if (!board) notFound();
  const posts = await getBoardPosts(board.id, page);
  const weekly = posts.filter((post) => !post.is_pinned).slice(0, 3);
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
        <Link href={`/boards/${slug}/write`}>
          <Button>
            <MaterialIcon name="edit" className="text-[18px]" />
            新規投稿
          </Button>
        </Link>
      </header>
      <Card className="overflow-hidden">
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
              <BoardRow key={post.id} post={post} index={index} slug={slug} />
            ))
          ) : (
            <div className="px-6 py-14 text-center text-body-md text-text-muted">
              まだ投稿がありません。最初の投稿を作成してみましょう。
            </div>
          )}
        </div>
      </Card>
      <Pagination current={page} />
      <section>
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="workspace_premium" className="text-primary" />
          <h2 className="font-headline-md text-headline-md">今週のベスト</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {weekly.map((post, index) => (
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
          ))}
        </div>
      </section>
    </div>
  );
}
