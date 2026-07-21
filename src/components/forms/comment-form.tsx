"use client";

import { useActionState, useId } from "react";
import { addComment } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function CommentForm({
  postId,
  slug,
  parentId,
}: {
  postId: string;
  slug: string;
  parentId?: string;
}) {
  const [state, action, pending] = useActionState(addComment, {});
  const contentId = useId();
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <label htmlFor={contentId} className="sr-only">
        コメント
      </label>
      <Textarea
        id={contentId}
        name="content"
        className="min-h-24"
        placeholder={
          parentId
            ? "返信を入力してください..."
            : "コメントを入力してください..."
        }
        required
        minLength={2}
      />
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      {state.success && (
        <p className="text-body-sm text-secondary">{state.success}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "投稿中..." : parentId ? "返信する" : "コメントする"}
        </Button>
      </div>
    </form>
  );
}
