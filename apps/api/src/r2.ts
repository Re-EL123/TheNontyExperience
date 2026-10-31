import { AwsClient } from "aws4fetch";
import { need } from "./env";

const client = () =>
  new AwsClient({
    accessKeyId: need("R2_ACCESS_KEY_ID"),
    secretAccessKey: need("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });

const objectUrl = (key: string) =>
  `https://${need("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${need("R2_BUCKET")}/${key}`;

export const publicUrl = (key: string) => `${(process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "")}/${key}`;

/** Presigned PUT so the browser uploads straight to R2 (bypasses Vercel's 4.5 MB body limit). */
export async function presignPut(key: string, contentType: string, expiresSeconds = 600) {
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds));
  const signed = await client().sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }), {
    aws: { signQuery: true },
  });
  return signed.url;
}

/** Returns what was actually stored, or null if the upload never happened. */
export async function headObject(key: string) {
  const res = await client().fetch(objectUrl(key), { method: "HEAD" });
  if (!res.ok) return null;
  return { contentType: res.headers.get("content-type") ?? "", size: Number(res.headers.get("content-length") ?? 0) };
}

export async function deleteObject(key: string) {
  const res = await client().fetch(objectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed (${res.status})`);
}
