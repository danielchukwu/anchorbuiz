import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Get notifications for the authenticated user
 */
export const getMyNotifications = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    let q = ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id));

    const list = await q.collect();
    // Sort newest first
    const sorted = list.sort(
      (a, b) => (b.createdAt ?? b._creationTime) - (a.createdAt ?? a._creationTime),
    );

    if (args.unreadOnly) {
      return sorted.filter((n) => !n.isRead);
    }
    return sorted;
  },
});

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_and_isRead", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .collect();

    return unread.length;
  },
});

/**
 * Create a notification
 */
export const createNotification = mutation({
  args: {
    userId: v.optional(v.string()),
    name: v.string(),
    entityId: v.optional(v.string()),
    entityType: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
    return args.notificationId;
  },
});

/**
 * Mark all notifications as read for current user
 */
export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_and_isRead", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .collect();

    for (const item of unread) {
      await ctx.db.patch(item._id, { isRead: true });
    }

    return unread.length;
  },
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});
