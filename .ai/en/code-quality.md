# Unified Code Quality Rules

## Purpose and Scope

This document is the single source of truth for code quality rules when writing, modifying, refactoring, and reviewing code in this project. It covers Clean Code principles and JavaScript and TypeScript practices. General JavaScript rules also apply to TypeScript; type-specific requirements are grouped separately.

Architectural layers, dependency directions, file placement, and contracts between layers are defined in [architecture.md](architecture.md). This document does not override the architecture.

## 1. Priorities, Simplicity, and Reuse

- Follow user requirements and local workspace instructions. Within those constraints, prioritize correctness, clarity, explicit domain intent, lower complexity, and consistency with existing code, in that order.
- Choose the simplest solution that preserves correctness, security, reliability, and maintainability. Brevity is not a goal by itself.
- Keep changes proportional to the task. Do not add dependencies, layers, interfaces, factories, or generic mechanisms for hypothetical future needs.
- Keep each shared business rule, algorithm, validation, and definition in one authoritative location. Reuse an existing implementation when it fits the task.
- Extract shared logic when repetition is real and stable and its meaning and responsibility match. Superficial similarity between fragments is not sufficient reason to combine them.
- Allow small duplication when generalization would hide meaning, couple independent responsibilities, or make future changes harder.
- Follow established naming, formatting, import, error-handling, and testing conventions. Deviate only for a clear technical reason.
- Preserve behavior during refactoring unless changing behavior is explicitly part of the task. Do not turn understandable code into a more abstract but less readable design.

## 2. Readability, Naming, and Comments

### Names and Expressions

- Use precise domain names. Avoid names without a clear purpose, such as `processData`, `handleStuff`, `obj`, `tmp`, and `value2`. Do not reuse one variable for different meanings.
- Avoid single-letter names outside short local loops.
- Do not compress logic into dense expressions and call chains when that makes it harder to understand. Modern syntax is useful only when it improves clarity.
- Extract meaningful intermediate results into named variables. If a nested call computes a distinct meaningful result, store it before passing it to another call, especially before `add`, `push`, `set`, `delete`, or `update`.
- Extract important conditions expressing business rules, contracts, or infrastructure semantics into variables with an `is`, `has`, `can`, or `should` prefix when this clarifies intent. Do not extract trivial checks just for formality.
- Destructuring should reduce noise without hiding a value's origin and meaning.

### Units of Measurement

- Names of variables, fields, DTOs, configuration values, and contract properties representing measurable quantities must express their units or unambiguous quantity semantics.
- Do not use neutral names such as `time`, `duration`, `value`, `change`, `interval`, or `amount` when the unit cannot be understood from the name.
- For time, use explicit names such as `durationMs`, `ttlSec`, `lookbackHours`, `startTimeMs`, and `openTimeUnixSec`; supported markers include `ms`, `sec`, `min`, `hours`, and `days`.
- For relative quantities, use `pct`, `percent`, `ratio`, `bps`, or `multiplier`, for example `changePct` and `ratioBps`.
- For market quantities and counts, use suitable markers such as `price`, `tickSize`, `ticks`, `volume`, `qty`, `count`, `bars`, and `candles`, for example `volumeUsd` and `candlesCount`.
- Conventional pagination and aggregate names `offset`, `limit`, `total`, and `count` do not require renaming solely to express units.
- A nonstandard unit must be understandable from the name, not only from a comment.

### Comments

- Explain reasons, constraints, protocol quirks, tradeoffs, workarounds, and non-obvious decisions.
- Do not restate obvious code behavior or compensate for weak names or unnecessary complexity with comments. First try to improve the code itself.
- Include context and the reason for remaining work in `TODO` comments.

## 3. Functions and Control Flow

- A function should have one clear responsibility. Separate calculations and business rules from IO and other side effects. Keep orchestration of related steps in an understandable place.
- Arrange logic in execution order: validation and early returns → preparation → main operation → result. Separate meaningful stages with blank lines without creating artificial sections or variables.
- Reduce nesting with guard clauses and early returns.
- Use ternary operators only for simple, single-level expressions. Do not nest ternary operators in conditions or branches. Replace nested ternaries with `if / else` or `switch`, preserving condition priority and short-circuit evaluation.
- Reduce the number of parameters when possible without losing clarity or correctness. Grouping parameters into an object does not by itself reduce a function's dependencies.
- Pass a small number of required arguments positionally, followed by optional parameters in an object. If there are many arguments or their order is hard to remember, use one typed object. Do not group parameters mechanically when it reduces readability.
- Avoid boolean flags that switch function behavior. An explicit mode such as `{ mode: 'discounted' }` is clearer than a `true` argument.
- Do not mutate input arguments without a clear reason and a contract understandable to the caller.
- Do not introduce unused variables, imports, or parameters. Remove an unused parameter if the contract does not require it and removal does not change the positions of arguments that are used.
- A name such as `_item` is allowed when an unused parameter is required by a positional callback signature or an external interface. Do not use underscores, fake usage, or adapters solely to bypass the linter.

## 4. Data, State, and JavaScript Semantics

### Input Data

- Treat external data as untrusted until validated. Validate HTTP requests, queues, webhooks, environment variables, files, external APIs and SDKs, `JSON.parse` results, and browser storage contents when used.
- Follow this flow: receive external data → validate → normalize and transform as needed → use a trusted value inside the system.
- Do not pass raw external payloads deep into business logic. TypeScript compile-time checking does not replace runtime validation.

### State and Collections

- Use `const` by default and `let` only when reassignment is necessary. Do not use `var`.
- Minimize shared mutable state and hidden dependencies. Prefer explicit inputs and local controlled changes over global implicit changes.
- Do not copy objects mechanically for ceremonial immutability. Choose immutable updates where they make behavior safer and clearer.
- Use `map`, `filter`, `reduce`, and transformation chains when they read more clearly than a simple loop. Do not use `reduce` as a universal tool.
- Do not hide mutations of shared objects and arrays inside transformations.

### Equality and Coercion

- Prefer `===` and `!==`.
- Do not rely on implicit coercion where exact behavior matters.
- Distinguish `0`, `''`, `false`, `null`, and `undefined` when their meanings differ. A check such as `if (!value)` is appropriate only when grouping these cases is intentional.

## 5. Asynchronous Work and Error Handling

### Asynchronous Operations

- Prefer `async/await` over complex Promise chains and nested callbacks.
- Execute dependent operations in the required order. Use `Promise.all` only for independent operations and `Promise.allSettled` when partial failure is acceptable and each operation's result will be handled.
- Limits on concurrency, queue memory, and large dataset processing are described in section 9, “Performance and Algorithmic Complexity”.
- Every Promise must be awaited with `await`, returned to the caller, or explicitly handled. Do not leave unhandled Promise rejections.
- Start background work only when its behavior is intentional and safe, with defined error handling and lifecycle management.
- Do not add `async` when there is no asynchronous work and the contract does not require a Promise. Do not use `await` for synchronous calls merely for consistency or hypothetical future needs.
- When removing `async`, preserve the result and error contract: a synchronous exception and a rejected Promise behave differently. A synchronous implementation may serve an interface that requires a Promise.
- Do not place `await` directly in function, method, or constructor arguments. First store the awaited value in a clearly named variable, then pass it as an argument. For example, use `const result = await inner(); outer(result)` instead of `outer(await inner())`.
- Do not use `await` in conditions, including `if`, loop, and ternary conditions. First store the awaited result in a clearly named variable, then use that variable in the condition. Preserve evaluation order, short-circuit behavior, and repeated evaluation in loops. For example, use `const canProceed = await checkPermission(); if (canProceed) { ... }` instead of `if (await checkPermission()) { ... }`.
- Do not use `return await`. First store the awaited result in a clearly named variable, then return that variable. For example, use `const user = await loadUser(); return user;` instead of `return await loadUser();`.
- Separate loading from meaningful result transformation. Do not call `map`, `filter`, `sort`, or similar methods directly on an `await` result when an intermediate variable improves clarity.

```ts
const tickers = await client.getTickers();
const liquidTickers = tickers.filter(isLiquidTicker);
storeTickers(liquidTickers);
```

### Errors

- Do not swallow errors with an empty `catch`. Handle an error meaningfully, recover when possible, or propagate it.
- Add useful context when propagating, mapping, or logging an error.
- Keep the error-handling strategy consistent within a layer. Specific mappings between layers are defined by the project architecture.
- Do not use exceptions for normal expected control flow unless that is the established policy of the relevant layer.
- Logging alone does not replace error handling.

## 6. TypeScript-Specific Rules

### Safe Types and Narrowing

- Use strict TypeScript checking by default.
- Use `unknown` for data of unknown structure, then validate or narrow it before use.
- Do not bypass type errors with `any`. If it is necessary because of a third-party library limitation or a dynamic interface, isolate it at the smallest integration boundary, briefly explain why, and do not propagate the unsafe type into business logic.
- Do not replace `any` with an unjustified `as`: a type assertion does not validate a value at runtime. Avoid unsafe assertions and assertion chains.
- Use control-flow narrowing, `typeof`, `instanceof`, `in`, discriminants, and guard clauses. Extract repeated checks into type guards when genuinely useful.
- A type guard must sufficiently establish its claimed type given the value's starting type. For an `unknown` input, validate all necessary properties and their types; field presence alone is insufficient. For an already typed union, checking the discriminant may be enough.
- Treat the value in `catch` as `unknown` until its type is narrowed.

```ts
type UserReference = { id: string };

function isUserReference(value: unknown): value is UserReference {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}
```

### Modeling

- Prefer literal unions over unrestricted `string` for a bounded set of allowed values.
- Use discriminated unions for mutually exclusive states instead of combinations of boolean flags and many optional fields. Make invalid states unrepresentable in types.
- Use `never` to check exhaustive handling of union variants.
- Separate transport DTOs, domain models, and persistence models according to the architecture. Do not substitute a raw transport object for a domain model.
- Use utility types and generics when they improve clarity. Do not complicate types for generality alone.
- For internal backend types, reuse `SourceType['field']` when the field's meaning fully matches an existing source of truth. Do not manually duplicate its primitive type or set of allowed values.
- The preceding rule does not apply to transport contracts, external API response shapes, UI payloads, `contracts/`, `resources/`, or other boundaries between the backend and an external consumer: their types must remain independent and explicitly readable.
- Use `readonly` and `ReadonlyArray` at boundaries where mutation is not allowed. Do not introduce ceremonial immutability that fails to reflect actual behavior.

```ts
type LoadResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'error'; error: string };
```

### Imports, Classes, and Configuration

- Import types using `import type { SomeType } from '...'` at the top of the file. Do not use inline imports such as `import('...').SomeType` in signatures or generic annotations.
- Omit `public` on class members that are public by default unless the modifier adds clarity.
- For new projects, the recommended configuration starting point is:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true
  }
}
```

This recommendation does not require changing an existing project's configuration as part of an unrelated task.

## 7. Modules and Public API

- Keep modules cohesive and dependencies explicit. Do not collect unrelated responsibilities in giant files, services, or a `utils` directory.
- Do not create classes by habit. Use them when they improve modeling, invariants, encapsulation, or lifecycle management; otherwise prefer understandable functions and plain objects.
- Do not force all code into OOP or procedural style. Avoid excessive inheritance, fragile reliance on `this`, and static utility classes that mimic namespaces.
- Export a symbol only when it is used outside the file or deliberately belongs to the module's public API. This applies to functions, types, interfaces, classes, constants, enums, factories, and other entities.
- Placement of business logic, transport, validation, persistence, and mapping, as well as the purpose of `types.ts`, `contracts/`, and `*.contract.ts`, is defined in [architecture.md](architecture.md).

## 8. Security and Logging

- External data validation rules are provided in section 4, “Data, State, and JavaScript Semantics”. Distinguish validation from protection for a specific context: a value allowed by business rules is not necessarily safe to use in SQL, a shell command, HTML, a template, a file path, or an external service call. Use context-appropriate mechanisms such as parameterized queries and escaping; validation does not replace them.
- Prefer structured logs containing an event and useful context. Avoid noise and meaningless messages.
- Do not log passwords, tokens, secrets, full payment data, or unnecessary personal data. Do not log an entire external payload or user object without evaluating its contents.

## 9. Performance and Algorithmic Complexity

### Algorithm Selection

- Consider expected data volume, execution frequency, and the tradeoff between time and memory. Prefer a simple, maintainable solution with suitable complexity.
- Aim for `O(n)` or better when appropriate for the task. Avoid `O(n²)` and higher when a practical, understandable alternative exists. Do not require linear complexity when the operation or output size requires more work, such as sorting or generating all pairs.
- Account for linear searches with `find`, `filter`, `includes`, and `indexOf` inside loops over growing collections. For repeated lookups, consider `Map`, `Set`, or a prebuilt index, including construction cost and additional memory.
- For small bounded collections, direct searches are acceptable when an index provides no useful benefit.

### Computation and Memory

- Remove unnecessary repeated calculations, sorting, copying, and intermediate arrays.
- Do not copy a growing accumulator on each step, for example with `result = [...result, item]`: building the array may become quadratic. If local mutation is acceptable, use `push`.
- A one-time spread copy is allowed when a new array is needed; account for `O(n)` time and additional memory, where `n` is the number of elements copied.
- Repeated copying of small arrays is allowed for clarity or required immutability when the cost is insignificant.
- Under these rules, an array is small if its size is guaranteed not to exceed **100 elements**. The bound must follow from a contract, validation, or task logic, not just current data. This is a project guideline, not a universal performance threshold; also consider operation frequency.
- Combine data passes when this provides useful benefit and preserves readability. Several sequential `O(n)` passes are acceptable.

### Entire Execution Path

- Account for database queries, network calls, serialization, and transferred data volume. Avoid N+1, use batch operations and suitable indexes, and load only necessary rows and fields.
- Process large datasets using pagination, chunks, or streaming. Bound both the number of running operations and the amount of pending work in memory. Batch processing must not require loading the entire dataset in advance.
- Do not block the Node.js event loop with long synchronous computations. `async` alone does not move computation to another thread.
- For heavy computation, choose chunks that actually yield control to the event loop, worker threads, or background jobs, considering workload, latency requirements, and overhead.

### Justification and Verification

- For nontrivial algorithms, briefly state time complexity and additional memory usage in the solution description. Define `n`, `m`, and other sizes, and account for called operations and output size.
- Justify superlinear complexity and significant exchanges of memory for speed. Add a code comment if the choice is non-obvious and important for maintenance.
- Verify substantial optimizations with before-and-after measurements on comparable, realistic data: time, memory, query count, or data volume.
- If measurements are unavailable, clearly distinguish theoretical estimates from verified speedups. Do not add caching or complex structures without a concrete need; preserve behavioral correctness.

## 10. Testing, Tooling, and Refactoring

- Treat testability as a quality signal: pure calculations, explicit dependencies, and deterministic behavior make verification easier.
- Complex setup for a simple test, excessive mocks, hidden global state, and implicit time or randomness sources are reasons to examine code coupling.
- Test business rules, invariants, transformations, contracts, error handling, and meaningful integrations. Do not write tests for function counts or merely to inflate coverage.
- Specific requirements for test placement, scope, and dependency isolation are defined in [architecture.md](architecture.md).
- Use the project's automated checks. The recommended baseline is ESLint, formatting, tests, and CI; for TypeScript, also use `tsc --noEmit` and `typescript-eslint`.
- Prefer checks for real errors over stylistic disputes: unsafe `any` and member access, unhandled Promises, unnecessary assertions, accidental globals, unreachable code, dangerous coercion, and inconsistent imports.
- Safely remove dead code, obsolete branches and flags, unused abstractions, unnecessary workarounds, and duplicate legacy paths. Do not expand an unrelated task to do so.

Success criterion: code is correct, understandable, explicit in domain meaning, consistent with the project, and does not require unnecessary effort for the next change.
