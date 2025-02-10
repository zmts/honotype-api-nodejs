import knex, { Knex } from 'knex';

export async function migrationsRunner(migrationConfig: Knex.Config): Promise<void> {
  const [, migrations] = await knex(migrationConfig).migrate.latest();
  console.log('########## APPLIED MIGRATIONS ##########');
  if (migrations.length) {
    for (const migration of migrations) {
      console.log(`- ${migration}`);
    }
  } else {
    console.log('####### ALL MIGRATIONS UP TO DATE ######');
  }
  console.log('########################################');
  process.exit(1);
}
