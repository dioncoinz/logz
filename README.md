# Logz

Logz is a QR-based asset logging MVP built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

It supports:

- Registering assets with readable asset codes
- Generating unique QR values
- Viewing and downloading QR codes
- Scanning QR tags on mobile
- Checking assets in and out
- Writing every movement to an audit log
- Viewing a dashboard of asset status and recent activity

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- `html5-qrcode`
- `qrcode`

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Setup

Run these SQL files in Supabase:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` dashboard
- `/assets` assets list
- `/assets/new` register asset
- `/assets/[id]` asset detail and QR code
- `/scan` scan and movement workflow
- `/logs` audit history

## Extension Points

- `src/app/actions.ts` for mutations
- `src/lib/data.ts` for data access
- `src/lib/asset-code.ts` for code generation
- `src/types/database.ts` for schema growth

