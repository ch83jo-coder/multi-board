import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards, getViewer } from "@/lib/data";

export async function SideNav() {
  const [boards, viewer] = await Promise.all([getBoards(), getViewer()]);
  const writeHref = boards[0] ? `/boards/${boards[0].slug}/write` : "/login";
  const links = [
    ["leaderboard", "Rankings", "/"],
    ["trending_up", "Popular", "/"],
    ["campaign", "Announcements", "/"],
    ["groups", "Communities", "/"],
    [
      "settings",
      "Settings",
      viewer?.role === "admin" ? "/admin/boards" : "/login",
    ],
  ];
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] w-64 shrink-0 xl:flex xl:flex-col">
      <div className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface-alt p-gutter">
        <h2 className="font-headline-md text-headline-md text-primary">
          Community Central
        </h2>
        <p className="mt-1 text-body-sm text-text-muted">
          Trending now in Panmoa
        </p>
        <Link
          href={writeHref}
          className="mt-6 flex items-center justify-center gap-2 rounded bg-primary py-2.5 font-label-md text-label-md text-white hover:bg-primary-container"
        >
          <MaterialIcon name="add_circle" className="text-[18px]" />
          New Post
        </Link>
        <nav className="mt-5 flex-1 space-y-1">
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
        </nav>
        <div className="border-t border-border-subtle pt-4">
          <div className="flex items-center gap-3 rounded bg-white p-3">
            <Avatar username={viewer?.username ?? "Guest"} />
            <div className="min-w-0">
              <p className="truncate font-label-md text-label-md">
                {viewer?.username ?? "Guest member"}
              </p>
              <p className="text-[10px] text-text-muted">
                {viewer ? `${viewer.karma} Karma` : "Sign in to join"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
