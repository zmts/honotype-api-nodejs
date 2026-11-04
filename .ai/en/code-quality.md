# Code Quality Rules

- When generating, editing, refactoring, or reviewing code in this workspace, use [`clean-code-rules.md`](clean-code-rules.md) as the baseline source of rules for readability, simplicity, and maintainability.
- For JavaScript code, also follow [`javascript-best-practices.md`](javascript-best-practices.md).
- For TypeScript code, also follow [`typescript-best-practices.md`](typescript-best-practices.md).
- If the instructions in these documents conflict, apply this priority order:
  1. user requirements and local workspace instructions;
  2. `clean-code-rules.md`;
  3. the language-specific document: `javascript-best-practices.md` or `typescript-best-practices.md`;
  4. existing conventions of the specific repository, provided they do not conflict with the items above.
- When writing new code or modifying existing code, treat these documents as the default practices and do not deviate without a clear reason.
- Do not use inline type imports in signatures or generic annotations such as `import('...').SomeType`. For types, use a regular `import type { SomeType } from '...'` at the top of the file.
- In TypeScript classes, do not use the `public` access modifier by default when it does not add clarity. If a member is already public by default, prefer omitting `public`.
- Do not mark functions or methods as `async` if they perform no actual asynchronous work and the existing contract does not require returning a `Promise`. Do not use `await` for synchronous calls merely for signature consistency or hypothetical future needs. If a call is synchronous and the contract permits a synchronous result, keep it synchronous. When removing `async`, preserve the existing return-value and error-handling contract, including the distinction between a synchronous exception and a rejected `Promise`. A synchronous implementation may serve an interface that requires a `Promise`.
- Do not introduce unused variables, bindings, or imports. Do not declare unnecessary parameters if they can be omitted without changing the contract or the positions of arguments that are used. If an unused parameter is required by a positional callback signature or an external interface, an explicitly marked name such as `_item` is allowed. Otherwise, do not use names such as `_variable` merely to suppress `no-unused-vars` or a similar lint warning. Do not add fake usage, checks, or adapters solely to satisfy the linter.
- If a boolean condition expresses important contract, domain, or infrastructure semantics, prefer extracting it into a named boolean variable with an `is/has/can/should` prefix when this makes the intent clearer. Do not extract trivial checks into separate variables if the new name does not improve readability.
- Extract meaningful intermediate operations into named variables. If a nested call produces a distinct meaningful result, do not pass it directly to another call, especially if the outer call mutates state: `add`, `push`, `set`, `delete`, `update`. First store the result in a variable with a precise domain name, then use that variable.
- The purpose of `types.ts`, `contracts/`, and `*.contract.ts` is defined in [architecture.md](architecture.md), in the “HTTP, DTOs, and Public Contracts” section.
- For internal backend types, reuse field types through `SourceType['field']` when the field semantics fully match an existing source-of-truth type. Prefer this over manually duplicating `number`, string unions, and other field-level types in internal adapter types, service-level DTOs, helper types, and module-level types. Do not apply this rule to transport contracts, external API response shapes, UI-facing payloads, `contracts/`, `resources/`, or other boundary types between the backend and an external consumer: these contracts must remain independent and explicitly readable.
- Export a module symbol only when you actually intend to support it as a separate external point of use.
- This rule applies to all kinds of symbols: functions, types, interfaces, classes, constants, enums, factories, builders, utilities, and other entities.
- If a symbol is not used outside the file and is not part of the module's deliberate public API, do not `export` it.

## Performance and Algorithmic Complexity

When writing and modifying code, follow these performance requirements:

1. **Choose an efficient and maintainable solution.** Consider the expected data volume, execution frequency, and the tradeoff between speed and memory. Prefer simple solutions with suitable algorithmic complexity. Do not complicate code for an unverified gain.

2. **Aim for `O(n)` or better when appropriate for the task.** Avoid `O(n²)` and higher if a practical and maintainable alternative exists. Do not require linear complexity when the necessary operation or output size inherently requires more work, such as sorting or generating all pairs.

3. **Avoid repeated linear searches inside loops over growing collections.** Account for `find`, `filter`, `includes`, `indexOf`, and similar operations. For repeated lookups, consider `Map`, `Set`, or prebuilt indexes, accounting for construction cost and additional memory. For small bounded collections, allow direct searches when an index provides no useful benefit.

4. **Eliminate unnecessary work and memory allocation.** Avoid repeated calculations, unnecessary sorting, copying, and intermediate arrays. Avoid repeatedly copying a growing accumulator in loops or other repeatedly executed operations, for example with `result = [...result, item]`: building an array this way may require `O(n²)` time. If mutating a local array is acceptable, prefer appending with `push`. A one-time copy using spread is allowed when a new array is needed; account for its `O(n)` time and additional memory cost, where `n` is the length of the array being copied. Repeated copying of small arrays is also allowed if it improves readability or preserves required immutability without significant cost. Combine passes when this provides a useful benefit and preserves readability. Several sequential `O(n)` passes are acceptable.

   Under these rules, **an array is considered small if its size is guaranteed not to exceed 100 elements**. The limit must follow from a contract, validation, or task logic, not merely the current data. This is a project guideline, not a universal performance boundary. Consider execution frequency: even small copies and searches can be costly when repeated many times.

5. **Evaluate the entire execution path.** Account for database queries, networking, serialization, and the volume of data transferred. Avoid N+1; use batch operations, suitable indexes, and bounded concurrency. Load only the necessary rows and fields. For large datasets, use pagination, chunked processing, or streaming. Limit both the number of concurrent operations and the amount of pending work held in memory. Batch processing must not require loading the entire dataset in advance.

6. **Do not block the Node.js event loop with long synchronous computations.** Declaring a function `async` does not by itself move computation off the event loop. For heavy processing, choose chunks that actually yield control to the event loop, worker threads, or background jobs, depending on the workload and latency requirements. Account for the overhead of the chosen mechanism.

7. **Explain the complexity of nontrivial algorithms.** In the solution description, briefly state time complexity and additional memory usage. Define what the input sizes (`n`, `m`, and others) mean, and account for called operations and output size, not just visible loops. Justify superlinear complexity or a significant speed-memory tradeoff. Add a code comment if the reason for the choice is non-obvious and important for future maintenance.

8. **Validate substantial optimizations with measurements.** Compare behavior before and after using comparable, realistic data. Measure the affected characteristics: execution time, memory consumption, query count, or data volume. If measurements are unavailable, state this explicitly and distinguish theoretical complexity estimates from verified speedups. Preserve behavioral correctness; do not add caching or complex structures without a concrete need.

# Unit-Aware Naming Rules

- All variables, fields, DTO fields, configuration values, and contract properties that express a quantity in a specific unit must explicitly reflect that unit in their names.
- If a value is measured in time, percentages, bars, candles, ticks, volume, count, or another measurable unit, do not use neutral names without unit semantics.
- Do not name such values simply `time`, `duration`, `value`, `change`, `interval`, or `amount` unless the unit is obvious from the name itself.
- Prefer names such as `durationMs`, `ttlSec`, `lookbackHours`, `changePct`, `ratioBps`, `candlesCount`, `tickSize`, `volumeUsd`, `startTimeMs`, and `openTimeUnixSec`.
- For time and durations, use explicit suffixes or equivalent unit markers: `ms`, `sec`, `min`, `hours`, `days`.
- For percentages and relative quantities, use explicit markers: `pct`, `percent`, `ratio`, `bps`, `multiplier`.
- For market and calculated quantities, use units or semantically explicit markers where applicable: `price`, `tickSize`, `ticks`, `volume`, `qty`, `count`, `bars`, `candles`.
- Exception: conventional pagination and aggregate names `offset`, `limit`, `total`, and `count` do not need renaming solely for unit-aware naming.
- If a unit is nonstandard or domain-specific, it must still be understandable from the name rather than existing only in a comment or in the author's head.
