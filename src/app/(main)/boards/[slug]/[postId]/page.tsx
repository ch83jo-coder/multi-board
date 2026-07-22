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
import { LinkifiedText } from "@/components/posts/linkified-text";
import { ShareToXButton } from "@/components/posts/share-to-x-button";
import { JsonLd } from "@/components/seo/json-ld";
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
import { absoluteUrl, createDescription } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string; postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, postId } = await params;
  const post = await getPost(postId);
  if (!post || post.board?.slug !== slug)
    return { title: "投稿", robots: { index: false } };

  const canonical = `/boards/${slug}/${postId}`;
  const description = createDescription(post.content, 160);
  const authorName = displayAuthorName(post);
  const images = post.thumbnail_url
    ? [{ url: post.thumbnail_url, alt: post.title }]
    : [{ url: "/opengraph-image", width: 1200, height: 630 }];
  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "ja_JP",
      siteName: "Panmoa",
      title: post.title,
      description,
      url: canonical,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [authorName],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [post.thumbnail_url ?? "/opengraph-image"],
    },
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
  const canonicalUrl = absoluteUrl(`/boards/${slug}/${postId}`);
  const discussionStructuredData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": canonicalUrl,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    headline: post.title,
    text: createDescription(post.content, 500),
    author: {
      "@type": "Person",
      name: authorName,
    },
    datePublished: post.created_at,
    dateModified: post.updated_at,
    commentCount: post.comment_count,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: Math.max(0, post.comment_count),
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: Math.max(0, post.vote_count),
      },
    ],
    ...(post.thumbnail_url ? { image: post.thumbnail_url } : {}),
    isPartOf: {
      "@type": "DiscussionForum",
      name: `${post.board?.name ?? slug}掲示板`,
      url: absoluteUrl(`/boards/${slug}`),
    },
    comment: comments.slice(0, 5).map((comment) => ({
      "@type": "Comment",
      url: `${canonicalUrl}#comment-${comment.id}`,
      text: createDescription(comment.content, 300),
      dateCreated: comment.created_at,
      author: {
        "@type": "Person",
        name: displayAuthorName(comment),
      },
    })),
  };
  return (
    <div className="space-y-5">
      <JsonLd
        id="discussion-forum-posting-json-ld"
        data={discussionStructuredData}
      />
      <nav className="flex items-center gap-2 text-body-sm text-text-muted">
        <Link href={`/boards/${slug}`} className="hover:text-primary">
          {post.board?.name ?? slug}
        </Link>
        <MaterialIcon name="chevron_right" className="text-[14px]" />
        <span>投稿</span>
      </nav>
      <Card className="overflow-hidden">
        <header className="border-b border-border-subtle p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-2 text-body-sm text-text-muted">
            {post.is_notice && <Chip tone="success">お知らせ</Chip>}
            {post.is_pinned && <Chip tone="primary">固定</Chip>}
            <span>番号 {post.post_number}</span>
            <span>·</span>
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
            <div className="flex flex-wrap justify-end gap-2">
              <ShareToXButton title={post.title} url={canonicalUrl} />
              {canEdit && (
                <>
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
                </>
              )}
            </div>
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
        <div className="p-5 md:p-7">
          <article className="min-w-0 text-body-lg leading-7 text-on-surface-variant">
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
            <LinkifiedText>{post.content}</LinkifiedText>
          </article>
          <div className="mt-6 flex justify-center border-t border-border-subtle pt-6">
            <VoteButtons
              postId={postId}
              slug={slug}
              count={post.vote_count}
              initialVote={initialVote}
            />
          </div>
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
