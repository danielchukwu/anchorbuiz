import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Ensure a profile exists for the authenticated user.
 * Automatically extracts names from Google/BetterAuth account if first time.
 */
export const ensureProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      return existing;
    }

    // Split Google/Auth name into firstName and lastName
    const fullName = (user.name || "").trim();
    const parts = fullName.split(/\s+/);
    const resolvedFirstName =
      args.firstName || (parts.length > 0 && parts[0] ? parts[0] : "User");
    const resolvedLastName =
      args.lastName ||
      (parts.length > 1 ? parts.slice(1).join(" ") : resolvedFirstName);
    const resolvedEmail = args.email || user.email || "";

    const now = Date.now();
    const profileId = await ctx.db.insert("profile", {
      userId: user._id,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(profileId);
  },
});

/**
 * Get profile for the currently authenticated user
 */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

/**
 * Get profile by Better Auth user ID
 */
export const getProfileByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get profile by profile document ID
 */
export const getProfileById = query({
  args: {
    id: v.id("profile"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create or update user profile
 */
export const upsertProfile = mutation({
  args: {
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    whatsappPhoneNumber: v.optional(v.string()),
    residentialAddress: v.optional(v.string()),
    countryOriginalId: v.optional(v.number()),
    dateOfBirth: v.optional(v.string()),
    governmentIds: v.optional(
      v.object({
        driversLicense: v.optional(v.string()),
        nin: v.optional(v.string()),
        passport: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const userId = user ? user._id : args.email;

    const existing = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("profile", {
      userId,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update government IDs specifically
 */
export const updateGovernmentIds = mutation({
  args: {
    governmentIds: v.object({
      driversLicense: v.optional(v.string()),
      nin: v.optional(v.string()),
      passport: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      governmentIds: {
        ...(profile.governmentIds || {}),
        ...args.governmentIds,
      },
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});
