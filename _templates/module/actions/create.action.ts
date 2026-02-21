import { BaseAction } from '@libs/core';

import { IDependency } from '../dependency';
import { CreateDto, ItemResource } from '../inout';

export class CreateAction extends BaseAction<[CreateDto], ItemResource> {
  // eslint-disable-next-line
  constructor(deps: IDependency) {
    super();
  }

  async run(dto: CreateDto): Promise<ItemResource> {
    return new ItemResource(dto);
  }
}
