import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

const siteUrl =
  process.env.SITE_URL || process.env.VITE_SITE_URL || "http://localhost:3010";

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      siteUrl,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3010",
      "http://localhost:5173",
    ],
    allowedHeaders: [
      "x-better-auth-forwarded-host",
      "x-better-auth-forwarded-proto",
    ],
  },
});

export default http;
