# PostgreSQL Migrations with Knex

This document must be read before designing, creating, or modifying migrations.
Architectural requirements, including primary and foreign key types, are defined in [architecture.md](architecture.md#database-identifiers).

## Files and Synchronization with Drizzle

- Migrations are located in `apps/api-main/database/migrations` and are named `YYYYMMDDHHmmss_<description-in-english>.js`.
- Use `export async function up(knex)` and `export async function down(knex)`.
- In the same change, update the corresponding files in `apps/api-main/database/schemas` and their exports in `schemas/index.ts`.
- Knex and Drizzle must match in types, nullability, defaults, PK, FK, CHECK, uniqueness, indexes, and partial index predicates.
- A migration must be self-contained. Do not import current Drizzle schemas, services, or application configuration to build its contents dynamically: future code changes must not change the behavior of an old migration.
- Do not rewrite migrations that have already been applied; use a new migration for subsequent changes.
  A new migration that has not been applied anywhere may be edited before application.

## Required Style: Knex Schema Builder

Use the Knex API for all operations it supports:

- `knex.schema.createTable`, `alterTable`, `dropTable`;
- `table.text`, `uuid`, `bigInteger`, `integer`, `jsonb`, and other column builders;
- `notNullable`, `defaultTo`, `primary`;
- `references`, `inTable`, `foreign`, `onDelete`;
- `unique`, `index`, `check`.

Do not write entire `CREATE TABLE`, `ALTER TABLE`, or `CREATE INDEX` statements through `knex.schema.raw` / `knex.raw` if the operation can be expressed with Schema Builder.

`specificType` is allowed for a PostgreSQL type or definition that has no suitable builder, for example `bigint generated always as identity`.

SQL expressions inside `table.check` and index predicates are allowed. Use targeted raw SQL for other operations only when no suitable Knex API exists; explain nearby why Schema Builder is insufficient. Do not wrap the entire migration in raw SQL because of one such operation.

## New Table Example

```js
export async function up(knex) {
  await knex.schema.createTable('items', table => {
    table.specificType('id', 'bigint generated always as identity').primary();
    table.uuid('uuid').notNullable();
    table.text('title').notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.jsonb('metadata_json');
    table.bigInteger('created_at_ms').notNullable();
    table.bigInteger('updated_at_ms').notNullable();

    table.unique(['uuid'], { indexName: 'UIDX_items__uuid', useConstraint: false });
    table.index(['status', 'created_at_ms', 'id'], 'IDX_items__status-created');
    table.check("status IN ('pending', 'completed')", [], 'CHK_items__status');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('items');
}
```

The application supplies the `created_at_ms` / `updated_at_ms` values in this example.
`updated_at_ms` does not update itself when a row changes.

## Relationships, Constraints, and Indexes

- PK and FK must follow the [identifier rules](architecture.md#database-identifiers).
  Do not use `increments`, `serial`, or `bigserial` instead of identity PKs.
- Choose `ON DELETE` explicitly according to the data's meaning. Financial history usually requires `RESTRICT`; `CASCADE` is allowed only when deleting dependent records intentionally.
- Name constraints and indexes: `PK_`, `FK_`, `CHK_`, `UIDX_`, `IDX_`.
  Automatic Knex/Drizzle names are allowed if they match and fit within PostgreSQL's 63-byte limit. Do not rely on automatic truncation of long names.
- For a standalone unique index, specify `useConstraint: false`; for a UNIQUE constraint, use the corresponding Knex form and the same constraint in Drizzle.
- Remember that a CHECK evaluating to SQL NULL allows the row. Additionally protect required fields with `notNullable` and explicit NULL checks where necessary.
- Validate JSONB against the expected type if data correctness depends on it.
  Align structure and content checks with application validation.
- Add indexes for specific queries, foreign keys, and uniqueness rules.

Also define partial unique indexes through Knex:

```js
table.unique(['position_id'], {
  indexName: 'UIDX_orders__position-active',
  useConstraint: false,
  predicate: knex.queryBuilder().whereRaw("status IN ('pending', 'submitted')"),
});
```

In the installed Knex version, the PostgreSQL index compiler does not retain predicate bindings.
Therefore, fixed SQL literals are required here, rather than `whereIn('status', values)` with placeholders. Check the generated SQL through `toSQL()`: DDL must not contain unresolved placeholders. Do not interpolate user-provided values into SQL.

## Precision and Units

- For monetary values and token quantities, use exact integers in the smallest units or a justified `numeric`, without `float` / `double`.
- For text representations of integers, add CHECK constraints for the valid format and range required by the domain. Do not convert large values to JS `Number`.
- Reflect units in names: `_wei`, `_raw`, `_bps`, `_ms`, `_unix_sec`.
- For PostgreSQL `bigint`, account for the Drizzle mode and JS precision when reading values.

## Verification and Application

1. Check the creation order of tables, foreign keys, and indexes. In `down`, remove dependencies in reverse order. Remember that a `down` which drops tables destroys their data.
2. Compare the migration with Drizzle, including defaults, CHECK constraints, and index predicates.
3. Check JS syntax, formatting, and the project's TypeScript.
4. Compile Schema Builder through `toSQL()` with `client: 'pg'`, without executing queries.
   This checks SQL generation; it does not replace execution in PostgreSQL.
5. Apply a migration only within explicit authorization to apply it.
   Preparing migration files does not by itself provide that authorization.

The project command `npm run migrations:api-main` runs code from `dist`, so authorized application first requires an up-to-date build. Do not run this command to check syntax or instead of compiling through `toSQL()`.
