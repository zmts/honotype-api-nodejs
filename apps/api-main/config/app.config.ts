import { z } from 'zod';

import { ValidEnvConfig, Config, AppEnv } from '@libs/core';

const config = new ValidEnvConfig({
  env: { NODE_ENV: z.string(), default: AppEnv.DEV },
  host: { API_HOST: z.string(), default: 'localhost' },
  port: { API_PORT: z.number(), default: 3000 },
}).result();

const configData = {
  env: config.env as AppEnv,
  host: config.host,
  port: config.port,
};

export type AppConfigType = typeof configData;
export const appConfig = new Config<AppConfigType>(configData).config();
