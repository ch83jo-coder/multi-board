"use client";

import { useActionState } from "react";
import { addComment } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function CommentForm({
  postId,
  slug,
}: {
  postId: string;
  slug: string;
}) {
  const [state, action, pending] = useActionState(addComment, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />
      <label htmlFor="comment-content" className="sr-only">
        댓글
      </label>
      <Textarea
        id="comment-content"
        name="content"
        className="min-h-24"
        placeholder="토론에 참여하세요..."
        required
        minLength={2}
      />
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      {state.success && (
        <p className="text-body-sm text-secondary">{state.success}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
