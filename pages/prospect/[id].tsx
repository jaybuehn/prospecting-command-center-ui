import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../components/store";

export default function ProspectDetail() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const { prospects, signals, load, save } = useStore();
  const [tab, setTab] = useState<"profile" | "activities" | "files" | "signals">("profile");
  useEffect(() => { load(); }, [load]);
  const p = useMemo(() => prospects.find(x => x.id === id), [prospects, id]);
  useEffect(() => { save(); }, [prospects, signals, save]);
  if (!p) return <div className="card p-6">Prospect not found.</div>;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8">
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{p.name}</h1>
            <div className="badge">Score {p.score ?? "-"}</div>
          </div>
          <div className="text-sm text-gray-600">{p.industry} • NAICS {p.naics}</div>
          <div className="mt-2 text-sm">{p.address}, {p.city}, {p.state} {p.zip}</div>
          {p.website && <a className="text-brand-600 text-sm" href={p.website} target="_blank" rel="noreferrer">{p.website}</a>}
        </div>

        <div className="card p-4">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setTab("profile")} className={`tab ${tab === "profile" ? "tab-active" : ""}`}>Profile</button>
            <button onClick={() => setTab("activities")} className={`tab ${tab === "activities" ? "tab-active" : ""}`}>Activities</button>
            <button onClick={() => setTab("files")} className={`tab ${tab === "files" ? "tab-active" : ""}`}>Files</button>
            <button onClick={() => setTab("signals")} className={`tab ${tab === "signals" ? "tab-active" : ""}`}>Signals</button>
          </div>
          {tab === "profile" && (
            <div className="space-y-4">
              <div>
                <div className="label">Contacts</div>
                <ul className="list-disc pl-6 text-sm">
                  {(p.contacts || []).map((c, i) => (<li key={i}><span className="font-medium">{c.name}</span> – {c.title} • {c.email || c.phone}</li>))}
                </ul>
              </div>
              <div>
                <div className="label">Suggested Products</div>
                <ul className="list-disc pl-6 text-sm">
                  {/* naive suggestions based on industry */}
                  {p.naics?.startsWith("333") && <li>Equipment Financing (asset-intensive manufacturing)</li>}
                  {p.naics?.startsWith("722") && <li>Working Capital Line of Credit (seasonality for restaurants)</li>}
                  <li>Treasury Management (payments & cash concentration)</li>
                </ul>
              </div>
              <div>
                <div className="label">Call Script (auto)</div>
                <div className="p-3 bg-gray-50 rounded-xl text-sm">
                  {(() => {
                    const contactName = p.contacts?.[0]?.name ?? "there";
                    const industry = p.industry?.toLowerCase() ?? "your industry";
                    return `Hi ${contactName}, this is your loan officer from First Mid. I noticed your work in ${industry}. Many peers benefit from flexible financing like a line of credit and treasury tools. Would you be open to a quick chat this week?`;
                  })()}
                </div>
              </div>
            </div>
          )}
          {tab === "activities" && (
            <div>
              <ul className="divide-y text-sm">
                {(p.activities || []).map((a, i) => (
                  <li key={i} className="py-2"><span className="badge mr-2">{a.type}</span>
                    <span className="text-gray-500">{new Date(a.ts).toLocaleString()}</span> – {a.content}</li>
                ))}
                {(!p.activities || p.activities.length === 0) && <li className="py-6 text-gray-500">No activity yet.</li>}
              </ul>
            </div>
          )}
          {tab === "files" && (
            <div>
              <ul className="list-disc pl-6 text-sm">
                {(p.files || []).map((f, i) => (<li key={i}><a className="text-brand-600" href={f.url || "#"}>{f.name}</a></li>))}
                {(!p.files || p.files.length === 0) && <li className="text-gray-500">No files attached.</li>}
              </ul>
            </div>
          )}
          {tab === "signals" && (
            <div className="space-y-3">
              {signals.filter(s => (s.prospectId === p.id) || (p.signals || []).includes(s.id)).map(s => (
                <div key={s.id} className="p-3 rounded-xl bg-gray-50">
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.source} • {s.publishedAt && new Date(s.publishedAt).toLocaleDateString()}</div>
                  <div className="text-sm">{s.excerpt}</div>
                </div>
              ))}
              {signals.filter(s => (s.prospectId === p.id) || (p.signals || []).includes(s.id)).length === 0 && <div className="text-gray-500 text-sm">No signals linked.</div>}
            </div>
          )}
        </div>
      </div>
      <aside className="col-span-12 lg:col-span-4">
        <div className="card p-4">
          <div className="label mb-2">Quick Actions</div>
          <button className="btn btn-primary mb-2">Add Task</button>
          <button className="btn btn-outline">Log Note</button>
        </div>
      </aside>
    </div>
  );
}
