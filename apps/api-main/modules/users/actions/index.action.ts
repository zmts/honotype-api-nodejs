import { BaseAction } from '@libs/core';

import { UserResource } from '../inout';

export class IndexAction extends BaseAction<[string], UserResource> {
  async run(name: string): Promise<UserResource> {
    return new UserResource({ name });
  }
}
