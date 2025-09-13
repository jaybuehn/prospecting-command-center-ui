# Prospecting Command Center (Prototype)

A Next.js + Tailwind clickable prototype that implements:
- Search & Results (keyword, NAICS prefix, center+radius)
- Prospect Detail (tabs: Profile, Activities, Files, Signals)
- Daily Signals Inbox (link / ignore)
- Agent Portal (credential vault demo + limited search)
- Upload Wizard (CSV import with dedupe preview)

**Data** is stored client-side (localStorage) for easy demo. Import your own CSV to avoid fake companies.

## Quick Start (Local)

1. Install Node.js 18+
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo into Vercel.
3. Click Deploy. (No env vars required for the client-side demo.)

## CSV Format

Include headers like:

```
Name,DBA,Website,NAICS,Industry,Address,City,State,Zip,Lat,Lon,Phone,Email,Score
```
If you provide `Lat`/`Lon`, the center+radius filter will work precisely. If not, records will appear without radius filtering.

## Notes

- This is a front-end prototype. For a production MVP, wire to PostgreSQL/PostGIS and a background worker (BullMQ) and move data/server logic to API routes.
- The Agent Portal's credential vault is a demo only; replace with a real secrets manager for production.
