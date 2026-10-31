import { zValidator } from "@hono/zod-validator";
import { and, asc, count, desc, enquiries, eq, getDb, gte, media, services } from "@nonty/db";
import { enquiryInput } from "@nonty/shared";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { allowedOrigins, need } from "../env";
import { publicUrl } from "../r2";

export const pub = new Hono();

pub.use(
  "*",
  cors({
    origin: (origin) => (allowedOrigins().includes(origin) ? origin : null),
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);

const sha256 = async (s: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

pub.get("/services", async (c) => {
  const rows = await getDb()
    .select({
      id: services.id,
      slug: services.slug,
      name: services.name,
      description: services.description,
      priceCents: services.priceCents,
      compareAtCents: services.compareAtCents,
      priceNote: services.priceNote,
    })
    .from(services)
    .where(eq(services.active, true))
    .orderBy(asc(services.sortOrder));
  c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return c.json({ items: rows });
});

pub.get("/gallery", async (c) => {
  const category = c.req.query("category");
  const rows = await getDb()
    .select()
    .from(media)
    .where(eq(media.published, true))
    .orderBy(asc(media.sortOrder), desc(media.createdAt));
  const items = rows
    .filter((m) => !category || m.category === category)
    .map((m) => ({
      id: m.id,
      url: publicUrl(m.key),
      alt: m.alt,
      caption: m.caption,
      category: m.category,
      width: m.width,
      height: m.height,
    }));
  c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return c.json({ items });
});

pub.post(
  "/enquiries",
  zValidator("json", enquiryInput, (r, c) => {
    if (!r.success) return c.json({ error: "Please check your details", fields: r.error.flatten().fieldErrors }, 400);
  }),
  async (c) => {
    const input = c.req.valid("json");
    const db = getDb();
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (process.env.TURNSTILE_SECRET) {
      const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET, response: input.turnstileToken ?? "", remoteip: ip });
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
      const verdict = (await res.json()) as { success?: boolean };
      if (!verdict.success) return c.json({ error: "Verification failed, please try again" }, 400);
    }

    // Light rate limit: max 5 enquiries per hour per (hashed) IP. Raw IPs are never stored.
    const ipHash = await sha256(ip + need("JWT_SECRET"));
    const [{ n }] = await db
      .select({ n: count() })
      .from(enquiries)
      .where(and(eq(enquiries.ipHash, ipHash), gte(enquiries.createdAt, new Date(Date.now() - 3_600_000))));
    if (n >= 5) return c.json({ error: "Too many enquiries. Please WhatsApp us instead." }, 429);

    let serviceId: string | null = null;
    let serviceLabel = input.service ?? null;
    if (input.service) {
      const [s] = await db
        .select({ id: services.id, name: services.name })
        .from(services)
        .where(and(eq(services.slug, input.service), eq(services.active, true)))
        .limit(1);
      if (s) {
        serviceId = s.id;
        serviceLabel = s.name;
      }
    }

    await db.insert(enquiries).values({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      serviceId,
      serviceLabel,
      preferredDate: input.preferredDate ?? null,
      preferredTime: input.preferredTime ?? null,
      occasion: input.occasion ?? null,
      details: input.details ?? null,
      ipHash,
    });
    return c.json({ ok: true }, 201);
  },
);
