import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ConvexClientProvider from "../integrations/convex/provider";
import PostHogProvider from "../integrations/posthog/provider";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var root=document.documentElement;root.classList.remove('dark');root.classList.add('light');root.setAttribute('data-theme','light');root.style.colorScheme='light';}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{
				title: "AnchorBuiz — Build your business beyond borders",
			},
			{
				name: "description",
				content:
					"Clear guidance and professional support for registering your business in Nigeria, the US, the UK, and international markets.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "any",
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/icon.png",
			},
			{
				rel: "apple-touch-icon",
				href: "/icon.png",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased bg-white text-[#25243a] selection:bg-[#533AFD]/15 selection:text-[#533AFD]">
				<QueryClientProvider client={queryClient}>
					<PostHogProvider>
						<ConvexClientProvider>
						{children}
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
							]}
						/>
					</ConvexClientProvider>
				</PostHogProvider>
			</QueryClientProvider>
			<Scripts />
			</body>
		</html>
	);
}
