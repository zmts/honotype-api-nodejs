import { Knex } from 'knex';

import { databaseConfig } from '@libs/config';

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.name,
  },
  migrations: {
    directory: `${__dirname}/migrations`,
    loadExtensions: ['.js'],
  },
};
