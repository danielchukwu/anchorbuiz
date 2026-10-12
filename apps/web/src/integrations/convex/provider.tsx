import { ConvexAuthProvider } from "@repo/convex/react";
import { type ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

export default function ConvexClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	if (!convexUrl) return children;
	return <ConvexAuthProvider url={convexUrl}>{children}</ConvexAuthProvider>;
}
