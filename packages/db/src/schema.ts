import { sql } from "drizzle-orm";
import { boolean, date, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { BOOKING_STATUSES, ENQUIRY_STATUSES, MEDIA_CATEGORIES, USER_ROLES } from "@nonty/shared";

export const userRole = pgEnum("user_role", USER_ROLES);
export const enquiryStatus = pgEnum("enquiry_status", ENQUIRY_STATUSES);
export const bookingStatus = pgEnum("booking_status", BOOKING_STATUSES);
export const mediaCategory = pgEnum("media_category", MEDIA_CATEGORIES);

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("staff"),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Money is stored as integer cents (ZAR). */
export const services = pgTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents"),
  compareAtCents: integer("compare_at_cents"), // original price when a promo is active
  priceNote: text("price_note"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const clients = pgTable(
  "clients",
  {
    id: id(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("clients_phone_idx").on(t.phone)],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: id(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    serviceLabel: text("service_label"), // what the visitor picked, kept even if the service is later deleted
    preferredDate: date("preferred_date"),
    preferredTime: text("preferred_time"),
    occasion: text("occasion"),
    details: text("details"),
    status: enquiryStatus("status").notNull().default("new"),
    source: text("source").notNull().default("website"),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    ipHash: text("ip_hash"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("enquiries_status_idx").on(t.status),
    index("enquiries_created_idx").on(t.createdAt),
    index("enquiries_ip_idx").on(t.ipHash, t.createdAt),
  ],
);

export const enquiryNotes = pgTable("enquiry_notes", {
  id: id(),
  enquiryId: uuid("enquiry_id").notNull().references(() => enquiries.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: id(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
    enquiryId: uuid("enquiry_id").references(() => enquiries.id, { onDelete: "set null" }),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMins: integer("duration_mins").notNull().default(60),
    location: text("location"),
    priceCents: integer("price_cents").notNull().default(0),
    depositCents: integer("deposit_cents").notNull().default(0),
    status: bookingStatus("status").notNull().default("pending"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("bookings_starts_idx").on(t.startsAt)],
);

export const media = pgTable("media", {
  id: id(),
  key: text("key").notNull().unique(), // R2 object key
  alt: text("alt").notNull().default(""),
  caption: text("caption"),
  category: mediaCategory("category").notNull().default("other"),
  width: integer("width"),
  height: integer("height"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false), // new uploads stay private until approved
  createdAt: createdAt(),
});
