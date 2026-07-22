import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards, getViewer } from "@/lib/data";

export async function SideNav() {
  const [viewer, boards] = await Promise.all([getViewer(), getBoards()]);
  const links: [string, string, string][] = [
    ["leaderboard", "ランキング", "/?sort=top"],
    ["trending_up", "人気", "/"],
  ];
  if (viewer?.role === "admin")
    links.push(["settings", "設定", "/admin/boards"]);
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] w-64 shrink-0 xl:flex xl:flex-col">
      <div className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface-alt p-gutter">
        <h2 className="font-headline-md text-headline-md text-primary">
          コミュニティ案内
        </h2>
        <p className="mt-1 text-body-sm text-text-muted">
          Panmoaの注目トピック
        </p>
        <nav className="mt-6 flex min-h-0 flex-1 flex-col">
          <div className="space-y-1">
            {links.map(([icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded px-3 py-2.5 text-text-muted transition-colors hover:bg-surface-variant hover:text-primary"
              >
                <MaterialIcon name={icon} />
                <span className="font-label-md text-label-md">{label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-border-subtle pt-4">
            <p className="px-3 font-label-md text-label-sm font-semibold text-text-muted">
              掲示板
            </p>
            <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.slug}`}
                  className="flex items-center gap-3 rounded px-3 py-2 text-text-muted transition-colors hover:bg-surface-variant hover:text-primary"
                >
                  <MaterialIcon name={board.icon} className="text-[20px]" />
                  <span className="truncate font-label-md text-label-md">
                    {board.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div className="border-t border-border-subtle pt-4">
          <div className="flex items-center gap-3 rounded bg-white p-3">
            <Avatar username={viewer?.username ?? "ゲスト"} />
            <div className="min-w-0">
              <p className="truncate font-label-md text-label-md">
                {viewer?.username ?? "ゲストユーザー"}
              </p>
              <p className="text-[10px] text-text-muted">
                {viewer ? `${viewer.karma} カルマ` : "ログインして参加"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
