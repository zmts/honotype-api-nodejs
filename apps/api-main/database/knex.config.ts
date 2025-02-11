import { databaseConfig } from '@api-main/config';
import { Knex } from 'knex';

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
