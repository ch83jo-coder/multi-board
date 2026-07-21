import { redirect } from "next/navigation";
import { toggleBoard } from "@/app/actions/boards";
import { BoardForm } from "@/components/forms/board-form";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards, getViewer } from "@/lib/data";

export default async function AdminBoardsPage() {
  const [viewer, boards] = await Promise.all([getViewer(), getBoards()]);
  if (!viewer) redirect("/login");
  if (viewer.role !== "admin") redirect("/");
  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <header>
          <span className="font-label-sm text-primary">管理</span>
          <h1 className="mt-1 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
            ボード管理
          </h1>
          <p className="mt-2 text-body-md text-text-muted">
            Panmoaに表示する動的ボードの作成、並び替え、有効化を管理します。
          </p>
        </header>
        <Card className="p-5">
          <h2 className="mb-4 font-headline-md text-headline-md">
            ボードを作成
          </h2>
          <BoardForm />
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-border-subtle bg-surface-alt px-5 py-3 font-label-md text-text-muted">
            ボード一覧
          </div>
          <div className="divide-y divide-border-subtle">
            {boards.map((board) => (
              <div key={board.id} className="flex items-center gap-4 px-5 py-4">
                <MaterialIcon name={board.icon} className="text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {board.name}{" "}
                    <span className="font-normal text-text-muted">
                      /{board.slug}
                    </span>
                  </p>
                  <p className="truncate text-body-sm text-text-muted">
                    {board.description}
                  </p>
                </div>
                <form action={toggleBoard}>
                  <input type="hidden" name="id" value={board.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={String(board.is_active)}
                  />
                  <Button type="submit" variant="ghost">
                    {board.is_active ? "無効にする" : "有効にする"}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
