import { z } from 'zod';

import { ValidEnvConfig, Config } from '@libs/core';

const config = new ValidEnvConfig({
  host: { APP_HOST: z.string(), default: 'localhost' },
  port: { APP_PORT: z.number(), default: 3000 },
}).result();

export type AppConfig = {
  host: string;
  port: number;
};

export const appConfig = new Config<AppConfig>({
  host: config.host,
  port: config.port,
}).config();
