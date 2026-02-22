import { IResponseOptions, Resource } from '@libs/common/api';

import { ItemContract } from '../contracts';

export class ItemResource extends Resource<ItemContract> {
  constructor(
    private item: { name: string },
    private responseOptions: IResponseOptions = {},
  ) {
    super();
  }

  options(): IResponseOptions {
    return this.responseOptions;
  }

  result(): ItemContract {
    return {
      name: this.item?.name,
    };
  }
}
