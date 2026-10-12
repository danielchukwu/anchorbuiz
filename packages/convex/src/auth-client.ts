import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getConvexSiteUrl = (): string => {
  if (typeof process !== "undefined") {
    if (process.env?.VITE_CONVEX_SITE_URL) return process.env.VITE_CONVEX_SITE_URL;
    if (process.env?.CONVEX_SITE_URL) return process.env.CONVEX_SITE_URL;
    if (process.env?.VITE_CONVEX_URL) return process.env.VITE_CONVEX_URL.replace(".convex.cloud", ".convex.site");
    if (process.env?.CONVEX_URL) return process.env.CONVEX_URL.replace(".convex.cloud", ".convex.site");
  }
  if (typeof import.meta !== "undefined") {
    const env = (import.meta as unknown as { env?: Record<string, string> })
      ?.env;
    if (env?.VITE_CONVEX_SITE_URL) return env.VITE_CONVEX_SITE_URL;
    if (env?.CONVEX_SITE_URL) return env.CONVEX_SITE_URL;
    if (env?.VITE_CONVEX_URL) return env.VITE_CONVEX_URL.replace(".convex.cloud", ".convex.site");
    if (env?.CONVEX_URL) return env.CONVEX_URL.replace(".convex.cloud", ".convex.site");
  }
  return "https://fastidious-jackal-851.eu-west-1.convex.site";
};

export const authClient = createAuthClient({
  baseURL: getConvexSiteUrl(),
  plugins: [convexClient(), crossDomainClient()],
});
