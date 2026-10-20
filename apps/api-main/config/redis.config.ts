import { z } from 'zod';

import { Config, ValidEnvConfig } from '@libs/core';

import { appConfig } from './app.config';

const config = new ValidEnvConfig({
  url: { REDIS_URL: z.url({ protocol: /^rediss?$/ }), default: 'redis://localhost:6379' },
  connectTimeoutMs: { REDIS_CONNECT_TIMEOUT_MS: z.number().int().positive().max(2_147_483_647), default: 5_000 },
  commandTimeoutMs: { REDIS_COMMAND_TIMEOUT_MS: z.number().int().positive().max(2_147_483_647), default: 5_000 },
  lockKeyPrefix: { REDIS_LOCK_KEY_PREFIX: z.string().trim().min(1), default: `honotype:${appConfig.env}:lock` },
}).result();

export const redisConfig = new Config(config).config();
