import { BaseAction } from '@libs/core';
import { User } from '@libs/entities';

import { IUsersDependency } from '../dependency';
import { CreateDto, UserResource } from '../inout';

export class CreateAction extends BaseAction<[CreateDto], UserResource> {
  constructor(
    deps: IUsersDependency,
    private usersRepo = deps.usersRepo,
  ) {
    super();
  }

  async run(dto: CreateDto): Promise<UserResource> {
    const user = await this.usersRepo.create(new User(dto));
    return new UserResource(user);
  }
}
