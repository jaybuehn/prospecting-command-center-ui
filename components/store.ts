import { create } from "zustand";

export type Prospect = {
  id: string;
  name: string;
  dba?: string;
  website?: string;
  naics?: string;
  industry?: string;
  size?: string;
  founded?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  phone?: string;
  email?: string;
  score?: number;
  contacts?: { name: string; title?: string; email?: string; phone?: string; linkedin?: string }[];
  activities?: { ts: string; type: string; content: string; user?: string }[];
  files?: { name: string; url?: string }[];
  signals?: number[]; // ids into signals list
};

export type Signal = {
  id: number;
  title: string;
  source: string;
  url?: string;
  type?: string;
  publishedAt?: string;
  excerpt?: string;
  prospectId?: string; // linked prospect
  status?: "new" | "linked" | "ignored";
};

type State = {
  prospects: Prospect[];
  signals: Signal[];
  agentCredentialsSaved: boolean;
  save: () => void;
  load: () => void;
  addProspects: (rows: Prospect[]) => void;
  setProspects: (rows: Prospect[]) => void;
  linkSignal: (signalId: number, prospectId: string) => void;
  ignoreSignal: (signalId: number) => void;
};

const KEY = "pcc:data:v1";

export const useStore = create<State>((set, get) => ({
  prospects: [],
  signals: [],
  agentCredentialsSaved: false,
  save: () => {
    const { prospects, signals, agentCredentialsSaved } = get();
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify({ prospects, signals, agentCredentialsSaved }));
  },
  load: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        set({ prospects: parsed.prospects || [], signals: parsed.signals || [], agentCredentialsSaved: !!parsed.agentCredentialsSaved });
      } catch {
        // if parse fails, ignore and use defaults
      }
    } else {
      // seed minimal demo data
      const prospects: Prospect[] = [
        {
          id: "p1",
          name: "Acme Manufacturing, Inc.",
          website: "https://example.com",
          naics: "333120",
          industry: "Construction Machinery Manufacturing",
          size: "120 employees",
          founded: 1998,
          address: "123 Industrial Dr",
          city: "Effingham",
          state: "IL",
          zip: "62401",
          lat: 39.1203, lon: -88.5434,
          phone: "(217) 555-0199",
          email: "info@acmemfg.com",
          score: 78,
          contacts: [{ name: "Jane Miller", title: "CFO", email: "jane@acmemfg.com" }],
          activities: [{ ts: new Date(Date.now() - 86400000).toISOString(), type: "note", content: "Met at Chamber luncheon." }],
          files: [{ name: "Company Overview.pdf" }],
          signals: [1]
        },
        {
          id: "p2",
          name: "Jenny's Diner LLC",
          dba: "Jenny's Diner",
          naics: "722511",
          industry: "Full-Service Restaurants",
          size: "35 employees",
          founded: 2012,
          address: "45 Main St",
          city: "Effingham",
          state: "IL",
          zip: "62401",
          lat: 39.1217, lon: -88.5421,
          phone: "(217) 555-0123",
          score: 64,
          contacts: [{ name: "Jennifer Lee", title: "Owner", email: "jennifer@example.com" }],
          activities: [{ ts: new Date(Date.now() - 172800000).toISOString(), type: "call", content: "Left voicemail about LOC." }],
          files: [],
          signals: [2]
        }
      ];
      const signals: Signal[] = [
        { id: 1, title: "Acme Manufacturing breaks ground on 20k sq ft expansion", source: "Effingham Daily", type: "expansion", publishedAt: new Date().toISOString(), excerpt: "Acme announced a new facility expansion...", status: "new" },
        { id: 2, title: "Ribbon cutting: Jenny's Diner opens patio", source: "Chamber News", type: "ribbon_cutting", publishedAt: new Date().toISOString(), excerpt: "Chamber welcomes Jenny's new patio...", status: "new" }
      ];
      set({ prospects, signals });
      get().save();
    }
  },
  addProspects: (rows) => set((s) => ({ prospects: [...s.prospects, ...rows] })),
  setProspects: (rows) => set({ prospects: rows }),
  linkSignal: (signalId, prospectId) => set((s) => ({
    signals: s.signals.map(sig => sig.id === signalId ? { ...sig, status: "linked", prospectId } : sig),
    prospects: s.prospects.map(p => p.id === prospectId ? { ...p, signals: Array.from(new Set([...(p.signals || []), signalId])) } : p)
  })),
  ignoreSignal: (signalId) => set((s) => ({ signals: s.signals.map(sig => sig.id === signalId ? { ...sig, status: "ignored" } : sig) }))
}));
