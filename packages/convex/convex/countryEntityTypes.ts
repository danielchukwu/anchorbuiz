import { v } from "convex/values";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

async function ensureAdmin(ctx: MutationCtx) {
	const user = await authComponent.getAuthUser(ctx);
	if (user.role !== "admin") {
		throw new Error("Admin access required");
	}
}

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
		await ensureAdmin(ctx);
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
		await ensureAdmin(ctx);
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
		await ensureAdmin(ctx);
		await ctx.db.delete(args.id);
		return args.id;
	},
});

export const saveCountryEntityTypes = mutation({
	args: {
		countryOriginalId: v.number(),
		entityIds: v.array(v.id("entityTypes")),
	},
	handler: async (ctx, args) => {
		await ensureAdmin(ctx);
		const uniqueEntityIds = new Set(args.entityIds.map(String));
		if (uniqueEntityIds.size !== args.entityIds.length) {
			throw new Error("An entity type can only be selected once");
		}

		const [country, existingMappings] = await Promise.all([
			ctx.db
				.query("countries")
				.withIndex("by_originalId", (q) =>
					q.eq("originalId", args.countryOriginalId),
				)
				.first(),
			ctx.db
				.query("countryEntityTypes")
				.withIndex("by_country_and_displayOrder", (q) =>
					q.eq("countryOriginalId", args.countryOriginalId),
				)
				.take(500),
		]);
		if (!country) throw new Error("Country not found");

		const existingByEntityId = new Map(
			existingMappings.map((mapping) => [String(mapping.entityId), mapping]),
		);
		const selectedIds = new Set(args.entityIds.map(String));
		for (const mapping of existingMappings) {
			if (!selectedIds.has(String(mapping.entityId))) {
				await ctx.db.delete(mapping._id);
			}
		}

		const now = Date.now();
		for (const [index, entityId] of args.entityIds.entries()) {
			const entity = await ctx.db.get(entityId);
			if (!entity) throw new Error("Entity type not found");
			const existing = existingByEntityId.get(String(entityId));
			if (existing) {
				if (existing.displayOrder !== index + 1) {
					await ctx.db.patch(existing._id, {
						displayOrder: index + 1,
						updatedAt: now,
					});
				}
			} else {
				await ctx.db.insert("countryEntityTypes", {
					countryOriginalId: args.countryOriginalId,
					entityId,
					displayOrder: index + 1,
					createdAt: now,
					updatedAt: now,
				});
			}
		}
		return args.entityIds.length;
	},
});
