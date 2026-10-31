import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api";
import Bookings from "./pages/Bookings";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Services from "./pages/Services";
import type { User } from "./types";

const nav = [
  ["/", "Dashboard"],
  ["/enquiries", "Enquiries"],
  ["/bookings", "Bookings"],
  ["/clients", "Clients"],
  ["/services", "Services"],
  ["/gallery", "Gallery"],
] as const;

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    api<{ user: User }>("/auth/me").then((r) => setUser(r.user)).catch(() => setUser(null));
    const out = () => setUser(null);
    window.addEventListener("nonty:signed-out", out);
    return () => window.removeEventListener("nonty:signed-out", out);
  }, []);

  if (user === undefined) return <p className="boot">Loading…</p>;
  if (user === null) return <Login onLogin={setUser} />;

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Nonty</div>
        <nav aria-label="Main">
          {nav.map(([to, text]) => (
            <NavLink key={to} to={to} end={to === "/"}>{text}</NavLink>
          ))}
        </nav>
        <div className="who">
          <span>{user.name}</span>
          <button className="ghost" onClick={() => api("/auth/logout", { method: "POST" }).finally(() => setUser(null))}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/enquiries" element={<Enquiries />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
