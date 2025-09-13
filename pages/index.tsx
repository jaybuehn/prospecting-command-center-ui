import { useEffect, useMemo, useState } from "react";
import { useStore } from "../components/store";
import { milesBetween, KNOWN_CENTERS } from "../components/geo";
import Fuse from "fuse.js";
import Link from "next/link";

export default function SearchPage() {
  const { prospects, load, save } = useStore();
  const [keyword, setKeyword] = useState("");
  const [naics, setNaics] = useState("");
  const [centerIdx, setCenterIdx] = useState(0);
  const [radius, setRadius] = useState(25);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { save(); }, [prospects, save]);

  const results = useMemo(() => {
    let data = prospects.slice();
    if (naics) data = data.filter(p => (p.naics || "").startsWith(naics));
    // radius filter
    const center = KNOWN_CENTERS[centerIdx];
    data = data.filter(p => (p.lat && p.lon) ? milesBetween(center.lat, center.lon, p.lat!, p.lon!) <= radius : true);

    if (keyword.trim()) {
      const fuse = new Fuse(data, { keys: ["name", "dba", "industry", "city", "state"], threshold: 0.3 });
      return fuse.search(keyword).map(r => r.item);
    }
    return data;
  }, [prospects, keyword, naics, centerIdx, radius]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-3 card p-4 h-fit sticky top-4">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <label className="label">Keyword</label>
        <input className="input mb-3" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Company, industry, city..." />
        <label className="label">NAICS (prefix ok)</label>
        <input className="input mb-3" value={naics} onChange={e => setNaics(e.target.value)} placeholder="e.g., 333, 722511" />
        <label className="label">Center</label>
        <select className="input mb-3" value={centerIdx} onChange={e => setCenterIdx(parseInt(e.target.value))}>
          {KNOWN_CENTERS.map((c, i) => (<option key={i} value={i}>{c.label}</option>))}
        </select>
        <label className="label">Radius (miles)</label>
        <input className="input mb-3" type="number" min={1} max={100} value={radius} onChange={e => setRadius(parseInt(e.target.value) || 1)} />
        <div className="text-xs text-gray-500">Showing {results.length} result(s)</div>
      </aside>
      <section className="col-span-12 lg:col-span-9">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">Prospects</h1>
            <Link className="btn btn-outline" href="/upload">Import CSV</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">NAICS</th>
                <th className="py-2 pr-4">Industry</th>
                <th className="py-2 pr-4">City</th>
                <th className="py-2 pr-4">Score</th>
              </tr></thead>
              <tbody>
                {results.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 pr-4"><Link href={`/prospect/${p.id}`} className="text-brand-600 hover:underline">{p.name}</Link></td>
                    <td className="py-2 pr-4">{p.naics}</td>
                    <td className="py-2 pr-4">{p.industry}</td>
                    <td className="py-2 pr-4">{p.city}, {p.state}</td>
                    <td className="py-2 pr-4">{p.score ?? "-"}</td>
                  </tr>
                ))}
                {results.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No results. Try widening your filters or import data.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
