"use client";

import { useActionState } from "react";
import { savePost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { Board, Post } from "@/lib/types";

export function PostForm({ board, post }: { board: Board; post?: Post }) {
  const [state, action, pending] = useActionState(savePost, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="boardId" value={board.id} />
      <input type="hidden" name="slug" value={board.slug} />
      {post && <input type="hidden" name="postId" value={post.id} />}
      <label className="block" htmlFor="post-title">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          TITLE
        </span>
        <Input
          name="title"
          id="post-title"
          defaultValue={post?.title}
          minLength={3}
          maxLength={160}
          required
          placeholder="토론 내용을 명확하게 설명해 주세요"
        />
      </label>
      <label className="block" htmlFor="post-content">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          CONTENT
        </span>
        <Textarea
          name="content"
          id="post-content"
          defaultValue={post?.content}
          minLength={10}
          required
          placeholder="내용을 입력하세요..."
        />
      </label>
      <label className="block" htmlFor="post-image">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          THUMBNAIL (OPTIONAL)
        </span>
        <Input
          id="post-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file:mr-3 file:rounded file:border-0 file:bg-primary-fixed file:px-3 file:py-1.5 file:text-primary"
        />
        <span className="mt-1 block text-label-sm text-text-muted">
          JPG, PNG, WebP · 최대 5MB
        </span>
      </label>
      {state.error && (
        <p
          role="alert"
          className="rounded bg-error-container px-3 py-2 text-body-sm text-on-error-container"
        >
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : post ? "변경사항 저장" : "게시글 등록"}
        </Button>
      </div>
    </form>
  );
}
