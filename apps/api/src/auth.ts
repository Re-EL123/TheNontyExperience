import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { jwtVerify, SignJWT } from "jose";
import { isProd, need } from "./env";

export type SessionUser = { id: string; email: string; name: string; role: "owner" | "staff" };
export type AppEnv = { Variables: { user: SessionUser } };

const COOKIE = "nonty_session";
const MAX_AGE = 60 * 60 * 24 * 7;
const secret = () => {
  const s = need("JWT_SECRET");
  if (s.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
};

export async function issueSession(c: Context, u: SessionUser) {
  const token = await new SignJWT({ email: u.email, name: u.name, role: u.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  setCookie(c, COOKIE, token, { httpOnly: true, secure: isProd(), sameSite: "Lax", path: "/", maxAge: MAX_AGE });
}

export const clearSession = (c: Context) => deleteCookie(c, COOKIE, { path: "/" });

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, COOKIE);
  if (!token) return c.json({ error: "Not signed in" }, 401);
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    c.set("user", {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "owner" ? "owner" : "staff",
    });
  } catch {
    clearSession(c);
    return c.json({ error: "Session expired" }, 401);
  }
  return next();
};

export const ownerOnly: MiddlewareHandler<AppEnv> = async (c, next) =>
  c.get("user").role === "owner" ? next() : c.json({ error: "Owner access required" }, 403);

/** Admin and API share one origin, so any state-changing request must come from that origin. */
export const csrfGuard: MiddlewareHandler = async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) return next();
  const origin = c.req.header("origin");
  const host = c.req.header("x-forwarded-host") ?? c.req.header("host");
  let ok = false;
  try {
    ok = !!origin && new URL(origin).host === host;
  } catch {}
  return ok ? next() : c.json({ error: "Cross-origin request blocked" }, 403);
};
