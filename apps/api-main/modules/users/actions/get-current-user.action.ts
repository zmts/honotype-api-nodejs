import { CurrentUserJwt } from '@libs/common/jwt';
import { BaseAction } from '@libs/core';

import { IUsersDependency } from '../dependency';
import { UserResource } from '../inout';

export class GetCurrentUserAction extends BaseAction<[CurrentUserJwt], UserResource> {
  constructor(
    deps: IUsersDependency,
    private usersRepo = deps.usersRepo,
  ) {
    super();
  }

  async run(currentUser: CurrentUserJwt): Promise<UserResource> {
    const user = await this.usersRepo.findOneById(currentUser.id);
    return new UserResource(user);
  }
}
