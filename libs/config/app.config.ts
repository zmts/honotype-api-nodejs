import { z } from 'zod';

import { TypedConfig } from '@libs/core';

export type AppConfig = {
  host: string;
  port: number;
};

export const appConfig = new TypedConfig<AppConfig>({
  host: { APP_HOST: z.string(), default: 'localhost' },
  port: { APP_PORT: z.number(), default: 3000 },
}).getAll();
