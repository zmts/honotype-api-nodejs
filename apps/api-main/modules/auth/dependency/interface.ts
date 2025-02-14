import { UsersRepo } from '@api-main/datalayer';

import { SymmetricJwtService } from '@libs/common/jwt';

export interface IAuthDependency {
  usersRepo: UsersRepo;
  jwtService: SymmetricJwtService;
}
