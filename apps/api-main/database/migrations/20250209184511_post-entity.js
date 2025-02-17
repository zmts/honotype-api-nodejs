export function up(knex) {
  return knex.schema.createTable('posts', table => {
    table.increments();
    table
      .uuid('uuid')
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .unique({ indexName: 'UIDX_posts__uuid' });
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title');
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['user_id'], 'IDX_posts__user_id');
  });
}

export function down(knex) {
  return knex.schema.dropTable('posts');
}
