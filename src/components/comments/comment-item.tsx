"use client";

import { useState } from "react";
import { deleteComment } from "@/app/actions/posts";
import { CommentForm } from "@/components/forms/comment-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/ui/feed-row";
import type { Comment } from "@/lib/types";

export function CommentItem({
  comment,
  postId,
  slug,
  canDelete,
}: {
  comment: Comment;
  postId: string;
  slug: string;
  canDelete: boolean;
}) {
  const [replying, setReplying] = useState(false);
  return (
    <div
      className={`flex gap-3 py-4 ${comment.parent_id ? "ml-8 border-l-2 border-primary-fixed pl-4" : ""}`}
    >
      <Avatar
        username={comment.author?.username ?? "メンバー"}
        url={comment.author?.avatar_url}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
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
        <div className="mt-2 flex items-center gap-3">
          {!comment.parent_id && (
            <Button
              type="button"
              onClick={() => setReplying((value) => !value)}
              variant="link"
              size="sm"
            >
              {replying ? "返信を閉じる" : "返信"}
            </Button>
          )}
          {canDelete && (
            <form action={deleteComment}>
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="slug" value={slug} />
              <Button type="submit" variant="destructive-link" size="sm">
                削除
              </Button>
            </form>
          )}
        </div>
        {replying && (
          <div className="mt-3 rounded bg-surface-alt p-3">
            <CommentForm postId={postId} slug={slug} parentId={comment.id} />
          </div>
        )}
      </div>
    </div>
  );
}
