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
import { useEffect, useRef } from "react";

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

  // --- OTT race condition fix ---
  // ConvexBetterAuthProvider exchanges ?ott=<token> in a useEffect (parent effect).
  // React runs CHILD effects before PARENT effects, so our effects here fire first.
  // We use a ref (not useState) to avoid SSR hydration mismatches — on the server
  // window is undefined and useState would always return false, but useRef is fine.
  const sawOtt = useRef(false);

  // Effect 1: detect ?ott= in the URL before the provider strips it.
  // Runs on mount only, before the provider's effect, so window.location.search
  // still has ?ott= at this point.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("ott")
    ) {
      sawOtt.current = true;
      // Safety: if session never populates (exchange failure), unblock after 10s
      const timer = setTimeout(() => {
        sawOtt.current = false;
      }, 10_000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: redirect guard — runs after Effect 1, so sawOtt.current is already set.
  // Also runs on re-renders (e.g. when location changes after replaceState strips ?ott=).
  useEffect(() => {
    if (isPending) return;

    // Waiting for OTT exchange to complete → hold off on redirecting
    if (sawOtt.current && session === null) return;

    // Session arrived → OTT exchange done, clear flag
    if (session) {
      sawOtt.current = false;
      return;
    }

    // The session hook can briefly report `isPending: false` before starting
    // its initial request (notably on the first OAuth signup callback). Give
    // that request time to start; dependency changes clean up this timer when
    // the hook becomes pending or the session arrives.
    const timer = setTimeout(() => {
      const authPaths = ["/signup", "/login"];
      const isAuthPath = authPaths.some((p) => location.pathname.startsWith(p));
      const redirectPath = isAuthPath ? "/" : location.pathname;
      void navigate({
        to: "/signup",
        search: { redirect_to: redirectPath },
        replace: true,
      });
    }, 2_000);

    return () => clearTimeout(timer);
  }, [isPending, session, location.pathname, navigate]);

  // Show spinner while session is resolving or OTT exchange might be in progress
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
