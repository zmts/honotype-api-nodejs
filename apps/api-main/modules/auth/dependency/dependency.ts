import { UsersRepo } from '@api-main/datalayer';
import { globalDeps } from '@api-main/global';

import { IAuthDependency } from './';

export const dependency: IAuthDependency = {
  usersRepo: new UsersRepo(),
  jwtService: globalDeps.jwtService,
};
