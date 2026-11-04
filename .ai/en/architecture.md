# API Architecture

## Status and Scope

The project is a modular TypeScript API scaffold built on Hono.

Architectural principle: new domain functionality is added as separate business modules. It must not be hidden in `libs/core`, added through an unrelated demonstration module, or mixed with the transport layer.

## Layer Map

```text
apps/api-main
  main.ts                 process entry point: server or migrations
  server.ts               composition root: Hono, middleware, controllers
  config/                 validated configuration from environment
  database/               Drizzle runtime schema and Knex migrations
  datalayer/              repositories and database error mapping
  global/                 cross-cutting dependencies and middleware
  modules/                business modules and HTTP controllers

libs
  core/
    kernel/               abstract contracts and base application rules
    runtime/              reusable technical implementations
  common/                 shared contracts, resources and stateless helpers
  entities/               lightweight domain entities
  domain/<domain>/        reusable domain logic and its types
```

Placement rules:

- `apps/api-main/modules/<module>` — use cases and HTTP APIs for a specific domain.
- `apps/api-main/datalayer` — SQL/Drizzle access; repositories contain no HTTP logic.
- `libs/entities` — domain data and small amounts of local behavior.
- `libs/domain/<domain>` — shared business rules and calculations used by several application modules, together with the necessary types and constants.
- `libs/core` — reusable infrastructure primitives only. Business logic for a specific domain does not belong here.
- `libs/common` — only genuinely shared transport artifacts, not contracts belonging to a single module.

## Core: kernel, runtime, and common

### `libs/core/kernel`

`kernel` contains only the application's basic abstractions:

- interfaces, abstract classes, basic types, and protocol contracts;
- shared lifecycle and repository contracts;
- rules for interaction between layers.

`kernel` contains no concrete clients, I/O, HTTP handlers, Redis, WebSocket, database access, domain logic, or imports from `apps/**` and `modules/**`.

### `libs/core/runtime`

`runtime` contains reusable technical implementations that perform work at application startup:

- HTTP server primitives, base controller, middleware, validator, error handling;
- Redis, database, queue, and generic WebSocket clients;
- lifecycle utilities, retries, migrations, and other infrastructure adapters.

`runtime` may depend on `kernel`, external packages, and other `libs/**`, but not on `apps/**` or domain `modules/**`.

### `libs/common`

`common` contains neutral contracts, resources, and stateless helpers reused by multiple modules. Shared API contracts, response envelopes, pagination, pure helpers, transformations, formatting, and validation primitives are allowed here, without I/O, lifecycle, or domain-specific rules.

`common` contains no infrastructure clients, HTTP/Redis/WebSocket/database access, or business logic for a specific domain.

## Shared Domain Logic: `libs/domain`

`libs/domain/<domain>/` contains self-contained domain operations needed by several application modules. Shared business rules belong to the domain library, while scenarios and decisions specific to a particular application module remain in that module.

Rules:
- move the smallest self-contained responsibility, not an entire application module for the sake of one shared function;
- keep the necessary types, interfaces, constants, and tests next to the logic; place internal backend types, including inputs and results of public functions, in a local `types.ts`;
- reuse existing entities from `libs/entities` without duplication; do not move domain interfaces to `core/kernel` merely because they are interfaces;
- leave HTTP controllers, actions, REST DTOs/contracts/resources, and scenarios of a specific module in `apps`;
- pass data to operations as arguments; do not create infrastructure clients, read the environment, or depend on an HTTP framework;
- if a domain operation needs I/O, declare a narrow dependency interface next to it and pass the implementation during application composition; do not import concrete clients or repositories into the domain library;
- provide a small public API through `libs/domain/<domain>/index.ts`; consumers use this API, while internal files use direct local imports rather than their own barrel;
- do not create a shared `libs/domain/index.ts` that exports all domains; add extra directories and abstractions only when genuinely necessary.

General structure:

```text
libs/domain/<domain>/
  <operation>.ts
  types.ts
  index.ts
  __tests__/
    <operation>.test.ts
```

## Placement Decision Rules

- Basic infrastructure abstraction or interface without concrete runtime behavior → `libs/core/kernel`.
- Reusable technical implementation with I/O, lifecycle, or framework integration → `libs/core/runtime`.
- Shared neutral API contract, resource, or pure stateless helper → `libs/common`.
- Shared domain operation and its types needed by several modules → `libs/domain/<domain>`.
- Scenario, REST contract, or logic used by only one application module → `apps/api-main/modules/<module>`.
- `libs/**` does not import `apps/**`, including `import type`.

## Dependency Direction

`apps` is the upper application layer; `libs` contains the lower reusable layers.

- `apps/**` may import `libs/**`.
- `libs/**` must not import anything from `apps/**`.
- The restriction applies to runtime imports, `import type`, alias paths, relative paths, and barrel exports.
- `libs/**` may depend only on Node.js, external packages, and other modules in `libs/**`.
- If code inside `libs/**` needs a type or contract currently declared in `apps/**`, that type or contract must be moved or extracted into `libs/**`. It must not be imported from `apps/**`.
- Code inside `apps/api-main/modules/<module>/**` must not import another application module: this includes functions, classes, constants, types, dynamic imports, and re-exports, regardless of aliases or relative paths. A neighboring module's public `index.ts` is not an exception.
- Do not bypass the restriction through an intermediate barrel or a re-export in another directory.
- `libs/domain` may use `libs/entities`, neutral helpers from `libs/common`, basic contracts from `libs/core/kernel`, and external packages without violating the infrastructure boundary. These lower layers do not import `libs/domain`.
- All dependencies between libraries must be acyclic. Explicit one-way dependencies between domain libraries are allowed; mutual needs require reconsidering the boundaries and extracting the shared responsibility.

### Shared Logic Extraction Procedure

1. Identify the shared operation and its responsibility: a calculation, business rule, or type. Do not combine code solely because it looks similar.
2. Define the operation's minimal inputs, results, and required dependencies.
3. Move the implementation, related types, constants, and tests into `libs/domain/<domain>/`, removing dependencies on `apps`.
4. Update all consumers, including the original module, to use the library's public API. When using a new alias, align it with compilation, runtime, and test settings.
5. Remove the old exports and duplicate implementations. Do not leave a compatibility re-export in the application module to preserve the old import path.
6. Verify preserved behavior with tests, compilation, and checks for forbidden imports and cycles. Automated architecture-boundary checks in CI must account for aliases, relative paths, and re-exports.

A scenario coordinating several modules is assembled above those modules through explicit interfaces and injected dependencies. The composition root may import the modules' public composition entry points; this does not allow modules to import each other.

### Infrastructure Client Ownership

An infrastructure client belongs to the layer where it is declared. Consumers import the client and its related contracts directly from the owning layer.

Do not create a compatibility re-export, renamed alias, or intermediate module in another layer solely to preserve the old import path.

When moving a client to another layer, update all consumer imports and remove obsolete intermediate exports or directories in the same change.


## Composition Root and Module Registration

`apps/api-main/main.ts` selects the startup mode: HTTP server or migrations.

`apps/api-main/server.ts` is the sole composition root. It creates the Hono application, global middleware, CORS, error handlers, and controllers from `apps/api-main/modules/index.ts`.

A new HTTP module must be explicitly registered in `modules/index.ts`. There is no automatic discovery, and none is needed: registration must remain easy to inspect.

Each controller implements `IBaseController`: it provides `routes` and an asynchronous `init()`. Before mounting routes, `server.ts` calls each controller's `init()`.

```text
Request
  -> Hono global middleware
  -> Controller route
  -> DTO validation
  -> Action
  -> Service / Repository
  -> Entity / persistence
  -> Resource
  -> BaseController.execute
  -> JSON response
```

## A Module as a Unit of Business Functionality

One module owns one domain context. A new domain context must use this structure:

```text
modules/example/
  actions/
  dependency/
  inout/
    validations/
    contracts/
    resources/
  services/
  example.controller.ts
  index.ts
```

Rules:

- a controller connects an HTTP route to a use case but does not implement business logic;
- one `Action` represents one use case;
- each `Action` class is stored in a separate `actions/<operation>-<entity>.action.ts` file; `actions/index.ts` contains exports only;
- an `Action` does not receive `Hono.Context` or construct an HTTP response;
- an `Action` does not create services with `new`; it only uses services created in `dependency.ts` and passed through its constructor;
- a service contains reusable domain operations that do not belong to a single action;
- pure stateless helpers without dependencies or lifecycle, used only by this module, belong in `modules/<module>/common/` in files with domain-specific names, such as `slugs.ts`, without the `.service` suffix; shared domain logic for several modules belongs in `libs/domain/<domain>/`;
- `services/` is used only for reusable domain logic with its own responsibility and real dependencies;
- a repository hides Drizzle and query details;
- a resource maps internal data into a public API contract;
- a module does not import another module, including its public `index.ts`; shared logic and its types belong in `libs/domain/<domain>/`.

Do not create a module for a single technical function. If code has no independent domain responsibility, it stays next to the owner of the use case, or in `libs/core` only when reusability has been demonstrated.

A new module is created from `_templates/module`. Its external module interface is expressed through a local `index.ts` for application composition. It is not an entry point for neighboring modules to reuse code.

## Explicit Dependencies

The project does not use a global DI container. Dependencies are assembled manually:

- global dependencies — cross-cutting services, such as JWT middleware;
- module dependencies — repositories and services of a specific module; `dependency.ts` creates them once and passes them through a dependency interface;
- an action receives repositories and services only through constructor dependencies.

This is a deliberate approach. It makes runtime wiring and dependency ownership visible in the code.

Rules:

- do not create a service locator;
- in application code, read `process.env` only in the configuration layer; services, actions, controllers, repositories, and domain libraries must not read the environment themselves;
- validate values in configuration modules and pass validated configuration to consumers through explicit dependencies;
- do not turn a dependency object into an implicit global container;
- stateless actions may be created per request; stateful objects require an explicitly chosen lifecycle.

## HTTP, DTOs, and Public Contracts

Input data undergoes runtime validation through Zod-based DTOs. A DTO is created in the controller before the action runs.

```text
HTTP JSON -> DTO -> Action input
Entity / domain result -> Resource -> Contract -> API JSON
```

### `inout` Structure

Each entity has its own contract and resource files: `contracts/<entity>.contract.ts` and `resources/<entity>.resource.ts`. Do not combine contracts or resources for different entities into one file.

Each use case input has a separate DTO file in `validations/` named `<operation>-<entity>.dto.ts`. The DTO extends `BaseValidator`, assembles the final Zod schema, and validates the input on construction.

`validations/schema.ts` contains only reusable Zod field primitives for the specific module. `index.ts` in `inout/` and its subdirectories is used only for barrel exports.

`contracts/` and `*.contract.ts` are intended exclusively for public REST API types — data exchanged between the backend and an external consumer. They must not be the type of a Drizzle row or entity.

Types and interfaces for services, actions, repositories, and infrastructure clients belong in a local `types.ts`.
This also applies to parameters and results of their public methods.
Exporting a type and using it in another backend module does not make it a REST API contract.
For example, the Redis client's `LockResult<T>` belongs in `redis-lock/types.ts`.

`resources` is the sole standard place for mapping entities into API output. Regular business routes must return `Resource` or `ResourceList` through `BaseController.execute(...)`.

Standard response:

```json
{
  "status": 200,
  "data": {},
  "list": [],
  "pagination": {
    "limit": 20,
    "total": 0
  },
  "meta": {}
}
```

A specific response uses either `data` or `list`. Do not manually assemble this envelope in a controller.

Exceptions: health checks, OAuth redirects, and other purely transport endpoints may return a Hono response directly if the Resource pipeline does not apply to them.

### Backend Contract First For UI Integrations

- For frontend/backend integrations, the backend API contract is the source of truth for the UI.
- Do not adjust the backend response shape to current UI expectations solely for frontend convenience.
- The backend transforms domain data into the agreed public API contract through `Resource` or `ResourceList`. This mapping is part of the architecture; the restriction concerns tailoring data to specific UI components and their local display models.
- The backend must not change time units, display-oriented naming, sorting, grouping, chart-specific shapes, or other presentation-specific transformations merely because they are currently more convenient for a particular screen.
- If the frontend needs to work with a new or changed backend contract, perform the adaptation on the UI side: in `src/api`, a page service, a mapping layer, or the nearest frontend data normalization step.
- If the UI expects a different data format, the UI must map the backend response to its components, charts, tables, and local display models.
- The backend changes a contract only when it is a genuine domain or API-level requirement, not a workaround for the current UI implementation.
- When the current UI and backend contract differ, fix the UI to reflect the backend's actual data and constraints, not the other way around.

## Errors and Authorization

Expected errors are expressed through `AppError` and `ErrorCode`. The top-level `globalExceptionHandler` converts them into a unified JSON error response.

Rules:

- validation, business rules, and repository errors are converted into `AppError`;
- do not duplicate try/catch and HTTP error responses in every controller;
- unknown errors must not expose technical details to the client;
- `JwtMiddleware` only extracts identity from the access token;
- an action that needs a user receives `CurrentUserJwt` through `getCurrentUserJwt(c)`.

Authorization must be part of the use case: retrieving identity in the controller is allowed, but ownership and permission checks belong in the action/service.

## Entities and Persistence

Entities in `libs/entities` are lightweight classes. They are not ORM models and may contain only local domain behavior, such as password hashing or refresh token generation.

Repositories:

- execute Drizzle queries;
- map a database row into an entity;
- do not expose raw database rows above the data layer;
- translate database-specific errors into `AppError`;
- do not perform presentation mapping.

If several lookup methods for the same entity differ only in additional conditions of the same lookup, the repository provides a single `findOneBy(filter)`. The `filter` type must be a narrow domain type with a required lookup key; do not accept `Partial<Entity>` or allow an empty filter. Methods with different business semantics or access rules are not combined.

For lookups where a missing entity is a use case error, the repository supports the `{ findOrThrow: true }` option. In this mode, the repository throws `AppError(ErrorCode.NOT_FOUND)` and returns a non-null entity. Do not create a service solely to call a repository and convert `null` into `NOT_FOUND`; a service contains only shared domain logic for the module.

## Database Migrations

- Before designing, creating, or modifying a SQL migration, you must read [`migrations.md`](migrations.md).
- That document defines the required Knex style, a migration example, and the verification procedure.
- Write migrations using Knex Schema Builder following that example. Do not replace supported Knex operations with handwritten DDL strings. Conditions for permitted targeted SQL are described in `migrations.md`.
- A schema change always consists of two synchronized parts:
1. a new Knex migration in `database/migrations`;
2. the corresponding Drizzle schema change in `database/schemas`.

A Knex migration describes the evolution of the actual database. The Drizzle schema describes the runtime contract. Neither replaces the other.

## Database Identifiers

- Table primary keys must be `bigint generated always as identity primary key`.
- Foreign keys must use the same type as the referenced primary key — usually `bigint`.
- Do not use `serial` or `bigserial` in new schemas; use `GENERATED ... AS IDENTITY`.

## Testing

- The primary testing focus is services that implement business logic.
- Helpers and common functions are also tested if they contain independent computations, transformations, or rules that affect business scenario behavior.

### Location

- All test files are stored in `__tests__` inside the directory that owns the code being tested.
- A service test is placed in `services/__tests__/<name>.service.test.ts`.
- A helper function test is placed in `common/__tests__/<name>.test.ts` or in `__tests__` of another owning directory.
- Test fixtures, mocks, and helper functions are stored inside the corresponding `__tests__`.
- Production code does not import files from `__tests__`.

Example:

```text
services/
  wallets.service.ts
  __tests__/
    wallets.service.test.ts

common/
  profit-drawdown.ts
  __tests__/
    profit-drawdown.test.ts
```

### Testing Scope

- Separate controller and repository tests are not created.
- A service is tested through its public methods: inputs, results, business errors, and significant side effects.
- If an action contains independent business logic, it is tested directly at the action level, without an HTTP controller.
  There is no need to create an extra service solely for testing.
- Simple delegation, getters, and trivial wrappers do not require separate tests without an independent regression risk.

### Dependencies and Isolation

- In service tests, repositories and external I/O dependencies are replaced with mocks or stubs through existing dependency injection points.
- Tests verify the service's decisions: what data it returns, what changes it requests, and what operations it prohibits.
  SQL, Redis commands, and repository internals are not tested.
- Pure helpers run for real; do not substitute their behavior if it is part of the scenario being tested.
- A regular test run does not require PostgreSQL, Redis, network APIs, or blockchain RPC.
- Time, timers, and randomness are controlled where they affect the result. Tests do not depend on execution order.

### Test Content

- Cover significant business scenarios: success, rule violations, boundary values, dependency errors, and the absence of forbidden side effects.
- Checks are tied to observable behavior, not private methods or incidental ordering of internal calls.
- Test counts and coverage percentages do not replace checks of critical business rules.

Tests run with Vitest: `npm test`.

## New Module Readiness Criteria

Before registering a module, verify:

- the module has one clear domain responsibility;
- the module does not import neighboring modules; shared domain logic is extracted into `libs/domain`, and library dependencies are acyclic;
- the route is registered in `modules/index.ts`;
- input is validated by a DTO;
- the action does not depend on Hono;
- a contract is returned externally through a resource;
- ownership is checked in the action/service;
- the repository does not leak into the controller;
- the migration and Drizzle schema are synchronized;
- configuration is validated by a separate configuration module;
- critical business scenarios are covered by service tests and, when necessary, action and helper tests; all test files are located in the corresponding `__tests__` directories.
