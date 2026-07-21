import Link from "next/link";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { TopNavLinks } from "@/components/layout/top-nav-links";
import { buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  getBoards,
  getNotifications,
  getUnreadNotificationCount,
  getViewer,
} from "@/lib/data";

export async function TopNavBar() {
  const [boards, viewer, notifications, unreadCount] = await Promise.all([
    getBoards(),
    getViewer(),
    getNotifications(),
    getUnreadNotificationCount(),
  ]);
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
          <TopNavLinks boards={boards.slice(0, 4)} />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <form action="/search" className="relative hidden w-64 lg:block">
            <Input
              name="q"
              aria-label="投稿を検索"
              variant="subtle"
              className="pr-10"
              placeholder="投稿を検索..."
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <MaterialIcon name="search" className="text-[20px]" />
            </span>
          </form>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
          />
          {viewer ? (
            <ProfileMenu viewer={viewer} />
          ) : (
            <Link
              aria-label="ログイン"
              href="/login"
              className={buttonStyles({ variant: "ghost", size: "icon" })}
            >
              <MaterialIcon name="login" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
