import { authConfig } from '@api-main/config';

import { JwtMiddleware, SymmetricJwtService } from '@libs/common/jwt';

interface IGlobalDependency {
  jwtService: SymmetricJwtService;
  jwtMiddleware: JwtMiddleware;
}

const jwtService = new SymmetricJwtService({
  secret: authConfig.accessToken.secret,
  expiresIn: authConfig.accessToken.expiresIn,
  issuer: authConfig.accessToken.issuer,
});

export const globalDeps: IGlobalDependency = {
  jwtService,
  jwtMiddleware: new JwtMiddleware(jwtService),
};
