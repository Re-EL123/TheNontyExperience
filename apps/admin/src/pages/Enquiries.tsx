import { ENQUIRY_STATUSES, type EnquiryStatus } from "@nonty/shared";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, useApi } from "../api";
import { Badge, Empty, ErrorNote, fmtDate, fmtDateTime, label, Modal, waLink } from "../ui";
import type { Booking, Client, Enquiry } from "../types";
import BookingForm from "./BookingForm";

export default function Enquiries() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const open = params.get("open");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const qs = new URLSearchParams({ limit: "100", ...(status && { status }), ...(debounced && { q: debounced }) });
  const list = useApi<{ items: Enquiry[]; total: number }>(`/admin/enquiries?${qs}`);

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };

  return (
    <>
      <h1>Enquiries</h1>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by status">
          <button className={!status ? "on" : ""} onClick={() => setParam("status", null)}>All</button>
          {ENQUIRY_STATUSES.map((s) => (
            <button key={s} className={status === s ? "on" : ""} onClick={() => setParam("status", s)}>{label(s)}</button>
          ))}
        </div>
        <input type="search" placeholder="Search name, phone or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
      </div>
      <ErrorNote message={list.error} />
      {list.data && list.data.items.length === 0 && <Empty>No enquiries match. New ones from the website will show up here.</Empty>}
      {list.data && list.data.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Received</th><th>Name</th><th>Phone</th><th>Service</th><th>Wants</th><th>Status</th></tr></thead>
            <tbody>
              {list.data.items.map((e) => (
                <tr key={e.id} tabIndex={0} className="click" onClick={() => setParam("open", e.id)} onKeyDown={(k) => k.key === "Enter" && setParam("open", e.id)}>
                  <td>{fmtDate(e.createdAt)}</td>
                  <td><b>{e.name}</b></td>
                  <td>{e.phone}</td>
                  <td>{e.serviceLabel ?? "–"}</td>
                  <td>{fmtDate(e.preferredDate)}</td>
                  <td><Badge value={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <EnquiryModal id={open} onClose={() => setParam("open", null)} onChanged={list.reload} />}
    </>
  );
}

type Detail = {
  item: Enquiry;
  notes: { id: string; authorName: string; body: string; createdAt: string }[];
  client: Client | null;
  bookings: Booking[];
};

function EnquiryModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const { data, error, reload } = useApi<Detail>(`/admin/enquiries/${id}`);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      reload();
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  if (!data) return <Modal title="Enquiry" onClose={onClose}><ErrorNote message={error} />{!error && <p className="muted">Loading…</p>}</Modal>;
  const { item: e, notes, client, bookings } = data;
  const hello = `Hi ${e.name.split(" ")[0]}, thanks for your enquiry with The Nonty Experience${e.serviceLabel ? ` about ${e.serviceLabel}` : ""}.`;

  return (
    <Modal title={e.name} onClose={onClose}>
      <div className="detail">
        <dl>
          <dt>Phone</dt><dd><a href={`tel:${e.phone}`}>{e.phone}</a></dd>
          <dt>Email</dt><dd>{e.email ? <a href={`mailto:${e.email}`}>{e.email}</a> : "–"}</dd>
          <dt>Service</dt><dd>{e.serviceLabel ?? "–"}</dd>
          <dt>Preferred</dt><dd>{fmtDate(e.preferredDate)}{e.preferredTime ? `, ${e.preferredTime}` : ""}</dd>
          <dt>Occasion</dt><dd>{e.occasion ?? "–"}</dd>
          <dt>Received</dt><dd>{fmtDateTime(e.createdAt)}</dd>
        </dl>
        {e.details && <p className="quote">{e.details}</p>}

        <div className="actions">
          <select value={e.status} aria-label="Status" onChange={(ev) => run(() => api(`/admin/enquiries/${id}`, { method: "PATCH", body: { status: ev.target.value as EnquiryStatus } }))}>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <a className="btn" href={waLink(e.phone, hello)} target="_blank" rel="noopener noreferrer">Reply on WhatsApp</a>
          {!client && <button onClick={() => run(() => api(`/admin/enquiries/${id}/convert`, { method: "POST" }))}>Save as client</button>}
          {client && !booking && <button className="primary" onClick={() => setBooking(true)}>Create booking</button>}
        </div>
        <ErrorNote message={err} />

        {client && <p className="muted">Client record: {client.name}{bookings.length ? ` · ${bookings.length} booking${bookings.length > 1 ? "s" : ""} from this enquiry` : ""}</p>}
        {booking && client && (
          <section>
            <h3>New booking for {client.name}</h3>
            <BookingForm clientId={client.id} enquiryId={id} serviceId={e.serviceId} onSaved={() => { setBooking(false); reload(); onChanged(); }} />
          </section>
        )}

        <section>
          <h3>Notes</h3>
          <form className="inline" onSubmit={(ev) => { ev.preventDefault(); if (note.trim()) run(async () => { await api(`/admin/enquiries/${id}/notes`, { method: "POST", body: { body: note } }); setNote(""); }); }}>
            <input value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Add a note, e.g. quoted R179, waiting on photo" />
            <button>Add note</button>
          </form>
          <ul className="timeline">
            {notes.map((n) => (
              <li key={n.id}><span>{n.body}</span><small>{n.authorName} · {fmtDateTime(n.createdAt)}</small></li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
