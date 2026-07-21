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
          タイトル
        </span>
        <Input
          name="title"
          id="post-title"
          defaultValue={post?.title}
          minLength={3}
          maxLength={160}
          required
          placeholder="投稿内容が分かるタイトルを入力してください"
        />
      </label>
      <label className="block" htmlFor="post-content">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          本文
        </span>
        <Textarea
          name="content"
          id="post-content"
          defaultValue={post?.content}
          minLength={10}
          required
          placeholder="本文を入力してください..."
        />
      </label>
      <label className="block" htmlFor="post-image">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          サムネイル（任意）
        </span>
        <Input
          id="post-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:font-semibold file:text-on-surface hover:file:bg-surface-container-high"
        />
        <span className="mt-1 block text-label-sm text-text-muted">
          JPG、PNG、WebP・最大5MB
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
          {pending ? "保存中..." : post ? "変更を保存" : "投稿する"}
        </Button>
      </div>
    </form>
  );
}
