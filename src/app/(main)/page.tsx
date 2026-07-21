import Link from "next/link";
import { BoardLinkGrid } from "@/components/boards/board-link-grid";
import { Hero } from "@/components/home/hero";
import { RightSidebar } from "@/components/home/right-sidebar";
import { FeedRow } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Pagination } from "@/components/ui/pagination";
import {
  getBoards,
  getHomePostCount,
  getHomePosts,
  POSTS_PER_PAGE,
  parseHomeSort,
} from "@/lib/data";
import type { HomeSort } from "@/lib/types";

const sortTabs: { value: HomeSort; label: string; icon?: string }[] = [
  { value: "trending", label: "トレンド", icon: "trending_up" },
  { value: "latest", label: "新着" },
  { value: "top", label: "高評価" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const query = await searchParams;
  const sort = parseHomeSort(query.sort);
  const parsedPage = Number(query.page ?? 1);
  const requestedPage = Number.isFinite(parsedPage)
    ? Math.max(1, Math.floor(parsedPage))
    : 1;
  const [total, boards] = await Promise.all([
    getHomePostCount(sort),
    getBoards(),
  ]);
  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const page = Math.min(requestedPage, pages);
  const posts = await getHomePosts(sort, page);
  const heroPost = posts.find((post) => post.id === "launch") ?? posts[0];
  return (
    <div className="flex gap-gutter">
      <div className="min-w-0 flex-1 space-y-6">
        <Hero post={heroPost} boards={boards} />
        <section
          className="space-y-3 md:hidden"
          aria-labelledby="mobile-boards"
        >
          <div className="flex items-center justify-between">
            <h2
              id="mobile-boards"
              className="font-headline-md text-headline-md"
            >
              掲示板
            </h2>
            <Link
              href="/boards"
              className="text-body-sm font-semibold text-primary hover:underline"
            >
              すべて見る
            </Link>
          </div>
          <BoardLinkGrid boards={boards} />
        </section>
        <div className="flex items-center border-b border-border-subtle pb-4">
          <div className="inline-flex rounded-lg bg-muted p-1">
            {sortTabs.map((tab) => (
              <Link
                key={tab.value}
                href={tab.value === "trending" ? "/" : `/?sort=${tab.value}`}
                aria-current={sort === tab.value ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors ${sort === tab.value ? "bg-white text-on-surface shadow-sm" : "text-muted-foreground hover:text-on-surface"}`}
              >
                {tab.icon && (
                  <MaterialIcon name={tab.icon} className="text-sm" />
                )}
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
        <section className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
          {posts.length ? (
            posts.map((post) => <FeedRow key={post.id} post={post} />)
          ) : (
            <div className="bg-white px-6 py-14 text-center text-body-md text-text-muted">
              この期間の投稿はありません。
            </div>
          )}
        </section>
        <Pagination
          current={page}
          pages={pages}
          sort={sort === "trending" ? undefined : sort}
        />
      </div>
      <RightSidebar boards={boards} />
    </div>
  );
}
