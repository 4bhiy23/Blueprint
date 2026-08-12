# Current Architecture

## Monorepo layout

```text
apps/
  api/       Express API
  web/       Next.js application
packages/
  db/        Drizzle schema, migrations, Neon connection
  env/       API environment validation
  logger/    Pino logger
  validators/ Shared Zod schemas and domain constants
context/     AI and contributor context
```

## API layering

The API follows this flow:

`route -> controller -> service -> Drizzle database`

- Routes define URLs and attach `requireAuth` for owner-only resources.
- Controllers read parameters, validate request bodies with shared Zod schemas, map expected failures to HTTP responses, and delegate business work.
- Services own authorization queries, transactions, graph validation, and persistence.
- Database access is through the `@repo/db` Drizzle client, backed by the `neon-serverless` WebSocket driver so `db.transaction` is available.

The public form route deliberately bypasses `requireAuth`, but only returns forms whose status is `published`.

## API v2

The Express app mounts all application routes under `/api/v2`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Health check |
| POST | `/forms` | Yes | Create a draft form |
| GET | `/forms` | Yes | List the caller’s forms |
| GET | `/forms/:id` | Yes | Get owner form data and ordered questions/options |
| PATCH | `/forms/:id` | Yes | Update title, description, or status |
| DELETE | `/forms/:id` | Yes | Delete an owned form |
| POST | `/forms/:id/duplicate` | Yes | Deep-copy form content |
| GET | `/forms/:id/builder` | Yes | Get persisted builder nodes, edges, and viewport |
| PUT | `/forms/:id/builder` | Yes | Transactionally replace builder graph and options |
| GET | `/public/forms/:publicId` | No | Get an ordered published questionnaire for responders |
| POST | `/public/forms/:publicId/responses` | No | Submit a response to a published form |

Swagger is served at `/api-docs`; its JSON is at `/api-docs.json`.

## Form persistence model

```text
user 1---* forms 1---* questions 1---* question_options
                         |
                         *---* question_edges (within the same form)

forms 1---* responses 1---* answers
questions 1---* answers
```

The API currently writes builder state as a form aggregate. A save validates IDs and a single connected, acyclic path, derives `firstQuestionId` and question `orderIndex`, then transactionally updates questions, options, edges, and viewport.

`orderIndex` remains an internal derived field. Public responders receive an already sorted `questions` array; they do not need graph edges or an `orderIndex` field.

## Frontend model

- Dashboard and form-management pages are client components.
- The dashboard uses `apiFetch` in `apps/web/src/lib/api.ts` for API v2 calls with cookies enabled.
- Better Auth uses `NEXT_PUBLIC_API_URL` as its base URL.
- The public responder page at `/f/:publicId` (`apps/web/src/app/f/[publicId]/page.tsx`) is unauthenticated and drives the public read + submit endpoints.
- The builder uses React Flow and dnd-kit. It loads and saves through `GET`/`PUT /forms/:id/builder` with explicit adapters, generates UUIDs for new questions/options, and debounced-autosaves graph and metadata.
- Its `start` and `submit` nodes are display-only and must never be persisted or sent to the API.
- The form layout and overview subscribe to `FORM_UPDATED_EVENT` (dispatched on publish) to keep title/status in sync across pages.

## Important architecture decision

`Blueprint_Complete_PRD.pdf` specifies a vertical builder where only `order_index` is stored and positions are generated client-side. The current implementation instead persists a graph (`question_edges`), question positions, a viewport, and `firstQuestionId`.

Treat the graph implementation as the active design unless the team explicitly decides to revert it. Do not accidentally mix the old per-question/per-option API model back into the v2 aggregate builder API.
