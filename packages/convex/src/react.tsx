import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { authClient } from "./auth-client";

export function ConvexAuthProvider({
	children,
	url,
}: {
	children: ReactNode;
	url: string;
}) {
	const [client] = useState(() => new ConvexReactClient(url));

	return (
		<ConvexBetterAuthProvider client={client} authClient={authClient}>
			{children}
		</ConvexBetterAuthProvider>
	);
}
