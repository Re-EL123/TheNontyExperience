export function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export const allowedOrigins = () =>
  (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);

export const isProd = () => !!process.env.VERCEL || process.env.NODE_ENV === "production";
