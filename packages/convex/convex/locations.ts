import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const getCountries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("countries").collect();
  },
});

export const getRegistrationCountries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_isRegistrationAvailable", (q) =>
        q.eq("isRegistrationAvailable", true),
      )
      .collect();
  },
});

export const getStatesByCountry = query({
  args: {
    countryOriginalId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("states")
      .withIndex("by_originalCountryId", (q) =>
        q.eq("originalCountryId", args.countryOriginalId),
      )
      .collect();
  },
});

export const searchLocations = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.query.trim();
    if (!searchTerm || searchTerm.length < 2) return [];

    const limit = args.limit ?? 10;
    const results: Array<{
      id: string;
      label: string;
      type: "country" | "state";
      countryOriginalId?: number;
      stateOriginalId?: number;
    }> = [];
    const seenLabels = new Set<string>();

    // Helper to add results uniquely
    const addResult = (res: (typeof results)[0]) => {
      if (results.length >= limit) return;
      if (!seenLabels.has(res.label)) {
        results.push(res);
        seenLabels.add(res.label);
      }
    };

    // --- PRIORITY 1: Country Matches ---
    const countryMatches = await ctx.db
      .query("countries")
      .withSearchIndex("search_name", (q) => q.search("name", searchTerm))
      .take(3);

    for (const country of countryMatches) {
      addResult({
        id: `country-${country.originalId}`,
        label: country.name,
        type: "country",
        countryOriginalId: country.originalId!,
      });

      // Get top states in this country
      const statesInCountry = await ctx.db
        .query("states")
        .withIndex("by_originalCountryId", (q) =>
          q.eq("originalCountryId", country.originalId!),
        )
        .take(5);

      for (const state of statesInCountry) {
        addResult({
          id: `state-${state.originalId}`,
          label: `${state.name}, ${country.name}`,
          type: "state",
          stateOriginalId: state.originalId!,
          countryOriginalId: country.originalId!,
        });
      }
    }

    if (results.length >= limit) return results;

    // --- PRIORITY 2: State Matches ---
    const stateMatches = await ctx.db
      .query("states")
      .withSearchIndex("search_name", (q) => q.search("name", searchTerm))
      .take(limit);

    for (const state of stateMatches) {
      addResult({
        id: `state-${state.originalId}`,
        label: `${state.name}, ${state.countryName}`,
        type: "state",
        stateOriginalId: state.originalId!,
        countryOriginalId: state.originalCountryId!,
      });
    }

    return results;
  },
});

export const getStatesByCountryName = query({
  args: {
    countryName: v.string(),
  },
  handler: async (ctx, args) => {
    const country = await ctx.db
      .query("countries")
      .withIndex("by_name", (q) => q.eq("name", args.countryName))
      .first();
    if (!country || country.originalId === undefined) return [];

    return await ctx.db
      .query("states")
      .withIndex("by_originalCountryId", (q) =>
        q.eq("originalCountryId", country.originalId!),
      )
      .collect();
  },
});

export const getStateByOriginalId = query({
  args: {
    originalId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("states")
      .withIndex("by_originalId", (q) => q.eq("originalId", args.originalId))
      .first();
  },
});

export const getCountryByOriginalId = query({
  args: {
    originalId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_originalId", (q) => q.eq("originalId", args.originalId))
      .first();
  },
});

export const resolveLocationByNames = query({
  args: {
    stateName: v.optional(v.string()),
    countryName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let stateId: number | undefined;
    let countryId: number | undefined;

    if (args.countryName) {
      const country = await ctx.db
        .query("countries")
        .withIndex("by_name", (q) => q.eq("name", args.countryName!))
        .first();
      countryId = country?.originalId;
    }

    if (args.stateName) {
      const states = await ctx.db
        .query("states")
        .withIndex("by_name", (q) => q.eq("name", args.stateName!))
        .collect();

      if (states.length > 0) {
        let state = states[0];
        if (states.length > 1 && countryId !== undefined) {
          state = states.find((s) => s.originalCountryId === countryId) || state;
        }
        stateId = state.originalId;
      }
    }

    return { stateId, countryId };
  },
});
