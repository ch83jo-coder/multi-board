"use client";

import { useState, useTransition } from "react";
import { votePost } from "@/app/actions/posts";
import { MaterialIcon } from "@/components/ui/material-icon";

export function VoteButtons({
  postId,
  slug,
  count,
}: {
  postId: string;
  slug: string;
  count: number;
}) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const vote = (value: 1 | -1) =>
    startTransition(async () => {
      const result = await votePost(postId, slug, value);
      setMessage(result.error ?? result.success ?? "");
    });
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => vote(1)}
        aria-label="賛成票を入れる"
        className="rounded border border-border-subtle p-2 text-primary hover:bg-primary-fixed"
      >
        <MaterialIcon name="expand_less" />
      </button>
      <strong className="text-lg">{count}</strong>
      <button
        type="button"
        disabled={pending}
        onClick={() => vote(-1)}
        aria-label="反対票を入れる"
        className="rounded border border-border-subtle p-2 text-text-muted hover:bg-surface-alt"
      >
        <MaterialIcon name="expand_more" />
      </button>
      {message && (
        <span className="max-w-24 text-center text-[10px] text-text-muted">
          {message}
        </span>
      )}
    </div>
  );
}
