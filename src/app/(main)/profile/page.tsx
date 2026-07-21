import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { ProfileForm } from "@/components/forms/profile-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { FeedRow } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getMyCommentCount, getMyPosts, getViewer } from "@/lib/data";

export const metadata: Metadata = {
  title: "プロフィール",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const [posts, commentCount] = await Promise.all([
    getMyPosts(viewer.id),
    getMyCommentCount(viewer.id),
  ]);
  const stats = [
    { label: "投稿", value: posts.length, icon: "article" },
    { label: "コメント", value: commentCount, icon: "chat_bubble" },
    { label: "カルマ", value: viewer.karma, icon: "stars" },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-primary-container" />
        <div className="px-5 pb-6 md:px-7">
          <div className="-mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <div className="rounded-full border-4 border-white bg-white">
                <Avatar
                  username={viewer.username}
                  url={viewer.avatar_url}
                  size="lg"
                />
              </div>
              <div className="pb-1">
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg">
                  {viewer.username}
                </h1>
                <Chip tone={viewer.role === "admin" ? "primary" : "neutral"}>
                  {viewer.role === "admin" ? "管理者" : "メンバー"}
                </Chip>
              </div>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline">
                <MaterialIcon name="logout" className="text-[18px]" />
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="活動統計">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <MaterialIcon name={stat.icon} />
            </span>
            <span>
              <strong className="block font-headline-md text-2xl">
                {stat.value.toLocaleString("ja-JP")}
              </strong>
              <span className="text-body-sm text-text-muted">{stat.label}</span>
            </span>
          </Card>
        ))}
      </section>

      <Card className="p-5 md:p-7">
        <h2 className="mb-4 font-headline-md text-headline-md">
          プロフィールを編集
        </h2>
        <ProfileForm username={viewer.username} />
      </Card>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="article" className="text-primary" />
          <h2 className="font-headline-md text-headline-md">自分の投稿</h2>
        </div>
        <div className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-border-subtle">
          {posts.length ? (
            posts.map((post) => <FeedRow key={post.id} post={post} />)
          ) : (
            <div className="bg-white px-6 py-14 text-center text-body-md text-text-muted">
              まだ投稿がありません。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
