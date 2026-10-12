// Server-side utilities (for your Hono backend)
import { Buffer } from "node:buffer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileUploadConfig } from "../types";

export class R2FileService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl?: string;

  constructor(config: FileUploadConfig["r2"]) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async uploadFile(
    key: string,
    file: Buffer,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.client.send(command);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://pub-${this.bucketName}.r2.dev/${key}`;
  }
}

// Factory function for creating R2 service
export function createR2Service(config: FileUploadConfig["r2"]): R2FileService {
  return new R2FileService(config);
}
