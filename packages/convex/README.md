# Shared Convex backend

This workspace owns the Convex schema, functions, and Better Auth integration used by AnchorBuiz apps. App specific URLs and secrets belong in each app's environment or in the Convex deployment environment. Business registration workflows will be added here when their backend contract is ready.

## Local development

Run `pnpm --filter @repo/convex dev` to link this package to a Convex deployment, start the development watcher, and refresh generated API and component types. The first run requires Convex account access and deployment selection. Commit refreshed files under `convex/_generated/` with schema changes so every app and CI use the same API types.

Configure these values in the Convex deployment:

- `BETTER_AUTH_SECRET`: a strong, unique secret generated with `npx auth secret`.
- `SITE_URL`: the canonical URL of the app using this deployment.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: optional Google OAuth credentials. Google sign-in stays unavailable until both are set.

For Google OAuth, add `https://<deployment>.convex.site/api/auth/callback/google` as an authorized redirect URI in Google Cloud.

The web app reads `CONVEX_URL` from its own environment. Keep secrets out of app `.env` files and source control.

## Layout

- `convex/schema.ts` contains the application schema.
- `convex/betterAuth/` contains the Better Auth component and configuration.
- `convex/http.ts` registers the authentication HTTP routes.
- `convex/waitlist.ts` contains the existing public waitlist functions.
- `@repo/convex/api` and `@repo/convex/data-model` expose shared generated types to apps.
- `src/auth-client.ts` exports the shared Better Auth browser client.

The Convex CLI uses this package as its project root.
