import { redisConfig } from '@api-main/config';
import { createClient } from 'redis';

export const redis = createClient({
  url: redisConfig.url,
  // Redis 5 in docker-compose.yml does not support RESP3.
  RESP: 2,
  disableOfflineQueue: true,
  commandOptions: { timeout: redisConfig.commandTimeoutMs },
  socket: {
    connectTimeout: redisConfig.connectTimeoutMs,
  },
});

redis.on('error', error => {
  console.error('Redis connection error', error);
});
