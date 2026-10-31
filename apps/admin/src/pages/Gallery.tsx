import { MEDIA_CATEGORIES, type MediaCategory } from "@nonty/shared";
import { useRef, useState } from "react";
import { api, useApi } from "../api";
import { Empty, ErrorNote, label } from "../ui";
import type { MediaItem } from "../types";

type Job = { name: string; state: "uploading" | "done" | string };

async function dimensions(file: File) {
  try {
    const bmp = await createImageBitmap(file);
    const d = { width: bmp.width, height: bmp.height };
    bmp.close();
    return d;
  } catch {
    return {}; // e.g. browser can't decode AVIF – dimensions are optional
  }
}

export default function Gallery() {
  const { data, error, reload } = useApi<{ items: MediaItem[] }>("/admin/media");
  const [category, setCategory] = useState<MediaCategory>("natural");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const setJob = (name: string, state: Job["state"]) => setJobs((j) => j.map((x) => (x.name === name ? { ...x, state } : x)));

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setJobs(list.map((f) => ({ name: f.name, state: "uploading" })));
    for (const file of list) {
      try {
        const { key, uploadUrl, headers } = await api<{ key: string; uploadUrl: string; headers: Record<string, string> }>("/admin/media/presign", {
          method: "POST",
          body: { filename: file.name, contentType: file.type, size: file.size },
        });
        const put = await fetch(uploadUrl, { method: "PUT", headers, body: file });
        if (!put.ok) throw new Error(`Upload to storage failed (${put.status}). Check the bucket's CORS settings.`);
        await api("/admin/media", { method: "POST", body: { key, category, ...(await dimensions(file)) } });
        setJob(file.name, "done");
      } catch (e) {
        setJob(file.name, (e as Error).message);
      }
    }
    if (input.current) input.current.value = "";
    reload();
  }

  const patch = async (id: string, body: object) => {
    setErr(null);
    try { await api(`/admin/media/${id}`, { method: "PATCH", body }); reload(); } catch (e) { setErr((e as Error).message); }
  };
  const remove = async (m: MediaItem) => {
    if (!confirm("Delete this photo permanently?")) return;
    try { await api(`/admin/media/${m.id}`, { method: "DELETE" }); reload(); } catch (e) { setErr((e as Error).message); }
  };

  return (
    <>
      <h1>Gallery</h1>
      <p className="muted">New uploads stay hidden until you switch on “Show on website”. Only publish photos you have the client's permission to use, and add a short description for accessibility.</p>

      <div className="toolbar">
        <label className="field inline-field"><span>Category for new photos</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as MediaCategory)}>
            {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
          </select>
        </label>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => upload(e.target.files)} aria-label="Upload photos" />
      </div>

      {jobs.length > 0 && (
        <ul className="jobs">{jobs.map((j) => <li key={j.name}>{j.name}: {j.state === "uploading" ? "uploading…" : j.state === "done" ? "uploaded" : <span className="error">{j.state}</span>}</li>)}</ul>
      )}
      <ErrorNote message={error ?? err} />
      {data && data.items.length === 0 && <Empty>No photos yet. Upload your first look above.</Empty>}

      <div className="gallery">
        {data?.items.map((m) => (
          <figure key={m.id} className={m.published ? "" : "hidden-item"}>
            <img src={m.url} alt={m.alt} loading="lazy" />
            <figcaption>
              <input defaultValue={m.alt} placeholder="Describe the photo" aria-label="Description" onBlur={(e) => e.target.value !== m.alt && patch(m.id, { alt: e.target.value })} />
              <select value={m.category} aria-label="Category" onChange={(e) => patch(m.id, { category: e.target.value })}>
                {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
              </select>
              <div className="row">
                <label className="check"><input type="checkbox" checked={m.published} onChange={(e) => patch(m.id, { published: e.target.checked })} /> Show on website</label>
                <button className="ghost danger" onClick={() => remove(m)}>Delete</button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
