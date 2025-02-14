import { authConfig } from '@api-main/config';
import { UsersRepo } from '@api-main/datalayer';

import { SymmetricJwtService } from '@libs/common/jwt';

import { IAuthDependency } from './interface';

export const container: IAuthDependency = {
  usersRepo: new UsersRepo(),
  jwtService: new SymmetricJwtService({
    secret: authConfig.accessToken.secret,
    expiresIn: authConfig.accessToken.expiresIn,
    issuer: authConfig.accessToken.issuer,
  }),
};
