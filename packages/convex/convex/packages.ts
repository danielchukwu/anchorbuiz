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
 * List all packages or filter by country
 */
export const getPackages = query({
	args: {
		countryOriginalId: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		if (args.countryOriginalId !== undefined) {
			return await ctx.db
				.query("packages")
				.withIndex("by_country_and_displayOrder", (q) =>
					q.eq("countryOriginalId", args.countryOriginalId!),
				)
				.collect();
		}
		return await ctx.db.query("packages").collect();
	},
});

/**
 * Get package by ID
 */
export const getPackageById = query({
	args: {
		packageId: v.id("packages"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.packageId);
	},
});

/**
 * Create a package
 */
export const createPackage = mutation({
	args: {
		countryOriginalId: v.number(),
		name: v.string(),
		displayOrder: v.number(),
		offerings: v.any(),
		currency: v.string(),
		price: v.number(),
		priceInNaira: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await ensureAdmin(ctx);
		const now = Date.now();
		return await ctx.db.insert("packages", {
			...args,
			isActive: args.isActive ?? true,
			createdAt: now,
			updatedAt: now,
		});
	},
});

/**
 * Update an existing package
 */
export const updatePackage = mutation({
	args: {
		packageId: v.id("packages"),
		countryOriginalId: v.optional(v.number()),
		name: v.optional(v.string()),
		displayOrder: v.optional(v.number()),
		offerings: v.optional(v.any()),
		currency: v.optional(v.string()),
		price: v.optional(v.number()),
		priceInNaira: v.optional(v.number()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await ensureAdmin(ctx);
		const { packageId, ...updates } = args;
		const existing = await ctx.db.get(packageId);
		if (!existing) throw new Error("Package not found");

		await ctx.db.patch(packageId, {
			...updates,
			updatedAt: Date.now(),
		});
		return packageId;
	},
});

/**
 * Delete a package
 */
export const deletePackage = mutation({
	args: {
		packageId: v.id("packages"),
	},
	handler: async (ctx, args) => {
		await ensureAdmin(ctx);
		const existing = await ctx.db.get(args.packageId);
		if (!existing) throw new Error("Package not found");

		await ctx.db.delete(args.packageId);
		return args.packageId;
	},
});
