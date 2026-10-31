import { ENQUIRY_STATUSES } from "@nonty/shared";
import { Link } from "react-router-dom";
import { useApi } from "../api";
import { Empty, ErrorNote, fmtDate, fmtDateTime, label, zar } from "../ui";
import type { Booking, Enquiry } from "../types";

type Data = {
  byStatus: { status: string; n: number }[];
  enquiriesThisWeek: number;
  upcoming: Booking[];
  latestNew: Enquiry[];
};

export default function Dashboard() {
  const { data, error } = useApi<Data>("/admin/dashboard");
  if (error) return <ErrorNote message={error} />;
  if (!data) return <p className="muted">Loading…</p>;

  const counts = Object.fromEntries(data.byStatus.map((r) => [r.status, r.n]));
  const max = Math.max(1, ...ENQUIRY_STATUSES.map((s) => counts[s] ?? 0));

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">{data.enquiriesThisWeek} new enquiries in the last 7 days.</p>

      {/* The pipeline is the one thing worth seeing at a glance: where every enquiry currently sits. */}
      <section className="pipeline" aria-label="Enquiry pipeline">
        {ENQUIRY_STATUSES.map((s) => (
          <Link key={s} to={`/enquiries?status=${s}`} className="stage">
            <strong>{counts[s] ?? 0}</strong>
            <span>{label(s)}</span>
            <i style={{ height: `${Math.max(6, ((counts[s] ?? 0) / max) * 100)}%` }} />
          </Link>
        ))}
      </section>

      <div className="cols">
        <section>
          <h2>Waiting for a reply</h2>
          {data.latestNew.length === 0 ? (
            <Empty>No new enquiries. You're all caught up.</Empty>
          ) : (
            <ul className="list">
              {data.latestNew.map((e) => (
                <li key={e.id}>
                  <Link to={`/enquiries?open=${e.id}`}>
                    <b>{e.name}</b> <span className="muted">{e.serviceLabel ?? "No service chosen"}</span>
                    <small>{fmtDate(e.createdAt)}</small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Next 14 days</h2>
          {data.upcoming.length === 0 ? (
            <Empty>No bookings coming up.</Empty>
          ) : (
            <ul className="list">
              {data.upcoming.map((b) => (
                <li key={b.id}>
                  <Link to="/bookings">
                    <b>{b.clientName}</b> <span className="muted">{b.serviceName ?? "Custom"} · {zar(b.priceCents)}</span>
                    <small>{fmtDateTime(b.startsAt)}</small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
