"use client";

import { useActionState, useState } from "react";
import { deleteGuestComment, deleteGuestPost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GuestDeleteForm({
  kind,
  targetId,
  postId,
  slug,
}: {
  kind: "post" | "comment";
  targetId: string;
  postId: string;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const serverAction = kind === "post" ? deleteGuestPost : deleteGuestComment;
  const [state, action, pending] = useActionState(serverAction, {});

  if (!open) {
    return (
      <Button
        type="button"
        variant={kind === "post" ? "destructive" : "destructive-link"}
        size={kind === "post" ? "default" : "sm"}
        onClick={() => setOpen(true)}
      >
        削除
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {kind === "comment" && (
        <input type="hidden" name="commentId" value={targetId} />
      )}
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />
      <Input
        name="guestPassword"
        type="password"
        minLength={4}
        maxLength={128}
        required
        autoFocus
        autoComplete="current-password"
        placeholder="削除用パスワード"
        aria-label="削除用パスワード"
        className="w-44"
      />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "削除中..." : "削除する"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        キャンセル
      </Button>
      {state.error && (
        <p role="alert" className="w-full text-body-sm text-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="w-full text-body-sm text-secondary">{state.success}</p>
      )}
    </form>
  );
}
