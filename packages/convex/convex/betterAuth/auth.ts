import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createClient<DataModel, typeof schema>(
	components.betterAuth,
	{ local: { schema }, verbose: false },
);

export function createAuthOptions(ctx: GenericCtx<DataModel>) {
	const googleClientId = process.env.GOOGLE_CLIENT_ID;
	const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

	return {
		appName: "AnchorBuiz",
		baseURL: process.env.SITE_URL,
		secret: process.env.BETTER_AUTH_SECRET,
		database: authComponent.adapter(ctx),
		user: {
			additionalFields: {
				role: {
					type: "string",
					required: false,
					defaultValue: "user",
					input: false,
				},
			},
		},
		emailAndPassword: { enabled: true },
		socialProviders:
			googleClientId && googleClientSecret
				? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
				: undefined,
		plugins: [convex({ authConfig })],
	} satisfies BetterAuthOptions;
}

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export function createAuth(ctx: GenericCtx<DataModel>) {
	return betterAuth(createAuthOptions(ctx));
}
