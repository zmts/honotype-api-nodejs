import { BaseAction } from '@libs/core';

import { CreateDto, UserResource } from '../inout';

export class CreateAction extends BaseAction<[CreateDto], UserResource> {
  async run(dto: CreateDto): Promise<UserResource> {
    return new UserResource(dto);
  }
}
