# JavaScript Best Practices for Codex

## Purpose

Use these rules when generating, editing, refactoring, or reviewing JavaScript code.

Primary goal: produce code that is correct, readable, maintainable, and proportionate to the task.

When rules conflict, prefer:
1. correctness
2. clarity
3. explicit intent
4. lower complexity
5. consistency with the existing codebase

---

## 1. General rules

- Prefer readable code over clever code.
- Prefer explicit code over compressed code.
- Prefer predictable behavior over stylish tricks.
- Keep changes proportional to the problem.
- Follow existing project conventions unless they are clearly harmful.

Do not introduce complexity without a concrete payoff.

---

## 2. Language defaults

- Use `const` by default.
- Use `let` only when reassignment is necessary.
- Do not use `var`.
- Prefer `===` and `!==`.
- Prefer `async/await` over complex promise chains.
- Use modern syntax only when it improves clarity.

Avoid using language features just because they are available.

---

## 3. Data handling rules

- Treat external data as untrusted by default.
- Validate inputs at boundaries.
- Normalize raw input before passing it deeper into business logic.
- Do not assume objects are complete, well-formed, or safe.
- Avoid passing raw external payloads deep into the system.

Always validate data from:
- HTTP requests
- queues
- webhooks
- environment variables
- JSON.parse
- localStorage/sessionStorage
- files
- external APIs
- third-party SDKs

Preferred boundary flow:
1. receive external input
2. validate structure
3. normalize shape
4. pass trusted value into domain logic

---

## 4. Function rules

- One function should do one job.
- Keep functions focused and cohesive.
- Separate pure logic from side effects.
- Reduce parameter count when possible.
- Prefer object parameters for large argument lists when they improve clarity.
- Avoid boolean flags that change behavior.
- Do not chain `map`, `filter`, `sort`, or similar transformations directly on the result of `await` when an intermediate variable makes the code easier to read.
- Prefer one variable for loaded data and a second variable for the transformed result when the transformation is meaningful.

### Prefer
```js
getPrice(product, { mode: 'discounted' })
```

### Avoid
```js
getPrice(product, true)
```

### Prefer
```js
const tickers = await client.getTickers()
const filteredTickers = tickers.filter(isLiquidTicker)
```

### Avoid
```js
const tickers = (await client.getTickers()).filter(isLiquidTicker)
```

Do not mutate input arguments unless there is a clear, deliberate reason.

---

## 5. Naming rules

- Names must express purpose, not vague shape.
- Use domain language consistently.
- Prefer precise names over short names.
- Do not reuse one variable for multiple meanings.

Avoid generic names like:
- `data`
- `obj`
- `item`
- `tmp`
- `res`
- `processData`
- `handleStuff`

If a name needs a comment to explain it, rename it.

---

## 6. Control flow rules

- Reduce nesting.
- Use guard clauses and early returns.
- Extract complex conditions into clearly named variables when that improves readability.
- Do not write conditionals that require mental decoding.

### Prefer
```js
function canProcessOrder(order) {
  if (!order) return false
  if (!order.items?.length) return false
  if (!order.isPaid) return false

  return true
}
```

---

## 7. Object and array rules

- Do not overuse chained transformations when a simple loop is clearer.
- Use `map`, `filter`, and `reduce` only when they improve readability.
- Do not use `reduce` as a default hammer.
- Use destructuring when it reduces noise, not when it hides context.
- Avoid hidden mutation of shared objects or arrays.

Prefer simple iteration over clever pipelines when logic becomes dense.

---

## 8. Async and promise rules

- Prefer `async/await`.
- Await operations when ordering matters.
- Use `Promise.all` only for truly independent work.
- Use `Promise.allSettled` when partial failure is acceptable.
- Control concurrency when running many async tasks.
- Never leave unhandled promise rejections.

Every promise should be:
- awaited
- returned
- or explicitly handled

Do not start async work “in the background” unless that behavior is intentional and safe.

---

## 9. Error handling rules

- Do not swallow errors.
- Either handle an error meaningfully or rethrow it.
- Add context when logging or propagating failures.
- Keep error strategy consistent within a layer.
- Do not use exceptions for normal expected control flow unless the layer clearly uses that policy.

### Avoid
```js
try {
  await saveUser(user)
} catch (error) {}
```

### Prefer
```js
try {
  await saveUser(user)
} catch (error) {
  logger.error('Failed to save user', { error, userId: user.id })
  throw error
}
```

---

## 10. Module and architecture rules

- Keep modules cohesive.
- Separate transport, validation, business logic, persistence, and mapping concerns.
- Prefer small focused modules over “god files”.
- Do not let `utils` become a dumping ground.
- Keep boundaries explicit.

Avoid by default:
- giant files with mixed responsibilities
- raw request/response objects deep inside domain code
- raw external API payloads flowing through business logic
- abstractions introduced before real variation exists

---

## 11. Class and `this` rules

- Do not use classes by habit.
- Do not rely on `this` when a function or plain object is simpler.
- Use classes when they improve modeling, state encapsulation, lifecycle handling, or invariants.
- Avoid static utility classes that only mimic namespaces.

Choose the structure that makes behavior clearer and safer.

---

## 12. State and mutation rules

- Minimize shared mutable state.
- Prefer local, controlled mutation over global, implicit mutation.
- Use immutable updates when they make behavior safer and clearer.
- Do not copy objects mechanically if it only adds noise.

The goal is controlled state changes, not ceremonial immutability.

---

## 13. Equality and coercion rules

- Prefer strict equality.
- Be careful with truthy/falsy checks.
- Do not rely on implicit coercion where exact behavior matters.
- Check explicitly for `null` / `undefined` / empty string / zero when those cases differ semantically.

### Avoid
```js
if (!value) {
  // ...
}
```

when `0`, `''`, `false`, `null`, and `undefined` are not equivalent in that context.

---

## 14. Comments rules

- Comments must explain why, not restate what.
- Use comments for constraints, protocol quirks, tradeoffs, and non-obvious decisions.
- Do not use comments to compensate for weak naming or confusing code.
- Write useful TODOs with context.

If code needs many explanatory comments, simplify the code first.

---

## 15. Logging rules

- Log events and context, not noise.
- Do not log secrets or sensitive data.
- Logging does not replace proper error handling.
- Prefer structured logs where possible.

Avoid logging:
- passwords
- tokens
- full payment data
- unnecessary personal data

---

## 16. Tooling rules

Use automated checks.

Recommended baseline:
- ESLint
- formatter
- tests
- CI enforcement

Prefer rules that catch real bugs and risky patterns over purely stylistic arguments.

Useful enforcement areas:
- accidental globals
- unhandled promises
- unreachable code
- dangerous equality/coercion patterns
- inconsistent imports
- complexity that exceeds team standards

---

## 17. Testing rules

- Treat testability as a design signal.
- Separate business logic from IO to make testing easier.
- Test domain rules, invariants, error handling, and integrations.
- Do not write tests just to inflate coverage numbers.
- Avoid designs that require excessive mocking for simple behavior.

---

## 18. Security and defensive coding rules

- Never trust external input.
- Validate before using data in SQL, shell commands, HTML, templates, file paths, or external service calls.
- Distinguish validation from sanitization.
- Assume strings from outside the system may be unsafe until proven otherwise.

Validation answers:
- is the data allowed?

Sanitization answers:
- is the data safe for this specific context?

Do not confuse the two.

---

## 19. Preferred baseline for new JavaScript projects

### Language baseline
- `const` by default
- `let` only when needed
- no `var`
- `===` / `!==`
- `async/await`
- early returns
- meaningful names

### Architecture baseline
- validate at boundaries
- separate IO from business logic
- keep modules focused
- minimize shared mutable state

### Tooling baseline
- ESLint
- formatter
- tests
- CI

### Safety baseline
- never trust external input
- validate env / HTTP / JSON / external API data
- avoid logging sensitive information

---

## 20. Refactoring priorities

When refactoring JavaScript code:
1. preserve behavior
2. improve names
3. reduce hidden side effects
4. flatten nesting
5. simplify control flow
6. isolate mutation
7. isolate IO from business logic
8. remove unnecessary abstraction

Do not refactor into a more abstract but less readable design.

---

## 21. Anti-patterns to avoid

- `var`
- broad truthy/falsy assumptions
- silent catches
- giant multi-purpose functions
- hidden mutation of shared state
- raw external payloads deep in business logic
- boolean mode flags
- callback pyramids when `async/await` is clearer
- utility modules with no domain structure
- abstractions without real need
- code that depends on fragile `this` behavior
- clever one-liners that reduce readability

---

## 22. Output standard

Generated JavaScript code should be:
- correct
- explicit
- readable
- maintainable
- predictable
- consistent with the repository style

If there is a choice between cleverness and maintainability, choose maintainability.
