import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getConvexSiteUrl = (): string | undefined => {
  if (typeof process !== "undefined" && process.env?.CONVEX_SITE_URL) {
    return process.env.CONVEX_SITE_URL;
  }
  if (typeof import.meta !== "undefined") {
    const env = (import.meta as unknown as { env?: Record<string, string> })
      .env;
    if (env?.CONVEX_SITE_URL) return env.CONVEX_SITE_URL;
    if (env?.CONVEX_URL) {
      return env.CONVEX_URL.replace(".convex.cloud", ".convex.site");
    }
  }
  return undefined;
};

export const authClient = createAuthClient({
  baseURL: getConvexSiteUrl(),
  plugins: [convexClient(), crossDomainClient()],
});
