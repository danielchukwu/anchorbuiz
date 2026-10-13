import { betterAuth } from "better-auth/minimal";
import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "./_generated/dataModel";

const frontendUrl =
  process.env.SITE_URL || process.env.VITE_SITE_URL || "http://localhost:3010";
const authBaseUrl = process.env.CONVEX_SITE_URL || frontendUrl;
const authSecret = process.env.BETTER_AUTH_SECRET || "development-secret-only";

async function sendOtpEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!resendApiKey || !emailFrom) {
    // Development-friendly fallback: log OTP to server logs when an email provider
    // is not configured.
    console.log(`[auth] OTP (${type}) for ${email}: ${otp}`);
    console.warn(
      `[auth] Email not sent because RESEND_API_KEY or EMAIL_FROM is missing in environment variables.`,
    );
    return;
  }

  const subject =
    type === "sign-in"
      ? "Your Siihomes sign-in code"
      : type === "forget-password"
        ? "Reset your Siihomes password"
        : "Verify your Siihomes email";

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
      <p style="margin:0 0 12px;">Your verification code is:</p>
      <p style="margin:0 0 16px; font-size: 28px; letter-spacing: 0.3em; font-weight: 700;">${otp}</p>
      <p style="margin:0; color:#6b7280; font-size: 13px;">If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  console.log(`[auth] Attempting to send ${type} email to ${email}...`);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: email,
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`[auth] Successfully sent ${type} email to ${email}`);
    } else {
      const errorText = await res.text();
      console.error(`[auth] Resend API error (${res.status}):`, errorText);
    }
  } catch (error) {
    console.error(`[auth] Network error while calling Resend:`, error);
  }
}

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account" as const,
          },
        }
      : undefined;

  return betterAuth({
    baseURL: authBaseUrl,
    secret: authSecret,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
    },
    ...(socialProviders ? { socialProviders } : {}),
    plugins: [
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          await sendOtpEmail({ email, otp, type });
        },
      }),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
      // Allow cross-origin access from your frontend (SITE_URL)
      crossDomain({
        siteUrl: frontendUrl,
      }),
    ],
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3010",
      "http://localhost:5173",
      frontendUrl,
    ],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});
