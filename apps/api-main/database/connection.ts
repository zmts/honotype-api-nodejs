import { drizzle } from 'drizzle-orm/node-postgres';

import { databaseConfig } from '@libs/config';

import * as schema from './schemas';

export const db = drizzle({
  schema,
  connection: {
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.name,
    user: databaseConfig.username,
    password: databaseConfig.password,
    max: databaseConfig.maxConnections,
  },
});
