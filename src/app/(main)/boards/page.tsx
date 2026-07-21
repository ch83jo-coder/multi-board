import type { Metadata } from "next";
import { BoardLinkGrid } from "@/components/boards/board-link-grid";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards } from "@/lib/data";

export const metadata: Metadata = { title: "掲示板一覧" };

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode: requestedMode } = await searchParams;
  const mode = requestedMode === "write" ? "write" : "browse";
  const boards = await getBoards();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="mb-2 flex items-center gap-2 text-label-sm font-semibold text-primary">
          <MaterialIcon
            name={mode === "write" ? "edit" : "view_list"}
            className="text-[18px]"
          />
          {mode === "write" ? "新規投稿" : "コミュニティ"}
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {mode === "write" ? "投稿先を選択" : "掲示板一覧"}
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          {mode === "write"
            ? "投稿内容に合う掲示板を選んでください。"
            : "参加したい掲示板を選んで投稿を確認しましょう。"}
        </p>
      </header>

      {boards.length ? (
        <BoardLinkGrid boards={boards} mode={mode} />
      ) : (
        <div className="rounded-lg border border-border bg-card px-6 py-14 text-center text-body-md text-muted-foreground shadow-sm">
          現在利用できる掲示板はありません。
        </div>
      )}
    </div>
  );
}
