import WhatsAppIcon from "@repo/ui/icons/whatsapp-icon";
import { authClient } from "@repo/convex/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Building2 } from "lucide-react";
import NotificationIcon from "@repo/ui/icons/notification-icon";
import { useMyBusinesses } from "@repo/convex/hooks/useBusinesses";
import { useMyProfile } from "@repo/convex/hooks/useProfiles";
import { useUnreadNotificationCount } from "@repo/convex/hooks/useNotifications";

export const Route = createFileRoute("/(app)/(home)/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { previewBusinesses?: boolean } => ({
    previewBusinesses: search.preview === "businesses" ? true : undefined,
  }),
  component: HomePage,
});

interface EnrichedBusiness {
  _id: string;
  name: string;
  logo?: string;
  status: string;
  paymentStatus: string;
  countryOriginalId: number;
  country?: {
    name: string;
    emoji?: string | null;
    iso2?: string | null;
  } | null;
  entityType?: {
    name: string;
    shortName: string;
  } | null;
}

interface BusinessTileProps {
  business: EnrichedBusiness;
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "registered") {
    return { label: "Active", className: "text-emerald-500" };
  }
  if (
    normalized === "processing" ||
    normalized === "pending" ||
    normalized === "in_review"
  ) {
    return { label: "Processing", className: "text-indigo-600" };
  }
  if (normalized === "paused" || normalized === "draft") {
    return { label: "Draft", className: "text-neutral-400" };
  }
  if (normalized === "rejected") {
    return { label: "Rejected", className: "text-red-500" };
  }
  return { label: status, className: "text-neutral-500" };
}

function BusinessTile({ business }: BusinessTileProps) {
  const badge = getStatusBadge(business.status);
  const countryEmoji = business.country?.emoji || "🌐";
  const entityTypeName =
    business.entityType?.name || business.entityType?.shortName || undefined;

  const paymentDetail =
    business.paymentStatus === "unpaid"
      ? "Payment Required"
      : business.paymentStatus === "pending"
        ? "Payment Processing"
        : null;

  return (
    <article className="flex items-center gap-3.5 py-1">
      <div className="relative size-12 shrink-0">
        {business.logo ? (
          <img
            className="size-11 rounded-full object-cover shadow-xs"
            src={business.logo}
            alt=""
          />
        ) : (
          <span
            className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#eac18c] to-[#9c5b42] text-base font-bold text-white shadow-xs"
            aria-hidden="true"
          >
            {business.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span
          className="absolute -bottom-0.5 right-0.5 flex size-5 items-center justify-center rounded-full border border-white bg-white text-xs shadow-xs"
          aria-label={business.country?.name || "Country"}
        >
          {countryEmoji}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-medium text-neutral-800">
          {business.name}
        </h2>
        {paymentDetail ? (
          <p className="truncate text-sm text-[#ff6470]">{paymentDetail}</p>
        ) : entityTypeName ? (
          <p className="truncate text-sm text-neutral-500">{entityTypeName}</p>
        ) : null}
      </div>

      <span className={`shrink-0 text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    </article>
  );
}

function EmptyBusinessState() {
  return (
    <section className="mt-7" aria-label="No businesses yet">
      <div className="flex h-32 flex-col items-center justify-center rounded-2xl bg-neutral-100/70 text-base font-medium text-neutral-400 gap-1">
        <Building2 className="size-6 stroke-[1.5] text-neutral-300" />
        <span>0 businesses</span>
      </div>
      <Link
        to="/register"
        className="mt-7 flex h-14 w-full max-w-sm mx-auto items-center justify-center gap-2 rounded-full bg-[#5037ff] text-lg font-semibold text-white shadow-sm transition-all hover:bg-[#432ee6] active:scale-[0.99] sm:h-16 sm:text-xl"
      >
        <Plus className="size-6 stroke-[2.5]" aria-hidden="true" />
        <span>New Business</span>
      </Link>
    </section>
  );
}

function HomePage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const profile = useMyProfile();
  console.log("data:", session);
  console.log("Profile:", profile);
  const unreadCount = useUnreadNotificationCount();
  const businesses = useMyBusinesses();

  const displayName =
    profile?.firstName || session?.user?.name?.trim().split(/\s+/)[0] || "User";

  const displayEmail = profile?.email || session?.user?.email || "Signed In";

  const avatar = session?.user?.image;
  const isLoading = isSessionLoading || businesses === undefined;

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col bg-white px-6 pb-24 pt-8 text-neutral-800 sm:px-8 sm:pt-12">
      {/* Top Header / User Profile */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {avatar ? (
            <img
              className="size-10 shrink-0 rounded-full object-cover shadow-xs"
              src={avatar}
              alt=""
            />
          ) : (
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd89d] to-[#db754f] text-sm font-bold text-white shadow-xs"
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
          <NotificationIcon
            className="size-6 stroke-[1.8]"
            aria-hidden="true"
          />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full border border-white bg-[#ff384d] text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* Main Section */}
      <main className="mt-8 flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
            My Businesses
          </h1>
          {businesses && businesses.length > 0 && (
            <Link
              to="/register"
              className="flex items-center gap-1.5 rounded-full bg-[#5037ff] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#432ee6] active:scale-[0.98]"
            >
              <Plus className="size-4 stroke-[2.5]" aria-hidden="true" />
              <span>New</span>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="mt-7 flex h-32 items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5037ff]" />
          </div>
        ) : !businesses || businesses.length === 0 ? (
          <EmptyBusinessState />
        ) : (
          <section className="mt-7 space-y-5" aria-label="Your businesses">
            {businesses.map((business) => (
              <BusinessTile key={business._id} business={business} />
            ))}
          </section>
        )}
      </main>

      {/* Floating WhatsApp Action Button */}
      <a
        className="fixed bottom-8 right-6 z-20 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-[#20ba59] active:scale-95"
        href="https://wa.me/?text=Hi%20AnchorBuiz%20Support"
        target="_blank"
        rel="noreferrer"
        aria-label="Contact AnchorBuiz on WhatsApp"
      >
        <WhatsAppIcon width={32} height={32} />
      </a>
    </div>
  );
}
