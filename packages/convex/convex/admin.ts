import { v } from "convex/values";
import {
	type MutationCtx,
	mutation,
	type QueryCtx,
	query,
} from "./_generated/server";
import { authComponent } from "./auth";

const ONGOING_STATUSES = new Set([
	"draft",
	"pending",
	"awaiting",
	"awaiting_review",
	"processing",
	"in_review",
]);
const COMPLETED_STATUSES = new Set(["active", "registered", "completed"]);

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
	const user = await authComponent.getAuthUser(ctx);
	if (user.role !== "admin") throw new Error("Admin access required");
}

export const getCountryAdminList = query({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);
		const [countries, mappings, entityTypes] = await Promise.all([
			ctx.db.query("countries").collect(),
			ctx.db.query("countryEntityTypes").collect(),
			ctx.db.query("entityTypes").collect(),
		]);
		const entityById = new Map(
			entityTypes.map((entity) => [String(entity._id), entity]),
		);
		const entitiesByCountry = new Map<
			number,
			Array<{ id: string; shortName: string }>
		>();
		for (const mapping of mappings) {
			const entity = entityById.get(String(mapping.entityId));
			if (!entity) continue;
			const current = entitiesByCountry.get(mapping.countryOriginalId) ?? [];
			current.push({ id: String(entity._id), shortName: entity.shortName });
			entitiesByCountry.set(mapping.countryOriginalId, current);
		}

		return countries
			.filter((country) => country.originalId !== undefined)
			.map((country) => ({
				_id: country._id,
				originalId: country.originalId as number,
				name: country.name,
				iso2: country.iso2,
				iso3: country.iso3,
				isRegistrationAvailable: country.isRegistrationAvailable ?? false,
				entityTypes: entitiesByCountry.get(country.originalId as number) ?? [],
			}));
	},
});

export const getCountryAdminDetails = query({
	args: { countryOriginalId: v.number() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const country = await ctx.db
			.query("countries")
			.withIndex("by_originalId", (q) =>
				q.eq("originalId", args.countryOriginalId),
			)
			.first();
		if (!country) return null;

		const [mappings, packages, businesses] = await Promise.all([
			ctx.db
				.query("countryEntityTypes")
				.withIndex("by_country_and_displayOrder", (q) =>
					q.eq("countryOriginalId", args.countryOriginalId),
				)
				.collect(),
			ctx.db
				.query("packages")
				.withIndex("by_country_and_displayOrder", (q) =>
					q.eq("countryOriginalId", args.countryOriginalId),
				)
				.collect(),
			ctx.db
				.query("businesses")
				.withIndex("by_countryOriginalId", (q) =>
					q.eq("countryOriginalId", args.countryOriginalId),
				)
				.collect(),
		]);
		const entities = await Promise.all(
			mappings.map(async (mapping) => {
				const entity = await ctx.db.get(mapping.entityId);
				return entity
					? {
							id: String(entity._id),
							name: entity.name,
							shortName: entity.shortName,
						}
					: null;
			}),
		);

		return {
			country: {
				originalId: args.countryOriginalId,
				name: country.name,
				iso2: country.iso2,
				iso3: country.iso3,
				isRegistrationAvailable: country.isRegistrationAvailable ?? false,
			},
			businessCount: businesses.length,
			entities: entities.filter((entity) => entity !== null),
			packages: packages.map((item) => ({
				_id: item._id,
				name: item.name,
				displayOrder: item.displayOrder,
				offerCount: Array.isArray(item.offerings) ? item.offerings.length : 0,
				isActive: item.isActive ?? true,
			})),
		};
	},
});

export const setCountryRegistrationAvailability = mutation({
	args: {
		countryOriginalId: v.number(),
		isRegistrationAvailable: v.boolean(),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const country = await ctx.db
			.query("countries")
			.withIndex("by_originalId", (q) =>
				q.eq("originalId", args.countryOriginalId),
			)
			.first();
		if (!country) throw new Error("Country not found");
		await ctx.db.patch(country._id, {
			isRegistrationAvailable: args.isRegistrationAvailable,
		});
		return country._id;
	},
});

export const getAccess = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		return user.role === "admin";
	},
});

export const getDashboard = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (user.role !== "admin") {
			return { isAdmin: false, summary: null, businesses: [] };
		}

		const [allBusinesses, activeCountries, entityTypes] = await Promise.all([
			ctx.db.query("businesses").order("desc").take(500),
			ctx.db
				.query("countries")
				.withIndex("by_isRegistrationAvailable", (q) =>
					q.eq("isRegistrationAvailable", true),
				)
				.take(100),
			ctx.db.query("entityTypes").take(100),
		]);

		const businesses = await Promise.all(
			allBusinesses.slice(0, 50).map(async (business) => {
				const [country, entityType] = await Promise.all([
					ctx.db
						.query("countries")
						.withIndex("by_originalId", (q) =>
							q.eq("originalId", business.countryOriginalId),
						)
						.first(),
					business.entityTypeId
						? ctx.db.get(business.entityTypeId)
						: Promise.resolve(null),
				]);
				return {
					_id: business._id,
					name: business.name,
					logo: business.logo ?? null,
					status: business.status,
					country: country ? { name: country.name, iso2: country.iso2 } : null,
					entityType: entityType?.name ?? null,
				};
			}),
		);

		const countries = activeCountries.map((country) => ({
			originalId: country.originalId,
			name: country.name,
			iso2: country.iso2,
		}));
		const entities = entityTypes.map((entity) => ({
			id: entity._id,
			name: entity.name,
		}));

		return {
			isAdmin: true,
			summary: {
				ongoingRegistrations: allBusinesses.filter((business) =>
					ONGOING_STATUSES.has(business.status.toLowerCase()),
				).length,
				completedRegistrations: allBusinesses.filter((business) =>
					COMPLETED_STATUSES.has(business.status.toLowerCase()),
				).length,
				activeCountries: countries.length,
				entityTypes: entities.length,
			},
			businesses,
		};
	},
});
