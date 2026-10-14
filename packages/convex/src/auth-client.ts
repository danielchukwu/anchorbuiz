import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

declare global {
  interface ImportMeta {
    env?: Record<string, string | undefined>;
  }
}

const getConvexSiteUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_CONVEX_SITE_URL)
      return import.meta.env.VITE_CONVEX_SITE_URL;
    if (import.meta.env.CONVEX_SITE_URL) return import.meta.env.CONVEX_SITE_URL;
    if (import.meta.env.VITE_CONVEX_URL)
      return import.meta.env.VITE_CONVEX_URL.replace(
        ".convex.cloud",
        ".convex.site",
      );
    if (import.meta.env.CONVEX_URL)
      return import.meta.env.CONVEX_URL.replace(
        ".convex.cloud",
        ".convex.site",
      );
  }
  if (typeof process !== "undefined" && process.env) {
    if (process.env.VITE_CONVEX_SITE_URL)
      return process.env.VITE_CONVEX_SITE_URL;
    if (process.env.CONVEX_SITE_URL) return process.env.CONVEX_SITE_URL;
    if (process.env.VITE_CONVEX_URL)
      return process.env.VITE_CONVEX_URL.replace(
        ".convex.cloud",
        ".convex.site",
      );
    if (process.env.CONVEX_URL)
      return process.env.CONVEX_URL.replace(".convex.cloud", ".convex.site");
  }
  // return "https://agile-gnu-461.eu-west-1.convex.site";
  return "https://confident-cassowary-256.eu-west-1.convex.site";
};

export const authClient = createAuthClient({
  baseURL: getConvexSiteUrl(),
  plugins: [convexClient(), crossDomainClient()],
});
