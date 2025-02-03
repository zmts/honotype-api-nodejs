import { Resource } from '@libs/common/api';

import { UserContract } from '../contracts';

export class UserResource extends Resource<UserContract> {
  constructor(private item: UserContract) {
    super();
  }

  result(): UserContract {
    return {
      name: this.item.name,
      title: this.item.title,
    };
  }
}
