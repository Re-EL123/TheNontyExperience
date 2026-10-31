import { useState, type FormEvent } from "react";
import { api } from "../api";
import { ErrorNote } from "../ui";
import type { User } from "../types";

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ user: User }>("/auth/login", { method: "POST", body: { email: f.get("email"), password: f.get("password") } });
      onLogin(r.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>The Nonty Experience</h1>
        <p className="muted">Sign in to manage enquiries, bookings and the website.</p>
        <label className="field"><span>Email</span><input name="email" type="email" autoComplete="username" required autoFocus /></label>
        <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
        <ErrorNote message={error} />
        <button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
