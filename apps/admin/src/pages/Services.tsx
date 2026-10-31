import { useState } from "react";
import { api, useApi } from "../api";
import { ErrorNote, fromCents, Modal, Field, toCents } from "../ui";
import type { Service } from "../types";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Services() {
  const { data, error, reload } = useApi<{ items: Service[] }>("/admin/services");
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="head"><h1>Services</h1><button className="primary" onClick={() => setAdding(true)}>Add service</button></div>
      <p className="muted">These appear on the website. Confirm prices before launch. Show an “original price” only while a promotion is genuinely running.</p>
      <ErrorNote message={error} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Price (R)</th><th>Original price (R)</th><th>Note</th><th>Order</th><th>Shown</th><th /></tr></thead>
          <tbody>{data?.items.map((s) => <Row key={s.id} s={s} onChanged={reload} />)}</tbody>
        </table>
      </div>
      {adding && <AddModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />}
    </>
  );
}

function Row({ s, onChanged }: { s: Service; onChanged: () => void }) {
  const [v, setV] = useState({ name: s.name, price: fromCents(s.priceCents), was: fromCents(s.compareAtCents), note: s.priceNote ?? "", order: String(s.sortOrder), active: s.active });
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle");
  const set = (k: keyof typeof v, val: string | boolean) => { setV({ ...v, [k]: val }); setState("idle"); };

  async function save() {
    setState("saving");
    try {
      await api(`/admin/services/${s.id}`, {
        method: "PATCH",
        body: { name: v.name, priceCents: toCents(v.price), compareAtCents: toCents(v.was), priceNote: v.note || undefined, sortOrder: Number(v.order) || 0, active: v.active },
      });
      setState("saved");
      onChanged();
    } catch (e) { setState((e as Error).message); }
  }
  async function remove() {
    if (!confirm(`Delete ${s.name}? Past enquiries keep the name they chose.`)) return;
    try { await api(`/admin/services/${s.id}`, { method: "DELETE" }); onChanged(); } catch (e) { setState((e as Error).message); }
  }

  return (
    <tr>
      <td><input value={v.name} onChange={(e) => set("name", e.target.value)} aria-label="Name" /></td>
      <td><input className="num" inputMode="decimal" value={v.price} onChange={(e) => set("price", e.target.value)} aria-label="Price" /></td>
      <td><input className="num" inputMode="decimal" value={v.was} onChange={(e) => set("was", e.target.value)} aria-label="Original price" /></td>
      <td><input value={v.note} onChange={(e) => set("note", e.target.value)} aria-label="Note" /></td>
      <td><input className="num" type="number" value={v.order} onChange={(e) => set("order", e.target.value)} aria-label="Order" /></td>
      <td><input type="checkbox" checked={v.active} onChange={(e) => set("active", e.target.checked)} aria-label="Shown on website" /></td>
      <td className="row-actions">
        <button onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save"}</button>
        <button className="ghost danger" onClick={remove}>Delete</button>
        {state !== "idle" && state !== "saving" && state !== "saved" && <small className="error">{state}</small>}
      </td>
    </tr>
  );
}

function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  return (
    <Modal title="Add service" onClose={onClose}>
      <form className="grid" onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = String(f.get("name"));
        try {
          await api("/admin/services", { method: "POST", body: { name, slug: slugify(name), description: f.get("description"), priceCents: toCents(String(f.get("price"))), active: true, sortOrder: 100 } });
          onSaved();
        } catch (x) { setErr((x as Error).message); }
      }}>
        <Field label="Name"><input name="name" required /></Field>
        <Field label="Price (R)"><input name="price" inputMode="decimal" /></Field>
        <Field label="Short description" wide><input name="description" /></Field>
        <div className="wide"><ErrorNote message={err} /></div>
        <div className="wide actions"><button className="primary">Add service</button></div>
      </form>
    </Modal>
  );
}
