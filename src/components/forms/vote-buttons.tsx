"use client";

import { useState, useTransition } from "react";
import { votePost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export function VoteButtons({
  postId,
  slug,
  count,
  initialVote,
}: {
  postId: string;
  slug: string;
  count: number;
  initialVote: 1 | -1 | null;
}) {
  const [message, setMessage] = useState("");
  const [currentVote, setCurrentVote] = useState(initialVote);
  const [currentCount, setCurrentCount] = useState(count);
  const [pending, startTransition] = useTransition();
  const vote = (value: 1 | -1) =>
    startTransition(async () => {
      const result = await votePost(postId, slug, value);
      setMessage(result.error ?? result.success ?? "");
      if (!result.error && "vote" in result) {
        const nextVote = result.vote ?? null;
        setCurrentCount(
          (previous) => previous + (nextVote ?? 0) - (currentVote ?? 0),
        );
        setCurrentVote(nextVote);
      }
    });
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        disabled={pending}
        onClick={() => vote(1)}
        aria-label="賛成票を入れる"
        aria-pressed={currentVote === 1}
        variant={currentVote === 1 ? "active" : "outline"}
        size="icon"
      >
        <MaterialIcon name="expand_less" />
      </Button>
      <strong className="text-lg text-on-surface">{currentCount}</strong>
      <Button
        type="button"
        disabled={pending}
        onClick={() => vote(-1)}
        aria-label="反対票を入れる"
        aria-pressed={currentVote === -1}
        variant={currentVote === -1 ? "active" : "outline"}
        size="icon"
      >
        <MaterialIcon name="expand_more" />
      </Button>
      {message && (
        <span className="max-w-24 text-center text-[10px] text-text-muted">
          {message}
        </span>
      )}
    </div>
  );
}
