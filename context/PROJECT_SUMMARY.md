# Project Summary

## What Blueprint is

Blueprint is a portfolio-grade visual form builder. Authenticated owners create forms, compose questions in a builder, publish a form, share a public link, and eventually review submitted responses.

The intended MVP journey is:

`Sign in -> dashboard -> create form -> build -> publish -> public link -> submit -> owner reviews responses`

## Product vocabulary

- **Form**: the owner-managed resource. The original PRD calls this a “blueprint”; the implementation uses `forms`.
- **Question**: a persisted form field: `text`, `number`, `email`, `select`, `radio`, or `checkbox`.
- **Option**: a label belonging to a select, radio, or checkbox question.
- **Builder flow**: persisted ordered question nodes with explicit branch rules layered on top. Rules can stack with `all`/`any` matching across option, checkbox, and rating answers. The first match wins; otherwise the responder continues in question order.
- **Public ID**: the shareable, non-UUID identifier beginning with `frm_`.
- **Response / answer**: database models for respondent submissions. The public submission API and the responder page (`/f/:publicId`) are implemented; the owner response-review API is still pending.

## Stack

| Area | Technology |
| --- | --- |
| Monorepo | pnpm workspaces, Turborepo |
| Web | Next.js 16, React 19, Tailwind CSS, React Flow, dnd-kit |
| API | Express 5, TypeScript, Better Auth, Pino |
| Data | Neon PostgreSQL, Drizzle ORM |
| Validation | Shared Zod schemas in `@repo/validators` |
| Documentation | Swagger/OpenAPI at `/api-docs` |

## Scope boundaries

The original MVP excluded conditional logic, collaboration, uploads, themes, and analytics. Conditional routing is now implemented; the visual analytics page remains mock UI rather than product functionality.
