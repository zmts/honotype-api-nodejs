import { Resource } from '@libs/common/api';

import { ItemContract } from '../contracts';

export class ItemResource extends Resource<ItemContract> {
  constructor(private item: { name: string }) {
    super();
  }

  result(): ItemContract {
    return {
      name: this.item?.name,
    };
  }
}
