import { z } from 'zod';

import { ValidEnvConfig, Config } from '@libs/core';

export type AppConfig = {
  host: string;
  port: number;
};

const config = new ValidEnvConfig({
  host: { API_HOST: z.string(), default: 'localhost' },
  port: { API_PORT: z.number(), default: 3000 },
}).result();

export const appConfig = new Config<AppConfig>({
  host: config.host,
  port: config.port,
}).config();
