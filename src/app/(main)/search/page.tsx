import type { Metadata } from "next";
import { FeedRow } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { searchPosts } from "@/lib/data";

export const metadata: Metadata = { title: "投稿検索" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim().slice(0, 100) ?? "";
  const posts = await searchPosts(query);
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 font-label-sm text-primary">
          <MaterialIcon name="search" className="text-[18px]" />
          投稿検索
        </div>
        <h1 className="mt-1 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
          {query ? `「${query}」の検索結果` : "投稿を検索"}
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          {query
            ? `${posts.length}件の投稿が見つかりました。`
            : "検索欄にキーワードを入力してください。"}
        </p>
      </header>
      <section className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
        {posts.length ? (
          posts.map((post) => <FeedRow key={post.id} post={post} />)
        ) : (
          <div className="bg-white px-6 py-14 text-center text-body-md text-text-muted">
            {query
              ? "該当する投稿はありません。別のキーワードをお試しください。"
              : "検索キーワードを入力すると結果が表示されます。"}
          </div>
        )}
      </section>
    </div>
  );
}
