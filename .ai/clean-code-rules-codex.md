# Clean Code Rules for Codex

## Purpose

This document defines the baseline clean code rules that must guide code generation, refactoring, and review.

The goal is not maximum abstraction or stylistic perfection.
The goal is code that is:

- easy to read
- easy to change
- hard to break by accident
- explicit in intent
- proportionate to the task

When rules conflict, prefer lower complexity, clearer intent, and easier maintenance.

---

## Core principle

Code is written for humans first.
Machines only execute it.

Readable, boring, explicit code is usually better than clever code.

---

## 1. Prefer readability over cleverness

Do not compress logic just because it is technically possible.
Avoid smart one-liners when they reduce clarity.

### Prefer
- explicit naming
- simple control flow
- obvious data transformations
- intermediate variables when they improve understanding

### Avoid
- dense chained expressions with unclear meaning
- hidden side effects inside expressions
- overuse of shorthand syntax that obscures intent

### Example

Bad:

```ts
const r = a.filter(x => x.s && x.t && x.u).map(x => ({ ...x, z: 1 }))
```

Better:

```ts
const eligibleUsers = users
  .filter(isEligibleUser)
  .map(markAsProcessed)
```

---

## 2. One function should do one job

A function should have one clear responsibility.
If it validates data, persists data, sends notifications, formats output, and logs — it is doing too much.

### Signals that a function is overloaded
- it has multiple sections separated by comments
- it mixes business logic with infrastructure concerns
- it has many condition branches for unrelated reasons
- its name contains `and`, `then`, or several verbs

### Prefer
- small focused functions
- orchestration in one place, implementation in smaller units
- separation of business logic from IO

---

## 3. Use names that explain intent

Names must reveal purpose, not implementation detail alone.
A good name reduces the need for comments.

### Prefer
- `activeUsers`
- `canProcessOrder`
- `withdrawalLimit`
- `isExpired`

### Avoid
- `data`
- `arr`
- `tmp`
- `value2`
- one-letter names outside tiny local loops

### Rule
If a name needs a comment to explain what it means, the name is probably weak.

---

## 4. Reduce nesting

Deep nesting increases cognitive load.
Use guard clauses and early returns to flatten control flow.

### Prefer

```ts
function canProcessOrder(order: Order | null): boolean {
  if (!order) return false
  if (!order.items.length) return false
  if (!order.isPaid) return false

  return true
}
```

### Avoid

```ts
function processOrder(order) {
  if (order) {
    if (order.items?.length) {
      if (order.isPaid) {
        return true
      }
    }
  }

  return false
}
```

---

## 5. Do not duplicate logic without reason

Duplication creates divergence.
When one copy changes and another does not, bugs appear.

### Prefer
- extracting truly repeated business rules
- centralizing shared validation and transformation logic
- reusing domain concepts consistently

### Avoid
- premature abstraction after a single use
- generic helpers that hide domain meaning

### Decision rule
Small duplication is often better than a wrong abstraction.
Extract only when repetition is real and stable.

---

## 6. Make business meaning visible in code

The code should reflect domain intent, not only mechanics.

### Prefer

```ts
if (user.canWithdraw(amount)) {
  // ...
}
```

Or:

```ts
const isWithdrawalAllowed =
  user.balance >= amount && user.status === UserStatus.ACTIVE
```

### Avoid

```ts
if (user.balance > amount && user.status === 1) {
  // ...
}
```

Domain language makes code easier to review and safer to change.

---

## 7. Keep modules small and cohesive

Large files and "god objects" are a structural smell.

### Prefer clear separation of concerns
- controller or handler: input boundary
- service or use case: business logic
- repository: persistence access
- mapper: transformation between layers
- utility: generic stateless helpers only when truly generic

### Avoid
- massive service classes doing everything
- files that mix transport, domain, persistence, formatting, and validation
- shared helpers that become a dumping ground

---

## 8. Minimize hidden dependencies

A unit of code should rely as much as possible on explicit inputs, not invisible external state.

### Prefer

```ts
function calculatePrice(cartTotal: number, taxRate: number): number {
  return cartTotal * taxRate
}
```

### Avoid

```ts
function calculatePrice(): number {
  return globalConfig.tax * currentCart.total
}
```

Explicit dependencies improve testability and predictability.

---

## 9. Handle errors explicitly

Do not swallow errors.
A caught error must be handled intentionally.

### Prefer
- adding context
- logging when appropriate
- mapping infrastructure errors to domain or API errors
- rethrowing if recovery is not possible

### Avoid

```ts
try {
  await saveUser(data)
} catch (error) {}
```

### Better

```ts
try {
  await saveUser(data)
} catch (error) {
  logger.error('Failed to save user', { error, data })
  throw error
}
```

---

## 10. Comments must explain why, not what

Good code should usually explain what it does by itself.
Comments are justified when they preserve context that code cannot express clearly.

### Useful comments
- non-obvious business constraints
- protocol quirks
- workaround rationale
- performance tradeoffs
- security assumptions

### Weak comments
- repeating the code
- narrating trivial steps
- compensating for poor naming

### Example

Weak:

```ts
// increment index
index++
```

Useful:

```ts
// Inclusive end date is required because the upstream billing API treats the range end as part of the chargeable window.
```

---

## 11. Consistency beats personal style

A consistent codebase is easier to maintain than a locally perfect but globally inconsistent one.

### Follow existing project conventions for
- naming
- formatting
- error handling
- async patterns
- file structure
- testing style
- import order
- DTO and type naming

Do not introduce a new style unless there is a clear technical reason.

---

## 12. Avoid overengineering

Do not build for hypothetical future complexity when the current task is simple.

### Avoid
- unnecessary abstraction layers
- factories for simple constructors
- generic frameworks around trivial CRUD
- excessive indirection
- architecture designed for scale that does not exist

### Prefer
- the simplest structure that meets current requirements
- extension points only where change is likely
- straightforward code over pattern worship

---

## 13. Testability is a design signal

When code is hard to test, the design is often too coupled or too implicit.

### Prefer
- pure functions where practical
- explicit dependencies
- isolated business rules
- deterministic behavior

### Warning signs
- heavy reliance on globals
- hidden time or random sources
- side effects mixed with calculation
- complex setup for simple tests

Testability is not the only goal, but poor testability usually indicates design problems.

---

## 14. Separate data, behavior, and side effects carefully

Do not mix everything into anonymous objects and utility functions.

### Prefer
- typed domain models
- behavior located near relevant domain concepts
- side effects isolated near boundaries

### Avoid
- `any` for important business objects
- large mutable structures passed everywhere
- domain rules scattered across unrelated helpers

---

## 15. Delete code aggressively when it no longer helps

Clean code is not only about writing new code.
It is also about removing code that adds no value.

### Remove when safe
- dead code
- obsolete branches
- stale feature flags
- unused abstractions
- compatibility hacks that are no longer needed
- duplicated legacy paths

Every extra line increases maintenance cost.

---

## Practical decision rules for Codex

When generating or modifying code, apply these priorities in order:

1. Preserve correctness.
2. Prefer clarity over brevity.
3. Keep the solution proportional to the problem.
4. Do not introduce abstractions without a clear payoff.
5. Keep business intent visible.
6. Avoid hidden side effects.
7. Follow the existing project style unless it is clearly harmful.

---

## Refactoring checklist

Before finalizing code, check:

- Are names precise and meaningful?
- Does each function have one clear responsibility?
- Can nesting be reduced?
- Is repeated logic extracted only where appropriate?
- Are errors handled intentionally?
- Are dependencies explicit?
- Does the code reflect domain meaning?
- Is any abstraction unnecessary?
- Can any code be deleted?
- Will another developer understand this quickly?

---

## Tradeoff rules

These rules are not absolute.
When rules conflict, use judgment.

### Prefer slightly longer code when
- it is easier to read
- it makes edge cases explicit
- it reduces ambiguity

### Prefer small duplication when
- abstraction would be misleading
- the repeated logic may evolve differently
- the shared helper would become too generic

### Prefer simple procedural code when
- the task is linear and small
- extra patterns would add indirection without value

### Prefer abstraction when
- the concept is stable
- duplication is real and repeated
- the abstraction improves clarity instead of hiding it

---

## What Codex should avoid by default

- clever one-liners that reduce readability
- generic helper names like `processData`, `handleResponse`, `doStuff`
- large multi-purpose functions
- comments that restate obvious code
- silent catches
- hidden global state
- overuse of inheritance
- introducing patterns without need
- converting clear code into abstract but harder-to-read code

---

## Target outcome

The final code should feel:

- obvious
- stable
- maintainable
- explicit
- consistent with the project

If there is a choice between impressive code and understandable code, choose understandable code.

