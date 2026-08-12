# Current State

## Implemented

### Platform and authentication

- pnpm/Turborepo monorepo is configured.
- Better Auth is backed by the Drizzle database adapter.
- Email/password sign-in and sign-up UI exists.
- Dashboard layout checks for a session and redirects unauthenticated users to sign-in.
- API CORS is configured for `FRONTEND_URL` with credentials.

### Owner form API

- Create, list, read, update, delete, and duplicate owned forms.
- Metadata updates support title, description, and status (`draft`, `published`, `closed`, `archived`).
- Builder reads and writes complete form state through `/forms/:id/builder`.
- Builder writes are transactionally validated, including ownership, graph connectivity, duplicate IDs, and allowed option-bearing question types.
- Legacy independent question and option mutation routes were removed in favor of aggregate builder writes.

### Builder UI

- The builder page at `/forms/:id/builder` loads form metadata and the persisted graph via `GET /forms/:id` and `GET /forms/:id/builder`.
- Explicit load and serialize adapters convert between the backend builder schema and React Flow nodes/edges, and questions/options get client-generated UUIDs.
- Changes autosave: the graph and options go to `PUT /forms/:id/builder` (debounced ~1s), the title to `PATCH /forms/:id` (debounced), and the description immediately.
- Display-only `start`/`submit` nodes and their edges are excluded from saved payloads.
- A save-status indicator (Saving / Saved / Error) reflects autosave state; the top nav also exposes Preview and Publish, and publishing dispatches `FORM_UPDATED_EVENT` to sync other pages.

### Public form read API

- `GET /api/v2/public/forms/:publicId` resolves published forms only.
- It returns responder-safe metadata plus ordered questions and option labels/IDs.
- It does not expose owners, builder positions, graph edges, or viewport state.

### Public response submission API

- `POST /api/v2/public/forms/:publicId/responses` records a response to a published form.
- It validates, inside one transaction, that the form is published, that answered question IDs belong to the form, that required questions are answered, that option IDs belong to the answered question, that radio/select receive exactly one selection, and that number/email values are typed correctly.
- Checkbox selections persist as multiple answer rows; text/number/email persist as a single value row.
- It captures completion time and optional request metadata (hashed IP and user agent).
- The database client uses the `neon-serverless` (WebSocket) driver so Drizzle transactions work for submissions, builder saves, and duplication.

### Public responder UI

- The responder page lives at `apps/web/src/app/f/[publicId]/page.tsx` and is reachable at `/f/:publicId` without authentication.
- It fetches `/api/v2/public/forms/:publicId`, renders the ordered questions one at a time, and supports all six question types with client-side required/type validation.
- It posts to `/api/v2/public/forms/:publicId/responses` and shows loading, not-found, and thank-you states (with confetti).
- Verified end-to-end: submissions return `201` and response/answer rows are persisted transactionally.

### Database

- Schemas and migrations exist for auth, forms, questions, options, edges, responses, and answers.
- Deletion cascades remove form-owned questions, options, edges, responses, and answers as applicable.
- `packages/db/src/seed-dummy.ts` is a dev-only script that seeds a published dummy survey for manual responder testing (run directly with `tsx`; no npm script wired up).

### Dashboard integration status

- The dashboard’s form list and create/rename/duplicate/delete actions now use the v2 form API through `apps/web/src/lib/api.ts`.
- The form overview and per-form navigation header load real data from `GET /forms/:id`.
- Form overview status actions publish, close, or reopen a form with `PATCH /forms/:id`.
- The publish flow is verified end-to-end: `PATCH /forms/:id` → `published` makes the form reachable and submittable through the public endpoints; draft forms return `404` to responders.
- Response counts remain `0` until owner response review is implemented.
- Forms are shown as “Created” rather than “Edited” because forms currently have no `updatedAt` column.

## Still mock or incomplete

- Response list and response-detail UI use mock data.
- Response counts on the dashboard and form overview remain `0` until owner response review is implemented.
- Analytics is a mock dashboard.
- Settings are presentation-only.
- Notification UI is mock data.
- Password-reset UI only shows a toast; no reset flow exists.

## Known gaps and decisions to make

- The API permits edits after publishing. The original PRD says published forms should be immutable; enforce that rule before treating publish as final.
- The frontend builder currently uses display-only `start`/`submit` nodes and non-API-shaped IDs/types. It needs an explicit serialize/deserialize adapter before persistence is enabled.
- `forms.updatedAt` is deliberately deferred. Add it, with a migration, if sorting and showing “recently edited” is a product requirement.
- The live Neon database has no `drizzle.__drizzle_migrations` table, so schema is applied with `drizzle-kit push` rather than tracked migrations. This caused drift (the live `forms` table was missing `first_question_id`) that surfaced as `POST /forms` returning `500` until the schema was pushed. Decide on a migrate-based workflow and wire it into start/deploy scripts.
- There is no automated test suite yet.
- The default web README and root Next metadata still contain starter text.
