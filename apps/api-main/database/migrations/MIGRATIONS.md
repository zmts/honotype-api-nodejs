```js
export function up(knex) {
  return knex.createTable('items', table => {
    table.increments();
    table.uuid('uuid').notNullable().unique({ indexName: 'UIDX_items__uuid' });
    table.string('title').unique({ indexName: 'UIDX_items__title' });
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['title', 'description'], 'IDX_items__title_description');
  });
}

export function down(knex) {
  return knex.schema.dropTable('items');
}

```
