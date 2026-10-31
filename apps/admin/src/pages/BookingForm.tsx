import { useState, type FormEvent } from "react";
import { api, useApi } from "../api";
import { ErrorNote, Field, fromCents, toCents } from "../ui";
import type { Client, Service } from "../types";

type Props = { clientId?: string; enquiryId?: string; serviceId?: string | null; onSaved: () => void };

export default function BookingForm({ clientId, enquiryId, serviceId, onSaved }: Props) {
  const services = useApi<{ items: Service[] }>("/admin/services");
  const clients = useApi<{ items: Client[] }>(clientId ? null : "/admin/clients?limit=200");
  const [svc, setSvc] = useState<string>(serviceId ?? "");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pickService(id: string) {
    setSvc(id);
    const s = services.data?.items.find((x) => x.id === id);
    if (s) setPrice(fromCents(s.priceCents));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/admin/bookings", {
        method: "POST",
        body: {
          clientId: clientId ?? f.get("clientId"),
          enquiryId: enquiryId ?? null,
          serviceId: svc || null,
          startsAt: new Date(String(f.get("startsAt"))).toISOString(), // datetime-local is the browser's local time
          durationMins: Number(f.get("durationMins")) || 60,
          location: f.get("location"),
          priceCents: toCents(price) ?? 0,
          depositCents: toCents(String(f.get("deposit"))) ?? 0,
          status: f.get("status"),
          notes: f.get("notes"),
        },
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid" onSubmit={submit}>
      {!clientId && (
        <Field label="Client" wide>
          <select name="clientId" required defaultValue="">
            <option value="" disabled>Choose a client…</option>
            {clients.data?.items.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </select>
        </Field>
      )}
      <Field label="Service">
        <select value={svc} onChange={(e) => pickService(e.target.value)}>
          <option value="">Custom / other</option>
          {services.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Date and time"><input name="startsAt" type="datetime-local" required /></Field>
      <Field label="Duration (minutes)"><input name="durationMins" type="number" min={15} step={15} defaultValue={60} /></Field>
      <Field label="Status">
        <select name="status" defaultValue="pending">
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </Field>
      <Field label="Price (R)"><input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
      <Field label="Deposit paid (R)"><input name="deposit" inputMode="decimal" defaultValue="0" /></Field>
      <Field label="Location" wide><input name="location" placeholder="Where the appointment takes place" /></Field>
      <Field label="Notes" wide><textarea name="notes" rows={2} /></Field>
      <div className="wide"><ErrorNote message={error} /></div>
      <div className="wide actions"><button className="primary" disabled={busy}>{busy ? "Saving…" : "Save booking"}</button></div>
    </form>
  );
}
