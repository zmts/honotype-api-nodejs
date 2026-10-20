import { authConfig, redisConfig } from '@api-main/config';

import { JwtMiddleware, RedisLockClient, SymmetricJwtService } from '@libs/core';

import { redis } from './redis';

interface IGlobalDependency {
  jwtService: SymmetricJwtService;
  jwtMiddleware: JwtMiddleware;
  locks: RedisLockClient;
}

const jwtService = new SymmetricJwtService({
  secret: authConfig.accessToken.secret,
  expiresIn: authConfig.accessToken.expiringPeriod,
  issuer: authConfig.accessToken.issuer,
});

export const globalDeps: IGlobalDependency = {
  jwtService,
  jwtMiddleware: new JwtMiddleware(jwtService),
  locks: new RedisLockClient(redis, redisConfig.lockKeyPrefix, redisConfig.commandTimeoutMs),
};
