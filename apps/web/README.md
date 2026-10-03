# Blueprint Web

The Next.js frontend for Blueprint. It provides the authenticated dashboard, visual form builder, response and analytics views, and public responder experience.

## Run locally

Install dependencies from the repository root and start the full development stack:

```bash
pnpm install
pnpm dev
```

The web app runs at `http://localhost:3000`. The API must be available at `http://localhost:4000` unless another URL is configured.

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commands

Run these from the repository root:

```bash
pnpm --filter @repo/web dev
pnpm --filter @repo/web build
pnpm --filter @repo/web lint
```

## Main routes

- `/dashboard` lists and creates forms.
- `/forms/[id]` manages a form and its availability.
- `/forms/[id]/builder` edits questions and logical branching.
- `/forms/[id]/responses` reviews submitted responses.
- `/forms/[id]/analytics` shows form analytics.
- `/f/[publicId]` renders the published responder flow.

Shared API calls and React Query hooks live in `src/features/forms`. Builder UI and flow serialization live in `src/components/builder`. Shared form types used by the frontend live in `src/lib/forms` and `@repo/validators`.

For database, API, Redis, and deployment setup, see the repository [README](../../README.md).
