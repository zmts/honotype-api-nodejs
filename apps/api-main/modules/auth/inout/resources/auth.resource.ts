import { IResponseOptions, Resource } from '@libs/common/api';

import { AuthContract } from '../contracts';

export class AuthResource extends Resource<AuthContract> {
  constructor(
    private item: { accessToken: string; refreshToken: string },
    private responseOptions: IResponseOptions = {},
  ) {
    super();
  }

  options(): IResponseOptions {
    return this.responseOptions;
  }

  result(): AuthContract {
    return {
      accessToken: this.item.accessToken,
      refreshToken: this.item.refreshToken,
    };
  }
}
