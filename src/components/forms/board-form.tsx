"use client";

import { useActionState } from "react";
import { saveBoard } from "@/app/actions/boards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BoardForm() {
  const [state, action, pending] = useActionState(saveBoard, {});
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Input name="name" placeholder="Board name" required />
      <Input
        name="slug"
        placeholder="board-slug"
        pattern="[a-z0-9-]+"
        required
      />
      <Input
        name="description"
        placeholder="Description"
        className="md:col-span-2"
      />
      <Input
        name="icon"
        placeholder="Material icon (forum)"
        defaultValue="forum"
      />
      <Input name="sortOrder" type="number" defaultValue="0" />
      {state.error && (
        <p className="text-body-sm text-error md:col-span-2">{state.error}</p>
      )}
      {state.success && (
        <p className="text-body-sm text-secondary md:col-span-2">
          {state.success}
        </p>
      )}
      <Button type="submit" className="md:col-span-2" disabled={pending}>
        {pending ? "저장 중..." : "보드 생성"}
      </Button>
    </form>
  );
}
