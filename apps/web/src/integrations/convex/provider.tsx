import { ConvexAuthProvider } from "@repo/convex/react";
import { type ReactNode } from "react";

const convexUrl =
  import.meta.env.VITE_CONVEX_URL ||
  import.meta.env.CONVEX_URL ||
  (typeof process !== "undefined"
    ? process.env?.VITE_CONVEX_URL || process.env?.CONVEX_URL
    : undefined) ||
  "https://confident-cassowary-256.eu-west-1.convex.cloud";
// "https://agile-gnu-461.eu-west-1.convex.cloud";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexAuthProvider url={convexUrl}>{children}</ConvexAuthProvider>;
}
