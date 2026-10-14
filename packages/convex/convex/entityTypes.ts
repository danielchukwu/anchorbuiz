import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
	type MutationCtx,
	mutation,
	type QueryCtx,
	query,
} from "./_generated/server";
import { authComponent } from "./auth";

async function ensureAdmin(ctx: MutationCtx) {
	const user = await authComponent.getAuthUser(ctx);
	if (user.role !== "admin") {
		throw new Error("Admin access required");
	}
}

async function getCountriesUsingEntity(
	ctx: QueryCtx,
	entityId: Id<"entityTypes">,
) {
	const mappings = await ctx.db
		.query("countryEntityTypes")
		.withIndex("by_entityId", (q) => q.eq("entityId", entityId))
		.take(100);

	const countries = await Promise.all(
		mappings.map(async (mapping) => {
			const country = await ctx.db
				.query("countries")
				.withIndex("by_originalId", (q) =>
					q.eq("originalId", mapping.countryOriginalId),
				)
				.first();
			return country
				? {
						originalId: mapping.countryOriginalId,
						name: country.name,
						iso2: country.iso2,
					}
				: null;
		}),
	);
	return countries.filter(
		(country): country is NonNullable<typeof country> => country !== null,
	);
}

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

export const getAdminEntityTypes = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== "admin") throw new Error("Admin access required");

		const [entityTypes, mappings] = await Promise.all([
			ctx.db.query("entityTypes").take(200),
			ctx.db.query("countryEntityTypes").take(5000),
		]);
		const countryCounts = new Map<string, number>();
		for (const mapping of mappings) {
			const key = String(mapping.entityId);
			countryCounts.set(key, (countryCounts.get(key) ?? 0) + 1);
		}
		return entityTypes.map((entityType) => ({
			...entityType,
			countryCount: countryCounts.get(String(entityType._id)) ?? 0,
		}));
	},
});

export const getAdminEntityType = query({
	args: {
		entityTypeId: v.id("entityTypes"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== "admin") throw new Error("Admin access required");

		const entityType = await ctx.db.get(args.entityTypeId);
		if (!entityType) return null;
		return {
			...entityType,
			countries: await getCountriesUsingEntity(ctx, entityType._id),
		};
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
		await ensureAdmin(ctx);
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
		await ensureAdmin(ctx);
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
		await ensureAdmin(ctx);
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
