import { CurrentUserJwt } from '@libs/common/jwt';
import { BaseAction } from '@libs/core';

import { IDependency } from '../dependency';
import { UserResource } from '../inout';

export class GetCurrentUserAction extends BaseAction<[CurrentUserJwt], UserResource> {
  constructor(
    deps: IDependency,
    private usersRepo = deps.usersRepo,
  ) {
    super();
  }

  async run(currentUser: CurrentUserJwt): Promise<UserResource> {
    const user = await this.usersRepo.findOne({ id: currentUser.id });
    return new UserResource(user);
  }
}
