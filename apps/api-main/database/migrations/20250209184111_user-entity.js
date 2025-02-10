export function up(knex) {
  return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').createTable('users', table => {
    table.increments();
    table
      .uuid('uuid')
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .unique({ indexName: 'UIDX_users__uuid' });
    table.string('email').notNullable().unique({ indexName: 'UIDX_users__email' });
    table.string('password');
    table.string('username').unique({ indexName: 'UIDX_users__username' });
    table.string('firstname');
    table.string('lastname');
    table.string('social_id');
    table.string('social_provider');
    table.timestamp('banned_at');
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable('users').then(() => knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"'));
}
