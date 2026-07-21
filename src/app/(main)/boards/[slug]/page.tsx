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
  return { title: board ? `${board.name} Board` : "Board" };
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
            <span>Board</span>
            <MaterialIcon name="chevron_right" className="text-[14px]" />
            <span className="font-bold text-primary">{board.name}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {board.name} Board
          </h1>
          <p className="mt-2 max-w-2xl text-body-md text-text-muted">
            {board.description}
          </p>
        </div>
        <Link href={`/boards/${slug}/write`}>
          <Button>
            <MaterialIcon name="edit" className="text-[18px]" />
            New Post
          </Button>
        </Link>
      </header>
      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[60px_1fr_120px_100px_80px] border-b border-border-subtle bg-surface-alt px-4 py-3 font-label-md text-label-md text-text-muted md:grid">
          <div className="text-center">No.</div>
          <div>Title</div>
          <div>Author</div>
          <div className="text-center">Date</div>
          <div className="text-center">Views</div>
        </div>
        <div className="divide-y divide-border-subtle">
          {posts.length ? (
            posts.map((post, index) => (
              <BoardRow key={post.id} post={post} index={index} slug={slug} />
            ))
          ) : (
            <div className="px-6 py-14 text-center text-body-md text-text-muted">
              아직 게시글이 없습니다. 첫 글을 작성해 보세요.
            </div>
          )}
        </div>
      </Card>
      <Pagination current={page} />
      <section>
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="workspace_premium" className="text-primary" />
          <h2 className="font-headline-md text-headline-md">Weekly Best</h2>
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
                TOP {index + 1}
              </span>
              <h3 className="mt-3 line-clamp-2 font-headline-md text-lg font-semibold">
                {post.title}
              </h3>
              <p
                className={`mt-3 text-body-sm ${index === 0 ? "text-white/70" : "text-text-muted"}`}
              >
                {post.vote_count} votes · {post.comment_count} comments
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
