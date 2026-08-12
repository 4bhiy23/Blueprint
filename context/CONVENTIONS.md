# Engineering Conventions

## TypeScript and modules

- Use TypeScript everywhere with strict compiler settings.
- The API uses NodeNext module resolution; local API imports must include the `.js` extension.
- The web app uses the `@/` path alias for `apps/web/src` imports.
- Prefer `type` imports when importing types only.

## API code

- Keep routes declarative: middleware plus controller binding only.
- Keep controllers thin: parse parameters, validate with shared Zod schemas, select HTTP statuses, and call services.
- Put database access, ownership scoping, aggregate rules, and transactions in services.
- Return consistent JSON errors using `{ error: string }`; include Zod `issues` for invalid bodies.
- Scope owner queries by both resource ID and `ownerId`. Do not load a resource and then trust a client-supplied owner.
- Public routes must expose only data needed by responders.

## Validation and data

- Define API payload validation in `packages/validators/src/index.ts` and infer input types from Zod.
- Validate all request bodies at the API boundary.
- Persist a complete form builder snapshot transactionally; do not reintroduce independent question or option writes without a deliberate architecture change.
- Use database cascades intentionally and keep migrations in `packages/db/drizzle/` when changing schema.
- The Drizzle client uses the `neon-serverless` WebSocket driver (`drizzle-orm/neon-serverless`). Do not switch back to `neon-http`; it has no `db.transaction` support, which the builder save, duplicate, and response submission flows rely on.
- Keep the live schema in sync. Schema changes are currently applied with `pnpm --filter @repo/db push`; verify the database matches `packages/db/src/schema/` before shipping API changes that insert into drifted tables.

## Frontend code

- Use client components only for interactive pages/components.
- Put reusable request behavior in `apps/web/src/lib/api.ts`; it attaches cookies and targets `/api/v2`.
- Use Better Auth client APIs for session/auth operations.
- Surface user-facing success/error feedback with Sonner toasts.
- Keep React Flow display-only nodes (`start`, `submit`) out of persisted API payloads.
- Debounce builder autosaves and surface the save state (saving/saved/error) in the UI.

## Quality checks

- Run `pnpm typecheck` and `pnpm lint` from the repository root when dependencies are installed.
- Run package-scoped checks while iterating: `pnpm --filter @repo/api typecheck`, `pnpm --filter @repo/api lint`, and the equivalent web checks.
- Run `git diff --check` before handing off changes.
- Add tests for authorization and state transitions whenever adding an API endpoint.

## Documentation maintenance

Update this `context/` folder when changing architecture, API versions, domain terminology, milestones, or significant conventions. Keep it concise enough to read before coding and accurate enough to trust.
