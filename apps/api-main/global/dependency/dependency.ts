import { authConfig } from '@api-main/config';

import { JwtMiddleware, SymmetricJwtService } from '@libs/core';

interface IGlobalDependency {
  jwtService: SymmetricJwtService;
  jwtMiddleware: JwtMiddleware;
}

const jwtService = new SymmetricJwtService({
  secret: authConfig.accessToken.secret,
  expiresIn: authConfig.accessToken.expiringPeriod,
  issuer: authConfig.accessToken.issuer,
});

export const globalDeps: IGlobalDependency = {
  jwtService,
  jwtMiddleware: new JwtMiddleware(jwtService),
};
