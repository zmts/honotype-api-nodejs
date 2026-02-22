import { IResponseOptions, Resource } from '@libs/common/api';
import { User } from '@libs/entities';

import { UserContract } from '../contracts';

export class UserResource extends Resource<UserContract> {
  constructor(
    private item: Partial<User>,
    private responseOptions: IResponseOptions = {},
  ) {
    super();
  }

  options(): IResponseOptions {
    return this.responseOptions;
  }

  result(): UserContract {
    return {
      uuid: this.item?.uuid,
      firstname: this.item?.firstname,
      lastname: this.item?.lastname,
    };
  }
}
