import Papa from "papaparse";
import { useEffect, useState } from "react";
import { useStore, Prospect } from "../components/store";
import { v4 as uuid } from "uuid";

function mapRow(row: any): Prospect | null {
  const name = row.Name || row.name || row.Company || row.company;
  if (!name) return null;
  const p: Prospect = {
    id: uuid(),
    name,
    dba: row.DBA || row.dba || undefined,
    website: row.Website || row.website || undefined,
    naics: row.NAICS || row.naics || undefined,
    industry: row.Industry || row.industry || undefined,
    address: row.Address || row.address || undefined,
    city: row.City || row.city || undefined,
    state: row.State || row.state || undefined,
    zip: row.Zip || row.ZIP || row.zip || undefined,
    lat: row.Lat ? parseFloat(row.Lat) : (row.lat ? parseFloat(row.lat) : undefined),
    lon: row.Lon ? parseFloat(row.Lon) : (row.lon ? parseFloat(row.lon) : undefined),
    phone: row.Phone || row.phone || undefined,
    email: row.Email || row.email || undefined,
    score: row.Score ? parseInt(row.Score) : undefined,
    contacts: [], activities: [], files: [], signals: []
  };
  return p;
}

export default function UploadPage() {
  const { prospects, addProspects, save, load } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<any[]>([]);
  const [dupes, setDupes] = useState<number>(0);
  const [newRows, setNewRows] = useState<Prospect[]>([]);

  useEffect(() => { load(); }, [load]);

  function parse() {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data as any[]).map(mapRow).filter(Boolean) as Prospect[];
        setParsed(rows);
        // dedupe by name + zip
        const existingKeys = new Set(prospects.map(p => (p.name || "").toLowerCase() + "::" + (p.zip || "").toLowerCase()));
        const incomingKeys = new Set<string>();
        const uniques: Prospect[] = [];
        let d = 0;
        for (const r of rows) {
          const key = (r.name || "").toLowerCase() + "::" + (r.zip || "").toLowerCase();
          if (existingKeys.has(key) || incomingKeys.has(key)) { d++; continue; }
          incomingKeys.add(key);
          uniques.push(r);
        }
        setDupes(d);
        setNewRows(uniques);
      }
    });
  }

  function importRows() {
    addProspects(newRows);
    save();
    alert(`Imported ${newRows.length} prospect(s). Skipped ${dupes} duplicate(s).`);
    setFile(null); setParsed([]); setNewRows([]); setDupes(0);
  }

  return (
    <div className="card p-4">
      <h1 className="text-xl font-semibold mb-2">Upload Wizard</h1>
      <p className="text-sm text-gray-600 mb-4">CSV with headers like: Name, DBA, Website, NAICS, Industry, Address, City, State, Zip, Lat, Lon, Phone, Email, Score</p>
      <input className="mb-3" type="file" accept=".csv,text/csv" onChange={e => setFile(e.target.files?.[0] || null)} />
      <div className="flex gap-2">
        <button onClick={parse} className="btn btn-outline" disabled={!file}>Parse</button>
        <button onClick={importRows} className="btn btn-primary" disabled={newRows.length === 0}>Import</button>
      </div>
      {parsed.length > 0 && (
        <div className="mt-4">
          <div className="text-sm mb-2">Preview: {parsed.length} rows parsed. {dupes} duplicate(s) detected. {newRows.length} to import.</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">NAICS</th><th className="py-2 pr-4">City</th><th className="py-2 pr-4">Score</th></tr></thead>
              <tbody>
                {newRows.slice(0, 10).map(r => (
                  <tr key={r.id} className="border-t"><td className="py-2 pr-4">{r.name}</td><td className="py-2 pr-4">{r.naics}</td><td className="py-2 pr-4">{r.city}</td><td className="py-2 pr-4">{r.score ?? "-"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
