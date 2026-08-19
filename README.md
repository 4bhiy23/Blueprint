# Blueprint

Blueprint is a full-stack form builder for creating, publishing, and analysing forms. It supports a visual question-flow builder, public response links, response exports, availability controls, and analytics.

## Stack

- Next.js and React for the web application
- Express for the API
- PostgreSQL with Drizzle ORM and Neon
- Better Auth for authentication
- pnpm workspaces and Turborepo for the monorepo

## Repository structure

```text
apps/
  api/       Express API and Swagger documentation
  web/       Next.js application
packages/
  db/        Drizzle schema and migrations
  env/       Environment validation
  logger/    Shared logging
  validators/ Shared API and form validation schemas
```

## Prerequisites

- Node.js 22 or later
- pnpm 11
- A PostgreSQL database (Neon is recommended)

## Local setup

Install dependencies from the repository root:

```bash
pnpm install
```

Create local environment files from the provided examples.

`apps/api/.env`

```env
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=development
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

`apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`packages/db/.env`

```env
DATABASE_URL=postgresql://...
```

Apply the database schema, then start both applications:

```bash
pnpm --filter @repo/db push
pnpm dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:4000`.

## Useful commands

```bash
pnpm dev                         # Start all workspace development servers
pnpm typecheck                   # Typecheck all workspace packages
pnpm lint                        # Lint all workspace packages
pnpm build                       # Build all workspace packages
pnpm --filter @repo/api lint     # Lint the API only
pnpm --filter @repo/web lint     # Lint the web app only
pnpm --filter @repo/db generate  # Generate Drizzle migrations
pnpm --filter @repo/db push      # Apply schema changes to a database
```

## API documentation

When the API is running, Swagger UI is available at:

```text
http://localhost:4000/api-docs
```

The OpenAPI document is available at `http://localhost:4000/api-docs.json`.

## Form availability

Published forms can be configured with:

- an opening date/time
- an expiry date/time
- a maximum response count
- one response per responder or multiple responses

Availability is calculated at request time, so no cron job is required for a form to become available, expire, or close after reaching its response limit.

## Deployment

Use a separate deployment for each app:

- Deploy `apps/web` to Vercel.
- Deploy the Express API to Render or another persistent Node.js host.
- Use Neon for PostgreSQL.

In production, set `FRONTEND_URL` to the exact web origin and set `BETTER_AUTH_URL` to the API origin. The frontend's `NEXT_PUBLIC_API_URL` must point to that API origin. Run database migrations before deploying code that depends on a schema change.

## Contributing

Run `pnpm typecheck` and `pnpm lint` before opening a pull request. Update Swagger documentation whenever an API route, request shape, response shape, or status code changes.
