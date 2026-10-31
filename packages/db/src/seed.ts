import { hashPassword } from "@nonty/shared";
import { eq, getDb, services, users } from "./index";

async function main() {
  const db = getDb();

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (12+ chars) in .env");
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    await db.insert(users).values({ email, name: "Nonty", role: "owner", passwordHash: await hashPassword(password) });
    console.log(`Created owner login for ${email}`);
  } else {
    console.log("Owner already exists, skipping");
  }

  // Prices are the ones printed in the original brochure. Confirm them in the admin before launch.
  const seedServices = [
    { slug: "natural-look", name: "Natural Look", description: "A fresh, understated finish.", priceCents: 9900, sortOrder: 10 },
    { slug: "soft-glam", name: "Soft Glam", description: "A polished look with soft definition.", priceCents: 11900, sortOrder: 20 },
    { slug: "full-face-beat", name: "Full Face Beat", description: "A more defined, statement-making look.", priceCents: 17900, compareAtCents: 21000, sortOrder: 30 },
    { slug: "eyebrows", name: "Eyebrows", description: "Defined brows that complement the overall look.", priceCents: 5900, sortOrder: 40 },
    { slug: "eyelashes-single", name: "Eyelashes (single)", description: "Individual lash option.", priceCents: 13900, priceNote: "Single", sortOrder: 50 },
    { slug: "eyelashes-strip", name: "Eyelashes (strip)", description: "Strip lash option.", priceCents: 7900, priceNote: "Strip", sortOrder: 60 },
  ];
  for (const s of seedServices) {
    await db.insert(services).values(s).onConflictDoNothing({ target: services.slug });
  }
  console.log("Services seeded");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });