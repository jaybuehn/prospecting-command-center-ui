import { useEffect, useMemo, useState } from "react";
import { useStore } from "../components/store";
import Fuse from "fuse.js";

export default function SignalsPage() {
  const { signals, prospects, load, save, linkSignal, ignoreSignal } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "linked" | "ignored">("new");
  useEffect(() => { load(); }, [load]);
  useEffect(() => { save(); }, [signals, prospects, save]);

  const list = useMemo(() => {
    let L = signals.slice();
    if (filter !== "all") L = L.filter(s => (s.status || "new") === filter);
    if (q.trim()) {
      const f = new Fuse(L, { keys: ["title", "source", "type"], threshold: 0.3 });
      L = f.search(q).map(r => r.item);
    }
    return L.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  }, [signals, q, filter]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Signals Inbox</h1>
        <div className="flex gap-2">
          <select className="input" value={filter} onChange={e => setFilter(e.target.value as any)}>
            <option value="new">New</option>
            <option value="linked">Linked</option>
            <option value="ignored">Ignored</option>
            <option value="all">All</option>
          </select>
          <input className="input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <ul className="divide-y">
        {list.map(sig => (
          <li key={sig.id} className="py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{sig.title}</div>
                <div className="text-xs text-gray-500">{sig.source} • {sig.publishedAt && new Date(sig.publishedAt).toLocaleString()}</div>
                <div className="text-sm">{sig.excerpt}</div>
              </div>
              <div className="flex gap-2">
                <select className="input" onChange={e => linkSignal(sig.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Link to prospect…</option>
                  {prospects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <button className="btn btn-outline" onClick={() => ignoreSignal(sig.id)}>Ignore</button>
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="py-6 text-center text-gray-500">No signals.</li>}
      </ul>
    </div>
  );
}
