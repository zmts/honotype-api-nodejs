import { z } from 'zod';

import { ValidEnvConfig, Config, AppEnv } from '@libs/core';

export type AppConfig = {
  env: AppEnv;
  host: string;
  port: number;
};

const config = new ValidEnvConfig({
  env: { NODE_ENV: z.string(), default: AppEnv.DEV },
  host: { API_HOST: z.string(), default: 'localhost' },
  port: { API_PORT: z.number(), default: 3000 },
}).result();

export const appConfig = new Config<AppConfig>({
  env: config.env as AppEnv,
  host: config.host,
  port: config.port,
}).config();
