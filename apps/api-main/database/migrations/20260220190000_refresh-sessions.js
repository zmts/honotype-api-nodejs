export function up(knex) {
  return knex.schema.createTable('refresh_sessions', table => {
    table.increments();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('refresh_token').notNullable().unique({ indexName: 'UIDX_refresh_sessions__refresh_token' });
    table.string('ua', 200);
    table.string('fingerprint', 200);
    table.string('ip', 45);
    table.bigInteger('expires_in').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['user_id'], 'IDX_refresh_sessions__user_id');
  });
}

export function down(knex) {
  return knex.schema.dropTable('refresh_sessions');
}
