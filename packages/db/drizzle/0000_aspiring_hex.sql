CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'contacted', 'quoted', 'booked', 'completed', 'lost');--> statement-breakpoint
CREATE TYPE "public"."media_category" AS ENUM('natural', 'soft_glam', 'full_glam', 'before_after', 'brand', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"enquiry_id" uuid,
	"service_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_mins" integer DEFAULT 60 NOT NULL,
	"location" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"deposit_cents" integer DEFAULT 0 NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"service_id" uuid,
	"service_label" text,
	"preferred_date" date,
	"preferred_time" text,
	"occasion" text,
	"details" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"client_id" uuid,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"author_id" uuid,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"category" "media_category" DEFAULT 'other' NOT NULL,
	"width" integer,
	"height" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_cents" integer,
	"compare_at_cents" integer,
	"price_note" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'staff' NOT NULL,
	"failed_logins" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_notes" ADD CONSTRAINT "enquiry_notes_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_notes" ADD CONSTRAINT "enquiry_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_starts_idx" ON "bookings" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "clients_phone_idx" ON "clients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "enquiries_ip_idx" ON "enquiries" USING btree ("ip_hash","created_at");