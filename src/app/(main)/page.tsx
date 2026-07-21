import { Hero } from "@/components/home/hero";
import { RightSidebar } from "@/components/home/right-sidebar";
import { FeedRow } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards, getHomePosts } from "@/lib/data";

export default async function HomePage() {
  const [posts, boards] = await Promise.all([getHomePosts(), getBoards()]);
  const heroPost = posts.find((post) => post.id === "launch") ?? posts[0];
  return (
    <div className="flex gap-gutter">
      <div className="min-w-0 flex-1 space-y-6">
        <Hero post={heroPost} />
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex gap-4">
            <button
              type="button"
              className="flex items-center gap-1 font-label-md text-label-md text-primary"
            >
              <MaterialIcon name="trending_up" className="text-sm" />
              トレンド
            </button>
            <button
              type="button"
              className="font-label-md text-label-md text-text-muted"
            >
              新着
            </button>
            <button
              type="button"
              className="font-label-md text-label-md text-text-muted"
            >
              高評価
            </button>
          </div>
          <MaterialIcon name="view_list" className="text-text-muted" />
        </div>
        <section className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
          {posts.map((post) => (
            <FeedRow key={post.id} post={post} />
          ))}
        </section>
      </div>
      <RightSidebar boards={boards} />
    </div>
  );
}
