export interface FileUploadConfig {
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region: string;
    endpoint: string;
    publicUrl?: string;
  };
  validation: {
    maxFileSize: number;
    allowedTypes: string[];
    allowedExtensions?: string[];
  };
  features: {
    autoCompress: boolean;
    generateThumbnails: boolean;
    enableChunkedUpload: boolean;
  };
}

export interface FileUpload {
  _id: string;
  originalName: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  isPublic: boolean;
  publicUrl: string;
  folder: string;
  status?: string;
  uploadedAt?: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  fileId: string;
}

export interface FileUploadRequest {
  originalName: string;
  mimeType: string;
  fileSize: number;
  tags?: string[];
  description?: string;
  isPublic?: boolean;
  folder?: string; // Different folders for admin vs web
}

export interface DirectUploadRequest {
  file: File;
  tags?: string[];
  description?: string;
  isPublic?: boolean;
  folder?: string;
}

export type FileCategory = "image" | "video" | "document" | "other";
export type UploadMethod = "direct" | "server";
export type AppContext = "admin" | "web" | "mobile";

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  result?: FileUpload;
}
