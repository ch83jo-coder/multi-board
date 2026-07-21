import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePost } from "@/app/actions/posts";
import { CommentForm } from "@/components/forms/comment-form";
import { VoteButtons } from "@/components/forms/vote-buttons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/components/ui/feed-row";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getComments, getPost, getViewer } from "@/lib/data";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;
  const [post, comments, viewer] = await Promise.all([
    getPost(postId),
    getComments(postId),
    getViewer(),
  ]);
  if (!post || post.board?.slug !== slug) notFound();
  const canEdit =
    viewer && (viewer.id === post.author_id || viewer.role === "admin");
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
            {post.is_notice && (
              <span className="rounded bg-secondary px-2 py-0.5 font-label-sm text-white">
                お知らせ
              </span>
            )}
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>閲覧 {post.view_count}回</span>
          </div>
          <h1 className="mt-3 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
            {post.title}
          </h1>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar username={post.author?.username ?? "メンバー"} />
              <div>
                <p className="font-medium">
                  {post.author?.username ?? "メンバー"}
                </p>
                <p className="text-body-sm text-text-muted">
                  コミュニティメンバー
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Link href={`/boards/${slug}/${postId}/edit`}>
                  <Button variant="ghost">編集</Button>
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="postId" value={postId} />
                  <input type="hidden" name="slug" value={slug} />
                  <Button type="submit" variant="danger">
                    削除
                  </Button>
                </form>
              </div>
            )}
          </div>
        </header>
        <div className="flex gap-5 p-5 md:p-7">
          <VoteButtons postId={postId} slug={slug} count={post.vote_count} />
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
              <div
                key={comment.id}
                className={`flex gap-3 py-4 ${comment.parent_id ? "ml-8 border-l-2 border-primary-fixed pl-4" : ""}`}
              >
                <Avatar
                  username={comment.author?.username ?? "メンバー"}
                  size="sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-body-sm">
                      {comment.author?.username ?? "メンバー"}
                    </strong>
                    <span className="text-label-sm text-text-muted">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-body-md text-on-surface-variant">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-body-md text-text-muted">
              最初のコメントを投稿してみましょう。
            </p>
          )}
        </div>
        <div className="mt-5">
          <CommentForm postId={postId} slug={slug} />
        </div>
      </Card>
    </div>
  );
}
