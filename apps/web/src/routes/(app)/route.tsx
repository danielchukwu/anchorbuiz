import {
  type AppSidebarItem,
  AppSidebarShell,
  type RouterLinkComponent,
} from "@repo/ui/components/custom/AppSidebar";
import LogoIcon from "@repo/ui/icons/logo-icon";
import HomeIcon from "@repo/ui/icons/navbar/home-icon";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { authClient } from "@repo/convex/auth-client";
import { useEnsureProfile } from "@repo/convex/hooks/useProfiles";
import { useEffect } from "react";

export const Route = createFileRoute("/(app)")({ component: AppLayout });

const sidebarItems: AppSidebarItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: <HomeIcon />,
    selectedIcon: <HomeIcon />,
  },
];

const SidebarLink: RouterLinkComponent = ({ href, ...props }) => (
  <Link to={href} {...props} />
);

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { data: session, isPending } = authClient.useSession();
  const ensureProfile = useEnsureProfile();

  useEffect(() => {
    if (!isPending && !session?.user) {
      const fullPath =
        location.pathname +
        (location.searchStr ? `?${location.searchStr}` : "");
      void navigate({
        to: "/signup",
        search: { redirect_to: fullPath },
        replace: true,
      });
    }
  }, [isPending, session?.user, location.pathname, location.searchStr, navigate]);

  useEffect(() => {
    if (session?.user) {
      const fullName = (session.user.name || "").trim();
      const parts = fullName.split(/\s+/);
      const firstName = parts[0] || "User";
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : firstName;

      void ensureProfile({
        firstName,
        lastName,
        email: session.user.email || "",
      }).catch((err) => {
        console.error("Failed to ensure user profile:", err);
      });
    }
  }, [session?.user?.id, session?.user?.email, ensureProfile]);

  // While checking session or if unauthenticated (redirecting), render a loading indicator
  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#f7f7f9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5037ff]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f7f9] text-[#171717] md:flex-row">
      <AppSidebarShell
        items={sidebarItems}
        logoIcon={<LogoIcon className="h-[38px] w-[135px]" />}
        homePageUrl="/"
        pathname={pathname}
        LinkComponent={SidebarLink}
      />
      <main className="h-dvh w-full p-0 md:py-3 md:pr-3">
        <div className="h-full min-w-0 flex-1 bg-white md:rounded-2xl md:shadow-[0_0px_20px_rgba(0,0,0,0.05)] overflow-y-scroll overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
