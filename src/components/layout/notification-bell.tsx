"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { markNotificationsRead } from "@/app/actions/notifications";
import { useDismissibleMenu } from "@/components/layout/use-dismissible-menu";
import { Avatar } from "@/components/ui/avatar";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Notification } from "@/lib/types";

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [optimisticallyRead, setOptimisticallyRead] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const rootRef = useDismissibleMenu(open, setOpen);
  const visibleUnreadCount = optimisticallyRead ? 0 : unreadCount;

  useEffect(() => {
    if (unreadCount === 0) setOptimisticallyRead(false);
  }, [unreadCount]);

  const toggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    setError("");
    if (!nextOpen || visibleUnreadCount === 0) return;

    setOptimisticallyRead(true);
    startTransition(async () => {
      const result = await markNotificationsRead();
      if (result.error) {
        setOptimisticallyRead(false);
        setError(result.error);
      }
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="通知"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
        className="relative p-2 text-text-muted hover:text-primary"
      >
        <MaterialIcon name="notifications" />
        {visibleUnreadCount > 0 && (
          <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold leading-4 text-white">
            {visibleUnreadCount > 9 ? "9+" : visibleUnreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="通知一覧"
          aria-busy={pending}
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border-subtle bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <strong className="font-headline-md text-lg">通知</strong>
            <span className="text-label-sm text-text-muted">
              {pending ? "既読にしています..." : "最新10件"}
            </span>
          </div>
          {error && (
            <p className="bg-error-container px-4 py-2 text-body-sm text-on-error-container">
              {error}
            </p>
          )}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? (
              notifications.map((notification) => {
                const actor = notification.actor?.username ?? "メンバー";
                const slug = notification.post?.board?.slug ?? "humor";
                return (
                  <Link
                    key={notification.id}
                    role="menuitem"
                    href={`/boards/${slug}/${notification.post_id}`}
                    onClick={() => setOpen(false)}
                    className={`flex gap-3 border-b border-border-subtle px-4 py-3 transition-colors last:border-0 hover:bg-surface-alt ${notification.is_read || optimisticallyRead ? "bg-white" : "bg-primary-fixed/40"}`}
                  >
                    <Avatar
                      username={actor}
                      url={notification.actor?.avatar_url}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm text-on-surface">
                        <strong>{actor}</strong>さんがあなたの投稿に
                        {notification.type === "comment"
                          ? "コメントしました"
                          : "賛成票を入れました"}
                      </span>
                      <span className="mt-1 block truncate text-label-sm text-text-muted">
                        {notification.post?.title ?? "投稿"} ·{" "}
                        {formatNotificationDate(notification.created_at)}
                      </span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="px-6 py-10 text-center text-body-sm text-text-muted">
                <MaterialIcon
                  name="notifications_off"
                  className="mb-2 block text-3xl"
                />
                通知はありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
