import { Resource } from '@libs/common/api';
import { User } from '@libs/entities';

import { UserContract } from '../contracts';

export class UserResource extends Resource<UserContract> {
  constructor(private item: Partial<User>) {
    super();
  }

  result(): UserContract {
    return {
      firstname: this.item.firstname,
      lastname: this.item.lastname,
    };
  }
}
