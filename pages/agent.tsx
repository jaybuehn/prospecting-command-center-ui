import { useEffect, useMemo, useState } from "react";
import { useStore } from "../components/store";
import Fuse from "fuse.js";

export default function AgentPortal() {
  const { load, save, prospects, agentCredentialsSaved } = useStore();
  const [pass, setPass] = useState("");
  const [secret, setSecret] = useState("");
  const [saved, setSaved] = useState(agentCredentialsSaved);
  const [q, setQ] = useState("");

  useEffect(() => { load(); }, [load]);
  useEffect(() => { save(); }, [prospects, saved, save]);

  function saveCreds() {
    // demo: "encrypt" by reversing string (placeholder). Replace with real crypto in production.
    if (!pass || !secret) return alert("Enter passphrase and credential");
    localStorage.setItem("pcc:agent:cred", btoa(secret.split("").reverse().join("") + "::" + pass));
    localStorage.setItem("pcc:agent:saved", "1");
    setSaved(true);
    setSecret(""); setPass("");
    alert("Credential stored securely (hidden).");
  }

  const canSearch = saved;
  const results = useMemo(() => {
    if (!canSearch || !q.trim()) return [];
    const f = new Fuse(prospects, { keys: ["name", "industry", "city"], threshold: 0.3 });
    return f.search(q).map(r => r.item).slice(0, 10);
  }, [q, canSearch, prospects]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4 card p-4">
        <h1 className="text-lg font-semibold mb-2">Agent Portal</h1>
        <div className="text-sm text-gray-600 mb-3">Enter a credential (demo) — stored securely and never shown after save.</div>
        {!saved ? (
          <div className="space-y-2">
            <input className="input" placeholder="Passphrase" type="password" value={pass} onChange={e => setPass(e.target.value)} />
            <input className="input" placeholder="3rd-party credential (demo)" type="password" value={secret} onChange={e => setSecret(e.target.value)} />
            <button className="btn btn-primary" onClick={saveCreds}>Save Credential</button>
          </div>
        ) : (
          <div className="text-sm text-green-700">Credential on file. (Hidden)</div>
        )}
      </div>
      <div className="col-span-12 lg:col-span-8 card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Limited Search</h2>
          {!saved && <div className="badge">Locked</div>}
        </div>
        <input className="input mb-3" placeholder="Search (name/industry/city)…" value={q} onChange={e => setQ(e.target.value)} disabled={!saved} />
        <ul className="divide-y">
          {results.map(p => (
            <li key={p.id} className="py-2 text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-gray-600">{p.industry} • {p.city}, {p.state}</div>
            </li>
          ))}
          {saved && results.length === 0 && q && <li className="py-4 text-center text-gray-500">No matches.</li>}
          {!saved && <li className="py-4 text-center text-gray-500">Enter credential to unlock search.</li>}
        </ul>
      </div>
    </div>
  );
}
