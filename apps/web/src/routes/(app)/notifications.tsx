import BackArrowIcon from "@repo/ui/icons/back-arrow-icon";
import LogoIconIcon from "@repo/ui/icons/logo-icon-icon";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import {
  useMyNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@repo/convex/hooks/useNotifications";
import type { Id } from "@repo/convex/data-model";

export const Route = createFileRoute("/(app)/notifications")({
  component: NotificationsPage,
});

function formatDate(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NotificationsPage() {
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>(
    [],
  );

  const notifications = useMyNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const hasUnread = notifications?.some((n) => !n.isRead) ?? false;
  const isLoading = notifications === undefined;

  function toggleExpanded(id: string, isRead?: boolean) {
    // If expanding an unread notification, mark it as read
    if (!isRead) {
      void markAsRead({ notificationId: id as Id<"notifications"> });
    }

    setExpandedNotifications((current) =>
      current.includes(id)
        ? current.filter((notificationId) => notificationId !== id)
        : [...current, id],
    );
  }

  return (
    <div className="min-h-dvh bg-white text-neutral-800">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4 border-b border-neutral-100">
          <Link
            to="/"
            aria-label="Back to home"
            className="flex size-10 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-100"
          >
            <BackArrowIcon className="size-6 text-neutral-800" />
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-neutral-900 sm:text-lg">
              Notifications
            </h1>
            {hasUnread && (
              <span
                aria-label="Unread notifications"
                className="size-2 rounded-full bg-[#ef4444]"
              />
            )}
          </div>

          {hasUnread ? (
            <button
              type="button"
              onClick={() => void markAllAsRead({})}
              title="Mark all as read"
              className="flex size-10 items-center justify-center rounded-full text-[#5037ff] transition-colors hover:bg-[#5037ff]/10"
            >
              <CheckCheck className="size-5" />
            </button>
          ) : (
            <div className="size-10" aria-hidden="true" />
          )}
        </header>

        {/* Notifications list */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5037ff]" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center text-neutral-400">
              <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <BellOff className="size-6" />
              </div>
              <p className="text-base font-medium">No notifications yet</p>
              <p className="text-sm text-neutral-400 max-w-xs">
                Important updates about your business registrations and payments will appear here.
              </p>
            </div>
          ) : (
            <section aria-label="Notifications list" className="divide-y divide-neutral-50">
              {notifications.map((notification) => {
                const expanded = expandedNotifications.includes(
                  notification._id,
                );
                const messageText = notification.message || notification.name;
                const dateStr = formatDate(
                  notification.createdAt ?? notification._creationTime,
                );
                const isUnread = !notification.isRead;

                return (
                  <article
                    key={notification._id}
                    className={`flex items-start gap-3.5 px-5 py-4 transition-colors ${
                      isUnread ? "bg-[#feeceb]/60" : "bg-white"
                    }`}
                  >
                    {/* Purple Circle Avatar with Anchor Logo */}
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ded4ff] text-[#5037ff]"
                      aria-hidden="true"
                    >
                      <LogoIconIcon className="size-5" />
                    </div>

                    {/* Notification Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h2 className="text-[15px] font-semibold text-neutral-900">
                          {notification.name}
                        </h2>
                        {dateStr && (
                          <time className="shrink-0 text-xs text-neutral-400">
                            {dateStr}
                          </time>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-neutral-600 line-clamp-2">
                        {expanded ? messageText : messageText}
                      </p>

                      {messageText.length > 90 && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpanded(notification._id, notification.isRead)
                          }
                          aria-expanded={expanded}
                          className="mt-0.5 inline-block text-sm font-normal text-[#6ca5f8] transition-colors hover:text-[#4389f5]"
                        >
                          {expanded ? "See less" : "See more"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
