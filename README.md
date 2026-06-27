# OmniLife OS

Personal operating system dashboard built with Next.js, React, Prisma, and shadcn-style UI primitives. Current workflows cover a dashboard shell, project tracking, finance transaction capture, and placeholder sections for calendar, events, skills, hobbies, and settings.

## Requirements

- Node.js compatible with Next.js 16
- npm
- Optional: PostgreSQL database URL for persistent Prisma data

The app includes a local fallback database client so it can build and render without `DATABASE_URL`. Server actions that create records require a configured database to persist data.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For persistence, create `.env.local` with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
OMNILIFE_DEFAULT_EMAIL="you@example.com"
```

Then generate Prisma artifacts and apply schema changes with the Prisma workflow used for your environment.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Key Paths

- `src/app/` - route pages and global styles.
- `src/components/layout/` - app shell, sidebar, and command palette.
- `src/components/ui/` - reusable UI primitives.
- `src/lib/db.ts` - Prisma client with build-safe fallback.
- `src/lib/omni-actions.ts` - server actions for projects and finance entries.
- `prisma/schema.prisma` - current data model.

## Validation

```bash
npm run lint
npm run build
```
