import { useEffect, useState, type FormEvent } from "react";
import { api, useApi } from "../api";
import { Badge, Empty, ErrorNote, Field, fmtDate, fmtDateTime, Modal, waLink, zar } from "../ui";
import type { Booking, Client, Enquiry } from "../types";

export default function Clients() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  const { data, error, reload } = useApi<{ items: Client[] }>(`/admin/clients?limit=200${dq ? `&q=${encodeURIComponent(dq)}` : ""}`);

  return (
    <>
      <div className="head"><h1>Clients</h1><button className="primary" onClick={() => setEditing("new")}>Add client</button></div>
      <div className="toolbar"><input type="search" placeholder="Search name, phone or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search clients" /></div>
      <ErrorNote message={error} />
      {data && data.items.length === 0 && <Empty>No clients yet. Save an enquiry as a client to start building your list.</Empty>}
      {data && data.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Added</th></tr></thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} tabIndex={0} className="click" onClick={() => setEditing(c)} onKeyDown={(k) => k.key === "Enter" && setEditing(c)}>
                  <td><b>{c.name}</b></td><td>{c.phone}</td><td>{c.email ?? "–"}</td><td>{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ClientModal client={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </>
  );
}

function ClientModal({ client, onClose, onSaved }: { client: Client | null; onClose: () => void; onSaved: () => void }) {
  const history = useApi<{ bookings: Booking[]; enquiries: Enquiry[] }>(client ? `/admin/clients/${client.id}` : null);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(client ? `/admin/clients/${client.id}` : "/admin/clients", { method: client ? "PATCH" : "POST", body: f });
      onSaved();
    } catch (x) { setErr((x as Error).message); }
  }
  async function remove() {
    if (!client || !confirm(`Delete ${client.name}?`)) return;
    try { await api(`/admin/clients/${client.id}`, { method: "DELETE" }); onSaved(); } catch (x) { setErr((x as Error).message); }
  }

  return (
    <Modal title={client ? client.name : "Add client"} onClose={onClose}>
      <form className="grid" onSubmit={save}>
        <Field label="Name"><input name="name" defaultValue={client?.name} required /></Field>
        <Field label="Phone"><input name="phone" defaultValue={client?.phone} required /></Field>
        <Field label="Email" wide><input name="email" type="email" defaultValue={client?.email ?? ""} /></Field>
        <Field label="Notes" wide><textarea name="notes" rows={3} defaultValue={client?.notes ?? ""} placeholder="Skin type, allergies, preferences" /></Field>
        <div className="wide"><ErrorNote message={err} /></div>
        <div className="wide actions">
          <button className="primary">Save client</button>
          {client && <a className="btn" href={waLink(client.phone)} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {client && <button type="button" className="ghost danger" onClick={remove}>Delete</button>}
        </div>
      </form>
      {history.data && (
        <section>
          <h3>History</h3>
          {history.data.bookings.length === 0 && history.data.enquiries.length === 0 && <Empty>No history yet.</Empty>}
          <ul className="timeline">
            {history.data.bookings.map((b) => <li key={b.id}><span>Booking · {fmtDateTime(b.startsAt)} · {zar(b.priceCents)} <Badge value={b.status} /></span></li>)}
            {history.data.enquiries.map((x) => <li key={x.id}><span>Enquiry · {x.serviceLabel ?? "no service"} <Badge value={x.status} /></span><small>{fmtDate(x.createdAt)}</small></li>)}
          </ul>
        </section>
      )}
    </Modal>
  );
}
