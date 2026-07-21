import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getBoards, getViewer } from "@/lib/data";

export async function TopNavBar() {
  const [boards, viewer] = await Promise.all([getBoards(), getViewer()]);
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border-subtle bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-container-max-width items-center justify-between px-4 md:px-margin-desktop">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-headline-lg text-[28px] font-bold tracking-tight text-primary"
          >
            Panmoa
          </Link>
          <nav className="hidden h-16 items-center gap-6 md:flex">
            <Link href="/" className="font-label-md text-label-md text-primary">
              Hot
            </Link>
            {boards.slice(0, 4).map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.slug}`}
                className="font-label-md text-label-md text-text-muted transition-colors hover:text-primary"
              >
                {board.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <form action="/" className="relative hidden lg:block">
            <input
              name="q"
              className="w-64 rounded border border-transparent bg-surface-container px-4 py-2 pr-10 text-body-md outline-none focus:border-primary"
              placeholder="Search discussions..."
            />
            <MaterialIcon
              name="search"
              className="absolute right-3 top-2 text-text-muted"
            />
          </form>
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 text-text-muted hover:text-primary"
          >
            <MaterialIcon name="notifications" />
          </button>
          <Link
            aria-label={viewer ? "Profile" : "Log in"}
            href={viewer ? "/" : "/login"}
            className="p-2 text-text-muted hover:text-primary"
          >
            <MaterialIcon name={viewer ? "account_circle" : "login"} />
          </Link>
        </div>
      </div>
    </header>
  );
}
