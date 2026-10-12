import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Get all entity types supported for a given country, ordered by displayOrder
 */
export const getEntityTypesByCountry = query({
  args: {
    countryOriginalId: v.number(),
  },
  handler: async (ctx, args) => {
    const mappings = await ctx.db
      .query("countryEntityTypes")
      .withIndex("by_country_and_displayOrder", (q) =>
        q.eq("countryOriginalId", args.countryOriginalId),
      )
      .collect();

    // Fetch full entity details for each mapping
    const enriched = await Promise.all(
      mappings.map(async (mapping) => {
        const entity = await ctx.db.get(mapping.entityId);
        return {
          ...mapping,
          entity,
        };
      }),
    );

    return enriched;
  },
});

/**
 * Assign an entity type to a country
 */
export const addCountryEntityType = mutation({
  args: {
    countryOriginalId: v.number(),
    entityId: v.id("entityTypes"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if mapping already exists
    const existing = await ctx.db
      .query("countryEntityTypes")
      .withIndex("by_country_and_entity", (q) =>
        q
          .eq("countryOriginalId", args.countryOriginalId)
          .eq("entityId", args.entityId),
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        displayOrder: args.displayOrder,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("countryEntityTypes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update display order for country entity type mapping
 */
export const updateCountryEntityTypeOrder = mutation({
  args: {
    id: v.id("countryEntityTypes"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      displayOrder: args.displayOrder,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

/**
 * Remove an entity type from a country
 */
export const removeCountryEntityType = mutation({
  args: {
    id: v.id("countryEntityTypes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
