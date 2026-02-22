import { authConfig } from '@api-main/config';
import { RefreshSessionsRepo, UsersRepo } from '@api-main/datalayer';
import { globalDeps } from '@api-main/global';

import { AuthService } from '../services';

import { IAuthDependency } from './';

const refreshSessionsRepo = new RefreshSessionsRepo();

export const dependency: IAuthDependency = {
  usersRepo: new UsersRepo(),
  refreshSessionsRepo,
  jwtService: globalDeps.jwtService,
  authConfig,
  authService: new AuthService({ authConfig, refreshSessionsRepo }),
};
