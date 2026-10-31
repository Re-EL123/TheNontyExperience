import { zValidator } from "@hono/zod-validator";
import {
  and, asc, bookings, clients, count, desc, enquiries, enquiryNotes, eq, getDb, getTableColumns,
  gte, ilike, inArray, lte, media, or, services,
} from "@nonty/db";
import {
  bookingInput, bookingUpdate, BOOKING_STATUSES, clientInput, enquiryUpdate, ENQUIRY_STATUSES,
  IMAGE_TYPES, MAX_UPLOAD_BYTES, mediaCreateInput, mediaPresignInput, mediaUpdate, noteInput, serviceInput,
  type BookingStatus, type EnquiryStatus,
} from "@nonty/shared";
import { Hono, type Context } from "hono";
import type { ZodTypeAny } from "zod";
import { ownerOnly, type AppEnv } from "../auth";
import { deleteObject, headObject, presignPut, publicUrl } from "../r2";

export const admin = new Hono<AppEnv>();

const v = <T extends ZodTypeAny>(schema: T) =>
  zValidator("json", schema, (r, c) => {
    if (!r.success) return c.json({ error: "Invalid input", fields: r.error.flatten().fieldErrors }, 400);
  });

const page = (c: Context) => ({
  limit: Math.min(Math.max(Number(c.req.query("limit")) || 50, 1), 200),
  offset: Math.max(Number(c.req.query("offset")) || 0, 0),
});
const day = 86_400_000;
const serviceUpdate = serviceInput.partial();

/* ───────────── dashboard ───────────── */
admin.get("/dashboard", async (c) => {
  const d = getDb();
  const [byStatus, [{ week }], upcoming, latestNew] = await Promise.all([
    d.select({ status: enquiries.status, n: count() }).from(enquiries).groupBy(enquiries.status),
    d.select({ week: count() }).from(enquiries).where(gte(enquiries.createdAt, new Date(Date.now() - 7 * day))),
    d
      .select({ ...getTableColumns(bookings), clientName: clients.name, clientPhone: clients.phone, serviceName: services.name })
      .from(bookings)
      .innerJoin(clients, eq(bookings.clientId, clients.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(and(gte(bookings.startsAt, new Date()), lte(bookings.startsAt, new Date(Date.now() + 14 * day)), inArray(bookings.status, ["pending", "confirmed"])))
      .orderBy(asc(bookings.startsAt))
      .limit(10),
    d.select().from(enquiries).where(eq(enquiries.status, "new")).orderBy(desc(enquiries.createdAt)).limit(5),
  ]);
  return c.json({ byStatus, enquiriesThisWeek: week, upcoming, latestNew });
});

/* ───────────── enquiries ───────────── */
admin.get("/enquiries", async (c) => {
  const d = getDb();
  const { limit, offset } = page(c);
  const status = c.req.query("status");
  const q = c.req.query("q")?.trim();
  const conds = [];
  if (status && (ENQUIRY_STATUSES as readonly string[]).includes(status)) conds.push(eq(enquiries.status, status as EnquiryStatus));
  if (q) conds.push(or(ilike(enquiries.name, `%${q}%`), ilike(enquiries.phone, `%${q}%`), ilike(enquiries.email, `%${q}%`))!);
  const where = conds.length ? and(...conds) : undefined;
  const [items, [{ total }]] = await Promise.all([
    d.select().from(enquiries).where(where).orderBy(desc(enquiries.createdAt)).limit(limit).offset(offset),
    d.select({ total: count() }).from(enquiries).where(where),
  ]);
  return c.json({ items, total });
});

admin.get("/enquiries/:id", async (c) => {
  const d = getDb();
  const id = c.req.param("id");
  const [item] = await d.select().from(enquiries).where(eq(enquiries.id, id));
  if (!item) return c.json({ error: "Not found" }, 404);
  const [notes, client, linked] = await Promise.all([
    d.select().from(enquiryNotes).where(eq(enquiryNotes.enquiryId, id)).orderBy(desc(enquiryNotes.createdAt)),
    item.clientId ? d.select().from(clients).where(eq(clients.id, item.clientId)).then((r) => r[0] ?? null) : null,
    d.select().from(bookings).where(eq(bookings.enquiryId, id)).orderBy(desc(bookings.startsAt)),
  ]);
  return c.json({ item, notes, client, bookings: linked });
});

admin.patch("/enquiries/:id", v(enquiryUpdate), async (c) => {
  const d = getDb();
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const [before] = await d.select().from(enquiries).where(eq(enquiries.id, id));
  if (!before) return c.json({ error: "Not found" }, 404);
  if (Object.keys(body).length === 0) return c.json({ item: before });
  const [item] = await d.update(enquiries).set(body).where(eq(enquiries.id, id)).returning();
  if (body.status && body.status !== before.status) {
    await d.insert(enquiryNotes).values({
      enquiryId: id, authorId: user.id, authorName: user.name,
      body: `Status changed from ${before.status} to ${body.status}`,
    });
  }
  return c.json({ item });
});

admin.post("/enquiries/:id/notes", v(noteInput), async (c) => {
  const user = c.get("user");
  const [note] = await getDb()
    .insert(enquiryNotes)
    .values({ enquiryId: c.req.param("id"), authorId: user.id, authorName: user.name, body: c.req.valid("json").body })
    .returning();
  return c.json({ item: note }, 201);
});

/** Turn an enquiry into a client record (re-uses an existing client with the same phone). */
admin.post("/enquiries/:id/convert", async (c) => {
  const d = getDb();
  const [e] = await d.select().from(enquiries).where(eq(enquiries.id, c.req.param("id")));
  if (!e) return c.json({ error: "Not found" }, 404);
  let [client] = e.clientId
    ? await d.select().from(clients).where(eq(clients.id, e.clientId))
    : await d.select().from(clients).where(eq(clients.phone, e.phone)).limit(1);
  if (!client) [client] = await d.insert(clients).values({ name: e.name, phone: e.phone, email: e.email }).returning();
  if (e.clientId !== client.id) await d.update(enquiries).set({ clientId: client.id }).where(eq(enquiries.id, e.id));
  return c.json({ client }, 201);
});

admin.delete("/enquiries/:id", ownerOnly, async (c) => {
  await getDb().delete(enquiries).where(eq(enquiries.id, c.req.param("id")));
  return c.json({ ok: true });
});

/* ───────────── clients ───────────── */
admin.get("/clients", async (c) => {
  const q = c.req.query("q")?.trim();
  const { limit, offset } = page(c);
  const where = q ? or(ilike(clients.name, `%${q}%`), ilike(clients.phone, `%${q}%`), ilike(clients.email, `%${q}%`)) : undefined;
  const items = await getDb().select().from(clients).where(where).orderBy(asc(clients.name)).limit(limit).offset(offset);
  return c.json({ items });
});

admin.get("/clients/:id", async (c) => {
  const d = getDb();
  const id = c.req.param("id");
  const [item] = await d.select().from(clients).where(eq(clients.id, id));
  if (!item) return c.json({ error: "Not found" }, 404);
  const [b, e] = await Promise.all([
    d.select().from(bookings).where(eq(bookings.clientId, id)).orderBy(desc(bookings.startsAt)),
    d.select().from(enquiries).where(eq(enquiries.clientId, id)).orderBy(desc(enquiries.createdAt)),
  ]);
  return c.json({ item, bookings: b, enquiries: e });
});

admin.post("/clients", v(clientInput), async (c) => {
  const [item] = await getDb().insert(clients).values(c.req.valid("json")).returning();
  return c.json({ item }, 201);
});

admin.patch("/clients/:id", v(clientInput.partial()), async (c) => {
  const [item] = await getDb().update(clients).set(c.req.valid("json")).where(eq(clients.id, c.req.param("id"))).returning();
  return item ? c.json({ item }) : c.json({ error: "Not found" }, 404);
});

admin.delete("/clients/:id", ownerOnly, async (c) => {
  await getDb().delete(clients).where(eq(clients.id, c.req.param("id"))); // blocked (409) while bookings exist
  return c.json({ ok: true });
});

/* ───────────── services ───────────── */
admin.get("/services", async (c) =>
  c.json({ items: await getDb().select().from(services).orderBy(asc(services.sortOrder), asc(services.name)) }),
);

admin.post("/services", v(serviceInput), async (c) => {
  const [item] = await getDb().insert(services).values(c.req.valid("json")).returning();
  return c.json({ item }, 201);
});

admin.patch("/services/:id", v(serviceUpdate), async (c) => {
  const [item] = await getDb().update(services).set(c.req.valid("json")).where(eq(services.id, c.req.param("id"))).returning();
  return item ? c.json({ item }) : c.json({ error: "Not found" }, 404);
});

admin.delete("/services/:id", ownerOnly, async (c) => {
  await getDb().delete(services).where(eq(services.id, c.req.param("id")));
  return c.json({ ok: true });
});

/* ───────────── bookings ───────────── */
const bookingRows = () =>
  getDb()
    .select({ ...getTableColumns(bookings), clientName: clients.name, clientPhone: clients.phone, serviceName: services.name })
    .from(bookings)
    .innerJoin(clients, eq(bookings.clientId, clients.id))
    .leftJoin(services, eq(bookings.serviceId, services.id));

admin.get("/bookings", async (c) => {
  const { limit, offset } = page(c);
  const status = c.req.query("status");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const conds = [];
  if (status && (BOOKING_STATUSES as readonly string[]).includes(status)) conds.push(eq(bookings.status, status as BookingStatus));
  if (from && !Number.isNaN(Date.parse(from))) conds.push(gte(bookings.startsAt, new Date(from)));
  if (to && !Number.isNaN(Date.parse(to))) conds.push(lte(bookings.startsAt, new Date(to)));
  const items = await bookingRows().where(conds.length ? and(...conds) : undefined).orderBy(desc(bookings.startsAt)).limit(limit).offset(offset);
  return c.json({ items });
});

admin.post("/bookings", v(bookingInput), async (c) => {
  const d = getDb();
  const { startsAt, ...rest } = c.req.valid("json");
  const [item] = await d.insert(bookings).values({ ...rest, startsAt: new Date(startsAt) }).returning();
  if (item.enquiryId) await d.update(enquiries).set({ status: "booked" }).where(eq(enquiries.id, item.enquiryId));
  return c.json({ item }, 201);
});

admin.patch("/bookings/:id", v(bookingUpdate), async (c) => {
  const { startsAt, ...rest } = c.req.valid("json");
  const [item] = await getDb()
    .update(bookings)
    .set({ ...rest, ...(startsAt ? { startsAt: new Date(startsAt) } : {}) })
    .where(eq(bookings.id, c.req.param("id")))
    .returning();
  return item ? c.json({ item }) : c.json({ error: "Not found" }, 404);
});

admin.delete("/bookings/:id", ownerOnly, async (c) => {
  await getDb().delete(bookings).where(eq(bookings.id, c.req.param("id")));
  return c.json({ ok: true });
});

/* ───────────── media (Cloudflare R2) ───────────── */
const withUrl = <T extends { key: string }>(m: T) => ({ ...m, url: publicUrl(m.key) });
const EXT: Record<(typeof IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif",
};

admin.get("/media", async (c) => {
  const rows = await getDb().select().from(media).orderBy(asc(media.sortOrder), desc(media.createdAt));
  return c.json({ items: rows.map(withUrl) });
});

/** Step 1: ask for a short-lived upload URL. Step 2 (browser): PUT the file to it. Step 3: POST /media to register. */
admin.post("/media/presign", v(mediaPresignInput), async (c) => {
  const { contentType } = c.req.valid("json");
  const key = `gallery/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${EXT[contentType]}`;
  return c.json({ key, uploadUrl: await presignPut(key, contentType), headers: { "Content-Type": contentType } });
});

admin.post("/media", v(mediaCreateInput), async (c) => {
  const body = c.req.valid("json");
  // The presigned URL can't hard-limit type/size, so re-check what actually landed in the bucket.
  const head = await headObject(body.key);
  if (!head) return c.json({ error: "Upload not found in storage" }, 400);
  if (!(IMAGE_TYPES as readonly string[]).includes(head.contentType) || head.size > MAX_UPLOAD_BYTES) {
    await deleteObject(body.key);
    return c.json({ error: "Only JPEG, PNG, WebP or AVIF images up to 15 MB are allowed" }, 400);
  }
  const [item] = await getDb().insert(media).values(body).returning();
  return c.json({ item: withUrl(item) }, 201);
});

admin.patch("/media/:id", v(mediaUpdate), async (c) => {
  const [item] = await getDb().update(media).set(c.req.valid("json")).where(eq(media.id, c.req.param("id"))).returning();
  return item ? c.json({ item: withUrl(item) }) : c.json({ error: "Not found" }, 404);
});

admin.delete("/media/:id", ownerOnly, async (c) => {
  const d = getDb();
  const [m] = await d.select().from(media).where(eq(media.id, c.req.param("id")));
  if (!m) return c.json({ error: "Not found" }, 404);
  await deleteObject(m.key);
  await d.delete(media).where(eq(media.id, m.id));
  return c.json({ ok: true });
});
