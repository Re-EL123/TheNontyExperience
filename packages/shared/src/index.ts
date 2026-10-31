import { z } from "zod";

/* ---------- constants (shared by DB, API and admin UI) ---------- */
export const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "booked", "completed", "lost"] as const;
export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
export const MEDIA_CATEGORIES = ["natural", "soft_glam", "full_glam", "before_after", "brand", "other"] as const;
export const USER_ROLES = ["owner", "staff"] as const;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

/* ---------- helpers ---------- */
const blank = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), s.optional());

const phone = z.string().trim().min(7).max(20).regex(/^[+0-9()\-\s]+$/, "Invalid phone number");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

/* ---------- public ---------- */
export const enquiryInput = z.object({
  name: z.string().trim().min(2).max(100),
  phone,
  email: blank(z.string().trim().email().max(200)),
  service: blank(z.string().trim().max(100)), // service slug or free text
  preferredDate: blank(isoDate),
  preferredTime: blank(z.string().trim().max(50)),
  occasion: blank(z.string().trim().max(150)),
  details: blank(z.string().trim().max(2000)),
  website: z.string().max(0).optional(), // honeypot – must stay empty
  turnstileToken: blank(z.string().max(4096)),
});
export type EnquiryInput = z.infer<typeof enquiryInput>;

/* ---------- admin ---------- */
export const loginInput = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export const enquiryUpdate = z.object({
  status: z.enum(ENQUIRY_STATUSES).optional(),
  serviceId: z.string().uuid().nullable().optional(),
});
export const noteInput = z.object({ body: z.string().trim().min(1).max(4000) });

export const serviceInput = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).max(60),
  name: z.string().trim().min(2).max(100),
  description: blank(z.string().trim().max(500)),
  priceCents: z.number().int().min(0).max(10_000_000).nullable().optional(),
  compareAtCents: z.number().int().min(0).max(10_000_000).nullable().optional(),
  priceNote: blank(z.string().trim().max(120)),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const clientInput = z.object({
  name: z.string().trim().min(2).max(100),
  phone,
  email: blank(z.string().trim().email().max(200)),
  notes: blank(z.string().trim().max(4000)),
});

export const bookingInput = z.object({
  clientId: z.string().uuid(),
  enquiryId: z.string().uuid().nullable().optional(),
  serviceId: z.string().uuid().nullable().optional(),
  startsAt: z.string().datetime({ offset: true }),
  durationMins: z.number().int().min(15).max(960).default(60),
  location: blank(z.string().trim().max(300)),
  priceCents: z.number().int().min(0).default(0),
  depositCents: z.number().int().min(0).default(0),
  status: z.enum(BOOKING_STATUSES).default("pending"),
  notes: blank(z.string().trim().max(4000)),
});
export const bookingUpdate = bookingInput.partial();

export const mediaPresignInput = z.object({
  filename: z.string().trim().max(200),
  contentType: z.enum(IMAGE_TYPES),
  size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});
export const mediaCreateInput = z.object({
  key: z.string().regex(/^gallery\/[\w\-/.]+$/).max(300),
  alt: z.string().trim().max(300).default(""),
  caption: blank(z.string().trim().max(300)),
  category: z.enum(MEDIA_CATEGORIES).default("other"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export const mediaUpdate = z.object({
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(300).nullable().optional(),
  category: z.enum(MEDIA_CATEGORIES).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/* ---------- password hashing (WebCrypto PBKDF2; works in Node 20+) ---------- */
const ITER = 600_000;
const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (s: string) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${hex(salt)}$${hex(await derive(password, salt, ITER))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !salt || !hash) return false;
  const got = hex(await derive(password, unhex(salt), Number(iter)));
  if (got.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}
