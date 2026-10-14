import { authClient } from "@repo/convex/auth-client";
import { useUnreadNotificationCount } from "@repo/convex/hooks/useNotifications";
import { useMyProfile } from "@repo/convex/hooks/useProfiles";
import NotificationIcon from "@repo/ui/icons/notification-icon";
import { Link } from "@tanstack/react-router";

export default function UserHeader() {
  const { data: session } = authClient.useSession();
  const profile = useMyProfile();
  const unreadCount = useUnreadNotificationCount();
  const displayName =
    profile?.firstName || session?.user?.name?.trim().split(/\s+/)[0] || "User";
  const displayEmail = profile?.email || session?.user?.email || "Signed In";
  const avatar = session?.user?.image;

  return (
    <header className="flex items-center justify-between px-4">
      <div className="flex min-w-0 items-center gap-3">
        {avatar ? (
          <img
            className="size-10 shrink-0 rounded-full object-cover shadow-xs"
            src={avatar}
            alt=""
          />
        ) : (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd89d] to-[#db754f] text-sm font-bold text-white"
            aria-hidden="true"
          >
            {displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-800">
            Hi, {displayName}
          </p>
          <span className="block truncate text-xs text-neutral-500 sm:text-sm">
            {displayEmail}
          </span>
        </div>
      </div>

      <Link
        to="/notifications"
        className="relative rounded-full p-2 text-neutral-800 transition-colors hover:bg-neutral-100"
        aria-label={`Notifications, ${unreadCount ?? 0} unread`}
      >
        <NotificationIcon className="size-6 stroke-[1.8]" aria-hidden="true" />
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full border border-white bg-[#ff384d] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
