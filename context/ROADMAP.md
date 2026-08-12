# Remaining MVP Roadmap

Work in this order to preserve an end-to-end vertical slice at every milestone.

## 1. Complete owner form management

Status: **complete, except response-derived metrics**.

- Dashboard, form overview, and form navigation use the v2 form API.
- Form overview exposes publish, close, and reopen actions.
- Response counts and completion rates wait for the response API phase.
- `forms.updatedAt` is deferred until “recently edited” is a confirmed product requirement.

## 2. Connect the builder

Status: **complete except the publish-immutability decision** (tracked under known gaps).

- The builder reads the form ID from the route and loads metadata plus builder state.
- Explicit mappers convert between the API builder schema and React Flow nodes/edges; questions/options get client-generated UUIDs.
- Display-only `start`/`submit` nodes and their edges are filtered from saved payloads.
- Metadata saves with `PATCH /forms/:id` and graph/options with `PUT /forms/:id/builder`, both debounced, with a visible save status.
- Top nav adds Preview and Publish; publishing dispatches `FORM_UPDATED_EVENT` to sync other pages.
- Whether published forms are immutable is still an open decision.

## 3. Build the public responder flow

Status: **complete**.

- The public page `/f/:publicId` renders the ordered `questions` array one at a time.
- It supports all six question types with client-side required-state and type validation.
- It provides loading, not-found, and thank-you states, and submits to the public responses endpoint.

## 4. Implement response submission

Status: **complete except abuse protection** (deferred intentionally).

- `POST /api/v2/public/forms/:publicId/responses` is implemented.
- Shared Zod input schemas for answers live in `@repo/validators`.
- In one transaction it confirms publication, validates required answers, question ownership, option ownership, and input types, then creates response and answer rows.
- Checkbox selections are stored as multiple answer rows.
- Completion time and optional request metadata (hashed IP, user agent) are captured.
- Basic abuse protection/rate limiting is still pending; add before production deployment.

## 5. Implement owner response review

- Add owner-only response list and detail endpoints.
- Add pagination and search.
- Replace mocked response list/detail pages.
- Add response counts to the dashboard and form overview.

## 6. Polish and release readiness

- Replace analytics mocks only if analytics remains in scope; it is non-MVP in the PRD.
- Implement or remove the placeholder settings/notification surfaces.
- Add API integration tests for ownership, builder saves, public reads, and submissions.
- Add web tests for the dashboard, builder adapters, and public form flow.
- Verify migrations, environment variables, CORS, error states, and deployment configuration. Specifically, replace the ad-hoc `drizzle-kit push` workflow with tracked migrations and confirm the schema is applied before the API starts (drift on the `forms` table already broke `POST /forms` once).
