# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Any authenticated person who needs to create and publish a form. Builders may be occasional users, so core authoring and branching controls must be understandable without training.

## Product Purpose

Blueprint lets form owners create multi-step forms, publish a public response link, collect submissions, and review results. A successful builder can move from an empty draft to a tested, published form without needing to understand graph theory or implementation details.

## Positioning

Blueprint combines a visual question-flow canvas with a conversational public responder. Conditional branching belongs to the authoring workflow as ordered, readable rules attached to questions.

## Operating Context

The primary workflow is sign in, create a form, add and configure questions, define branching, preview the respondent path, publish, share, and review responses. The builder is a dense desktop authoring surface; the responder supports desktop and mobile web.

## Capabilities and Constraints

- Forms contain ordered questions and selectable options.
- Supported branching condition sources are select, radio, checkbox, and rating questions.
- Branch rules run in priority order and the first matching rule wins.
- A rule can match all or any of its conditions.
- A branch can go to a later question or submit the form; otherwise the form continues in normal question order.
- Conditions may reference the current or an earlier compatible question.
- Published forms are read-only in the builder.
- The API must independently validate the path represented by a submitted response.

## Brand Commitments

The product name is Blueprint. The existing interface uses a warm, paper-like workspace, compact controls, blueprint-blue accents, ink-colored structure, and React Flow for the builder canvas. New authoring controls should inherit this product interface rather than create a separate visual identity.

## Evidence on Hand

The repository contains the working builder, public responder, shared validation package, API services, database schema, Blueprint logo, and technical context under `context/`. No customer claims, testimonials, or usage benchmarks are available and none should be invented.

## Product Principles

- Explain authoring concepts in form-builder language rather than graph terminology.
- Keep the common path obvious while allowing advanced rules progressively.
- Make rule order and fallback behavior visible before publishing.
- Use the same deterministic routing behavior in the builder, responder, and API.
- Prevent invalid paths at save time and reject tampered submissions at submit time.

## Accessibility & Inclusion

All branching controls must be keyboard accessible, visibly labeled, and usable without relying on color alone. Interactive targets and focus states must remain clear in the compact properties panel.
