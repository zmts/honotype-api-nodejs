# TypeScript Best Practices for Codex

## Purpose

Use these rules when generating, editing, refactoring, or reviewing TypeScript code.

Primary goal: produce code that is correct, readable, maintainable, and proportionate to the task.

When rules conflict, prefer:
1. correctness
2. clarity
3. explicit domain intent
4. lower complexity
5. consistency with the existing codebase

---

## 1. General rules

- Prefer readable code over clever code.
- Prefer explicit code over compressed code.
- Prefer stable, boring solutions over impressive abstractions.
- Keep changes proportional to the problem.
- Follow existing project conventions unless they are clearly harmful.

Do not introduce complexity without a concrete payoff.

---

## 2. Type safety defaults

- Use `strict` TypeScript settings by default.
- Prefer `unknown` over `any` for untrusted input.
- Treat external data as unsafe until validated.
- Use `never` for exhaustive checks in discriminated unions.
- Avoid unsafe `as` assertions unless there is no better option.

### Default stance
- external input -> `unknown`
- validated input -> typed domain value
- internal domain code -> avoid `any`

---

## 3. Modeling rules

- Prefer string literal unions over unrestricted `string`.
- Prefer discriminated unions over boolean flags and loose optional fields.
- Model impossible states as impossible in types.
- Keep DTOs, domain models, and persistence models separate.
- Use utility types only when they improve clarity.

### Prefer
```ts
type Result =
  | { kind: 'success'; data: User }
  | { kind: 'error'; error: string }
```

### Avoid
```ts
type Result = {
  isSuccess: boolean
  data?: User
  error?: string
}
```

---

## 4. Runtime validation rules

TypeScript does not replace runtime validation.

Always validate at boundaries when data comes from:
- HTTP requests
- queues
- webhooks
- environment variables
- JSON.parse
- local storage
- external APIs
- files
- third-party SDKs

Preferred boundary flow:
1. receive `unknown`
2. validate with schema or guard
3. convert into trusted typed value
4. use trusted value inside the system

Do not pass raw external payloads deep into domain logic.

---

## 5. Function rules

- One function should do one job.
- Prefer small focused functions.
- Separate pure logic from side effects.
- Reduce parameter count when possible.
- Prefer object parameters for large argument lists, but keep them typed and meaningful.
- Avoid boolean flags that change function behavior.
- Do not chain `map`, `filter`, `sort`, or similar transformations directly on the result of `await` when an intermediate variable would make the code easier to read.
- Prefer a separate variable for loaded data and another variable for the transformed result when the operation is not trivial.

### Prefer
```ts
getPrice(product, { mode: 'discounted' })
```

### Avoid
```ts
getPrice(product, true)
```

### Prefer
```ts
const tickers = await client.getTickers()
const filteredTickers = tickers.filter(isLiquidTicker)
```

### Avoid
```ts
const tickers = (await client.getTickers()).filter(isLiquidTicker)
```

---

## 6. Naming rules

- Names must express intent, not vague shape.
- Use domain language consistently.
- Prefer precise names over short names.
- Avoid generic names like:
  - `data`
  - `obj`
  - `item2`
  - `processData`
  - `handleStuff`

If a name needs a comment to explain it, rename it.

---

## 7. Narrowing rules

- Use control-flow narrowing naturally.
- Prefer `typeof`, `instanceof`, `in`, discriminant checks, and guard clauses.
- Extract repeated checks into user-defined type guards when useful.
- Do not create fake type guards that do not actually prove the claimed type.

### Prefer
```ts
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value
}
```

---

## 8. Error handling rules

- Do not swallow errors.
- In `catch`, treat error as `unknown` until narrowed.
- Add context when rethrowing or mapping errors.
- Keep error strategy consistent within a layer.

Possible layer strategy:
- domain -> `Result` unions or explicit domain errors
- application/service layer -> mapped errors
- HTTP layer -> transport-specific response mapping

Avoid silent catches.

---

## 9. Module and architecture rules

- Keep modules cohesive.
- Keep boundaries explicit.
- Separate transport, domain, persistence, validation, and mapping concerns.
- Prefer simple modules over “god files”.
- Do not introduce interfaces or abstractions before real variation exists.

### Avoid by default
- generic manager/factory/resolver layers without real need
- repository interfaces with only one trivial implementation and no variation
- deeply nested indirection around simple CRUD

---

## 10. Class and object rules

- Do not use classes by habit.
- Use classes when they improve modeling, invariants, lifecycle handling, or encapsulation.
- Prefer functions and plain objects when they are simpler and clearer.
- Do not force everything into OOP or everything into procedural style.

Choose the structure that makes the domain clearer.

---

## 11. Immutability rules

- Use `const` by default.
- Prefer `readonly` and `ReadonlyArray` at safe boundaries where mutation should not happen.
- Avoid uncontrolled mutation of shared state.
- Do not add ceremonial immutability that does not reflect actual behavior.

---

## 12. Linting and toolchain rules

Use automated checks.

Recommended baseline:
- `tsc --noEmit`
- ESLint
- `typescript-eslint`
- formatter
- tests
- CI enforcement

Prefer lint rules that catch semantic problems over purely stylistic disputes.

Prioritize detection of:
- unsafe `any`
- unsafe member access
- unhandled promises
- inconsistent imports
- unnecessary assertions

---

## 13. Testing rules

- Treat testability as a design signal.
- Separate business logic from IO to make testing easier.
- Test domain rules, invariants, mapping, and contract behavior.
- Do not write tests only to satisfy function-count vanity metrics.
- Avoid designs that require mocking half the system for a simple test.

---

## 14. Comments rules

- Comments must explain why, not restate what.
- Use comments for constraints, protocol quirks, tradeoffs, workarounds, and non-obvious decisions.
- Do not use comments to compensate for weak naming or overly complex code.

If code needs many explanatory comments, simplify the code first.

---

## 15. Preferred TypeScript baseline for new projects

### tsconfig baseline
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

### Data handling baseline
- external data = `unknown`
- validate on entry
- convert to trusted types
- keep trusted types inside domain logic

### Modeling baseline
- unions over magic strings
- discriminated unions over loose optional bags
- exhaustive checks for domain states

---

## 16. Refactoring priorities

When refactoring TypeScript code:
1. preserve behavior
2. improve names
3. reduce unsafe typing
4. reduce duplication where stable
5. flatten nesting
6. isolate side effects
7. keep types aligned with domain meaning
8. remove unnecessary abstraction

Do not refactor into a more abstract but less readable design.

---

## 17. Anti-patterns to avoid

- broad `any` usage
- unsafe `as` chains
- loose objects with many optional fields modeling multiple states
- boolean mode flags
- giant multi-purpose functions
- transport DTOs reused as domain entities
- raw external payloads flowing into business logic
- silent catches
- helper names with no domain meaning
- abstraction layers without actual variation
- overly clever generics that reduce readability

---

## 18. Output standard

Generated TypeScript code should be:
- type-safe
- explicit
- readable
- domain-oriented
- easy to change
- consistent with the repository style

If there is a choice between cleverness and maintainability, choose maintainability.
