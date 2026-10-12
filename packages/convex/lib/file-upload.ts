import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

export interface UploadToR2Params {
  file: File;
  folder?: string;
}

export interface UploadResult {
  fileKey: string;
  publicUrl: string;
  fileId: string;
}

export class ConvexFileUploader {
  private convex: ConvexHttpClient;

  constructor(convexUrl: string) {
    this.convex = new ConvexHttpClient(convexUrl);
  }

  async uploadToR2(params: UploadToR2Params): Promise<UploadResult> {
    const { file, folder = "web/uploads" } = params;

    // Step 1: Generate upload URL and get file metadata
    const uploadData = await this.convex.mutation(api.files.generateUploadUrl, {
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      folder,
      isPublic: true,
    });

    try {
      // Step 2: Upload file to R2 using the presigned URL
      const response = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Step 3: Confirm successful upload
      await this.convex.mutation(api.files.confirmUpload, {
        fileId: uploadData.fileId,
        success: true,
      });

      return {
        fileKey: uploadData.fileKey,
        publicUrl: uploadData.publicUrl,
        fileId: uploadData.fileId,
      };
    } catch (error) {
      // Step 4: Mark upload as failed if there was an error
      await this.convex.mutation(api.files.confirmUpload, {
        fileId: uploadData.fileId,
        success: false,
      });

      throw error;
    }
  }
}

// Helper to get Convex URL across different environments (Vite, Next.js, Node)
export function getConvexUrl() {
  return (
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CONVEX_URL) ||
    (import.meta as any).env?.CONVEX_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_CONVEX_URL ||
    ""
  );
}

// Create a singleton instance
export const convexFileUploader = new ConvexFileUploader(getConvexUrl());

// Export the uploadToR2 function for backward compatibility
export async function uploadToR2(
  params: UploadToR2Params,
): Promise<UploadResult> {
  return convexFileUploader.uploadToR2(params);
}
