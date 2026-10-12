import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Get all shareholders for a business
 */
export const getShareholdersByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shareholders")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();
  },
});

/**
 * Get shareholder by ID
 */
export const getShareholderById = query({
  args: {
    shareholderId: v.id("shareholders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.shareholderId);
  },
});

/**
 * Add a shareholder to a business
 */
export const addShareholder = mutation({
  args: {
    businessId: v.id("businesses"),
    userId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    email: v.string(),
    ownershipPercentage: v.number(),
    countryOriginalId: v.optional(v.number()),
    countryStateOriginalId: v.optional(v.number()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const business = await ctx.db.get(args.businessId);
    if (!business) throw new Error("Business not found");
    if (business.userId !== user._id) {
      throw new Error("Unauthorized: You do not own this business");
    }

    const now = Date.now();
    return await ctx.db.insert("shareholders", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update shareholder details
 */
export const updateShareholder = mutation({
  args: {
    shareholderId: v.id("shareholders"),
    userId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    ownershipPercentage: v.optional(v.number()),
    countryOriginalId: v.optional(v.number()),
    countryStateOriginalId: v.optional(v.number()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const { shareholderId, ...updates } = args;
    const existing = await ctx.db.get(shareholderId);
    if (!existing) throw new Error("Shareholder not found");

    const business = await ctx.db.get(existing.businessId);
    if (!business || business.userId !== user._id) {
      throw new Error("Unauthorized: You do not own this business");
    }

    await ctx.db.patch(shareholderId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return shareholderId;
  },
});

/**
 * Remove a shareholder
 */
export const removeShareholder = mutation({
  args: {
    shareholderId: v.id("shareholders"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.shareholderId);
    if (!existing) throw new Error("Shareholder not found");

    const business = await ctx.db.get(existing.businessId);
    if (!business || business.userId !== user._id) {
      throw new Error("Unauthorized: You do not own this business");
    }

    await ctx.db.delete(args.shareholderId);
    return args.shareholderId;
  },
});
