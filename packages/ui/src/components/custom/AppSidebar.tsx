import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import LogoIcon from "../../icons/logo-icon";
// import { Skeleton } from "../skeleton";
import { cn } from "../../lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "../sidebar";
import { TooltipProvider } from "../tooltip";

export type AppSidebarItem = {
  id: string;
  label: string;
  icon: ReactNode;
  selectedIcon: ReactNode;
  href?: string;
};

/** A minimal Link-compatible type — accepts `href` + any extra props */
export type RouterLinkComponent = ElementType<{
  href: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  title?: string;
}>;

export type AppSidebarShellProps = {
  userDetails?: any;
  items: AppSidebarItem[];
  logoIcon?: ReactNode;
  logoText?: string;
  onLogout?: () => void | Promise<void>;
  onSidebarStateChange?: (state: "expanded" | "collapsed") => void;
  avatarUrl?: string;
  username?: string;
  displayName?: string;
  homePageUrl?: string;
  profilePopoverExtraContent?: ReactNode;
  defaultOpen?: boolean;
  showSidebarFooter?: boolean;
  /** Pass your router's Link component. Defaults to a native <a> tag. */
  LinkComponent?: RouterLinkComponent;
  /** Pass current pathname so the sidebar can highlight the active item and hide on auth pages. */
  pathname?: string;
};

export function AppSidebarShell({
  items,
  logoIcon,
  logoText,
  onSidebarStateChange,
  homePageUrl,
  defaultOpen = true,
  LinkComponent,
  pathname,
}: AppSidebarShellProps) {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const isAuthPage = currentPath.startsWith("/auth");

  if (isAuthPage) {
    return null;
  }

  return (
    <SidebarProvider
      id="sidebar-wrapper"
      defaultOpen={defaultOpen}
      className="flex min-h-0 w-full flex-col bg-[#f7f7f9] text-[#171717] md:min-h-dvh md:w-auto md:flex-row"
      style={
        {
          "--sidebar-width": "272px",
          "--sidebar-width-icon": "76px",
        } as CSSProperties
      }
    >
      <TooltipProvider>
        <AppSidebar
          items={items}
          logoIcon={logoIcon}
          logoText={logoText}
          onSidebarStateChange={onSidebarStateChange}
          homePageUrl={homePageUrl}
          LinkComponent={LinkComponent}
          pathname={pathname}
        />
      </TooltipProvider>
    </SidebarProvider>
  );
}

export function AppSidebar({
  items,
  logoIcon,
  logoText,
  homePageUrl,
  onSidebarStateChange,
  LinkComponent,
  pathname,
}: Pick<
  AppSidebarShellProps,
  | "items"
  | "logoIcon"
  | "logoText"
  | "homePageUrl"
  | "onSidebarStateChange"
  | "LinkComponent"
  | "pathname"
>) {
  const { state: sideBarState } = useSidebar();
  const activeItemFromUrl = useActiveItem(items, pathname);
  const isFirstMountRef = useRef(true);
  const prevSidebarStateRef = useRef(sideBarState);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (prevSidebarStateRef.current !== sideBarState) {
      prevSidebarStateRef.current = sideBarState;
      onSidebarStateChange?.(sideBarState);
    }
  }, [sideBarState, onSidebarStateChange]);

  return (
    <Sidebar collapsible="icon" className="md:data-[side=left]:left-0">
      <div className="flex h-full flex-col bg-[#f7f7f9] px-5 pt-[25px] text-[#171717]">
        <LogoComponent
          logoIcon={logoIcon}
          logoText={logoText}
          homePageUrl={homePageUrl}
          LinkComponent={LinkComponent}
        />

        <SidebarContent className="gap-0 overflow-visible">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-[2px]">
              {items.map((item) => (
                <EachLinkComponent
                  key={item.id}
                  item={item}
                  isActive={item.id === activeItemFromUrl}
                  LinkComponent={LinkComponent}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

/** Thin wrapper so we can use either the injected LinkComponent or a plain <a> */
function NavLink({
  LinkComponent,
  href,
  className,
  onClick,
  title,
  children,
}: {
  LinkComponent?: RouterLinkComponent;
  href: string;
  className?: string;
  onClick?: () => void;
  title?: string;
  children?: ReactNode;
}) {
  if (LinkComponent) {
    return (
      <LinkComponent
        href={href}
        className={className}
        onClick={onClick}
        title={title}
      >
        {children}
      </LinkComponent>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick} title={title}>
      {children}
    </a>
  );
}

function useActiveItem(items: AppSidebarItem[], pathname?: string): string {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const matchingItem = items
    .filter((item) => {
      const href = item.href ?? `/${item.id}`;
      return href === "/"
        ? currentPath === "/"
        : currentPath === href || currentPath.startsWith(`${href}/`);
    })
    .sort(
      (a, b) => (b.href ?? `/${b.id}`).length - (a.href ?? `/${a.id}`).length,
    )[0];

  return matchingItem?.id ?? "";
}

function EachLinkComponent({
  item,
  isActive,
  LinkComponent,
}: {
  item: AppSidebarItem;
  isActive: boolean;
  LinkComponent?: RouterLinkComponent;
}) {
  const { state: sideBarState, setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={cn(
          "w-full gap-[15px] rounded-[14px] px-[14px] py-0 text-[18px] tracking-[-0.02em] text-[#3c3c3c] transition-colors hover:bg-black/[0.035]",
          isActive &&
            "bg-[#ffdfa5] font-semibold text-[#171717] hover:bg-[#ffdfa5]",
          sideBarState === "collapsed" && "my-2 justify-center px-0",
        )}
        size="lg"
      >
        <NavLink
          LinkComponent={LinkComponent}
          href={item.href ?? "/"}
          className={cn(
            "h-full w-full",
            sideBarState !== "collapsed" && "justify-start",
          )}
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        >
          <div className="flex size-[23px] shrink-0 items-center justify-center [&>svg]:size-[23px] [&>svg]:stroke-[1.65]">
            {isActive ? item.selectedIcon : item.icon}
          </div>
          <span
            className={cn(
              "whitespace-nowrap",
              isActive
                ? "font-semibold text-[#171717]"
                : "font-normal text-[#3c3c3c]",
            )}
          >
            {item.label}
          </span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function LogoComponent({
  logoIcon,
  logoText,
  homePageUrl,
  LinkComponent,
}: {
  logoIcon?: ReactNode;
  logoText?: string;
  homePageUrl?: string;
  LinkComponent?: RouterLinkComponent;
}) {
  const { state: sideBarState } = useSidebar();

  return (
    <div
      className={cn(
        "mb-[43px] flex min-h-[38px] items-center gap-3 text-[#171717]",
        sideBarState === "collapsed" && "justify-center",
      )}
    >
      <NavLink LinkComponent={LinkComponent} href={homePageUrl ?? "/"}>
        <div className="flex items-center gap-3">
          {logoIcon ?? <LogoIcon className="size-8 shrink-0" />}
          {sideBarState === "expanded" && logoText && (
            <div className="text-[20px] font-semibold tracking-[-0.04em]">
              {logoText}
            </div>
          )}
        </div>
      </NavLink>
    </div>
  );
}
