import { useMutation, useQuery } from "./convex-hooks";
import { api } from "../convex/_generated/api";
import type { Id, Doc } from "../convex/_generated/dataModel";

// FILE HOOKS

// Hook to generate upload URL
export const useGenerateUploadUrl = () => {
  return useMutation(api.files.generateUploadUrl);
};

// Hook to confirm upload
export const useConfirmUpload = () => {
  return useMutation(api.files.confirmUpload);
};

// Hook to get file by ID
export const useFile = (fileId: Id<"files"> | undefined) => {
  return useQuery(api.files.getFile, fileId ? { fileId } : "skip");
};

// Hook to list files by folder
export const useFilesByFolder = (folder?: string, limit?: number) => {
  return useQuery(api.files.listFiles, { folder, limit });
};

// Hook to delete file
export const useDeleteFile = () => {
  return useMutation(api.files.deleteFile);
};

// Types for file operations
export type FileUploadData = {
  originalName: string;
  mimeType: string;
  fileSize: number;
  folder?: string;
  isPublic?: boolean;
};

export type FileUploadResult = {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  fileId: Id<"files">;
};

export type FileData = Doc<"files">;
