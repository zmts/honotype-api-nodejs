import { AuthConfig } from '@api-main/config';
import { RefreshSessionsRepo, UsersRepo } from '@api-main/datalayer';

import { SymmetricJwtService } from '@libs/common/jwt';

import { AuthService } from '../services';

export interface IAuthDependency {
  usersRepo: UsersRepo;
  refreshSessionsRepo: RefreshSessionsRepo;
  jwtService: SymmetricJwtService;
  authConfig: AuthConfig;
  authService: AuthService;
}
