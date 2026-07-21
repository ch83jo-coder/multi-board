import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { deletePost, toggleNotice, togglePin } from "@/app/actions/posts";
import { CommentItem } from "@/components/comments/comment-item";
import { CommentForm } from "@/components/forms/comment-form";
import { GuestDeleteForm } from "@/components/forms/guest-delete-form";
import { VoteButtons } from "@/components/forms/vote-buttons";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { formatDate } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { displayAuthorName } from "@/lib/author";
import {
  getComments,
  getMyVote,
  getPost,
  getViewer,
  incrementViewCount,
} from "@/lib/data";

type Props = {
  params: Promise<{ slug: string; postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, postId } = await params;
  const post = await getPost(postId);
  return {
    title: post?.board?.slug === slug ? post.title : "投稿",
    description: post?.content.slice(0, 120),
  };
}

export default async function PostPage({ params }: Props) {
  const { slug, postId } = await params;
  const [post, comments, viewer, initialVote] = await Promise.all([
    getPost(postId),
    getComments(postId),
    getViewer(),
    getMyVote(postId),
  ]);
  if (!post || post.board?.slug !== slug) notFound();
  after(async () => {
    await incrementViewCount(postId);
  });
  const authorName = displayAuthorName(post);
  const canManageDirectly = Boolean(
    viewer && (viewer.id === post.author_id || viewer.role === "admin"),
  );
  const canEdit = post.author_id === null || canManageDirectly;
  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-2 text-body-sm text-text-muted">
        <Link href={`/boards/${slug}`} className="hover:text-primary">
          {post.board?.name ?? slug}
        </Link>
        <MaterialIcon name="chevron_right" className="text-[14px]" />
        <span>投稿</span>
      </nav>
      <Card className="overflow-hidden">
        <header className="border-b border-border-subtle p-5 md:p-7">
          <div className="flex items-center gap-2 text-body-sm text-text-muted">
            {post.is_notice && <Chip tone="success">お知らせ</Chip>}
            {post.is_pinned && <Chip tone="primary">固定</Chip>}
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>閲覧 {post.view_count}回</span>
          </div>
          <h1 className="mt-3 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
            {post.title}
          </h1>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar username={authorName} url={post.author?.avatar_url} />
              <div>
                <p className="font-medium">{authorName}</p>
                <p className="text-body-sm text-text-muted">
                  {post.author_id ? "コミュニティメンバー" : "ゲスト投稿"}
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex flex-wrap justify-end gap-2">
                <Link
                  href={`/boards/${slug}/${postId}/edit`}
                  className={buttonStyles({ variant: "outline" })}
                >
                  編集
                </Link>
                {canManageDirectly ? (
                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={postId} />
                    <input type="hidden" name="slug" value={slug} />
                    <Button type="submit" variant="destructive">
                      削除
                    </Button>
                  </form>
                ) : (
                  <GuestDeleteForm
                    kind="post"
                    targetId={postId}
                    postId={postId}
                    slug={slug}
                  />
                )}
              </div>
            )}
          </div>
          {viewer?.role === "admin" && (
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border-subtle pt-4">
              <form action={togglePin}>
                <input type="hidden" name="postId" value={postId} />
                <input type="hidden" name="slug" value={slug} />
                <input
                  type="hidden"
                  name="active"
                  value={String(post.is_pinned)}
                />
                <Button type="submit" variant="outline" size="sm">
                  {post.is_pinned ? "固定を解除" : "固定する"}
                </Button>
              </form>
              <form action={toggleNotice}>
                <input type="hidden" name="postId" value={postId} />
                <input type="hidden" name="slug" value={slug} />
                <input
                  type="hidden"
                  name="active"
                  value={String(post.is_notice)}
                />
                <Button type="submit" variant="outline" size="sm">
                  {post.is_notice ? "お知らせを解除" : "お知らせに設定"}
                </Button>
              </form>
            </div>
          )}
        </header>
        <div className="flex gap-5 p-5 md:p-7">
          <VoteButtons
            postId={postId}
            slug={slug}
            count={post.vote_count}
            initialVote={initialVote}
          />
          <article className="min-w-0 flex-1 text-body-lg leading-7 text-on-surface-variant">
            {post.thumbnail_url && (
              <figure className="mb-6 overflow-hidden rounded-lg border border-border-subtle bg-surface-container">
                <Image
                  src={post.thumbnail_url}
                  alt={`${post.title}の添付画像`}
                  width={1200}
                  height={675}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="h-auto max-h-[720px] w-full object-contain"
                />
              </figure>
            )}
            <div className="whitespace-pre-wrap">{post.content}</div>
          </article>
        </div>
      </Card>
      <Card className="p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md">
            コメント <span className="text-primary">{post.comment_count}</span>
          </h2>
        </div>
        <div className="divide-y divide-border-subtle border-y border-border-subtle">
          {comments.length ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                slug={slug}
                canDelete={Boolean(
                  viewer &&
                    (viewer.id === comment.author_id ||
                      viewer.role === "admin"),
                )}
                viewerIsGuest={!viewer}
              />
            ))
          ) : (
            <p className="py-8 text-center text-body-md text-text-muted">
              最初のコメントを投稿してみましょう。
            </p>
          )}
        </div>
        <div className="mt-5">
          <CommentForm postId={postId} slug={slug} isGuest={!viewer} />
        </div>
      </Card>
    </div>
  );
}
