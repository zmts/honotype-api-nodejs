# General information about the project:

- Project name: **honotype-api-nodejs**
- Language: **TypeScript**
- Runtime stack: **Node.js, Hono, PostgreSQL, Drizzle ORM, Knex migrations, Zod**

---

## Core principles: KISS & DRY

### KISS — Keep It Simple, Stupid

Choose the simplest solution that meets current requirements without compromising correctness, readability, security, reliability, or maintainability.

- Avoid unnecessary complexity, abstractions, architecture layers, design patterns, classes, interfaces, and factories.
- Introduce these structures only to solve a concrete problem.
- Follow project conventions. Reuse existing infrastructure and tools when sufficient.
- Do not implement features or abstractions for hypothetical future needs.
- Do not add unnecessary dependencies.
- Do not sacrifice code quality to reduce code length.

**Criterion:** Remove complexity if no required behavior or system property is lost.

### DRY — Don't Repeat Yourself

Keep each shared business rule, algorithm, validation, configuration, or definition in one authoritative location.

- Reuse existing implementations. Do not create independent copies of shared logic.
- Extract logic into functions, modules, or services only when it serves the same responsibility.
- Do not create abstractions solely because code fragments look similar.
- Keep responsibilities separate when they differ or can evolve independently.
- Avoid generalizations that increase complexity, coupling, or reduce readability.

**Criterion:** Changing one business rule must not require updating independent copies of that rule.

### Balance

- Prefer small, explicit implementations over premature generalization.
- Remove duplicated knowledge, not merely similar code.
- Introduce abstractions only when they solve a concrete problem and reduce overall complexity.
- Preserve existing behavior during refactoring unless changes are explicitly required.

## Code Quality

- Follow [`code-quality.md`](.ai/en/code-quality.md), the single source of truth for code quality, naming, style, and general coding rules in this workspace.
- Do not duplicate code quality rules in `AGENTS.md`. Architectural rules belong in [`architecture.md`](.ai/en/architecture.md).

## Architecture

Architectural rules, layers, dependencies, and endpoint flows are defined in [`architecture.md`](.ai/en/architecture.md). This is the single source of truth for the project's architecture.

## AI Documentation

- These requirements apply only to AI documentation under `.ai/`.
- Before changing these documents, read and follow [`.ai/README.md`](.ai/README.md).
- Update corresponding `.ai/en/` and `.ai/ru/` documents together in the same change.
