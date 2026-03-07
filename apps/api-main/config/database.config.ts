import { z } from 'zod';

import { Config, ValidEnvConfig } from '@libs/core';

const config = new ValidEnvConfig({
  host: { DB_HOST: z.string() },
  port: { DB_PORT: z.number() },
  password: { DB_PASSWORD: z.string() },
  name: { DB_NAME: z.string() },
  username: { DB_USERNAME: z.string() },
}).result();

const configData = {
  host: config.host,
  port: config.port,
  password: config.password,
  name: config.name,
  username: config.username,
  maxConnections: 300,
};

export type DatabaseConfigType = typeof configData;
export const databaseConfig = new Config<DatabaseConfigType>(configData).config();
