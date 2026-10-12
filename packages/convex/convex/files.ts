import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Generate upload URL for file storage
 */
export const generateUploadUrl = mutation({
  args: {
    originalName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    folder: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const postUrl = await ctx.storage.generateUploadUrl();
    const folder = args.folder ?? "web/uploads";

    const fileId = await ctx.db.insert("files", {
      originalName: args.originalName,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      fileKey: "",
      publicUrl: "",
      folder,
      isPublic: args.isPublic ?? true,
      status: "uploading",
      uploadedAt: Date.now(),
    });

    return {
      uploadUrl: postUrl,
      fileId,
      fileKey: `${folder}/${fileId}`,
      publicUrl: "",
    };
  },
});

/**
 * Confirm upload completion
 */
export const confirmUpload = mutation({
  args: {
    fileId: v.id("files"),
    storageId: v.optional(v.id("_storage")),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File record not found");

    if (!args.success) {
      await ctx.db.patch(args.fileId, {
        status: "failed",
      });
      return { success: false };
    }

    let publicUrl = "";
    if (args.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      if (url) publicUrl = url;
    }

    await ctx.db.patch(args.fileId, {
      status: "uploaded",
      publicUrl,
      uploadedAt: Date.now(),
    });

    return { success: true, publicUrl };
  },
});

/**
 * Get file by ID
 */
export const getFile = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

/**
 * List files by folder
 */
export const listFiles = query({
  args: {
    folder: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("files");
    if (args.folder) {
      return await q
        .withIndex("by_folder", (q) => q.eq("folder", args.folder!))
        .take(args.limit ?? 50);
    }
    return await q.take(args.limit ?? 50);
  },
});

/**
 * Delete a file record
 */
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fileId);
    return args.fileId;
  },
});
