# Blueprint Context

Read these files before making changes to Blueprint.

1. [Project summary](PROJECT_SUMMARY.md) - product purpose, stack, and domain language.
2. [Architecture](ARCHITECTURE.md) - current runtime, data, and API design.
3. [Current state](CURRENT_STATE.md) - implemented work, known gaps, and active integration state.
4. [Roadmap](ROADMAP.md) - the recommended order for the remaining MVP work.
5. [Conventions](CONVENTIONS.md) - code, validation, and change guidelines.
6. [Question types and API contract](QUESTION_TYPES.md) - supported inputs, rating configuration, persistence, and submission validation.

## Source of truth

The current source code and migrations are authoritative. `Blueprint_Complete_PRD.pdf` captures the original MVP plan, but its builder specification has been superseded by the graph-based implementation now present in the API and database.

## Quick facts

- Monorepo: pnpm + Turborepo.
- Web: Next.js App Router, React, Tailwind, React Flow, Better Auth client.
- API: Express, Better Auth, Drizzle, Neon/PostgreSQL, Zod validation.
- API namespace: `/api/v2`.
- Primary aggregate: a user-owned form with questions, options, and a linear builder graph.
