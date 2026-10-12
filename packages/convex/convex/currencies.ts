import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getCurrencies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("currencies")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getCurrencyByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("currencies")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

export const getCurrencyById = query({
  args: {
    id: v.id("currencies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
