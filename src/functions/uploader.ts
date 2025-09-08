// lib/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from 'dotenv'
 
const {
  AWS_S3_REGION,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_S3_BASE_PREFIX = "",
} = process.env;

export const s3 = new S3Client({
  region: AWS_S3_REGION!,
  credentials: {
    accessKeyId: AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate a safe S3 key like:
 */
function buildObjectKey(filename: string, folder?: string) {
  const ext = path.extname(filename) || "";
  const base = path.basename(filename, ext);
  const stamp = Date.now();
  const rand = crypto.randomBytes(2).toString("hex");
  const safeBase = base.replace(/[^\w\- .]/g, " "); // keep word chars, dash, dot, space
  const prefix = folder || AWS_S3_BASE_PREFIX || "";
  return [prefix, `${safeBase}${stamp}${rand}${ext}`].filter(Boolean).join("/");
}

function detectContentType(filename: string): string {
  const ext = (path.extname(filename) || "").toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

/**
 * Upload a file Buffer/Uint8Array/Readable to S3 and return its public URL.
 */
export async function uploadImageToS3(opts: {
  file: Buffer | Uint8Array | Blob | ReadableStream | NodeJS.ReadableStream;
  filename: string;
  folder?: string; // optional subfolder
  cacheSeconds?: number; // default 1 year
}) {
  const { file, filename, folder, cacheSeconds = 60 * 60 * 24 * 365 } = opts;

  const Key = buildObjectKey(filename, folder);
  const ContentType = detectContentType(filename);

  // Put object
  await s3.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME!,
      Key,
      Body: file as any,
      ContentType,
    //   ACL: "public-read",
      CacheControl: `public, max-age=${cacheSeconds}, immutable`,
    })
  );

  // Public URL — adjust if you serve via CloudFront or have a custom domain
  const url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURI(
    Key
  )}`;

  return { key: Key, url, contentType: ContentType };
}
