import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * List all entity types
 */
export const getEntityTypes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("entityTypes").collect();
  },
});

/**
 * Get entity type by ID
 */
export const getEntityTypeById = query({
  args: {
    entityTypeId: v.id("entityTypes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.entityTypeId);
  },
});

/**
 * Get entity type by short name (e.g. LLC)
 */
export const getEntityTypeByShortName = query({
  args: {
    shortName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entityTypes")
      .withIndex("by_shortName", (q) => q.eq("shortName", args.shortName))
      .first();
  },
});

/**
 * Create an entity type
 */
export const createEntityType = mutation({
  args: {
    shortName: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("entityTypes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an entity type
 */
export const updateEntityType = mutation({
  args: {
    entityTypeId: v.id("entityTypes"),
    shortName: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { entityTypeId, ...updates } = args;
    const existing = await ctx.db.get(entityTypeId);
    if (!existing) throw new Error("Entity type not found");

    await ctx.db.patch(entityTypeId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return entityTypeId;
  },
});

/**
 * Delete an entity type
 */
export const deleteEntityType = mutation({
  args: {
    entityTypeId: v.id("entityTypes"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.entityTypeId);
    if (!existing) throw new Error("Entity type not found");

    // Also remove relations in countryEntityTypes
    const relations = await ctx.db
      .query("countryEntityTypes")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityTypeId))
      .collect();

    for (const r of relations) {
      await ctx.db.delete(r._id);
    }

    await ctx.db.delete(args.entityTypeId);
    return args.entityTypeId;
  },
});
