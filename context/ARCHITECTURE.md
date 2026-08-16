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

## API modules

The API is organized by feature under `apps/api/src/modules/`:

```text
modules/
  forms/         # authenticated form management and builder persistence
  public-forms/  # anonymous published-form reads and response submission
  health/        # liveness and database-readiness endpoints
```

Each module owns its router, controller, and service together. Shared concerns remain outside modules in `middleware/`, `config/`, `libs/`, and `types/`.

Within a module, requests follow this flow:

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
| GET | `/health/live` | No | Liveness check; confirms the API process is serving without checking dependencies |
| GET | `/health` | No | Readiness check; verifies the database connection and returns `503` when unavailable |
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

The health module emits a timestamp and process uptime for both endpoints. Readiness returns `checks.database: "ok"` on success or `"unavailable"` with a `degraded` status on failure; the underlying database error is logged but never returned to callers.

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
- `QueryProvider` configures TanStack Query once at the application root. Form reads and writes use the feature-owned `apps/web/src/features/forms/api.ts` and `queries.ts` modules; `apiFetch` remains the shared cookie-enabled API v2 transport.
- Form query keys are centralized in `apps/web/src/features/forms/query-keys.ts`. Mutations invalidate or update the relevant form, dashboard, analytics, response, and builder cache entries.
- Domain schemas, constants, and inferred request types (`FormStatus`, `QuestionType`, `BuilderInput`, `UpdateFormInput`, and `SubmitResponseInput`) are owned by `@repo/validators` and consumed by both applications. Do not duplicate their unions or request-payload shapes in an app.
- Better Auth uses `NEXT_PUBLIC_API_URL` as its base URL.
- The public responder page at `/f/:publicId` (`apps/web/src/app/f/[publicId]/page.tsx`) is unauthenticated and drives the public read + submit endpoints.
- The builder uses React Flow and dnd-kit. It loads and saves through `GET`/`PUT /forms/:id/builder` with explicit adapters, generates UUIDs for new questions/options, and debounced-autosaves graph and metadata.
- Its `start` and `submit` nodes are display-only and must never be persisted or sent to the API.
- The form layout and overview subscribe to `FORM_UPDATED_EVENT` (dispatched on publish) to keep title/status in sync across pages.

## Important architecture decision

`Blueprint_Complete_PRD.pdf` specifies a vertical builder where only `order_index` is stored and positions are generated client-side. The current implementation instead persists a graph (`question_edges`), question positions, a viewport, and `firstQuestionId`.

Treat the graph implementation as the active design unless the team explicitly decides to revert it. Do not accidentally mix the old per-question/per-option API model back into the v2 aggregate builder API.
