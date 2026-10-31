import { zValidator } from "@hono/zod-validator";
import { eq, getDb, users } from "@nonty/db";
import { loginInput, verifyPassword } from "@nonty/shared";
import { Hono } from "hono";
import { clearSession, issueSession, requireAuth, type AppEnv } from "../auth";

export const auth = new Hono<AppEnv>();

// Burns the same CPU as a real check so response time doesn't reveal which emails exist.
const DUMMY = `pbkdf2$600000$${"00".repeat(16)}$${"00".repeat(32)}`;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;

auth.post("/login", zValidator("json", loginInput), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = getDb();
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!u) {
    await verifyPassword(password, DUMMY);
    return c.json({ error: "Wrong email or password" }, 401);
  }
  if (u.lockedUntil && u.lockedUntil > new Date()) {
    return c.json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  }

  if (!(await verifyPassword(password, u.passwordHash))) {
    const fails = u.failedLogins + 1;
    await db
      .update(users)
      .set(fails >= MAX_FAILS ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: fails })
      .where(eq(users.id, u.id));
    return c.json({ error: "Wrong email or password" }, 401);
  }

  await db.update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, u.id));
  const user = { id: u.id, email: u.email, name: u.name, role: u.role };
  await issueSession(c, user);
  return c.json({ user });
});

auth.post("/logout", (c) => {
  clearSession(c);
  return c.json({ ok: true });
});

auth.get("/me", requireAuth, (c) => c.json({ user: c.get("user") }));
