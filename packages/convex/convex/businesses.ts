import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * List businesses for the authenticated user, enriched with country and entity type info
 */
export const getMyBusinesses = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    let q = ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id));

    let items = await q.collect();
    if (args.status) {
      items = items.filter((b) => b.status === args.status);
    }

    // Enrich each business with country and entity type
    return await Promise.all(
      items.map(async (business) => {
        const country = await ctx.db
          .query("countries")
          .withIndex("by_originalId", (q) =>
            q.eq("originalId", business.countryOriginalId),
          )
          .first();

        const entityType = business.entityTypeId
          ? await ctx.db.get(business.entityTypeId)
          : null;

        return {
          ...business,
          country: country
            ? {
                name: country.name,
                iso2: country.iso2,
              }
            : null,
          entityType: entityType
            ? {
                name: entityType.name,
                shortName: entityType.shortName,
              }
            : null,
        };
      }),
    );
  },
});

/**
 * Get a specific business by ID
 */
export const getBusinessById = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.businessId);
  },
});

/**
 * Get businesses by country
 */
export const getBusinessesByCountry = query({
  args: {
    countryOriginalId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_countryOriginalId", (q) =>
        q.eq("countryOriginalId", args.countryOriginalId),
      )
      .collect();
  },
});

/**
 * Search businesses by name
 */
export const searchBusinesses = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    return await ctx.db
      .query("businesses")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(20);
  },
});

/**
 * Create a new business registration entry
 */
export const createBusiness = mutation({
  args: {
    name: v.string(),
    logo: v.optional(v.string()),
    countryOriginalId: v.number(),
    stateOriginalId: v.optional(v.number()),
    isAStartup: v.optional(v.boolean()),
    status: v.optional(v.string()), // default "draft"
    paymentStatus: v.optional(v.string()), // default "unpaid"
    otherCountriesRegisteredIn: v.optional(v.array(v.string())),
    entityTypeId: v.optional(v.id("entityTypes")),
    businessDescription: v.optional(v.string()),
    businessActivitiesAndPurpose: v.optional(v.string()),
    businessStartDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("businesses", {
      userId: user._id,
      name: args.name,
      logo: args.logo,
      countryOriginalId: args.countryOriginalId,
      stateOriginalId: args.stateOriginalId,
      isAStartup: args.isAStartup ?? false,
      status: args.status ?? "draft",
      paymentStatus: args.paymentStatus ?? "unpaid",
      otherCountriesRegisteredIn: args.otherCountriesRegisteredIn,
      entityTypeId: args.entityTypeId,
      businessDescription: args.businessDescription,
      businessActivitiesAndPurpose: args.businessActivitiesAndPurpose,
      businessStartDate: args.businessStartDate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing business
 */
export const updateBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    countryOriginalId: v.optional(v.number()),
    stateOriginalId: v.optional(v.number()),
    isAStartup: v.optional(v.boolean()),
    status: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    otherCountriesRegisteredIn: v.optional(v.array(v.string())),
    entityTypeId: v.optional(v.id("entityTypes")),
    businessDescription: v.optional(v.string()),
    businessActivitiesAndPurpose: v.optional(v.string()),
    businessStartDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const { businessId, ...updates } = args;
    const existing = await ctx.db.get(businessId);
    if (!existing) throw new Error("Business not found");

    if (existing.userId !== user._id) {
      throw new Error("Unauthorized: You do not own this business");
    }

    await ctx.db.patch(businessId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return businessId;
  },
});

/**
 * Delete a business and its associated shareholders
 */
export const deleteBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.businessId);
    if (!existing) throw new Error("Business not found");

    if (existing.userId !== user._id) {
      throw new Error("Unauthorized: You do not own this business");
    }

    // Delete associated shareholders
    const shareholders = await ctx.db
      .query("shareholders")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();

    for (const sh of shareholders) {
      await ctx.db.delete(sh._id);
    }

    await ctx.db.delete(args.businessId);
    return args.businessId;
  },
});
