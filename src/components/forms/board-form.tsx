"use client";

import { useActionState } from "react";
import { saveBoard } from "@/app/actions/boards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Board } from "@/lib/types";

export function BoardForm({ board }: { board?: Board }) {
  const [state, action, pending] = useActionState(saveBoard, {});
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      {board && <input type="hidden" name="id" value={board.id} />}
      <Input
        name="name"
        aria-label="ボード名"
        placeholder="ボード名"
        defaultValue={board?.name}
        required
      />
      <Input
        name="slug"
        aria-label="スラッグ"
        placeholder="board-slug"
        defaultValue={board?.slug}
        pattern="[a-z0-9-]+"
        required
      />
      <Input
        name="description"
        aria-label="説明"
        placeholder="説明"
        defaultValue={board?.description}
        className="md:col-span-2"
      />
      <Input
        name="icon"
        aria-label="Materialアイコン"
        placeholder="Materialアイコン（forum）"
        defaultValue={board?.icon ?? "forum"}
      />
      <Input
        name="sortOrder"
        aria-label="表示順"
        type="number"
        defaultValue={board?.sort_order ?? 0}
      />
      {state.error && (
        <p className="text-body-sm text-error md:col-span-2">{state.error}</p>
      )}
      {state.success && (
        <p className="text-body-sm text-secondary md:col-span-2">
          {state.success}
        </p>
      )}
      <Button type="submit" className="md:col-span-2" disabled={pending}>
        {pending ? "保存中..." : board ? "変更を保存" : "ボードを作成"}
      </Button>
    </form>
  );
}
