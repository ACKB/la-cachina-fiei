/**
 * lib/r2.ts — Cliente para Cloudflare R2 (S3-compatible)
 *
 * Usa el SDK oficial de AWS (@aws-sdk/client-s3) que funciona con R2.
 * Solo se instancia en el runtime de Node.js (server-side).
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "fiei";

const r2Client = new S3Client({
  region: "auto",
  endpoint: "https://360dcf4ff69aeac4971282ac12ecb61b.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getFileFromR2(key: string) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  return r2Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Sube un archivo al bucket de R2 y devuelve la URL relativa.
 *
 * @param key      - Ruta del archivo dentro del bucket (ej. "products/uuid.jpg")
 * @param body     - Contenido del archivo como Buffer
 * @param mimeType - Tipo MIME del archivo (ej. "image/jpeg")
 * @returns /api/images/{key}
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  mimeType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mimeType,
    })
  );

  return `/api/images/${key}`;
}
