import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { csrfGuard, requireAuth, type AppEnv } from "./auth";
import { admin } from "./routes/admin";
import { auth } from "./routes/auth";
import { pub } from "./routes/public";

const app = new Hono<AppEnv>().basePath("/api");

app.use("*", secureHeaders());
app.get("/health", (c) => c.json({ ok: true }));

app.route("/public", pub);

app.use("/auth/*", csrfGuard);
app.route("/auth", auth);

app.use("/admin/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});
app.use("/admin/*", requireAuth, csrfGuard);
app.route("/admin", admin);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  // Postgres constraint violations (Neon surfaces them with a SQLSTATE `code`)
  const code = (err as any)?.code ?? (err as any)?.cause?.code;
  if (code === "22P02") return c.json({ error: "Not found" }, 404); // malformed uuid in URL
  if (code === "23505") return c.json({ error: "That value already exists" }, 409);
  if (code === "23503") return c.json({ error: "This record is still linked to other records" }, 409);
  console.error(err);
  return c.json({ error: "Something went wrong" }, 500);
});

export default app;
