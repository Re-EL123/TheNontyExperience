import { BOOKING_STATUSES } from "@nonty/shared";
import { useState } from "react";
import { api, useApi } from "../api";
import { Badge, Empty, ErrorNote, fmtDateTime, label, Modal, zar } from "../ui";
import type { Booking } from "../types";
import BookingForm from "./BookingForm";

export default function Bookings() {
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { data, error, reload } = useApi<{ items: Booking[] }>(`/admin/bookings?limit=100${status ? `&status=${status}` : ""}`);

  const act = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try { await fn(); reload(); } catch (e) { setErr((e as Error).message); }
  };

  return (
    <>
      <div className="head"><h1>Bookings</h1><button className="primary" onClick={() => setAdding(true)}>New booking</button></div>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by status">
          <button className={!status ? "on" : ""} onClick={() => setStatus("")}>All</button>
          {BOOKING_STATUSES.map((s) => <button key={s} className={status === s ? "on" : ""} onClick={() => setStatus(s)}>{label(s)}</button>)}
        </div>
      </div>
      <ErrorNote message={error ?? err} />
      {data && data.items.length === 0 && <Empty>No bookings yet. Create one here, or from an enquiry once you've agreed the details.</Empty>}
      {data && data.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>When</th><th>Client</th><th>Service</th><th>Price</th><th>Deposit</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.items.map((b) => (
                <tr key={b.id}>
                  <td>{fmtDateTime(b.startsAt)}</td>
                  <td><b>{b.clientName}</b><br /><small className="muted">{b.clientPhone}</small></td>
                  <td>{b.serviceName ?? "Custom"}</td>
                  <td>{zar(b.priceCents)}</td>
                  <td>{zar(b.depositCents)}</td>
                  <td>
                    <select value={b.status} aria-label="Status" onChange={(e) => act(() => api(`/admin/bookings/${b.id}`, { method: "PATCH", body: { status: e.target.value } }))}>
                      {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                  </td>
                  <td><button className="ghost danger" onClick={() => confirm(`Delete this booking for ${b.clientName}?`) && act(() => api(`/admin/bookings/${b.id}`, { method: "DELETE" }))}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adding && (
        <Modal title="New booking" onClose={() => setAdding(false)}>
          <BookingForm onSaved={() => { setAdding(false); reload(); }} />
        </Modal>
      )}
    </>
  );
}
